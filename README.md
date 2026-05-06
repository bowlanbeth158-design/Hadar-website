# Hadar.ma

> Plateforme marocaine de prévention des fraudes.
> **Restez vigilant avant toute transaction.**

[![CI](https://github.com/bowlanbeth158-design/Hadar-website/actions/workflows/ci.yml/badge.svg)](https://github.com/bowlanbeth158-design/Hadar-website/actions/workflows/ci.yml)
[![Security](https://github.com/bowlanbeth158-design/Hadar-website/actions/workflows/security-scan.yml/badge.svg)](https://github.com/bowlanbeth158-design/Hadar-website/actions/workflows/security-scan.yml)

## Qu'est-ce que c'est ?

Hadar permet aux Marocains de **vérifier un contact** (numéro,
email, site, RIB, crypto, etc.) **avant** de payer ou d'acheter en
ligne. Les signalements sont contribués par la communauté et modérés
par notre équipe.

## Stack

- **Frontend** : Next.js 14 (App Router) + React 18 + TypeScript + Tailwind
- **Backend** : Next.js API routes + Prisma ORM + PostgreSQL 17
- **Cache / sessions** : Redis 7
- **Auth** : argon2id + JWT (HS512) + refresh token rotation + 2FA TOTP
- **Stockage objets** : DigitalOcean Spaces (S3-compatible) pour les évidences
- **Email** : Resend (transactionnel)
- **Hébergement** : DigitalOcean Droplet + Cloudflare Tunnel
- **i18n** : FR / EN / AR (RTL natif)
- **Monitoring** : Glitchtip self-hosted (Sentry-compatible) + Uptimerobot

## Démarrer en local

### Prérequis

- Node.js 22+
- Docker + Docker Compose

### Installation

```bash
git clone https://github.com/bowlanbeth158-design/Hadar-website.git
cd Hadar-website
npm install
```

### Configuration

```bash
cp .env.example .env.local
node scripts/generate-secrets.mjs >> .env.local
# Édite .env.local pour ajouter DATABASE_URL + DIRECT_URL (Neon ou local)
```

### Lancer la stack

```bash
docker compose up -d              # Postgres + Redis
npx prisma migrate dev            # Crée les tables
SEED_SUPERADMIN_PASSWORD='un-mot-de-passe-fort' npm run db:seed
npm run dev                       # http://localhost:3000
```

## Tests

```bash
npm test                          # Vitest unit tests (105 tests)
npm run typecheck                 # TypeScript strict
npm run lint                      # ESLint
npm run test:e2e                  # Playwright e2e (Chrome + Mobile Safari)
npm run audit:deps                # npm audit production
```

## Documentation

- [`design/`](./design) — specs produit (UI, légal, écrans admin)
- [`docs/deployment.md`](./docs/deployment.md) — runbook complet (DO + Cloudflare)
- [`docs/monitoring.md`](./docs/monitoring.md) — Glitchtip + Uptimerobot
- [`docs/migration-front-back.md`](./docs/migration-front-back.md) — état mock → API
- [`scripts/jobs/README.md`](./scripts/jobs/README.md) — cron jobs (rétention, agrégats)
- [`prisma/schema.prisma`](./prisma/schema.prisma) — schéma DB (25 tables, commentaires détaillés)

## Sécurité

Hadar manipule des PII sensibles (CIN, selfies, données de fraude)
et applique :

- **argon2id** + pepper KMS pour les mots de passe
- **2FA TOTP** obligatoire pour le staff (Admin, Modérateur, Support)
- **JWT 15 min** + refresh tokens 30 j avec rotation et détection de réutilisation
- **Chiffrement champ-par-champ** AES-256-GCM (CIN, secrets TOTP, payload audit)
- **HMAC peppered** sur les contactValueHash (recherche indexée sans révéler les contacts)
- **Audit log append-only** avec hash chain (chaque ligne contient le hash de la précédente,
  trigger Postgres bloque UPDATE/DELETE)
- **CSRF** via Origin/Referer middleware sur toutes les mutations
- **CSP stricte** + HSTS preload + X-Frame-Options DENY
- **Rate limiting** sliding window (signup, login, search, etc.)
- **HIBP** check sur les mots de passe au signup et reset
- **Cloudflare Turnstile** sur les routes anti-bot
- **Validation magic bytes + ré-encodage sharp** sur tous les uploads (EXIF stripping)
- **Anti-énumération** sur signup/login/password-reset
- **Auto-purge** RGPD des évidences (90 j post-publication) et CIN/selfie (30 j post-validation)

Pour reporter une vulnérabilité : `security@hadar.ma`.

## Roadmap

| Étape | Statut |
|---|---|
| 1. Backend & DB (25 tables, 30+ routes API, 105 tests) | ✅ |
| 2. Auth & sécurité (CSRF, HIBP, 2FA TOTP réel, audit hash chain, CSP, uploads) | ✅ |
| 3. Front ↔ API (toutes les surfaces utilisateur + admin live) | ✅ |
| 4. Infra & déploiement (Docker + Cloudflare Tunnel + GitHub Actions CI/CD) | ✅ |
| 5. Qualité (Playwright e2e + Semgrep SAST + TruffleHog + Dependabot) | ✅ |
| 6. Launch (CNDP + pentest + soft launch beta privée) | 🔜 |

## Licence

Propriétaire — code source non public en dehors de l'équipe Hadar.
