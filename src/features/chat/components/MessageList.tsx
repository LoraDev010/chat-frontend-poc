import { useEffect, useRef } from 'react';
import type { DisplayMessage } from '../hooks/useChatMessages';

interface MessageListProps {
  messages: DisplayMessage[];
  currentAlias: string;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
}

export function MessageList({ messages, currentAlias }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="messages" ref={listRef}>
      {messages.map((m) => {
        if (m.type === 'system') {
          return (
            <div key={m.id} className="message system">
              <span className="body">{m.text}</span>
            </div>
          );
        }
        const isMine = m.alias === currentAlias;
        return (
          <div key={m.id} className={`message ${isMine ? 'mine' : 'them'}`}>
            <div className="meta">{isMine ? '' : `${m.alias} · `}{formatTime(m.ts)}</div>
            <div className="body">{m.text}</div>
          </div>
        );
      })}
    </div>
  );
}
