import type { ActiveRoom } from '../../../shared/types/socket.types';

interface RoomTabsProps {
  rooms: ActiveRoom[];
  activeRoomId: string;
  onSwitch: (id: string) => void;
}

export function RoomTabs({ rooms, activeRoomId, onSwitch }: RoomTabsProps) {
  if (rooms.length <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        padding: '6px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        overflowX: 'auto',
      }}
    >
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSwitch(room.id)}
          style={{
            padding: '4px 14px',
            borderRadius: '4px',
            border: room.id === activeRoomId ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: room.id === activeRoomId ? 'var(--accent)' : 'transparent',
            color: room.id === activeRoomId ? '#fff' : 'var(--muted)',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {room.name}
        </button>
      ))}
    </div>
  );
}
