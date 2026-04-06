import { useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useChatMessages } from '../hooks/useChatMessages';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useToast } from '../../../shared/hooks/useToast';
import { ToastContainer } from '../../../shared/components/Toast';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { UserSidebar } from './UserSidebar';
import { RoomTabs } from './RoomTabs';
import type { ActiveRoom } from '../../../shared/types/socket.types';

interface ChatRoomProps {
  alias: string;
  room: string;
  rooms: ActiveRoom[];
  activeRoomId: string;
  onSwitchRoom: (id: string) => void;
  onLeave: () => void;
}

export function ChatRoom({ alias, room, rooms, activeRoomId, onSwitchRoom, onLeave }: ChatRoomProps) {
  const { toasts, addToast } = useToast();

  const onKicked = useCallback(() => {
    onLeave();
  }, [onLeave]);

  const { connected, users, getSocket } = useSocket(room, alias, onKicked, addToast);
  const { messages, sendMessage } = useChatMessages(getSocket, room, addToast);
  const { typingList, emitTyping } = useTypingIndicator(getSocket, room);

  const handleLeave = () => {
    const s = getSocket();
    if (s) {
      s.emit('leave_room', { room });
      s.disconnect();
    }
    onLeave();
  };

  return (
    <div className="page">
      {!connected && (
        <div className="connection-banner">Desconectado — reconectando…</div>
      )}

      <ToastContainer toasts={toasts} />

      <RoomTabs rooms={rooms} activeRoomId={activeRoomId} onSwitch={onSwitchRoom} />

      <div className="top-bar">
        <span><span style={{ color: 'var(--accent)' }}>chatDev</span> › {room}</span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span>👥 {users.length} conectados · <span style={{ color: 'var(--accent2)' }}>{alias}</span></span>
          <button
            style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '3px 14px', borderRadius: '4px', fontFamily: 'inherit', fontSize: '1.05rem', cursor: 'pointer' }}
            onClick={handleLeave}
          >Salir</button>
        </div>
      </div>

      <div className="layout">
        <UserSidebar users={users} currentAlias={alias} room={room} getSocket={getSocket} />

        <main className="chat">
          <MessageList messages={messages} currentAlias={alias} />

          <div className="typing-indicator">
            {typingList.length > 0 && (
              typingList.length === 1
                ? `${typingList[0]} está escribiendo…`
                : `${typingList.slice(0, 2).join(', ')} están escribiendo…`
            )}
          </div>

          <Composer onSend={sendMessage} onTyping={emitTyping} />
        </main>
      </div>
    </div>
  );
}
