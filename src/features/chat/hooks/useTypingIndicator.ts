import { useEffect, useState, useCallback, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../../../shared/types/socket.types';
import { TYPING_TIMEOUT_MS, TYPING_EMIT_INTERVAL_MS } from '../constants/chat';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Rastrea qué peers están tipeando actualmente y provee un helper con throttle para emitir.
 *
 * Los eventos `typing` entrantes agregan un alias al conjunto visible. Un timeout de 2 segundos
 * elimina automáticamente el alias cuando el usuario remoto deja de tipear (el servidor
 * también aplica su propio throttle de 1 segundo).
 *
 * Las emisiones de `typing` salientes se limitan en el cliente a una vez por segundo
 * para reducir el ruido, coincidiendo con el throttle del servidor en `chat.service.ts`.
 *
 * @param getSocket - Getter de referencia de `useSocket`.
 * @param room      - ID de la sala incluido en los eventos `typing` salientes.
 *
 * @returns
 * - `typingList`  — array de aliases que están tipeando actualmente (para mostrar).
 * - `emitTyping`  — llamar en cada pulsación de tecla; con throttle interno.
 */
export function useTypingIndicator(getSocket: () => TypedSocket | null, room: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const lastEmitRef = useRef(0);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onTyping = ({ alias }: { alias: string }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.add(alias);
        return next;
      });

      if (timersRef.current.has(alias)) {
        clearTimeout(timersRef.current.get(alias));
      }

      const timer = setTimeout(() => {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(alias);
          return next;
        });
        timersRef.current.delete(alias);
      }, TYPING_TIMEOUT_MS);

      timersRef.current.set(alias, timer);
    };

    s.on('typing', onTyping);

    return () => {
      s.off('typing', onTyping);
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, [getSocket]);

  const emitTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastEmitRef.current < TYPING_EMIT_INTERVAL_MS) return;
    lastEmitRef.current = now;
    const s = getSocket();
    if (s) s.emit('typing', { room });
  }, [getSocket, room]);

  const typingList = Array.from(typingUsers);

  return { typingList, emitTyping };
}
