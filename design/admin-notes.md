# Hadar.ma — Admin / Back-office (analyse des maquettes)

> Source : maquettes admin fournies par le propriétaire (avril 2026).
> Ce fichier documente **uniquement l'espace admin**. Le côté utilisateur est dans `design-notes.md`, la charte dans `brand.md`.

---

## Règles générales d'accès

- 🔐 **Authentification obligatoire** : pas de signup public pour l'admin
- Comptes admin créés manuellement (ou par un super-admin)
- Écran de login dédié (différent du login utilisateur) — maquette à recevoir

### Distinction Membres / Utilisateurs (validée par le propriétaire)
- **Membres** = équipe interne Hadar (admins, modérateurs, support)
- **Utilisateurs** = usagers finaux de la plateforme (ceux qui signalent / vérifient)

Deux entités distinctes dans la base et deux écrans de gestion séparés.

---

## Layout global admin

### Sidebar (gauche, fond navy `#00327D`, pleine hauteur)
- **Header sidebar** : logo `Hadar.ma` (bouclier + wordmark blanc) + bouton hamburger `☰` (collapse/expand)
- **Nav items** (icône + label, blanc sur navy ; actif = pill jaune/orange avec texte jaune + icône jaune) :
  1. `🏠 Dashboard` *(route `/admin`)*
  2. `🚨 Signalements` — modération
  3. `👥 Membres` — équipe interne
  4. `👤+ Utilisateurs` — usagers finaux
  5. `📊 Statistiques`
  6. `📝 Annonces` — publications bandeau / news plateforme
  7. `🎧 Assistant` — support / chatbot / tickets
- **Footer sidebar** (bas, ancré) : `⚙️ Paramètres`

### Top bar (droite, au-dessus du contenu)
- **Barre de recherche globale** (pill blanc large, loupe à droite, placeholder "Rechercher…")
  - Portée : **recherche transversale** sur toute la plateforme (signalements, utilisateurs, membres, annonces…). Comportement SaaS type Notion/Linear.
- **Chat** 💬 avec badge rouge numérique
  - Volume = nombre de conversations ou messages non lus du **chatbot utilisateur** (voir §Assistant)
  - Click → ouvre l'interface de supervision
- **Notifications** 🔔 avec badge rouge numérique
  - Volume = **nombre de nouveaux signalements** en attente de modération
  - Click → popover listant les derniers signalements → lien "Voir tout" qui mène à `/admin/signalements?filter=pending`
- **Pill `Admin`** (navy outline sur fond blanc) : indique le rôle de la personne connectée (à dynamiser selon le rôle réel : `Admin`, `Modérateur`, `Support`…)
- **Avatar** rond (photo membre ou placeholder) → dropdown profil / déconnexion

### Zone contenu
- Fond : blanc ou très clair bleuté (`#F7F9FB` / dégradé `#DBE5F3` → blanc)
- Padding confortable, cards arrondies (radius ~16 px), ombres douces

---

## Écran 1 — Dashboard (`/admin`)

### Header de page
- Titre H1 **`Dashboard`** navy
- Actions à droite :
  - `🔄 Rafraîchir` — pill navy plein, icône flèche circulaire, recharge les KPI
  - `⬇ Exporter` — pill navy plein, icône download, exporte les données (CSV/XLSX — format à confirmer)

### Filtres temporels (pills horizontales)
Sélecteur de période global pour toutes les données du dashboard :
- `Aujourd'hui` *(actif par défaut — navy plein, texte blanc)*
- `Hier`
- `7 jours`
- `30 jours`
- `365 jours`
- `Personnalisé` *(ouvre un date-picker plage)*

État inactif : pill fond bleu très clair `#DBE5F3`, texte navy.

### Row 1 — 4 KPI globaux (cards gradient grand format)
Utilisent les **gradients "Statistique"** de la charte (cf `brand.md` §3.1).

