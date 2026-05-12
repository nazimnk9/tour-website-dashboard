# ─────────────────────────────────────────────
#  Stage 1 – install dependencies
# ─────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

COPY package.json ./

# Don't copy package-lock.json — let npm generate a fresh one for Linux
RUN npm install --legacy-peer-deps


# ─────────────────────────────────────────────
#  Stage 2 – build
# ─────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build


# ─────────────────────────────────────────────
#  Stage 3 – runtime
# ─────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN groupadd --system nextjs && useradd --system --gid nextjs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 5000

CMD ["npm", "run", "start"]