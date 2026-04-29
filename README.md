# Hadar.ma

Plateforme marocaine de prévention des fraudes.
**Restez vigilant avant toute transaction.**

🔗 **Démo en ligne** : [https://hadar-website.vercel.app](https://hadar-website.vercel.app)

---

## Démarrer en local

### Prérequis
- **Node.js ≥ 20**
- **PostgreSQL 15+** (local ou Docker)
- **Redis 7+** (local ou Docker)

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Préparer les variables d'environnement
cp .env.example .env.local
# puis éditer .env.local avec tes vraies valeurs (DATABASE_URL, REDIS_URL, secrets…)

# 3. Générer le client Prisma + appliquer les migrations
npm run prisma:generate
npm run prisma:migrate

# 4. (optionnel) Seed un compte Super-admin local
#    Nécessite SEED_SUPERADMIN_PASSWORD dans .env.local
npm run db:seed

# 5. Lancer le dev server
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance Next.js en mode dev (hot reload) |
| `npm run build` | Build production |
| `npm start` | Lance Next.js en mode prod (après `build`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript strict sans emit |
| `npm run prisma:generate` | Génère le client Prisma typé |
| `npm run prisma:migrate` | Applique les migrations (dev) |
| `npm run prisma:deploy` | Applique les migrations (prod) |
| `npm run db:seed` | Crée un Super-admin local |
| `npm test` | Vitest |
| `npm run audit:deps` | Scan des dépendances (`high`+) |

---

## Architecture

- **Next.js 14** (App Router, Server Components)
- **TypeScript strict**
- **Tailwind CSS** avec tokens charte (`design/brand.md`)
- **Prisma** + **PostgreSQL**
- **Redis** (sessions, cache, rate limit)
- **argon2id** · **jose** · **zod** · **pino**

## Documentation produit

Tout est dans `design/` :
- [`design/brand.md`](./design/brand.md) — charte graphique officielle
- [`design/design-notes.md`](./design/design-notes.md) — spécifications côté utilisateur
- [`design/admin-notes.md`](./design/admin-notes.md) — spécifications back-office
- [`design/legal/`](./design/legal/) — mentions légales

## Sécurité

La sécurité est posée dès les fondations (voir `next.config.mjs` pour les headers stricts, `prisma/schema.prisma` pour le modèle, etc.).

- Headers : CSP, HSTS, X-Frame-Options=DENY, Permissions-Policy restrictive
- Passwords : **argon2id**
- Validation : **Zod** côté serveur obligatoire
- Cookies : `HttpOnly` + `Secure` + `SameSite=Lax`
- Audit log append-only (modèle `AuditLog`)
- Soft-delete + conformité CNDP/RGPD

## Déploiement prod (cible)

- **DigitalOcean Droplet 2 GB** (Docker)
- **DigitalOcean Managed PostgreSQL** + **Managed Redis**
- **DigitalOcean Spaces** (uploads)
- **Cloudflare** devant (WAF, DDoS, CDN, SSL)
- Domaine : `hadar.ma`

## Contribuer

Travail sur la branche `main`. Messages de commit : **conventional commits** (`feat:`, `fix:`, `docs:`, `chore:`).

---

© 2026 HADAR — Tous droits réservés.