| Card | Gradient | Valeur | Label | Icône |
|---|---|---|---|---|
| Total Signalements | `stat.violet` (#BCA6F9 → #8652FB) | `25` | Total Signalements | gyrophare |
| En attente | `stat.orange` (#F29B11 → #FFB500) | `8` | En attente | horloge |
| Publiés | `stat.green` (#22C45E → #009145) | `13` | Publiés | stack / copies |
| Refusés | `stat.red` (#EE4444 → #C0272D) | `4` | Refusés | X dans cercle |

Texte blanc, chiffre grand `text-5xl font-bold`, label petit dessous, icône à droite (grand format, blanc semi-transparent).

### Progress bar 1 — Taux de traitement admin (permanente)
- **Toujours affichée** (KPI-clé)
- Fond `#E1E1E1`, fill navy `#00327D`, hauteur ~8 px, coins arrondis
- Label pourcentage à droite (ex. `68%`)
- Calcul : `(Publiés + Refusés) / Total` — à confirmer
- Objectif : montrer la réactivité de l'équipe de modération en un coup d'œil

### Row 2 — 4 cards "par type de signalement" (cards blanches)
Cards blanches avec bordure fine `#E1E1E1`, radius ~12 px :
- `5` **Non livraison** (icône doc X)
- `13` **Bloqué** (icône carte)
- `3` **Non conforme** (icône doc alerte)
- `4` **Usurpation** (icône masque)

Chiffre en gros `text-4xl font-bold` bleu `#0078BA`, label gris dessous avec icône.

### Progress bar 2 — Taux de problème par canal (interactive)
- Affiche le **taux pour le canal sélectionné** (dynamique)
- **8 canaux cliquables** (pills, 2 lignes × 4) :

| Ligne 1 | Ligne 2 |
|---|---|
| Téléphone (1) | Réseaux sociaux (8) |
| WhatsApp (8) | Binance (1) |
| Email (1) | PayPal (0) |
| Site web (2) | RIB (3) |

- État par défaut : pill outline bleu ciel, texte navy, chiffre dans un cercle/pill à droite
- **État actif (cliqué)** : pill navy plein, texte blanc → la progress bar 2 se met à jour (couleur + pourcentage correspondants)
- Couleur de la barre = couleur associée au canal (à définir : bleu pour WhatsApp, vert pour Email, etc. — ou une seule couleur navy pour tous)

> **Question ouverte** : veut-on une couleur distinctive par canal, ou on garde navy uniforme et seul le % change ?

### Footer page
Ligne centrée : `© 2026 HADAR — Tous droits réservés` (gris clair)

---

## Système de notifications admin (top bar)

### Badge 🔔 cloche — signalements
- Incrément : **chaque nouveau signalement utilisateur**
- Reset : quand l'admin ouvre l'écran `/admin/signalements` (ou marque comme lu)
- Popover au clic : liste des 5 derniers signalements + "Voir tout"

### Badge 💬 chat — conversations chatbot
**Contexte** : les utilisateurs ont accès à un chatbot IA ; l'admin peut superviser et reprendre la main.

**Proposition de modèle (inspirée Intercom / Crisp / Zendesk Messaging)** :

| Élément | Spec |
|---|---|
| Badge top bar | Nombre de **conversations ouvertes non assignées** (pas tous les messages, sinon ingérable) |
| Écran de supervision | 3 colonnes : (1) liste des conversations, (2) thread actif, (3) fiche utilisateur + contexte |
| Statuts conversation | `bot` (auto) · `en attente` (demande escalade) · `en cours` (admin a pris la main) · `résolu` |
| Actions admin | Reprendre la main · Assigner à un membre · Ajouter note interne · Tagger · Fermer |
| Filtres liste | Tous · Non assignées · Mes conversations · Résolues · Par tag |
| Canned responses | Réponses pré-rédigées réutilisables |

**Comportement recommandé** : le chatbot répond seul tant qu'il peut ; s'il détecte une question hors de son scope (ou si l'utilisateur tape "parler à un humain"), il escalade → statut `en attente` → badge admin s'incrémente.

**À valider par le propriétaire** avant d'implémenter. Voir §Assistant quand la maquette arrivera.

---

## Questions ouvertes (admin)

- [ ] Format d'export (CSV / XLSX / PDF) ? Périmètre = uniquement les KPI visibles ou dump complet des signalements de la période ?
- [ ] Progress bar 2 : couleur unique (navy) ou une couleur par canal ?
- [ ] Rôles admin prévus : quels niveaux ? (Super-admin, Admin, Modérateur, Support, autres ?)
- [ ] Matrice de permissions par rôle (qui peut modérer, qui peut créer des membres, qui voit les stats sensibles…)
- [ ] Langue de l'admin : FR uniquement, ou bilingue FR/AR comme côté utilisateur ?
- [ ] Top bar search : périmètre exhaustif (signalements, utilisateurs, membres, annonces, messages chat, logs…) ? Ou sous-ensemble ?
