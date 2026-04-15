import { useEffect, useMemo, useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { User, UserSearchFilter } from '../lib/types';
import { formatLabel } from '../lib/utils';

interface DiscoverPageProps {
  currentUser: User;
  onStartChat: (user: User) => Promise<void>;
}

const initialFilter: UserSearchFilter = {
  keyword: '',
  city: '',
  studyMode: undefined,
};

export function DiscoverPage({ currentUser, onStartChat }: DiscoverPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<UserSearchFilter>(initialFilter);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const loadUsers = async (payload?: UserSearchFilter) => {
    setBusy(true);
    setError('');

    try {
      const cleaned = payload || {};
      const data = Object.values(cleaned).some(Boolean)
        ? await api.searchUsers(cleaned)
        : await api.getDiscoverUsers(currentUser.id);

      setUsers(data.filter((user) => user.id !== currentUser.id));
      setCurrentIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const cards = useMemo(() => users, [users]);
  const currentUserCard = cards[currentIndex];

  const imageUrl = currentUserCard
    ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUserCard.id}`
    : '';

  return (
    <section className="stack-lg">
      <div
        className="card"
        style={{
          padding: '18px 20px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(255,255,255,0.35)',
        }}
      >
        <div
          className="section-header"
          style={{
            marginBottom: '14px',
          }}
        >
          <div>
            <span className="eyebrow">Discover</span>
            <h2 style={{ margin: '6px 0 0 0', fontSize: '28px' }}>Find study partners</h2>
          </div>
        </div>

        <div
          className="grid-4"
          style={{
            gap: '12px',
            alignItems: 'end',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Keyword</span>
            <input
              value={filter.keyword || ''}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              placeholder="bio or degree"
              style={{
                height: '46px',
                fontSize: '15px',
                padding: '0 14px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: 'rgba(255,255,255,0.72)',
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>City</span>
            <input
              value={filter.city || ''}
              onChange={(e) => setFilter({ ...filter, city: e.target.value })}
              placeholder="BERLIN"
              style={{
                height: '46px',
                fontSize: '15px',
                padding: '0 14px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: 'rgba(255,255,255,0.72)',
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700 }}>Study Mode</span>
            <select
              value={filter.studyMode || ''}
              onChange={(e) =>
                setFilter({
                  ...filter,
                  studyMode: (e.target.value || undefined) as UserSearchFilter['studyMode'],
                })
              }
              style={{
                height: '46px',
                fontSize: '15px',
                padding: '0 14px',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                background: 'rgba(255,255,255,0.72)',
                outline: 'none',
              }}
            >
              <option value="">Any</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="BOTH">BOTH</option>
            </select>
          </label>

          <div
            className="button-row align-end"
            style={{
              gap: '10px',
              flexWrap: 'nowrap',
            }}
          >
            <button
              className="primary-button"
              onClick={() => void loadUsers(filter)}
              style={{
                height: '46px',
                padding: '0 18px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(59,130,246,0.22)',
              }}
            >
              <Search size={16} />
              Search
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setFilter(initialFilter);
                void loadUsers({});
              }}
              style={{
                height: '46px',
                padding: '0 18px',
                borderRadius: '14px',
                background: '#e2e8f0',
                border: 'none',
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {busy && <div className="card">Loading users…</div>}

      {!busy && currentUserCard && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '30px',
          }}
        >
          <div
            style={{
              width: '360px',
              height: '640px',
              borderRadius: '30px',
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundColor: '#e6ceffff',
              backgroundPosition: 'center 20%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}
          >
            {cards.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  right: '12px',
                  display: 'flex',
                  gap: '4px',
                  zIndex: 2,
                }}
              >
                {cards.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: '2px',
                      borderRadius: '999px',
                      background:
                        index === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.25)',
                    }}
                  />
                ))}
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.1))',
              }}
            />

            <div
              style={{
                position: 'absolute',
                bottom: '120px',
                left: '20px',
                right: '20px',
                color: '#fff',
              }}
            >
              <div className="pill" style={{ marginBottom: '10px' }}>
                Top Match · {currentUserCard.score}
              </div>

              <h2 style={{ margin: 0 }}>{currentUserCard.name}</h2>
              <p>{currentUserCard.universityName}</p>
              <p>
                {currentUserCard.degreeProgram} · Semester {currentUserCard.semester}
              </p>
              <p>{currentUserCard.bio}</p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="pill">{currentUserCard.city}</span>
                <span className="pill">{formatLabel(currentUserCard.studyMode)}</span>
                <span className="pill">{formatLabel(currentUserCard.learningGoal)}</span>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
              }}
            >
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: currentIndex === 0 ? '#94a3b8' : '#2f3441',
                  color: '#fff',
                  border: 'none',
                  fontSize: '28px',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex === 0 ? 0.6 : 1,
                }}
                title="Previous"
              >
                ↺
              </button>

              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(prev + 1, cards.length - 1))
                }
                disabled={currentIndex === cards.length - 1}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: currentIndex === cards.length - 1 ? '#fda4af' : '#ff4d6d',
                  color: '#fff',
                  border: 'none',
                  fontSize: '30px',
                  cursor: currentIndex === cards.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentIndex === cards.length - 1 ? 0.6 : 1,
                }}
                title="Next"
              >
                ✕
              </button>

              <button
                onClick={() => void onStartChat(currentUserCard)}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#4facfe',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                title="Start Chat"
              >
                <MessageCircle size={28} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}