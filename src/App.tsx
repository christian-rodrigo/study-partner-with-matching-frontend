import { useEffect, useMemo, useState } from 'react';
import { api, clearToken, saveToken } from './lib/api';
import type { Conversation, Course, LearningPlace, Message, User } from './lib/types';
import { Sidebar } from './components/Sidebar';
import { AuthPanel } from './components/AuthPanel';
import { DiscoverPage } from './components/DiscoverPage';
import { ChatPage } from './components/ChatPage';
import { PlacesPage } from './components/PlacesPage';
import { ProfilePage } from './components/ProfilePage';
import { TutorCoursesPage } from './components/TutorCoursesPage';

export type View = 'discover' | 'chat' | 'places' | 'profile' | 'tutor';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [view, setView] = useState<View>('discover');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [places, setPlaces] = useState<LearningPlace[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const boot = async () => {
      if (!api.getStoredToken()) {
        setTokenChecked(true);
        return;
      }

      try {
        const me = await api.me();
        setUser(me);
      } catch {
        clearToken();
      } finally {
        setTokenChecked(true);
      }
    };

    void boot();
  }, []);

  useEffect(() => {
    const loadProtectedData = async () => {
      if (!user) return;

      try {
        const [conversationData, placeData] = await Promise.all([
          api.getUserConversations(user.id),
          api.getLearningPlaces(),
        ]);

        setConversations(conversationData);
        setPlaces(placeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load app data.');
      }
    };

    void loadProtectedData();
  }, [user]);

  const refreshCurrentUser = async () => {
    try {
      const me = await api.me();
      setUser(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh user.');
    }
  };

  const login = async (email: string, password: string) => {
    setError('');
    const response = await api.login(email, password);
    saveToken(response.token);
    setUser(response.user);
  };

  const register = async (payload: Parameters<typeof api.register>[0]) => {
    setError('');
    await api.register(payload);
    await login(payload.email, payload.password);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setConversations([]);
    setMessages([]);
    setActiveConversation(null);
    setCourses([]);
    setView('discover');
  };

  const refreshConversations = async () => {
    if (!user) return;

    const data = await api.getUserConversations(user.id);
    setConversations(data);

    if (activeConversation) {
      const latest =
        data.find((item) => item.id === activeConversation.id) || activeConversation;
      setActiveConversation(latest);
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setActiveConversation(conversation);

    try {
      const data = await api.getMessages(conversation.id);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages.');
    }
  };

  const sendMessage = async (content: string) => {
    if (!user || !activeConversation) return;

    try {
      const newMessage = await api.sendMessage(activeConversation.id, user.id, content);
      setMessages((current) => [...current, newMessage]);
      await refreshConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    }
  };

  const startChatWithUser = async (otherUser: User) => {
    if (!user) return;

    try {
      const conversation = await api.openConversation(user.id, otherUser.id);

      setConversations((current) => {
        const exists = current.some((item) => item.id === conversation.id);
        return exists ? current : [conversation, ...current];
      });

      await selectConversation(conversation);
      setView('chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open conversation.');
    }
  };

  const loadTutorCourses = async () => {
    try {
      const data = await api.getTutorCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutor courses.');
    }
  };

  useEffect(() => {
    if (view === 'tutor' && user) {
      void loadTutorCourses();
    }
  }, [view, user]);

  const content = useMemo(() => {
    if (!user) {
      return <AuthPanel onLogin={login} onRegister={register} />;
    }

    switch (view) {
      case 'discover':
        return <DiscoverPage currentUser={user} onStartChat={startChatWithUser} />;

      case 'chat':
        return (
          <ChatPage
            currentUser={user}
            conversations={conversations}
            messages={messages}
            selectedConversationId={activeConversation?.id}
            onSelectConversation={selectConversation}
            onSendMessage={sendMessage}
          />
        );

      case 'places':
        return <PlacesPage initialPlaces={places} />;

      case 'profile':
        return <ProfilePage onProfileUpdated={refreshCurrentUser} />;

      case 'tutor':
        return <TutorCoursesPage courses={courses} onSaved={loadTutorCourses} />;

      default:
        return null;
    }
  }, [
    activeConversation,
    conversations,
    courses,
    messages,
    places,
    user,
    view,
  ]);

  if (!tokenChecked) {
    return <div className="center-screen">Loading…</div>;
  }

  return (
    <div className="app-shell">
      <Sidebar currentView={view} onChangeView={setView} user={user} onLogout={logout} />

      <main className="main-panel">
        <div className="topbar">
          <div></div>

          {user && (
            <div className="topbar-user">
              <strong>{user.name}</strong>
              <span>{user.universityName || 'No university selected'}</span>
            </div>
          )}
        </div>

        {error && <div className="alert error">{error}</div>}
        {content}
      </main>
    </div>
  );
}

export default App;