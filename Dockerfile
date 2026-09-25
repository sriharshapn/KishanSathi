# AgriMate - Production Dockerfile for Google Cloud Run / Container Platforms
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and subproject package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm run install:all

# Copy source files
COPY client/ ./client/
COPY server/ ./server/

# Build Vite client
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Copy build artifacts and server code
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/dist ./client/dist

# Expose HTTP port for Google Cloud Run
EXPOSE 5001

# Start production Node.js Express server
CMD ["node", "server/server.js"]
