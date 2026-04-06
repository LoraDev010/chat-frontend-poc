# Chat Frontend

Cliente React con Socket.io para chat en tiempo real. Para instrucciones completas de setup con Docker, ver el [README principal](../../README.md).

## Stack

- React 18 + TypeScript 5
- Vite 8 como build tool
- Socket.io Client 4
- Arquitectura por features

## Estructura

```
src/
├── app/
│   └── App.tsx                 # Componente raíz, state global
├── features/
│   ├── auth/
│   │   └── AliasScreen.tsx     # Pantalla de ingreso de alias
│   ├── chat/
│   │   ├── components/         # ChatRoom, MessageList, Composer, etc.
│   │   └── hooks/              # useSocket, useChatMessages, useTypingIndicator
│   └── rooms/
│       ├── components/         # LobbyScreen, RoomList
│       └── hooks/              # useRooms
└── shared/
    ├── components/             # Toast, reutilizables
    ├── hooks/                  # useToast
    ├── types/                  # Socket.io types
    └── constants/              # URLs, configuración
```

## Setup Local (Sin Docker)

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev              # http://localhost:5173

# Build
npm run build

# Preview
npm run preview
```

## Variables de Entorno

```env
VITE_SERVER_URL=http://localhost:3000
```

Si no se define, usa `http://localhost:3000` por defecto.

## Features

- Salas públicas con códigos de 6 caracteres
- Mensajes en tiempo real
- Indicador de "escribiendo..."
- Lista de usuarios activos
- Tabs para múltiples salas
- Sistema de bans temporales
- Toasts para notificaciones

## Arquitectura

```
App.tsx (State: alias, rooms[], activeRoomId)
    ↓
LobbyScreen / ChatRoom (según estado)
    ↓
Custom Hooks (useSocket, useChatMessages, etc.)
    ↓
Socket.io Client
```

## Documentación

Ver instrucciones de arquitectura en `.github/instructions/react-architecture.instructions.md` del proyecto principal.

## Configuración

El cliente se conecta por defecto a `http://localhost:3000` (backend).

Para cambiar la URL del servidor, edita la conexión en `src/features/chat/hooks/useSocket.ts`

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Genera build de producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta ESLint

## Arquitectura

Este proyecto sigue una arquitectura modular basada en features:

- Cada feature es independiente y auto-contenido
- Separación clara entre componentes, hooks y tipos
- Componentes y hooks compartidos en `shared/`

## Notas

- Sin autenticación formal (solo alias)
- Salas públicas sin persistencia
- Diseñado como POC/demo
