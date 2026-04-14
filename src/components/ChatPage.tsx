import { useMemo, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import type { Conversation, Message, User } from '../lib/types';

interface ChatsPageProps {
  currentUser: User;
  conversations: Conversation[];
  messages: Message[];
  selectedConversationId?: number;
  onSelectConversation: (conversation: Conversation) => Promise<void> | void;
  onSendMessage: (content: string) => Promise<void>;
}

function formatTime(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('de-DE');
}

function getOtherParticipantName(conversation: Conversation, currentUser: User) {
  if (conversation.user1?.id === currentUser.id) {
    return conversation.user2?.name || 'Unknown';
  }
  return conversation.user1?.name || 'Unknown';
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export function ChatPage({
  currentUser,
  conversations,
  messages,
  selectedConversationId,
  onSelectConversation,
  onSendMessage,
}: ChatsPageProps) {
  const [draft, setDraft] = useState('');

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const selectedPartnerName = selectedConversation
    ? getOtherParticipantName(selectedConversation, currentUser)
    : 'Select a conversation';

  const handleSend = async () => {
    const cleaned = draft.trim();
    if (!cleaned) return;
    await onSendMessage(cleaned);
    setDraft('');
  };

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '18px',
        alignItems: 'stretch',
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(255,255,255,0.35)',
          minHeight: '700px',
        }}
      >
        <div style={{ marginBottom: '18px' }}>
          <span className="eyebrow">Chats</span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '28px' }}>Your conversations</h2>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {conversations.length === 0 && (
            <div
              style={{
                padding: '18px',
                borderRadius: '18px',
                background: '#f8fafc',
                color: '#64748b',
                border: '1px solid #e2e8f0',
              }}
            >
              No conversations yet.
            </div>
          )}

          {conversations.map((conversation) => {
            const isActive = conversation.id === selectedConversationId;
            const partnerName = getOtherParticipantName(conversation, currentUser);
            const lastTimestamp =
              conversation.updatedAt ||
              conversation.lastMessageAt ||
              conversation.createdAt;

            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => void onSelectConversation(conversation)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px',
                  borderRadius: '18px',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid #dbe4f0',
                  background: isActive
                    ? 'linear-gradient(135deg, #e0ecff 0%, #f0f7ff 100%)'
                    : '#ffffff',
                  boxShadow: isActive ? '0 8px 20px rgba(59,130,246,0.12)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {getInitial(partnerName)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: '#172554',
                      fontSize: '17px',
                      marginBottom: '4px',
                    }}
                  >
                    {partnerName}
                  </div>

                  <div
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Open conversation
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    whiteSpace: 'nowrap',
                    marginLeft: '8px',
                  }}
                >
                  {formatTime(lastTimestamp)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: '24px',
          padding: '20px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(255,255,255,0.35)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '700px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '14px',
            borderBottom: '1px solid #e2e8f0',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #60a5fa 0%, #34d399 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            {getInitial(selectedPartnerName)}
          </div>

          <div>
            <div style={{ fontWeight: 800, color: '#172554', fontSize: '18px' }}>
              {selectedPartnerName}
            </div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              {selectedConversation ? 'Conversation active' : 'Choose a conversation'}
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            background: 'rgba(248,250,252,0.78)',
            border: '1px solid #e2e8f0',
            borderRadius: '22px',
            padding: '18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minHeight: '420px',
          }}
        >
          {!selectedConversation && (
            <div style={{ color: '#94a3b8', fontSize: '18px' }}>
              Choose a conversation from the left side.
            </div>
          )}

          {selectedConversation && messages.length === 0 && (
            <div style={{ color: '#94a3b8', fontSize: '16px' }}>
              No messages yet. Start the conversation.
            </div>
          )}

          {selectedConversation &&
            messages.map((message) => {
              const isOwn = message.senderId === currentUser.id;

              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '72%',
                      padding: '12px 14px',
                      borderRadius: isOwn
                        ? '18px 18px 6px 18px'
                        : '18px 18px 18px 6px',
                      background: isOwn
                        ? 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)'
                        : '#ffffff',
                      color: isOwn ? '#fff' : '#0f172a',
                      border: isOwn ? 'none' : '1px solid #e2e8f0',
                      boxShadow: isOwn
                        ? '0 8px 20px rgba(59,130,246,0.18)'
                        : '0 4px 12px rgba(15,23,42,0.05)',
                    }}
                  >
                    <div style={{ fontSize: '15px', lineHeight: 1.45 }}>{message.content}</div>
                    <div
                      style={{
                        fontSize: '11px',
                        marginTop: '8px',
                        opacity: isOwn ? 0.85 : 0.55,
                        textAlign: 'right',
                      }}
                    >
                      {formatTime(message.sentAt || message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '12px',
            marginTop: '16px',
            alignItems: 'end',
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            disabled={!selectedConversation}
            style={{
              minHeight: '64px',
              maxHeight: '120px',
              resize: 'none',
              borderRadius: '18px',
              border: '1px solid #cbd5e1',
              padding: '16px',
              fontSize: '15px',
              outline: 'none',
              background: selectedConversation
                ? 'rgba(255,255,255,0.9)'
                : 'rgba(241,245,249,0.9)',
            }}
          />

          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={!selectedConversation || !draft.trim()}
            style={{
              height: '56px',
              padding: '0 22px',
              border: 'none',
              borderRadius: '16px',
              background:
                !selectedConversation || !draft.trim()
                  ? '#cbd5e1'
                  : 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)',
              color: '#fff',
              fontWeight: 700,
              cursor:
                !selectedConversation || !draft.trim() ? 'not-allowed' : 'pointer',
              boxShadow:
                !selectedConversation || !draft.trim()
                  ? 'none'
                  : '0 10px 22px rgba(59,130,246,0.22)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <SendHorizonal size={18} />
            Send
          </button>
        </div>
      </div>
    </section>
  );
}