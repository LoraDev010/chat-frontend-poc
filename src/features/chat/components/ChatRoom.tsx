import { useCallback, useState } from 'react';
import { Copy, Check, LogOut, Users } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);

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

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const roomName = activeRoom?.name || room;
  const roomCode = activeRoom?.code;

  const handleCopyCode = async () => {
    if (!roomCode) return;
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      addToast('Código copiado al portapapeles', 'info');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('Error al copiar código', 'error');
    }
  };

  return (
    <div className="page">
      {!connected && (
        <div className="connection-banner">Desconectado — reconectando…</div>
      )}

      <ToastContainer toasts={toasts} />

      <RoomTabs rooms={rooms} activeRoomId={activeRoomId} onSwitch={onSwitchRoom} />

      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>
            <span style={{ color: 'var(--accent)' }}>Chat POC</span> › {roomName}
          </span>
          {roomCode && (
            <button
              onClick={handleCopyCode}
              style={{
                background: copied ? 'var(--accent)' : 'var(--bg3)',
                border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
                color: copied ? 'var(--bg)' : 'var(--accent2)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Copiar código de sala"
            >
              {copied ? (
                <>
                  <Check size={16} />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={16} />
                  {roomCode}
                </>
              )}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={18} />
            {users.length} conectados · <span style={{ color: 'var(--accent2)' }}>{alias}</span>
          </span>
          <button
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--danger)', 
              color: 'var(--danger)', 
              padding: '6px 14px', 
              borderRadius: '4px', 
              fontFamily: 'inherit', 
              fontSize: '1.05rem', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            onClick={handleLeave}
          >
            <LogOut size={16} />
            Salir
          </button>
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
