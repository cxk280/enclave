# syntax=docker/dockerfile:1
# Multi-stage build producing a minimal, self-contained Next.js standalone image.
# No external network is needed at runtime — fonts are vendored, inference is
# in-process, and the CSP blocks egress. Consistent with the sovereignty story.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Region-locked, app-owned dir for the append-only audit log (persists across
# container restarts; a redeploy intentionally starts a fresh trail).
ENV ENCLAVE_AUDIT_DIR=/app/.data

# Run as a non-root user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# The standalone output bundles only what the server needs.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Writable, non-root-owned dir for the persisted audit log.
RUN mkdir -p /app/.data && chown nextjs:nodejs /app/.data

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
