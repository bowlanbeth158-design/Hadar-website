# CLAUDE.md — Contexte projet Hadar.ma

> Ce fichier est lu automatiquement par Claude Code au démarrage de chaque session. Il sert à reprendre le travail sans que l'utilisateur doive tout ré-expliquer.

---

## Résumé projet

**Hadar.ma** — plateforme marocaine de **prévention des fraudes** (arnaques en ligne, non-livraison, blocage après paiement, produits non conformes, usurpation d'identité).

- **Valeur utilisateur** : avant d'acheter ou payer en ligne, vérifier si le contact (numéro, email, site web, RIB, compte crypto, etc.) a déjà été signalé
- **Modèle** : contributions utilisateurs (signalements) + modération humaine + agrégation en niveaux de risque
- **Bilingue** FR / AR (public cible : Maroc)
- **Baseline officielle** : « Restez vigilant avant toute transaction. »

## État d'avancement (au commit le plus récent)

### ✅ Phase 1 — Specs complètes
Toutes les décisions produit sont figées et documentées. Voir les 3 fichiers de référence :
- **`design/brand.md`** — charte graphique officielle (logo, palette, gradients, icônes, tokens Tailwind)
- **`design/design-notes.md`** — partie utilisateur (20 écrans : accueil, recherche, signalement, profil, mes signalements/alertes, etc.)
- **`design/admin-notes.md`** — partie admin (11 écrans : dashboard, modération, membres, utilisateurs, stats, paramètres, administration, assistant, annonces)
- **`design/legal/*.md`** — 6 pages légales (CGU, privacy, FAQ, etc.)

### 🚧 Phase 2 — Code (en cours)
Scaffolding Next.js 14 posé. Écrans à implémenter ensuite un par un, selon priorités du propriétaire.

---

## Décisions produit clés à ne pas oublier

### Rôles (4, hiérarchiques)
1. **Super-admin** (1-2 personnes) — seul à pouvoir les 5 actions 🔒 (changeRole, hardDelete, rolesEdit, platformSettings, integrations)
2. **Admin** — équipe dirigeante, tous droits sauf les 5 🔒
3. **Modérateur** — modération signalements + gestion partielle users
4. **Support** — chat + reset password user

### Statuts signalements (5 user-facing + 1 backend)
`SUBMITTED` → `UNDER_REVIEW` → {`PUBLISHED` | `REJECTED` | `NEEDS_CORRECTION`} → (`ARCHIVED`)

### Statuts utilisateur (4)
`Actif` · `Inactif` · `Bloqué` · `Supprimé` (soft-delete avec restauration admin possible)

### Niveaux de risque (4, par contact signalé)
- 🟢 Faible = 0 · 🟡 Vigilance = 1-2 · 🟠 Modéré = 3-4 · 🔴 Élevé ≥ 5

### Règle d'unicité signalement
`UNIQUE (userId, contactValue, channel)` — un user peut signaler 1 contact par canal, jamais 2× le même tuple.

### Motifs obligatoires
- `Non retenu` (modération)
- `Bloquer` un user
- `Supprimer` un user

### Workflow "À corriger"
Notif cloche rouge + email → écran d'édition avec motif admin → resoumission → repasse en `UNDER_REVIEW`.

### Widget rating 1-5 ⭐
Affiché après chaque signalement soumis → alimente les 4 KPI satisfaction (`/admin/statistiques` page 4).

---

## Sidebar admin (structure figée)

```
Hadar.ma
────────
🏠 Dashboard
🚨 Signalements
👥 Membres
👤+ Utilisateurs
📊 Statistiques
📝 Annonces
🎧 Assistant
────────
🛡️ Administration  ← Admin+ uniquement
⚙️ Paramètres      ← tous rôles
```

---

## Stack technique

- **Next.js 14** (App Router, Server Components)
- **TypeScript strict**
- **Tailwind CSS** + tokens charte (`brand.navy/blue/sky/...`)
- **Prisma** + **PostgreSQL** (managed)
- **Redis** (sessions, cache, rate limiting)
- **argon2id** (hashing passwords) · **jose** (JWT) · **zod** (validation) · **pino** (logs)

## Infrastructure cible (prod)

- **DigitalOcean Droplet 2 GB** (app Next.js dans Docker)
- **DigitalOcean Managed PostgreSQL** + **Managed Redis**
- **DigitalOcean Spaces** (uploads preuves signalement)
- **Cloudflare** devant (gratuit) — CDN + WAF + DDoS + SSL
- **Domaine** : `hadar.ma` (pointé vers Cloudflare)
- Budget ~$47/mois (crédit $200 DO disponible = ~4 mois de prod)

## Sécurité (baked-in dès le code)

- Headers stricts (CSP, HSTS, X-Frame-Options) dans `next.config`
- argon2id passwords + JWT 15 min + refresh token rotation
- Cookies `HttpOnly` + `Secure` + `SameSite=Lax`
- Zod validation **serveur obligatoire** sur chaque endpoint
- CSRF tokens sur toutes les mutations
- Rate limiting Redis (login, signup, recherche, API)
- Account lockout après 5 tentatives ratées
- 2FA TOTP pour Admin/Super-admin
- Uploads : magic bytes + antivirus (ClamAV) + noms UUID
- Audit log append-only sur toutes les actions sensibles
- Dependabot + Semgrep activés

## Performance (targets)

- Recherche contact : **< 200 ms** même sous charge
- Page publique (FAQ, légal) : **< 50 ms** via cache Cloudflare
- Cache Redis (résultats recherche TTL 60 s)
- Compteurs pré-calculés (pas de `COUNT(*)` live)
- Index `pg_trgm` sur `contactValue` pour recherche partielle
- Next.js Server Components + streaming SSR

---

## Branche git active

**`claude/continue-project-dJHA7`** (repo `bowlanbeth158-design/Hadar-website`). Toujours commit + push sur cette branche.

## Comment reprendre dans une nouvelle session

1. `git status` + `git log --oneline -20` pour voir l'état
2. Lire `design/design-notes.md` + `design/admin-notes.md` + `design/brand.md` pour le contexte complet
3. Demander au propriétaire : "Sur quoi veux-tu avancer ?" — il indiquera le prochain écran ou la prochaine feature à coder
4. Toujours commit + push après chaque incrément logique

## Conventions de code

- Messages de commit : **conventional commits** (`feat:`, `fix:`, `docs:`, `chore:`)
- Pas de `any` TypeScript sauf exception justifiée en commentaire
- Composants React Server par défaut ; `"use client"` uniquement quand nécessaire
- Fichiers nommés en kebab-case (`report-card.tsx`, `user-menu.tsx`)
- Dossiers d'écrans admin sous `app/admin/`
- Routes API sous `app/api/`
- Pas de `console.log` en prod — utiliser `pino` logger avec scrubbing PII

## Questions ouvertes (non bloquantes, à valider au fil de l'eau)

Voir `design/admin-notes.md` §Questions ouvertes. Les plus importantes :
- Seuils SLA par priorité de ticket (proposition : Urgente 1 h / Haute 4 h / Moyenne 24 h / Basse 72 h)
- Provider email transactionnel (SendGrid / Resend / Mailgun)
- Fournisseur LLM chatbot (Anthropic recommandé)
- Langue admin : FR seul ou bilingue FR/AR
- Fichiers sources du logo SVG à récupérer auprès du designer

---

**Dernier point de contact** : le propriétaire a validé le passage au dev après la phase specs. Le scaffolding Next.js est en cours.
