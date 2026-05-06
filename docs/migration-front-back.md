# Migration front ↔ backend — état d'avancement

Dernière mise à jour : 2026-05-06.

## ✅ Branché au backend (vrais flux DB)

| Surface | Composants | Routes API consommées |
|---|---|---|
| Inscription / Connexion / Logout | `SignupFormContent`, `LoginFormContent`, `UserMenu` | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/me`, `/api/auth/refresh` (auto) |
| Mot de passe oublié | `ForgotPasswordContent` | `/api/auth/password-reset/request` |
| Mes expériences (liste) | `MesSignalementsListLive` | `/api/reports/mine` |
| Soumission signalement | `ReportForm` | `/api/reports` |
| Recherche publique | `SearchResult` | `/api/search` |
| Suivi de contact (toggle) | `useFollowContact` | `/api/alerts`, `/api/alerts/[id]` |
| Garde admin (auth) | `AdminAuthGuard` (sur layout `/admin`) | `/api/me` (lookup membership) |
| Liste signalements admin | `AdminReportsListLive` | `/api/admin/reports` |

## 🟡 À brancher (encore sur mocks / localStorage)

Ces vues utilisent les fichiers `lib/mock/*.ts` ou `localStorage`. Le
backend correspondant existe déjà (toutes les routes API sont
codées), il reste à créer le wrapper `*Live.tsx` qui fetch et
mappe → composant existant.

| Surface | Mock actuel | Route à brancher |
|---|---|---|
| Mes suivis (liste) | `MesAlertesList` + `localStorage hadar:follows` | `GET /api/alerts/mine` |
| Détail signalement (`/mes-signalements/[id]`) | `USER_REPORTS` mock | `GET /api/reports/[id]` |
| Reset password (page) | n/a | `POST /api/auth/password-reset/confirm` |
| Vérification email (page) | n/a | `POST /api/auth/verify-email` |
| Vérification d'identité (form) | localStorage | `POST /api/uploads` + `POST /api/verifications` |
| Mon profil — niveau contributeur | `localStorage tierThresholds` | `GET /api/me` (déjà fait) + lecture serveur de `publishedReportsCount` |
| Modal contestation (`SearchResult`) | n/a | `POST /api/reports/[id]/contestation` |
| Setup 2FA member (modal) | localStorage stub | `POST /api/auth/2fa/setup` + `/verify` |

## 🟡 Admin — pages à brancher

Le `AdminAuthGuard` est posé : un visiteur non-membre est redirigé
vers `/connexion`. Reste à brancher chaque vue admin individuelle :

| Page admin | Mock actuel | Route à brancher |
|---|---|---|
| `/admin/signalements` | `lib/mock/signalements.ts` | ✅ POC posé via `AdminReportsListLive` (à insérer dans la page) |
| `/admin/signalements/[id]/moderate` | n/a | `POST /api/admin/reports/[id]/moderate` |
| `/admin/utilisateurs` (liste) | `lib/mock/utilisateurs.ts` | `GET /api/admin/users` |
| `/admin/utilisateurs` (vérifications onglet) | `lib/mock/verifications.ts` | `GET /api/admin/verifications`, `/approve`, `/reject` |
| `/admin/utilisateurs` (étoiles onglet) | `localStorage` | `POST /api/admin/contributor-tiers` (à coder) |
| Block / Unblock / Delete user | localStorage stub | `POST /api/admin/users/[id]/block` etc. |
| `/admin/membres` | `lib/mock/membres.ts` | `GET /api/admin/members` (à coder) |
| `/admin/statistiques` | `lib/mock/stats-*.ts` | `GET /api/admin/stats` (à coder) |
| `/admin/annonces` | localStorage | `GET/POST /api/admin/announcements` (à coder) |
| `/admin/parametres` | localStorage | `GET/POST /api/admin/platform-config` (à coder) |
| `/admin/administration` | mocks divers | divers `/api/admin/*` (audit log, jobs) |
| `/admin/assistant` | mocks support | `GET/POST /api/admin/tickets` (à coder) |

## Pattern de wiring

Pour chaque vue mock → live, suivre le même schéma :

```tsx
// 1. Créer un composant *Live.tsx qui fait useApi<T>('/api/...')
// 2. Mapper la réponse au shape attendu par le composant existant
// 3. Remplacer l'import dans la page par le wrapper Live
```

Cf. `MesSignalementsListLive.tsx` et `AdminReportsListLive.tsx` pour
les modèles de référence.

## Routes API encore manquantes (à coder côté backend)

- `GET /api/admin/members` (liste staff)
- `POST /api/admin/members` (création staff)
- `PATCH /api/admin/members/[id]` (changement de rôle 🔒)
- `GET /api/admin/stats` (KPI global)
- `GET/POST /api/admin/announcements`
- `GET/POST /api/admin/platform-config`
- `GET/POST /api/admin/tickets`, `/api/admin/tickets/[id]/messages`
- `POST /api/admin/contributor-tiers` (édition seuils)
- `GET /api/audit-log` (lecture audit, super-admin)
