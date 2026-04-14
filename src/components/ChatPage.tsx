import { useEffect, useMemo, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { api } from '../lib/api';
import type { Conversation, Message, User } from '../lib/types';
import { formatDate } from '../lib/utils';

interface ChatPageProps {
  currentUser: User;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onPickConversation: (conversation: Conversation) => void;
  onRefreshConversations: () => Promise<void>;
}

export function ChatPage({
  currentUser,
  conversations,
  activeConversation,
  onPickConversation,
  onRefreshConversations,
}: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeConversation) return;
      try {
        setError('');
        const data = await api.getMessages(activeConversation.id);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load messages.');
      }
    };

    void loadMessages();
  }, [activeConversation]);

  const title = useMemo(() => {
    if (!activeConversation) return 'Select a conversation';
    return activeConversation.user1Id === currentUser.id
      ? activeConversation.user2Name
      : activeConversation.user1Name;
  }, [activeConversation, currentUser.id]);

  const send = async () => {
    if (!activeConversation || !draft.trim()) return;
    try {
      const message = await api.sendMessage(activeConversation.id, currentUser.id, draft.trim());
      setMessages((current) => [...current, message]);
      setDraft('');
      await onRefreshConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.');
    }
  };

  return (
    <section className="chat-layout">
      <div className="card stack-md chat-sidebar">
        <div className="section-header">
          <div>
            <span className="eyebrow">Chats</span>
            <h2>Your conversations</h2>
          </div>
        </div>
        <div className="stack-sm">
          {conversations.length === 0 && <p className="muted">Start a chat from the Discover page.</p>}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={activeConversation?.id === conversation.id ? 'conversation-item active' : 'conversation-item'}
              onClick={() => onPickConversation(conversation)}
            >
              <strong>{conversation.user1Id === currentUser.id ? conversation.user2Name : conversation.user1Name}</strong>
              <span>{formatDate(conversation.createdAt)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card stack-md">
        <div className="section-header">
          <div>
            <span className="eyebrow">Conversation</span>
            <h2>{title}</h2>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <div className="message-list">
          {activeConversation ? (
            messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={message.senderId === currentUser.id ? 'message-bubble own' : 'message-bubble'}
                >
                  <strong>{message.senderName}</strong>
                  <p>{message.content}</p>
                  <span>{formatDate(message.createdAt)}</span>
                </div>
              ))
            ) : (
              <p className="muted">No messages yet. Send the first one.</p>
            )
          ) : (
            <p className="muted">Choose a conversation from the left side.</p>
          )}
        </div>

        <div className="composer">
          <textarea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message…"
            disabled={!activeConversation}
          />
          <button className="primary-button" onClick={() => void send()} disabled={!activeConversation}>
            <SendHorizontal size={16} /> Send
          </button>
        </div>
      </div>
    </section>
  );
}
