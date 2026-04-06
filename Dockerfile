# syntax=docker/dockerfile:1
# Multi-platform build compatible: linux/amd64, linux/arm64

FROM node:22-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 5173

# Comando por defecto (puede ser sobrescrito en docker-compose)
CMD ["npm", "run", "dev", "--", "--host"]
