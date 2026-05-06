# ─────────────────────────────────────────────────────────────────────────────
# Hadar.ma — Dockerfile production
# ─────────────────────────────────────────────────────────────────────────────
#
# Multi-stage build :
#   1. deps      — install des dépendances avec lockfile
#   2. builder   — génération Prisma client + `next build` (output standalone)
#   3. runner    — image finale minimale, non-root, healthcheck
#
# Sécurité :
#   - Image alpine + node:22 LTS
#   - User non-root (uid 1001)
#   - HEALTHCHECK basique sur /api/me ou /
#   - Aucune dépendance dev dans l'image finale
#
# Build :
#   docker build -t hadar:latest .
#
# Run :
#   docker run -p 3000:3000 --env-file .env.production hadar:latest

# ── Stage 1 : Install deps ──────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# argon2 a besoin de python + build-base pour compiler ses bindings natifs.
RUN apk add --no-cache libc6-compat python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ── Stage 2 : Build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Pour Prisma generate (cli tool).
RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Génère le client Prisma avec les binaires linux-musl-openssl-3.0.x.
# (déjà inclus dans schema.prisma binaryTargets).
RUN npx prisma generate

# next.config.mjs doit avoir output: 'standalone' pour que cette étape
# produise un dossier minimal copiable dans l'image runner.
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── Stage 3 : Runner ────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Utilisateur non-root (sécurité).
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Outils système nécessaires au runtime :
# - openssl : Prisma client lib
# - curl    : HEALTHCHECK
RUN apk add --no-cache openssl curl

# Copie l'output standalone (next standalone embarque déjà node_modules
# nécessaires) + les artefacts publics + le client Prisma généré.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma engine + schema (utilisés par migrate deploy en production).
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
