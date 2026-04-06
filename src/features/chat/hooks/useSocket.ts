import { useEffect, useRef, useState, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../../../shared/types/socket.types';
import { KICKED_DELAY_MS } from '../constants/chat';
import { DEFAULT_SERVER_URL } from '../../../shared/constants/app';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL = import.meta.env.VITE_SERVER_URL || DEFAULT_SERVER_URL;

/**
 * Gestiona el ciclo de vida de la conexión Socket.io para una sesión de sala de chat.
 *
 * Al montar, abre una conexión a `VITE_SERVER_URL`, emite `join_room` y
 * sincroniza la lista de `users` a partir de los eventos del servidor.
 * Al desmontar, emite `leave_room` y se desconecta limpiamente.
 *
 * @param room      - ID de la sala a unirse.
 * @param alias     - Nombre de display del usuario local.
 * @param onKicked  - Callback invocado (con un pequeño retraso) cuando el servidor
 *                    expulsa a este usuario.
 * @param addToast  - Función para mostrar mensajes de conexión/error en la UI.
 * @returns `connected`, lista de `users` y getter estable de referencia `getSocket`.
 */
export function useSocket(
  room: string,
  alias: string,
  onKicked: () => void,
  addToast: (msg: string, type: 'info' | 'error') => void,
) {
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const socketRef = useRef<TypedSocket | null>(null);

  const getSocket = useCallback(() => socketRef.current, []);

  useEffect(() => {
    const s: TypedSocket = io(SERVER_URL, { autoConnect: true });
    socketRef.current = s;

    s.on('connect', () => {
      setConnected(true);
      s.emit('join_room', { room, alias }, (res) => {
        if (!res || !res.ok) {
          addToast(res?.message || 'No se pudo unir a la sala', 'error');
          return;
        }
        setUsers(res.users || []);
      });
    });

    s.on('disconnect', () => {
      setConnected(false);
      addToast('Desconectado. Reconectando...', 'error');
    });

    s.on('user_joined', (u) => {
      setUsers((prev) => Array.from(new Set([...prev, u.alias])));
    });

    s.on('user_left', (u) => {
      setUsers((prev) => prev.filter((a) => a !== u.alias));
    });

    s.on('user_kicked', (info) => {
      if (info.alias === alias) {
        addToast('Has sido expulsado de la sala', 'error');
        s.disconnect();
        setTimeout(onKicked, KICKED_DELAY_MS);
      }
    });

    return () => {
      s.emit('leave_room', { room });
      s.disconnect();
    };
  }, [alias, room, addToast, onKicked]);

  return { connected, users, getSocket };
}
