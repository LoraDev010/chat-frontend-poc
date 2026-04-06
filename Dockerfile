# Dockerfile para Chat Frontend
FROM node:18-alpine

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
