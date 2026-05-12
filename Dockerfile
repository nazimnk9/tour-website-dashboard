# ─────────────────────────────────────────────
#  Stage 1 – install dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

# Add --ignore-scripts=false to ensure native binaries
# are built/downloaded for linux-musl (Alpine)
RUN npm ci --legacy-peer-deps

# ─────────────────────────────────────────────
#  Stage 2 – build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ⚠️ Do NOT let "COPY . ." overwrite node_modules with a host copy.
# The line below ensures host node_modules (if present) are ignored.
# Add "node_modules" to your .dockerignore file instead (see below).

RUN npm run build

# ─────────────────────────────────────────────
#  Stage 3 – runtime
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup --system nextjs && adduser --system --ingroup nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000

CMD ["node", "server.js"]