import { UserX } from 'lucide-react';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../../../shared/types/socket.types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UserSidebarProps {
  users: string[];
  currentAlias: string;
  room: string;
  getSocket: () => TypedSocket | null;
}

export function UserSidebar({ users, currentAlias, room, getSocket }: UserSidebarProps) {
  const handleKick = (targetAlias: string) => {
    const s = getSocket();
    if (s) s.emit('kick_user', { room, targetAlias }, () => {});
  };

  return (
    <aside className="sidebar">
      <h3>En línea</h3>
      <ul>
        {users.map((u) => (
          <li
            key={u}
            style={
              u === currentAlias
                ? { color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
                : { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
            }
          >
            <span>{u}</span>
            {u !== currentAlias && (
              <button 
                className="kick-btn" 
                onClick={() => handleKick(u)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <UserX size={14} />
                kick
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
