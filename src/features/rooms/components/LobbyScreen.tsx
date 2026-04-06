import { useState, useEffect, type FormEvent } from 'react';
import { PlusCircle, LogIn, Copy, Trash2, RefreshCw, Users, Hash, DoorOpen } from 'lucide-react';
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
  const [pendingRoom, setPendingRoom] = useState<{ id: string; name: string; code: string } | null>(null);

  // Cargar salas automáticamente al montar el componente
  useEffect(() => {
    handleLoadMyRooms();
  }, []);

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
          : result.error.code === 4204
            ? result.error.message // Mensaje personalizado del servidor (nombre duplicado)
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
            <h3>Sala creada exitosamente</h3>
            <p style={{ color: 'var(--muted)' }}>Comparte este código con otros usuarios:</p>
            <div
              style={{
                fontSize: '2rem', fontWeight: 700, letterSpacing: '0.2em',
                color: 'var(--accent)', padding: '16px', border: '2px solid var(--accent)',
                borderRadius: '8px', background: 'var(--bg3)', cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(pendingRoom.code);
                  addToast('Código copiado al portapapeles', 'info');
                } catch (err) {
                  addToast('Error al copiar código', 'error');
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent2)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Clic para copiar"
            >
              {pendingRoom.code}
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(pendingRoom.code);
                    addToast('Código copiado al portapapeles', 'info');
                  } catch (err) {
                    addToast('Error al copiar código', 'error');
                  }
                }}
                style={{
                  flex: 1,
                  background: 'var(--bg3)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: 'center',
                }}
              >
                <Copy size={18} />
                Copiar código
              </button>
              <button
                onClick={() => {
                  onJoinRoom(pendingRoom);
                  setPendingRoom(null);
                }}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
              >
                <DoorOpen size={18} />
                Entrar al chat
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ minWidth: '360px', gap: '24px' }}>
        <h2>
          <span style={{ color: 'var(--accent)' }}>Chat POC</span> — Lobby
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
              <PlusCircle size={18} style={{ marginRight: '4px' }} />
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
              <LogIn size={18} style={{ marginRight: '4px' }} />
              Unirse
            </button>
          </div>
        </form>

        {/* Mis salas */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <label style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
              Mis salas ({myRooms.length}/3)
            </label>
            <button
              onClick={handleLoadMyRooms}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--muted)',
                padding: '6px 12px',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>

          {myRooms.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                border: '1px dashed var(--border)',
                borderRadius: '8px',
                color: 'var(--muted)',
              }}
            >
              <p>No tienes salas creadas</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                Crea una sala arriba para empezar a chatear
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myRooms.map((r) => (
                <div
                  key={r.id}
                  className="card"
                  style={{
                    padding: '12px',
                    background: 'var(--bg3)',
                    border: '1px solid var(--border)',
                    gap: '12px',
                  }}
                >
                  {/* Header: Nombre y usuarios */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ margin: 0, color: 'var(--fg)', fontSize: '1rem' }}>
                        {r.name}
                      </h4>
                      {r.isOwner && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: 'var(--accent)',
                            color: 'var(--bg)',
                            fontWeight: 600,
                          }}
                        >
                          OWNER
                        </span>
                      )}
                      {r.isActive && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: '#10b981',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        >
                          ACTIVA
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      fontSize: '0.875rem', 
                      color: 'var(--muted)',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}>
                      <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} />
                        {r.userCount} usuario{r.userCount !== 1 ? 's' : ''}
                      </span>
                      <span>·</span>
                      <span
                        style={{ 
                          cursor: 'pointer', 
                          color: 'var(--accent)',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(r.code);
                            addToast('Código copiado', 'info');
                          } catch (err) {
                            addToast('Error al copiar', 'error');
                          }
                        }}
                        title="Clic para copiar"
                      >
                        <Hash size={14} />
                        {r.code}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: r.isOwner ? 'auto 1fr auto' : 'auto 1fr',
                    gap: '8px',
                    width: '100%',
                  }}>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(r.code);
                          addToast('Código copiado al portapapeles', 'info');
                        } catch (err) {
                          addToast('Error al copiar código', 'error');
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--muted)',
                        padding: '8px 12px',
                        fontSize: '1rem',
                        minWidth: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Copiar código"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => onJoinRoom({ id: r.id, name: r.name, code: r.code })}
                      style={{
                        background: 'var(--accent)',
                        border: 'none',
                        color: 'var(--bg)',
                        padding: '8px 16px',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: 'center',
                      }}
                    >
                      <DoorOpen size={16} />
                      {r.isActive ? 'Entrar' : 'Reentrar'}
                    </button>
                    {r.isOwner && (
                      <button
                        onClick={() => handleDeleteRoom(r.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--danger)',
                          color: 'var(--danger)',
                          padding: '8px 12px',
                          fontSize: '1rem',
                          minWidth: 'auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Eliminar sala (solo owner)"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
