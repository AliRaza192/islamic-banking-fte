# Dockerfile — Islamic Banking FTE
# Multi-stage: build + runtime
FROM node:20-alpine AS base
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy application code
COPY api/ ./api/
COPY web/ ./web/
COPY skills/ ./skills/
COPY references/ ./references/
COPY hooks/ ./hooks/
COPY CLAUDE.md schema.sql vercel.json ./

# Production stage
FROM node:20-alpine AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup
USER appuser

COPY --from=base /app .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npx", "vercel", "dev", "--listen", "0.0.0.0:3000"]
