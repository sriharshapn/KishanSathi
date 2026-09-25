# ==========================================
# AgriMate Production Multi-Stage Dockerfile
# ==========================================

# Stage 1: Build React 19 + TypeScript Vite Client
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Prepare Server and Package
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5001

# Copy and install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy built frontend assets from stage 1
COPY --from=client-builder /app/client/dist /app/client/dist

# Expose production port
EXPOSE 5001

# Start full-stack AgriMate service
CMD ["node", "server.js"]
