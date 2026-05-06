# Migration front ↔ backend — état d'avancement

Dernière mise à jour : 2026-05-06.

## ✅ Branché au backend (vrais flux DB)

| Surface | Composants | Routes API consommées |
|---|---|---|
| Inscription / Connexion / Logout | `SignupFormContent`, `LoginFormContent`, `UserMenu` | `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/me`, `/api/auth/refresh` (auto) |
| Mot de passe oublié | `ForgotPasswordContent` | `/api/auth/password-reset/request` |
| Page reset password (`/reset-password?token=…`) | `ResetPasswordContent` | `/api/auth/password-reset/confirm` |
| Page vérification email (`/verify-email?token=…`) | `VerifyEmailContent` | `/api/auth/verify-email` |
| Mes expériences (liste) | `MesSignalementsListLive` | `/api/reports/mine` |
| Mes expériences (détail) | `ReportDetailBodyLive` | `/api/reports/[id]` |
| Mes suivis (liste) | `MesAlertesListLive` | `/api/alerts/mine` |
| Soumission signalement | `ReportForm` | `/api/reports` |
| Recherche publique | `SearchResult` | `/api/search` |
| Suivi de contact (toggle) | `useFollowContact` | `/api/alerts`, `/api/alerts/[id]` |
| Garde admin (auth) | `AdminAuthGuard` (sur layout `/admin`) | `/api/me` |
| Admin signalements (liste) | `AdminReportsListLive` | `/api/admin/reports` |
| Admin signalements (détail + modération) | `AdminReportDetailLive` | `/api/reports/[id]` + `/api/admin/reports/[id]/moderate` |
| Admin utilisateurs (liste + actions) | `AdminUsersListLive` | `/api/admin/users` + `/api/admin/users/[id]/{block,unblock,delete}` |
| Admin vérifications (file + actions) | `AdminVerificationsListLive` | `/api/admin/verifications` + `/api/admin/verifications/[id]/{approve,reject}` |

## ✅ Backend — toutes les routes API codées

Auth + reports + search + alerts + verifications + uploads + admin
(reports, users, verifications, members, stats, announcements,
platform-config, contributor-tiers, tickets, audit-log).

Voir `app/api/` et `scripts/jobs/`.

## 🟡 À faire pour la v1 (hors scope étape 3 base)

Ces flux nécessitent du travail UI non-trivial qui mérite ses
propres PR. Le backend est prêt, c'est le front qui demande des
composants spécifiques.

### 1. Vérification d'identité — flow d'upload réel

`IdentityVerificationModal` actuellement simule la vérification avec
un setTimeout. Pour le faire vraiment :

1. Capture caméra du selfie (getUserMedia) ou upload fichier.
2. Calcul pHash côté client (lib image-hash ou WebGL custom).
3. POST /api/uploads pour CIN → signed URL → PUT direct vers Spaces.
4. POST /api/uploads pour selfie → idem.
5. POST /api/verifications avec les 2 object keys + pHash.

### 2. 2FA TOTP enrollment modal

`TfaEnrollmentModal` actuellement génère un faux secret côté client.
Pour le faire vraiment :

1. À l'ouverture (mode 'app') → POST /api/auth/2fa/setup pour obtenir
   otpauthUri + secretBase32.
2. Génération QR code à partir de l'otpauthUri (lib `qrcode` npm).
3. À la validation du code → POST /api/auth/2fa/verify.
4. Affichage des recoveryCodes retournés (1 seule fois, à imprimer).

### 3. Modal contestation publique

Pas encore branché côté SearchResult. Il faudrait ajouter un bouton
"Contester ce signalement" sur la card d'un signalement publié, qui
ouvre une modale appelant POST /api/reports/[id]/contestation.

### 4. Pages admin secondaires (priorité basse)

/admin/membres, /admin/annonces, /admin/parametres,
/admin/statistiques, /admin/administration, /admin/assistant sont
encore sur mocks. Les routes API existent toutes — il reste juste à
wirer chaque page sur le pattern *Live.tsx :

- /admin/membres → GET /api/admin/members + actions
- /admin/annonces → GET/POST /api/admin/announcements
- /admin/parametres → GET/POST /api/admin/platform-config
- /admin/statistiques → GET /api/admin/stats
- /admin/administration (audit log) → GET /api/admin/audit-log (super-admin)
- /admin/assistant (tickets) → GET /api/admin/tickets

Ces pages sont fonctionnelles en démo et leur migration suit le
pattern établi.

## Pattern de wiring (référence)

```tsx
// 1. Créer un composant *Live.tsx qui fait useApi<T>('/api/...')
// 2. Mapper la réponse au shape attendu par le composant existant
// 3. Remplacer l'import dans la page par le wrapper Live
```

Modèles : MesSignalementsListLive, MesAlertesListLive,
AdminReportsListLive, AdminUsersListLive, AdminVerificationsListLive.
