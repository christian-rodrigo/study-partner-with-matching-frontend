import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
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

  return (
    <section className="stack-lg">
      <div className="card stack-md">
        <div className="section-header">
          <div>
            <span className="eyebrow">Discover</span>
            <h2>Find study partners</h2>
          </div>
        </div>

        <div className="grid-4">
          <label>
            Keyword
            <input value={filter.keyword || ''} onChange={(e) => setFilter({ ...filter, keyword: e.target.value })} placeholder="bio or degree" />
          </label>
          <label>
            City
            <input value={filter.city || ''} onChange={(e) => setFilter({ ...filter, city: e.target.value })} placeholder="BERLIN" />
          </label>
          <label>
            Study Mode
            <select
              value={filter.studyMode || ''}
              onChange={(e) => setFilter({ ...filter, studyMode: (e.target.value || undefined) as UserSearchFilter['studyMode'] })}
            >
              <option value="">Any</option>
              <option value="ONLINE">ONLINE</option>
              <option value="OFFLINE">OFFLINE</option>
              <option value="BOTH">BOTH</option>
            </select>
          </label>
          <div className="button-row align-end">
            <button className="primary-button" onClick={() => void loadUsers(filter)}>
              <Search size={16} /> Search
            </button>
            <button className="secondary-button" onClick={() => { setFilter(initialFilter); void loadUsers({}); }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {busy && <div className="card">Loading users…</div>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px minmax(320px, 520px) 80px',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '24px',
          
        }}
      >
        {/* LEFT BUTTON */}
        <button
          className="secondary-button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((prev) => prev - 1)}
          style={{ height: '56px', borderRadius: '999px', fontSize: '18px' }}
        >
          ←
        </button>

        {/* CARD */}
        {currentUserCard && (
          <article
            className="card stack-md"
            style={{
              minHeight: '400px',
              maxWidth: '400px',
              width: '100%',
              margin: '0 auto',
              background: 'linear-gradient(135deg, #d4fc79 0%, #fff4bfff 100%)'
            }}
          >
            <div className="user-card">
              <div className="avatar">
                {currentUserCard.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3>{currentUserCard.name}</h3>
                <p className="muted">
                  {currentUserCard.universityName || 'No university'} ·{' '}
                  {currentUserCard.degreeProgram || 'No program'}
                </p>
              </div>
            </div>

            <p>{currentUserCard.bio || 'No bio yet.'}</p>

            <div className="pill-row">
              <span className="pill">{currentUserCard.city || 'Unknown city'}</span>
              <span className="pill">Semester {currentUserCard.semester || '—'}</span>
              <span className="pill">{formatLabel(currentUserCard.studyMode)}</span>
              <span className="pill">{formatLabel(currentUserCard.learningGoal)}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              {currentIndex + 1} / {cards.length}
            </div>

            <button
              className="primary-button"
              onClick={() => void onStartChat(currentUserCard)}
            >
              Start Chat
            </button>
          </article>
        )}

        {/* RIGHT BUTTON */}
        <button
          className="primary-button"
          disabled={currentIndex === cards.length - 1}
          onClick={() => setCurrentIndex((prev) => prev + 1)}
          style={{ height: '56px', borderRadius: '999px', fontSize: '18px' }}
        >
          →
        </button>
      </div>
    </section>
  );
}
