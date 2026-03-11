# ======================================
# Stage 1: Dependencies
# ======================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# ======================================
# Stage 2: Development deps (for build)
# ======================================
FROM node:20-alpine AS dev-deps

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

# ======================================
# Stage 3: Production image
# ======================================
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy production deps
COPY --from=deps /app/node_modules ./node_modules

# Copy app code
COPY --chown=appuser:appgroup . .

# Create required directories
RUN mkdir -p uploads logs && \
    chown -R appuser:appgroup uploads logs

# Remove dev files
RUN rm -rf tests/ *.test.js .eslintrc*

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

EXPOSE 3001

ENV NODE_ENV=production

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "app.js"]
