import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents, ChatMessage } from '../../../shared/types/socket.types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SystemMessage {
  type: 'system';
  id: string;
  text: string;
  ts: number;
}

/** Unión de mensajes enviados por usuarios y mensajes de sistema (join/leave) renderizados en MessageList. */
export type DisplayMessage = (ChatMessage & { type: 'user' }) | (ChatMessage & { type: 'system' }) | SystemMessage;

/**
 * Acumula los mensajes del chat y expone la acción `sendMessage`.
 *
 * Se suscribe a los eventos del servidor `message`, `user_joined` y `user_left`.
 * Los mensajes de sistema se insertan localmente con un ID monotónico estable.
 *
 * @param getSocket - Getter de referencia de `useSocket`.
 * @param room      - ID de la sala actual — incluido en los eventos `message` salientes.
 * @param addToast  - Superficie de error para envíos fallidos.
 * @returns Array de `messages` y la acción `sendMessage`.
 */
export function useChatMessages(
  getSocket: () => TypedSocket | null,
  room: string,
  addToast: (msg: string, type: 'info' | 'error') => void,
) {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const msgCounterRef = useRef(0);

  const addSystemMsg = useCallback((text: string) => {
    const id = `sys-${++msgCounterRef.current}`;
    setMessages((prev) => [...prev, { type: 'system', id, text, alias: '', ts: Date.now() }]);
  }, []);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onMessage = (m: ChatMessage) => {
      setMessages((prev) => [...prev, { ...m, type: 'user' as const }]);
    };

    const onUserJoined = (u: { alias: string }) => {
      addSystemMsg(`${u.alias} se unio a la sala`);
    };

    const onUserLeft = (u: { alias: string }) => {
      addSystemMsg(`${u.alias} salio de la sala`);
    };

    s.on('message', onMessage);
    s.on('user_joined', onUserJoined);
    s.on('user_left', onUserLeft);

    return () => {
      s.off('message', onMessage);
      s.off('user_joined', onUserJoined);
      s.off('user_left', onUserLeft);
    };
  }, [getSocket, addSystemMsg]);

  const sendMessage = useCallback(
    (text: string) => {
      const s = getSocket();
      if (!s || !text.trim()) return;
      s.emit('message', { room, text }, (ack) => {
        if (!ack || !ack.ok) {
          addToast(ack?.message || 'Error al enviar el mensaje', 'error');
        }
      });
    },
    [getSocket, room, addToast],
  );

  return { messages, sendMessage };
}
