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

---

## Écran 2 — Signalements (liste) `/admin/signalements`

### Header
- Titre H1 `Signalements` (navy)
- Actions droite : `Rafraîchir` + `Exporter` (mêmes boutons que dashboard)
- Filtres temporels identiques (Aujourd'hui / Hier / 7j / 30j / 365j / Personnalisé)

### Row KPI — 4 cards gradient avec mini progress bar
Chaque card a une **mini progress bar colorée AU-DESSUS** (hauteur ~4 px) + un `%` à droite qui indique sa part dans le total.

| Card | Gradient | Valeur | Label | Icône | % barre |
|---|---|---|---|---|---|
| En cours | `stat.orange` (#F29B11 → #FFB500) | `2` | En cours | horloge ↻ | `40%` (barre orange) |
| Publié | `stat.green` (#22C45E → #009145) | `1` | Publié | stack | `20%` (barre verte) |
| Non retenu | `stat.red` (#EE4444 → #C0272D) | `1` | Non retenu | X cercle | `20%` (barre rouge) |
| À corriger | `stat.navy` (#0078BA → #00327D) | `1` | À corriger | crayon édition | `20%` (barre bleue) |

### ⚠️ 4 statuts de signalement (taxonomie complète)
La modération a **4 issues possibles** :

| Statut | Couleur | Signification |
|---|---|---|
| `En cours` | orange | En file d'attente / en cours d'examen par un modérateur |
| `Publié` | vert | Validé → visible publiquement sur la plateforme |
| `Non retenu` | rouge | Refusé définitivement → non publié (motif obligatoire) |
| `À corriger` | navy | Renvoyé à l'utilisateur pour complétion / correction (motif obligatoire) |

> **Conséquence côté user (à ajouter à `design-notes.md`)** : le statut `À corriger` implique un aller-retour admin → user. L'utilisateur doit :
> 1. Recevoir une notification ("Votre signalement #2454 nécessite des corrections — voir le motif")
> 2. Pouvoir ouvrir le signalement en mode édition avec le motif de l'admin affiché
> 3. Resoumettre → repasse en `En cours`

### Table liste (colonnes)
| Col | Type | Exemple | Notes |
|---|---|---|---|
| `ID` | texte | `#2454` | Lien vers le détail |
| `Contact` | texte | WhatsApp, RIB, Email, Téléphone, Site web, PayPal… | Canal signalé |
| `Type Problème` | texte | Non livraison, Bloqué, Non conforme, Usurpation | Taxonomie user |
| `Montant` | texte | `500 MAD` | Devise explicite ; à adapter si user a choisi une autre devise |
| `Date & heure` | texte | `13/04/26  23:12:05` | Format `DD/MM/YY  HH:MM:SS` |
| `Statut` | pill coloré cliquable | pill orange/vert/rouge/navy + chevron `›` | Click → écran détail §Écran 3 |

**Comportement ligne** : toute la ligne est cliquable (ou au moins l'ID + le Statut) → ouvre l'écran détail.

### Pagination
Non visible sur la maquette actuelle — à confirmer :
- Pagination numérotée ? Scroll infini ? Bouton "Charger plus" ?
- Nombre de lignes par page (25 / 50 / 100) ?

### Tri et filtres additionnels
- Non visibles sur la maquette — à confirmer avec le propriétaire si :
  - Tri par colonne (date, montant) ?
  - Filtres multi-critères (par canal / par type / par statut / par user) ?

---

## Écran 3 — Détail signalement `/admin/signalements/[id]`

### Header
- Titre H1 `Signalements` (même que liste ; **breadcrumb à ajouter** : `Signalements / #2454`)
- Actions droite : `Rafraîchir` + `Exporter`
- **Suggestion** : ajouter un bouton `← Retour à la liste` avant le titre

### Ligne récap (sous le titre)
Ligne d'info structurée, séparée par des `|` fins :
```
#2454 - Signalement | En cours | ID Utilisateur : 345 651 | Date : 13 avril 2026-23:12
```
- `#2454` : identifiant
- `En cours` : statut courant (pourrait être un pill coloré plutôt que texte brut)
- `ID Utilisateur : 345 651` : **lien** → ouvre la fiche user (`/admin/utilisateurs/345651`)
- `Date` : date/heure de soumission

### Row principale — 3 colonnes
Cards arrondies (radius ~16 px), fond gris très clair (`#F7F9FB`).

**Colonne 1 — INFOS PRINCIPALES**
- Type de contact : `WhatsApp`
- Type de problème : `Non livraison`
- Montant : `500 MAD`

**Colonne 2 — DESCRIPTION**
- Texte libre de l'utilisateur (zone scrollable si long)
- Ex : « Paiement effectué le 10/04, aucune réponse depuis. Le vendeur ne répond plus… »

**Colonne 3 — PREUVES**
- Vignettes des fichiers joints (image, document, pj générique)
- Click → ouvre viewer plein écran
- Actions à prévoir : `Télécharger`, `Zoomer` (idem écran user)

### Section "Décision de modération"
Titre H2 **`Décision de modération`** centré (navy).

**3 boutons pills** (sélecteurs de décision) :
- 🟢 `Publié` — fond vert `#22C45E`
- 🔴 `Non retenu` — fond rouge `#EE4444`
- 🔵 `À corriger` — fond navy `#00327D`

**Input "Motif de décision"**
- Input texte large (single-line dans la maquette ; **à passer en textarea** pour plus de confort)
- Placeholder : `Motif de décision`
- **Obligatoire** : helper text sous le champ « Ce champ est obligatoire pour confirmer la décision »
- Apparaît/requis quelle que soit la décision (même pour Publié ?)

**CTA final**
- Bouton rouge plein `Refuser le signalement` (large, centré)

### ⚠️ Pattern des boutons décision — décision figée (Option A)

Les 3 boutons `Publié` / `Non retenu` / `À corriger` sont des **sélecteurs** (type radio). Ils marquent la décision choisie mais ne déclenchent aucune action.

Le **CTA final en bas est l'action de confirmation**. Son label et sa couleur changent dynamiquement selon la décision sélectionnée :

| Décision sélectionnée | CTA final | Couleur |
|---|---|---|
| `Publié` | **Publier le signalement** | vert `#22C45E` |
| `Non retenu` | **Refuser le signalement** | rouge `#EE4444` |
| `À corriger` | **Demander correction** | navy `#00327D` |

**États du CTA** :
- Désactivé (gris) tant qu'aucune décision n'est sélectionnée OU que le motif est vide
- Activé (couleur pleine) dès que : décision choisie + motif rempli
- Au click → modal de confirmation « Confirmer cette décision ? » (action irréversible ou semi-irréversible)

**Pourquoi ce pattern** : évite les clics accidentels sur des décisions irréversibles, permet de relire/modifier le motif avant confirmation, pattern standard SaaS.

### Workflow d'audit
Il faut tracer :
- Modérateur qui a pris la décision (`moderatedBy`)
- Date de décision (`moderatedAt`)
- Motif de décision (`moderationReason`)
- Historique complet si plusieurs aller-retours (user → admin → user via `À corriger`)

---

## Questions ouvertes (admin)

- [ ] Format d'export (CSV / XLSX / PDF) ? Périmètre = uniquement les KPI visibles ou dump complet des signalements de la période ?
- [ ] Progress bar 2 : couleur unique (navy) ou une couleur par canal ?
- [ ] Rôles admin prévus : quels niveaux ? (Super-admin, Admin, Modérateur, Support, autres ?)
- [ ] Matrice de permissions par rôle (qui peut modérer, qui peut créer des membres, qui voit les stats sensibles…)
- [ ] Langue de l'admin : FR uniquement, ou bilingue FR/AR comme côté utilisateur ?
- [ ] Top bar search : périmètre exhaustif (signalements, utilisateurs, membres, annonces, messages chat, logs…) ? Ou sous-ensemble ?
- [x] ~~Pattern boutons décision modération~~ → **Option A figée** : 3 sélecteurs + CTA dynamique (cf §Écran 3)
- [ ] **Statut "À corriger"** : workflow user complet (notification, écran correction, resoumission) ?
- [ ] **Motif de décision** obligatoire aussi pour `Publié`, ou uniquement pour `Non retenu` / `À corriger` ?
- [ ] Pagination de la liste signalements (type + nombre par page) ?
- [ ] Filtres liste signalements (tri par colonne + filtres multi-critères par canal/type/statut/user) ?
- [ ] **Breadcrumb ou bouton Retour** sur page détail signalement ?
