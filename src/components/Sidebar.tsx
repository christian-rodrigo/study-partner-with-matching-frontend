import { BookOpen, LogOut, MapPinned, MessageSquare, Search, UserRound } from 'lucide-react';
import type { View } from '../App';
import type { User } from '../lib/types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  user: User | null;
  onLogout: () => void;
}

const items: { key: View; label: string; icon: typeof Search }[] = [
  { key: 'discover', label: 'Discover', icon: Search },
  { key: 'chat', label: 'Chats', icon: MessageSquare },
  { key: 'places', label: 'Learning Places', icon: MapPinned },
  { key: 'profile', label: 'Profile', icon: UserRound },
  { key: 'tutor', label: 'Tutor Courses', icon: BookOpen },
];

export function Sidebar({ currentView, onChangeView, user, onLogout }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <div className="brand-badge">SP</div>
          <div>
            <h2>Study Partner</h2>
            
          </div>
        </div>

        <nav className="nav-list">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={currentView === item.key ? 'nav-item active' : 'nav-item'}
                onClick={() => onChangeView(item.key)}
                disabled={!user}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="user-card compact">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="nav-item" onClick={onLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <p className="muted">Please sign in to use the protected backend endpoints.</p>
        )}
      </div>
    </aside>
  );
}
