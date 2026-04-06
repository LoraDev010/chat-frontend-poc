import { useState, type FormEvent } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useToast } from '../../../shared/hooks/useToast';
import { ToastContainer } from '../../../shared/components/Toast';
import type { RoomInfo } from '../types/rooms.types';

interface LobbyScreenProps {
  alias: string;
  onJoinRoom: (room: { id: string; name: string; code: string }) => void;
}

export function LobbyScreen({ alias, onJoinRoom }: LobbyScreenProps) {
  const { toasts, addToast } = useToast();
  const { createRoom, joinByCode, deleteRoom, listMyRooms } = useRooms(alias);

  const [newRoomName, setNewRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [myRooms, setMyRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<{ id: string; name: string; code: string } | null>(null);

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) return;
    setLoading(true);
    const result = await createRoom(name);
    setLoading(false);
    if ('error' in result) {
      const msg =
        result.error.code === 4203
          ? 'Límite de 3 salas alcanzado'
          : `Error al crear sala: ${result.error.message}`;
      addToast(msg, 'error');
    } else {
      setNewRoomName('');
      setPendingRoom({ id: result.roomId, name: result.roomName, code: result.roomCode });
    }
  };

  const handleJoinByCode = async (e: FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    const result = await joinByCode(code);
    setLoading(false);
    if ('error' in result) {
      const msg =
        result.error.code === 4201
          ? 'Código inválido — sala no encontrada'
          : result.error.code === 4202
            ? 'Ya estás en esta sala'
            : result.error.code === 4203
              ? 'Límite de 3 salas alcanzado'
              : result.error.message;
      addToast(msg, 'error');
    } else {
      setJoinCode('');
      onJoinRoom({ id: result.roomId, name: result.roomName, code: result.roomCode });
    }
  };

  const handleLoadMyRooms = async () => {
    setLoading(true);
    const rooms = await listMyRooms();
    setMyRooms(rooms);
    setShowMyRooms(true);
    setLoading(false);
  };

  const handleDeleteRoom = async (roomId: string) => {
    const result = await deleteRoom(roomId);
    if (result.error) {
      const msg =
        result.error.code === 4401 ? 'No eres el propietario de esta sala' : result.error.message;
      addToast(msg, 'error');
    } else {
      setMyRooms((prev) => prev.filter((r) => r.id !== roomId));
      addToast('Sala eliminada', 'info');
    }
  };

  return (
    <div className="page center">
      <ToastContainer toasts={toasts} />

      {pendingRoom && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
          }}
        >
          <div className="card" style={{ minWidth: '300px', gap: '16px', textAlign: 'center' }}>
            <h3>Sala creada</h3>
            <p style={{ color: 'var(--muted)' }}>Comparte este código:</p>
            <div
              style={{
                fontSize: '2rem', fontWeight: 700, letterSpacing: '0.2em',
                color: 'var(--accent)', padding: '12px', border: '1px solid var(--accent)',
                borderRadius: '8px',
              }}
            >
              {pendingRoom.code}
            </div>
            <button
              onClick={() => {
                onJoinRoom(pendingRoom);
                setPendingRoom(null);
              }}
            >
              Entrar al chat
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ minWidth: '360px', gap: '24px' }}>
        <h2>
          <span style={{ color: 'var(--accent)' }}>chatDev</span> — Lobby
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: '-16px' }}>
          Hola, <strong>{alias}</strong>
        </p>

        {/* Crear sala */}
        <form onSubmit={handleCreateRoom}>
          <label>Crear sala</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Nombre de la sala"
              maxLength={50}
            />
            <button type="submit" disabled={loading}>
              Crear
            </button>
          </div>
        </form>

        {/* Unirse por código */}
        <form onSubmit={handleJoinByCode}>
          <label>Unirse por código</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Código (6 chars)"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
            <button type="submit" disabled={loading}>
              Unirse
            </button>
          </div>
        </form>

        {/* Mis salas */}
        <div>
          <button onClick={handleLoadMyRooms} disabled={loading}>
            {showMyRooms ? 'Actualizar mis salas' : 'Mis salas'}
          </button>

          {showMyRooms && (
            <div style={{ marginTop: '12px' }}>
              {myRooms.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No tienes salas creadas</p>
              ) : (
                myRooms.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <strong>{r.name}</strong>
                      <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>#{r.code}</span>
                      <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>{r.userCount} users</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => onJoinRoom({ id: r.id, name: r.name, code: r.code })}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--accent)',
                          color: 'var(--accent)',
                          padding: '2px 10px',
                          borderRadius: '4px',
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        Entrar
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(r.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--danger)',
                          color: 'var(--danger)',
                          padding: '2px 10px',
                          borderRadius: '4px',
                          fontFamily: 'inherit',
                          cursor: 'pointer',
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
