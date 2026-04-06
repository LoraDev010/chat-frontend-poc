# Chat Frontend

Cliente web para aplicación de chat en tiempo real con salas públicas.

## Stack Tecnológico

- **React 18** con TypeScript
- **Vite** como build tool
- **Socket.io Client** para comunicación real-time
- **Arquitectura modular** basada en features

## Estructura

```
src/
├── app/              # Componente raíz
├── features/         # Features modulares
│   ├── auth/        # Autenticación (alias)
│   ├── chat/        # Sala de chat
│   └── rooms/       # Gestión de salas
└── shared/          # Componentes y tipos compartidos
```

## Setup

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

El cliente estará disponible en `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

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
