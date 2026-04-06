import { useState } from 'react';
import { AliasScreen } from '../features/auth';
import { ChatRoom } from '../features/chat';
import { LobbyScreen } from '../features/rooms';
import type { ActiveRoom } from '../shared/types/socket.types';

export default function App() {
  const [alias, setAlias] = useState<string | null>(null);
  const [rooms, setRooms] = useState<ActiveRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  if (!alias) return <AliasScreen onJoin={setAlias} />;

  const handleJoinRoom = (room: ActiveRoom) => {
    setRooms((prev) => (prev.find((r) => r.id === room.id) ? prev : [...prev, room]));
    setActiveRoomId(room.id);
  };

  const handleLeave = () => {
    setRooms([]);
    setActiveRoomId(null);
  };

  return (
    <>
      {activeRoomId === null && (
        <LobbyScreen alias={alias} onJoinRoom={handleJoinRoom} />
      )}
      {rooms.map((room) => (
        <div key={room.id} style={{ display: room.id === activeRoomId ? 'block' : 'none' }}>
          <ChatRoom
            alias={alias}
            room={room.id}
            rooms={rooms}
            activeRoomId={activeRoomId ?? room.id}
            onSwitchRoom={setActiveRoomId}
            onLeave={handleLeave}
          />
        </div>
      ))}
    </>
  );
}
