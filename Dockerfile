# ==========================================
# Stage 1: Build Client Frontend (Vite + React)
# ==========================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY src/client/package*.json ./
RUN npm install
COPY src/client/ ./
RUN npm run build

# ==========================================
# Stage 2: Build Server Backend (Fastify TypeScript)
# ==========================================
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY src/server/package*.json ./
RUN npm install
COPY src/server/ ./
RUN npm run build

# ==========================================
# Stage 3: Production Runtime
# ==========================================
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=80
ENV STATIC_DIR=/app/public

COPY src/server/package*.json ./
RUN npm install --omit=dev

# Copy compiled server code
COPY --from=server-builder /app/server/dist ./server-dist

# Copy compiled frontend static assets
COPY --from=client-builder /app/client/dist ./public

EXPOSE 80

CMD ["node", "server-dist/index.js"]
