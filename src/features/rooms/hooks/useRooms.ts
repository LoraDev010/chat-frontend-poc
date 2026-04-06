import { useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '../../../shared/types/socket.types';
import type { RoomInfo } from '../types/rooms.types';
import { DEFAULT_SERVER_URL } from '../../../shared/constants/app';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SERVER_URL = import.meta.env?.VITE_SERVER_URL || DEFAULT_SERVER_URL;

export interface RoomActionError {
  code: number;
  message: string;
}

export function useRooms(alias: string) {
  const socketRef = useRef<TypedSocket | null>(null);

  useEffect(() => {
    const s: TypedSocket = io(SERVER_URL, { autoConnect: true });
    socketRef.current = s;
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, []);

  const createRoom = useCallback(
    (name: string): Promise<{ roomId: string; roomCode: string; roomName: string } | { error: RoomActionError }> => {
      return new Promise((resolve) => {
        const s = socketRef.current;
        if (!s) return resolve({ error: { code: 0, message: 'not_connected' } });
        const emit = () =>
          s.emit('create_room', { name, alias }, (res) => {
            if (res.ok && res.roomId && res.roomCode) {
              resolve({ roomId: res.roomId, roomCode: res.roomCode, roomName: name });
            } else {
              resolve({ error: { code: res.code ?? 0, message: res.message ?? 'error' } });
            }
          });
        s.connected ? emit() : s.once('connect', emit);
      });
    },
    [alias],
  );

  const joinByCode = useCallback(
    (code: string): Promise<{ roomId: string; roomName: string; roomCode: string } | { error: RoomActionError }> => {
      return new Promise((resolve) => {
        const s = socketRef.current;
        if (!s) return resolve({ error: { code: 0, message: 'not_connected' } });
        const emit = () =>
          s.emit('join_room_by_code', { code, alias }, (res) => {
            if (res.ok && res.roomId) {
              resolve({ roomId: res.roomId, roomName: res.roomName ?? code, roomCode: code });
            } else {
              resolve({ error: { code: res.code ?? 0, message: res.message ?? 'error' } });
            }
          });
        s.connected ? emit() : s.once('connect', emit);
      });
    },
    [alias],
  );

  const deleteRoom = useCallback(
    (roomId: string): Promise<{ error?: RoomActionError }> => {
      return new Promise((resolve) => {
        const s = socketRef.current;
        if (!s) return resolve({ error: { code: 0, message: 'not_connected' } });
        const emit = () =>
          s.emit('delete_room', { roomId, alias }, (res) => {
            if (res.ok) {
              resolve({});
            } else {
              resolve({ error: { code: res.code ?? 0, message: res.message ?? 'error' } });
            }
          });
        s.connected ? emit() : s.once('connect', emit);
      });
    },
    [alias],
  );

  const listMyRooms = useCallback((): Promise<RoomInfo[]> => {
    return new Promise((resolve) => {
      const s = socketRef.current;
      if (!s) return resolve([]);
      const emit = () => s.emit('list_my_rooms', { alias }, (res) => resolve(res.ok ? (res.rooms ?? []) : []));
      s.connected ? emit() : s.once('connect', emit);
    });
  }, [alias]);

  return { createRoom, joinByCode, deleteRoom, listMyRooms };
}
