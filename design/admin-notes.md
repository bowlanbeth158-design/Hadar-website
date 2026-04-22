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
- **Footer sidebar** (bas, ancré, 2 items) :
  - `🛡️ Administration` *(config globale — Admin uniquement, cf §Menu "Administration")*
  - `⚙️ Paramètres` *(préférences personnelles — tous rôles)*

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

> **Workflow `À corriger` côté user** (figé par le propriétaire) :
> 1. Quand l'admin sélectionne `À corriger` + clique le CTA, l'utilisateur reçoit :
>    - Une **notification cloche rouge** dans son espace (badge sur "Mes alertes" / "Mes signalements")
>    - Un **email** transactionnel
> 2. L'utilisateur ouvre son signalement → le **motif de l'admin** est affiché en haut (encart navy clair)
> 3. L'utilisateur peut éditer (mêmes champs que la création) puis resoumettre
> 4. À la resoumission → le signalement repasse en `En cours` côté admin (et l'admin reçoit une notif "signalement #2454 corrigé et resoumis")
>
> Le détail UI côté user (encart motif, écran édition, CTA "Resoumettre") est documenté dans `design-notes.md` §"Mes signalements — workflow À corriger".

### Table liste (colonnes)
| Col | Type | Exemple | Notes |
|---|---|---|---|
| `ID` | texte | `#2454` | Lien vers le détail |
| `Contact` | texte | WhatsApp, RIB, Email, Téléphone, Site web, PayPal… | Canal signalé |
| `Type Problème` | texte | Non livraison, Bloqué, Non conforme, Usurpation | Taxonomie user |
| `Montant` | texte | `500 MAD` | Devise explicite ; à adapter si user a choisi une autre devise |
| `Date & heure` | texte | `13/04/26  23:12:05` | Format `DD/MM/YY  HH:MM:SS` |
| `Statut` | pill coloré cliquable | pill orange/vert/rouge/navy + chevron `›` | **Seul élément cliquable** de la ligne → ouvre l'écran détail §Écran 3 |

**Comportement ligne** (figé par le propriétaire) : **seul le pill statut à droite est cliquable** (avec le chevron `›`). Le reste de la ligne (ID, Contact, Type, Montant, Date) est en lecture seule. Cela évite les ouvertures accidentelles et clarifie l'affordance.

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

**Input "Motif de décision"** (décision figée par le propriétaire)
- Input texte large (single-line dans la maquette ; **à passer en textarea** pour plus de confort)
- Placeholder : `Motif de décision`
- **Obligatoire uniquement pour `Non retenu`**
- Optionnel pour `Publié` (aucun motif attendu, publication simple)
- Optionnel pour `À corriger` (mais **fortement recommandé** côté produit — sans motif, l'utilisateur ne sait pas quoi corriger)

> ⚠️ **Alerte UX à remonter au propriétaire** : pour `À corriger`, si aucun motif n'est saisi, l'utilisateur recevra une demande de correction sans savoir quoi corriger. Proposition : rendre le motif **obligatoire pour `Non retenu` ET `À corriger`**, optionnel pour `Publié`. À trancher.

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

---

## Écran 4 — Membres de l'équipe (liste) `/admin/membres`

### Header de page
- Titre H1 `Membres de l'équipe` (navy)
- Actions droite : 2 pills navy plein
  - `👤+ Ajouter un nouvel utilisateur` → ouvre la modal §Écran 5 en mode création
  - `✏️ Modifier` → comportement à clarifier (cf §Questions ouvertes)

### Card principale (fond blanc, radius 16 px)

**En-tête de la card :**
- Gauche : icône **filtre** (entonnoir jaune `#FFB500`) + badge `10` (jaune) avec chevron down → ouvre les options de filtre (par rôle, statut, dernière activité…)
  - À confirmer : `10` = nombre de résultats par page **ou** nombre de filtres actifs ?
- Droite : barre de recherche secondaire (pill blanc avec loupe) — recherche dans la liste membres uniquement (différente de la recherche globale du top bar)

**Table membres**
| Col | Label dans maquette | Contenu réel | Notes |
|---|---|---|---|
| 1 | ID | `#01`, `#02`, `#03` | Identifiant interne |
| 2 | Nom | `Yahya MOUSSAOUI` | Prénom + NOM |
| 3 | Email | `yahya.moussaoui@gmail.com` | |
| 4 | **Statut** *(label maquette)* | Admin / Modérateur / Support | **En fait : Rôle** — labels permutés dans la maquette |
| 5 | **Rôle** *(label maquette)* | Actif / Inactif / Suspendu | **En fait : Statut** — labels permutés dans la maquette |
| 6 | Dernière activité | `13/04/26  23:12:05` | Format `DD/MM/YY  HH:MM:SS` |
| 7 | Statut *(action)* | bouton `Voir ›` navy plein | Click → ouvre la modal §Écran 5 en mode édition |

> ⚠️ **À corriger dans la maquette** : les en-têtes des colonnes 4 et 5 sont permutés. À code, on respectera la **sémantique** (col 4 = "Rôle", col 5 = "Statut"), pas le label graphique de la maquette.

### Pagination
Pills numérotés en bas à droite : `‹ 1 2 3 ›` — page 2 active (navy plein), pages inactives (navy outline).

### Footer
`© 2026 HADAR — Tous droits réservés` (centré)

---

## Écran 5 — Modal "Ajouter / Modifier un utilisateur"

### Conteneur
- Modal centrée à l'écran, fond contenu opacifié derrière
- Pill header navy `Ajouter un utilisateur` (ou `Modifier un utilisateur` selon le mode — à valider)
- Card fond bleu très clair `#DBE5F3`, radius ~16 px

### Section "Informations"
4 inputs verticaux, fond blanc, label au-dessus :
- **Nom Complet** (texte)
- **Numéro de téléphone** (texte, format E.164 recommandé)
- **Email** (texte, validation regex)
- **Mot de passe** (password) → **⚠️ voir alerte sécurité §Questions ouvertes**

### Section "Rôle"
3 toggles horizontaux (label au-dessus, switch dessous) :
- `Admin` (off)
- `Modérateur` (on — vert `#22C45E`)
- `Support` (off)

> ⚠️ **Pattern UI à revoir** : un membre n'a logiquement qu'**un seul rôle**. Des toggles permettent d'en activer plusieurs simultanément, ce qui crée des états invalides. Recommandation : remplacer par des **radio buttons** ou un **dropdown unique**. À valider avec le propriétaire (cf §Questions ouvertes).

### Section "Statut"
3 toggles horizontaux :
- `Actif` (off?)
- `Inactif`
- `Suspendu`

> ⚠️ **Même remarque** : statuts mutuellement exclusifs → préférer radios.

### Boutons d'action (3, en bas)
- ❌ `Annuler` — pill navy plein, icône X cercle → ferme la modal sans sauvegarder
- ✅ `Valider` — pill vert plein, icône check → enregistre (création ou édition)
- 🗑️ `Supprimer` — pill rouge plein, icône poubelle → **ne devrait apparaître qu'en mode édition** (à confirmer)

### Modes de la modal (proposition)
| Mode | Trigger | Champs préremplis ? | Bouton Supprimer visible ? |
|---|---|---|---|
| Création | Click `Ajouter un nouvel utilisateur` | Non | Non |
| Édition | Click `Voir ›` sur une ligne de la table | Oui | Oui |

### Sécurité critique pour cette modal
1. **Mot de passe NE DEVRAIT PAS être saisi par l'admin** (cf §Questions ouvertes) — recommandation forte : remplacer par un lien d'activation envoyé par email au nouveau membre
2. **Modification du rôle** = action sensible → log dans audit trail (qui a changé qui, ancien/nouveau rôle, horodatage)
3. **Suppression** = soft-delete par défaut (`deletedAt`), avec préservation de l'historique (qui a modéré quoi)
4. **Re-authentication** requise pour : changer un Admin en Modérateur, supprimer un membre, changer le statut en `Suspendu`
5. **Validation Zod stricte** côté serveur : email format, téléphone E.164, password complexity (si on garde)
6. **Rate limiting** sur l'endpoint de création (max N créations par heure par admin)

---

## Rôles & permissions (matrice à compléter)

3 rôles identifiés sur la maquette : `Admin`, `Modérateur`, `Support`.

| Action | Admin | Modérateur | Support |
|---|---|---|---|
| Voir le dashboard | ✅ | ✅ | ✅ |
| Modérer un signalement (Publié / Non retenu / À corriger) | ✅ | ✅ | ❌ |
| Voir la liste des utilisateurs | ✅ | ✅ | ✅ |
| Suspendre un utilisateur | ✅ | ❓ | ❌ |
| Voir la liste des membres | ✅ | ❌ | ❌ |
| Ajouter / modifier / supprimer un membre | ✅ | ❌ | ❌ |
| Changer le rôle d'un membre | ✅ (super-admin uniquement ?) | ❌ | ❌ |
| Publier une annonce | ✅ | ❓ | ❌ |
| Accéder aux statistiques | ✅ | ✅ | ✅ |
| Accéder à l'Assistant (chat support) | ✅ | ❓ | ✅ |
| Modifier les paramètres globaux | ✅ | ❌ | ❌ |

**À faire valider par le propriétaire** — chaque ligne `❓` ou contradictoire doit être tranchée avant l'implémentation.

> **Question** : faut-il un 4e rôle `Super-admin` (le seul à pouvoir gérer les Admins) ? Sinon, n'importe quel Admin peut se faire promouvoir / supprimer un autre Admin.

### Statuts d'un membre

| Statut | Connexion possible ? | Visible dans la liste ? | Reçoit des notifs ? |
|---|---|---|---|
| `Actif` | ✅ | ✅ | ✅ |
| `Inactif` | ❌ | ✅ (grisé) | ❌ |
| `Suspendu` | ❌ + message d'erreur explicite à la connexion | ✅ (badge rouge) | ❌ |

> Différence `Inactif` vs `Suspendu` à valider : `Inactif` = désactivé temporairement (compte mis en pause par le membre lui-même ou par défaut) · `Suspendu` = sanction administrative explicite après un incident.

---

---

## Écran 6 — Utilisateurs (liste) `/admin/utilisateurs`

> Rappel : **Utilisateurs = usagers finaux** de la plateforme (ceux qui signalent / vérifient). Distincts des Membres (équipe interne).

### Header de page
- Titre H1 `Utilisateurs` (navy)
- Actions droite : `🔄 Rafraîchir` + `⬇ Exporter` (mêmes que Dashboard)
- **Pas de bouton "Ajouter"** → les utilisateurs s'inscrivent eux-mêmes côté public, l'admin ne crée pas de compte user

### Card principale (fond blanc)

**Toolbar (en haut de la card)**
- Gauche : icône **filtre** (entonnoir jaune) + badge `10` (jaune, chevron down)
- À côté : bouton `Selectionner tous` (pill outline) — sélectionne tous les utilisateurs visibles sur la page courante (à confirmer : page courante OU tous les résultats du filtre)
- À côté : dropdown **`Actions ▼`** (pill outline) — ouvre un menu avec les **4 actions en lot** applicables aux utilisateurs cochés
- Droite : barre de recherche secondaire (loupe)

### Table utilisateurs

| Col | Label | Contenu | Notes |
|---|---|---|---|
| 1 | `Select` | Checkbox | Sélection ligne par ligne ; coché = surbrillance bleue |
| 2 | `ID` | `#01`, `#18`, `#16`… | Identifiant interne |
| 3 | `Nom` | `Yahya MOUSSAOUI` | Prénom + NOM |
| 4 | `Email` | `yahya.moussaoui@gmail.com` | |
| 5 | `Téléphone` | `0675487955` | Format MSISDN local |
| 6 | `Date d'inscription` | `13/04/26  23:12:05` | |
| 7 | `Dernière activité` | `13/04/26  23:12:05` | |
| 8 | `Statut` | Actif / Inactif / Bloqué / Supprimé | Texte coloré (vert/navy/navy/rouge) |
| 9 | `Action` | Bouton coloré contextuel | cf §Actions ci-dessous |

### Pagination
Pills `‹ 1 2 3 ›` en bas à droite (page 2 active), même pattern que Membres.

---

### Statuts utilisateur (4 valeurs)

| Statut | Couleur | Connexion possible ? | Visible publiquement ? | Signification |
|---|---|---|---|---|
| `Actif` | vert `#22C45E` | ✅ | ✅ | Compte normal |
| `Inactif` | navy `#00327D` | ✅ (mais inactivité longue) | ✅ | Compte sans activité depuis X jours (auto-flag) |
| `Bloqué` | navy/gris | ❌ + message à la connexion | ❌ (signalements masqués) | Sanction admin (violation des règles) |
| `Supprimé` | rouge `#EE4444` | ❌ | ❌ | Soft-delete (à confirmer hard vs soft) |

> **Règle légale** : un compte `Supprimé` doit conserver les signalements publiés (sinon perte de l'historique de modération) mais anonymiser les données personnelles (RGPD article 17). À détailler.

---

### Cas d'usage admin (confirmés par le propriétaire)

> La page Utilisateurs sert à la fois de **outil de support client** et de **outil de modération** :
> - **Support** : un user a oublié son mot de passe → admin cherche par ID → clique `Réinitialiser` → un email de reset est envoyé à l'adresse de création
> - **Modération** : un user enfreint les règles → admin clique `Bloquer` ou `Supprimer` → un email de notification est envoyé
>
> Les actions admin sont toujours **assorties d'un email automatique à l'adresse de création** du user.

### Actions admin (les 4 décisions, confirmées par le propriétaire)

| Action | Couleur bouton | Quand cliquable | Effet | Email user |
|---|---|---|---|---|
| `Voir ›` | navy `#00327D` | Toujours | Ouvre la fiche utilisateur (`/admin/utilisateurs/[id]`) | Aucun |
| `Réinitialiser` | orange `#F29B11` | Statut ≠ `Supprimé` *(ou aussi Supprimé pour restauration ?)* | **Envoie un email de reset password** au user (lien signé, expiration 1 h). L'admin ne voit jamais le nouveau mot de passe. | `Réinitialisez votre mot de passe Hadar` |
| `Bloquer` / `Débloquer` | gris/noir → vert si déjà bloqué | Toujours | Bascule le statut `Actif`/`Inactif` ↔ `Bloqué`. Force la déconnexion immédiate des sessions actives. | `Votre compte a été suspendu` + motif (à demander) |
| `Supprimer` | rouge `#EE4444` | Statut ≠ `Supprimé` | **Soft-delete avec récupération admin** : du point de vue user = suppression définitive (impossible de se reconnecter, données invisibles publiquement). Côté admin : données préservées en base, restaurables via `Restaurer`. | Email de confirmation de suppression |
| `Restaurer` | vert `#22C45E` | Statut == `Supprimé` uniquement | Réactive le compte avec ses données d'origine (use case : user qui s'excuse et demande à revenir). Statut repasse `Actif`. | Email `Votre compte Hadar a été restauré` |

### Pattern colonne Action — figé par le propriétaire

> **Décision** : la maquette affiche des libellés "exemple" différents par ligne pour illustrer les couleurs possibles. À l'implémentation, **chaque ligne a un bouton unique cliquable qui ouvre un menu déroulant avec les 4 actions**.

**Spec :**
- Bouton par ligne : pill navy (par défaut) avec icône `⋮` ou label `Actions ▼` + chevron
- Au click → menu déroulant ancré sur le bouton avec les **4 items** :
  1. `Voir le profil` — ouvre `/admin/utilisateurs/[id]`
  2. `Réinitialiser le mot de passe` — envoie email de reset (désactivé si `Supprimé`)
  3. `Bloquer` ou `Débloquer` — libellé contextuel selon le statut courant
  4. `Supprimer` ou `Restaurer` — libellé contextuel selon le statut courant
- Items désactivés (gris) quand l'action n'a pas de sens (ex : `Supprimer` quand déjà `Supprimé`)
- Le menu se ferme au click extérieur ou Escape
- Action destructive (`Supprimer`, `Bloquer`) → modal de confirmation avant exécution

### Bulk actions (dropdown `Actions ▼` en haut)
S'applique aux lignes **cochées**. Mêmes 4 actions, mais :
- `Voir` : non applicable en bulk → grisé
- `Réinitialiser` : OK (envoie l'email à chaque user coché)
- `Bloquer` / `Débloquer` : OK avec confirmation
- `Supprimer` : OK avec **double confirmation** (action critique)

Si plusieurs users cochés ont des statuts mixtes (ex : 2 actifs + 1 bloqué), n'afficher que les actions cohérentes pour tous (ex : pas de "Bloquer" si l'un est déjà bloqué).

---

### Spec suppression / restauration (figée par le propriétaire)

**Côté utilisateur** (vue depuis le user supprimé) :
- Plus possible de se connecter (email + mot de passe rejetés avec message neutre type "Identifiants invalides")
- Sessions actives révoquées immédiatement (tous les devices)
- Profil public + signalements affichés en mode `Utilisateur supprimé` (nom anonymisé en lecture publique)
- Email de confirmation de suppression envoyé à l'adresse de création

**Côté admin / base de données** :
- Soft-delete : flag `deletedAt = now()`, statut `SUPPRIMÉ`, mais **données originales conservées** (email, téléphone, nom)
- Apparaît toujours dans la liste `/admin/utilisateurs` avec statut `Supprimé` (rouge)
- Action `Restaurer` disponible dans le menu dropdown → réactive le compte intégralement (use case : user qui présente ses excuses et demande à revenir)
- Aucun délai automatique d'effacement définitif (rétention indéfinie tant que l'admin n'a pas explicitement purgé)

> ⚠️ **Note RGPD à valider** : la rétention indéfinie des données après suppression peut être en tension avec le droit à l'effacement (CNDP/GDPR art. 17). Recommandation : ajouter une action séparée `Purger définitivement` (super-admin uniquement) accessible après un délai configurable (ex : 90 jours après le soft-delete), pour respecter les éventuelles demandes formelles de droit à l'oubli. À trancher avec le propriétaire.

### Motif obligatoire pour les sanctions (figé par le propriétaire)

Les actions sanction **`Bloquer`** et **`Supprimer`** exigent un **motif obligatoire** saisi par l'admin. Le motif est :
- Intégré dans l'email envoyé à l'utilisateur
- Conservé dans l'audit trail (traçabilité interne)

| Action | Motif obligatoire ? | Où apparaît-il ? |
|---|---|---|
| `Voir` | ❌ | — |
| `Réinitialiser` | ❌ (action de support, pas de sanction) | — |
| `Bloquer` / `Débloquer` | ✅ **oui, obligatoire** | Email user + audit log |
| `Supprimer` | ✅ **oui, obligatoire** | Email user + audit log |
| `Restaurer` | Optionnel (recommandé pour l'audit) | Audit log uniquement |

**Écran du flux** : avant validation de la sanction, une modal s'ouvre avec :
- Récap de l'action (ex : « Vous allez bloquer l'utilisateur Yahya MOUSSAOUI. »)
- Textarea **Motif** (obligatoire, min 10 caractères)
- Boutons : `Annuler` (gris) + CTA coloré (`Bloquer`/`Supprimer`) désactivé tant que le motif est vide

### Sécurité critique pour cette page

1. **Réinitialiser** ne révèle JAMAIS le nouveau mot de passe à l'admin ; envoie uniquement un email de reset au user
2. **Bloquer / Supprimer** = action sensible → log dans audit trail (qui, quand, quel user, motif)
3. **Restauration** = log dans audit trail également (qui a restauré, quand, quel motif)
4. **Anonymisation publique uniquement** : sur les pages publiques (signalements visibles), un compte supprimé apparaît comme `Utilisateur supprimé`. En base, données conservées pour permettre `Restaurer`.
5. **Re-authentication** requise avant `Bloquer` / `Supprimer` en bulk (au-dessus de N lignes)
6. **Rate-limiting** sur les bulk actions (anti-erreur)
7. **Sessions** : un user `Bloqué` ou `Supprimé` est immédiatement déconnecté de tous ses devices (révocation des refresh tokens)

---

---

## Écran 7 — Paramètres `/admin/parametres`

> **Typo à corriger partout** : la maquette affiche "Parametres" (titre + sidebar). Le bon libellé est **"Paramètres"** (avec accent aigu). Le code et les traductions respecteront l'orthographe correcte.

### Layout global
- Sidebar : item `Paramètres` actif (pill jaune, item ancré en bas)
- Titre H1 `Paramètres` (navy) *(correction de la typo "Parametres" → "Paramètres" avec accent aigu)*
- **3 tabs horizontaux** (pills) sous le titre — **préférences personnelles uniquement** :
  1. `Compte` (actif par défaut)
  2. `Sécurité`
  3. `Général`
- État actif : gradient navy (`#0078BA` → `#00327D`), texte blanc
- État inactif : fond bleu très clair `#DBE5F3`, texte navy

> **Architecture validée (propriétaire, avril 2026, pattern SaaS)** : le tab `Rôle` de la maquette initiale a été déplacé dans un **menu `Administration`** distinct (cf §Écran 8) car il s'agit de configuration globale de la plateforme, pas de préférences personnelles. Séparation standard : Notion, Linear, Figma, Slack procèdent ainsi.

---

### Tab 1 — Compte

**Header profil (haut de la zone contenu)**
- Avatar rond (grand, ~80 px) — placeholder silhouette si pas de photo
- Nom complet (H3 navy) : `Mohamed ossama Moussaoui`
- Rôle en sous-ligne (bleu ciel `#0078BA`) : `Admin`

**Card 1 — Informations personnelles** (fond `#F7F9FB`, radius 16 px)
- Titre H3 navy : `Informations personnelles`
- Sous-titre gris : « Gérez vos informations personnelles en toute sécurité. »
- Grid 2 colonnes :
  - `Prénom` (input) — ex : `Mohamed ossama`
  - `Nom de famille` (input) — ex : `MOUSSAOUI`
- Pleine largeur :
  - `Numéro de portable` (input) — ex : `212698000000`
    - Helper sous l'input : « Inclure l'indicatif pays (ex : 212…), sans 0 ni + »
    - Format attendu : **E.164 sans le `+`** (ex : `212698765432`)
  - `Adresse e-mail` (input) — ex : `mohamedossama.mossaoui@gmail.com`
- Bouton bas-droit : `✅ Enregistrer les modifications` (pill vert `#22C45E`, icône check)

**Card 2 — Mot de passe** (fond `#F7F9FB`, à droite de la card 1)
- Titre H3 navy : `Mot de passe`
- Sous-titre gris : « Pour votre sécurité, utilisez un mot de passe unique et sécurisé. »
- 3 inputs password avec icône œil (toggle visibilité) :
  - `Mot de passe actuel`
  - `Nouveau mot de passe`
  - `Confirmer le nouveau mot de passe`
- Bouton bas-droit : `🔄 Mettre à jour le mot de passe` (pill navy `#00327D`, icône refresh)

**Sécurité du formulaire**
- Tous les inputs password **masqués par défaut** (attention : la maquette montre le 3e visible — c'est un placeholder à sécuriser)
- Re-authentication exigée avant le changement d'email (envoi d'un lien de confirmation au nouveau + notif à l'ancien)
- Changement de téléphone : validation E.164 stricte côté serveur
- Validation nouveau mot de passe :
  - Min 12 caractères
  - Complexité : maj + min + chiffre + symbole
  - Blocklist des passwords connus (haveibeenpwned)
  - `newPassword !== currentPassword`
  - `newPassword === confirmPassword`
- Après changement du mot de passe : déconnexion de toutes les autres sessions (sauf celle en cours)

---

### Tab 2 — Sécurité

Illustration décorative : bouclier `H` en filigrane à droite (watermark opacité ~10%).

**3 accordions empilés** (fond bleu très clair, chevron `⌄` à droite) :

**Accordion 1 — `Activer / désactiver 2FA (double authentification)`** *(ouvert par défaut)*
- 3 pills oranges gradient (`#F29B11` → `#FFB500`) côte à côte :
  - `Application` (ex : Google Authenticator, Authy)
  - `SMS` (OTP par SMS)
  - `Email` (OTP par email)
- Chaque pill cliquable active/désactive la méthode correspondante
- État actif : fond orange plein ; inactif : outline orange
- **Question ouverte** : on peut activer plusieurs méthodes simultanément (recommandé, fallback) ou une seule ?

**Accordion 2 — `Historique des connexions`** *(fermé par défaut)*
À l'ouverture : table des N dernières connexions avec :
- Date/heure
- IP
- Localisation approximative (ville/pays via GeoIP)
- Navigateur + OS (parse User-Agent)
- Résultat (réussie / échec / bloquée)
- Action « Révoquer cette session » (si session active)

**Accordion 3 — `Déconnexion de tous les appareils`** *(fermé)*
À l'ouverture : bouton rouge `Se déconnecter partout` → révoque **tous les refresh tokens** (sauf la session courante, optionnellement). Modal de confirmation avant exécution.

---

### Tab 3 — Général

3 dropdowns horizontaux (pill orange en header, valeur en dessous dans pill bleu clair) :

| Paramètre | Icône | Valeur par défaut | Options |
|---|---|---|---|
| `Langue` | 🌍 globe | `Français` | À confirmer (FR uniquement ou FR/AR) |
| `Fuseau horaire` | 🕐 horloge | `Casablanca Maroc` | Liste complète des TZ IANA (ou restreinte à `Africa/Casablanca` + quelques TZ MENA ?) |
| `Format date` | 📅 calendrier | `JJ/MM/AAAA` | **Format unique `JJ/MM/AAAA`** (français — figé par le propriétaire). Pas de choix multi-formats. |

> **Stockage** : tous les timestamps en base = UTC (ISO 8601). Affichage = conversion selon TZ du membre. Format string côté rendu = `DD/MM/YYYY` (dayjs) / `dd/MM/yyyy` (date-fns).

> **Maquette à corriger** : le placeholder `23 : 23 : 22` du champ `Format date` sera remplacé par `JJ/MM/AAAA`.

---

## Écran 8 — Administration `/admin/administration` *(nouveau — Admin uniquement)*

> **Pourquoi un menu séparé** : la maquette initiale plaçait la configuration des rôles dans `Paramètres > Rôle`. Sur validation du propriétaire, on isole cette zone dans un item sidebar distinct (pattern SaaS : Notion, Linear, Figma, Slack). Rationale :
> - Séparer les **préférences personnelles** (`Paramètres`) de la **configuration globale plateforme** (`Administration`)
> - Contrôle d'accès strict : tab Rôle jamais visible par un Modérateur ou Support, même par erreur
> - Scalabilité : on pourra y ajouter d'autres sections admin (Configuration plateforme, Logs d'audit, Intégrations, Webhooks…) sans surcharger Paramètres

### Position sidebar
Juste au-dessus de `Paramètres`, en bas de la sidebar :
```
…
📣 Annonces
🎧 Assistant
───────────
🛡️ Administration  ← Admin uniquement (masqué pour Modérateur/Support)
⚙️ Paramètres      ← tous rôles
```

### Sections (tabs horizontaux dans `/admin/administration`)
1. **Rôles & permissions** *(ex-tab Paramètres > Rôle)*
2. **Logs d'audit** *(trace de toutes les actions sensibles — à détailler plus tard)*
3. **Configuration plateforme** *(mentions légales, bandeau WhatsApp, paramètres globaux — à détailler)*
4. **Intégrations** *(email transactionnel, SMS, OAuth providers — à détailler)*

Pour la V1, on implémente uniquement le tab **Rôles & permissions**.

### Tab "Rôles & permissions"

**UI** : une section par rôle (`Admin`, `Modérateur`, `Support`), chaque permission avec un toggle (on/off).
- Badge jaune en tête de section avec le nom du rôle
- Grid responsive des permissions : pill `Nom permission` + toggle à droite
- Bouton bas : `Enregistrer les modifications` (vert, désactivé tant qu'aucun changement)
- Logique : sauvegarde en une fois pour éviter les ventilations partielles

**Rôle `Admin`** : un seul toggle master `Tous les accès activés` (vert par défaut). Pas de granularité. Si on veut un contrôle fin sur un Admin, on peut introduire plus tard un rôle `Super-admin` distinct.

**Rôles `Modérateur` et `Support`** : toggles individuels pour chaque permission de la matrice ci-dessous.

---

## Matrice complète des permissions

> Liste exhaustive des actions possibles dans l'admin. À **valider ligne par ligne avec le propriétaire**. Chaque permission est un toggle dans l'écran Administration > Rôles & permissions.

**Légende** : ✅ activé par défaut · ❌ désactivé par défaut · 🔒 super-admin uniquement (si on introduit ce rôle)

### Domaine : Dashboard
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `dashboard.view` | Accéder au tableau de bord `/admin` | ✅ | ✅ | ✅ |
| `dashboard.export` | Exporter les KPI du dashboard | ✅ | ❌ | ❌ |
| `search.global` | Utiliser la recherche globale (top bar) | ✅ | ✅ | ✅ |

### Domaine : Signalements
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `reports.list` | Voir la liste `/admin/signalements` | ✅ | ✅ | ✅ |
| `reports.view` | Voir le détail d'un signalement | ✅ | ✅ | ✅ |
| `reports.moderate` | Appliquer une décision `Publié` / `Non retenu` / `À corriger` | ✅ | ✅ | ❌ |
| `reports.export` | Exporter la liste filtrée | ✅ | ✅ | ❌ |
| `reports.reassign` | Réassigner à un autre modérateur | ✅ | ❌ | ❌ |
| `reports.viewAudit` | Voir l'historique de modération d'un signalement | ✅ | ✅ | ❌ |

### Domaine : Membres (équipe interne)
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `members.list` | Voir la liste `/admin/membres` | ✅ | ❌ | ❌ |
| `members.view` | Voir le détail d'un membre | ✅ | ❌ | ❌ |
| `members.create` | Ajouter un nouveau membre | ✅ | ❌ | ❌ |
| `members.edit` | Modifier nom/email/téléphone d'un membre | ✅ | ❌ | ❌ |
| `members.changeRole` | Changer le rôle d'un membre | 🔒 Super-admin | ❌ | ❌ |
| `members.changeStatus` | Actif / Inactif / Suspendu | ✅ | ❌ | ❌ |
| `members.delete` | Supprimer un membre | ✅ | ❌ | ❌ |

### Domaine : Utilisateurs (usagers finaux)
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `users.list` | Voir la liste `/admin/utilisateurs` | ✅ | ✅ | ✅ |
| `users.view` | Voir le profil d'un utilisateur | ✅ | ✅ | ✅ |
| `users.resetPassword` | Déclencher un email de reset password | ✅ | ✅ | ✅ |
| `users.block` | Bloquer un utilisateur (avec motif) | ✅ | ✅ | ❌ |
| `users.unblock` | Débloquer un utilisateur | ✅ | ✅ | ❌ |
| `users.softDelete` | Supprimer (soft-delete avec restauration possible) | ✅ | ❌ | ❌ |
| `users.restore` | Restaurer un compte supprimé | ✅ | ❌ | ❌ |
| `users.hardDelete` | Purger définitivement (droit à l'oubli CNDP) | 🔒 Super-admin | ❌ | ❌ |
| `users.export` | Exporter la liste filtrée | ✅ | ❌ | ❌ |
| `users.bulkActions` | Exécuter des actions en lot | ✅ | ❌ | ❌ |

### Domaine : Statistiques
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `stats.view` | Accéder à `/admin/statistiques` | ✅ | ✅ | ✅ |
| `stats.viewSensitive` | Voir les stats sensibles (montants, identifiants) | ✅ | ✅ | ❌ |
| `stats.export` | Exporter les rapports statistiques | ✅ | ❌ | ❌ |

### Domaine : Annonces
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `announcements.list` | Voir la liste des annonces | ✅ | ✅ | ✅ |
| `announcements.create` | Créer une annonce / bandeau plateforme | ✅ | ❌ | ❌ |
| `announcements.edit` | Modifier une annonce | ✅ | ❌ | ❌ |
| `announcements.publish` | Publier / dépublier | ✅ | ❌ | ❌ |
| `announcements.delete` | Supprimer | ✅ | ❌ | ❌ |

### Domaine : Assistant (chat support)
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `assistant.view` | Voir la liste des conversations | ✅ | ❌ | ✅ |
| `assistant.reply` | Répondre à une conversation | ✅ | ❌ | ✅ |
| `assistant.assign` | Assigner / réassigner une conversation | ✅ | ❌ | ✅ |
| `assistant.close` | Clôturer une conversation | ✅ | ❌ | ✅ |
| `assistant.viewInternal` | Voir les notes internes | ✅ | ❌ | ✅ |
| `assistant.addInternal` | Ajouter une note interne | ✅ | ❌ | ✅ |
| `assistant.configure` | Configurer réponses pré-rédigées / tags / chatbot | ✅ | ❌ | ❌ |

### Domaine : Administration (global)
| Code permission | Description | Admin | Modérateur | Support |
|---|---|---|---|---|
| `admin.view` | Accéder au menu `/admin/administration` | ✅ | ❌ | ❌ |
| `admin.rolesEdit` | Modifier la matrice de permissions | 🔒 Super-admin | ❌ | ❌ |
| `admin.viewAuditLog` | Voir les logs d'audit de la plateforme | ✅ | ❌ | ❌ |
| `admin.platformSettings` | Modifier les paramètres globaux plateforme | 🔒 Super-admin | ❌ | ❌ |
| `admin.integrations` | Configurer les intégrations (email, SMS, etc.) | 🔒 Super-admin | ❌ | ❌ |

### Domaine : Paramètres personnels
Toutes les actions `account.*` et `security.*` (modifier son propre profil, 2FA, historique connexions) sont **automatiquement accordées à tous les rôles** pour leur propre compte — pas de toggle.

---

### Totaux

- **Permissions globales** : ~38 permissions
- **Permissions super-admin uniquement** : 5 (changeRole, hardDelete, rolesEdit, platformSettings, integrations)
- **Permissions par défaut** :
  - Admin : toutes ✅ (master toggle)
  - Modérateur : 14 permissions ✅
  - Support : 11 permissions ✅

### Proposition d'introduction d'un rôle `Super-admin`

Pour protéger les actions les plus sensibles (gestion des Admins, purge définitive RGPD, config plateforme), **fortement recommandé** d'introduire un 4e rôle `Super-admin` :
- 1 seule personne (ou très peu) : le propriétaire / CTO
- Seul à pouvoir : promouvoir/rétrograder un Admin, purger définitivement un user, modifier la matrice de permissions, configurer les intégrations
- Sinon : n'importe quel Admin peut se promouvoir Super-admin ou supprimer un autre Admin — risque opérationnel

→ **À valider avec le propriétaire**. Si validé, le tab `Rôles & permissions` de l'écran Administration comportera 4 sections au lieu de 3.

---

## Questions ouvertes (admin)

- [ ] Format d'export (CSV / XLSX / PDF) ? Périmètre = uniquement les KPI visibles ou dump complet des signalements de la période ?
- [ ] Progress bar 2 : couleur unique (navy) ou une couleur par canal ?
- [ ] Rôles admin prévus : quels niveaux ? (Super-admin, Admin, Modérateur, Support, autres ?)
- [ ] Matrice de permissions par rôle (qui peut modérer, qui peut créer des membres, qui voit les stats sensibles…)
- [ ] Langue de l'admin : FR uniquement, ou bilingue FR/AR comme côté utilisateur ?
- [ ] Top bar search : périmètre exhaustif (signalements, utilisateurs, membres, annonces, messages chat, logs…) ? Ou sous-ensemble ?
- [x] ~~Pattern boutons décision modération~~ → **Option A figée** : 3 sélecteurs + CTA dynamique (cf §Écran 3)
- [x] ~~Statut "À corriger" workflow user~~ → **Notification cloche + email + écran d'édition + resoumission → repasse En cours** (cf §Écran 2)
- [x] ~~Click ligne table signalements~~ → **Uniquement le pill statut à droite est cliquable** (cf §Écran 2)

### Membres / Rôles
- [ ] **Mot de passe créé par l'admin (sécurité)** — recommandation forte : remplacer par lien d'activation envoyé au membre. À trancher.
- [ ] **Rôle = sélection unique ou multiple** ? (Toggles → multi par défaut, recommandé : radios → unique)
- [ ] **Statut = sélection unique** confirmée ? (radios)
- [ ] **Bouton "Modifier" en haut de page Membres** (à côté de "Ajouter") — quel comportement ? Édition du membre sélectionné ? Édition multiple ? Action redondante avec le `Voir ›` de chaque ligne ?
- [ ] **Bouton "Supprimer" dans la modal** — uniquement en mode édition, ou aussi en création (et dans ce cas, pour faire quoi) ?
- [ ] **Terminologie "Membre" vs "Utilisateur"** dans les boutons → harmoniser ("Ajouter un membre" pour la page Membres) ?
- [ ] **Labels colonnes "Statut" / "Rôle"** permutés dans la maquette → confirmer le bon ordre à coder
- [ ] **Filtre `10` sur la liste Membres** : nombre par page, ou nombre de filtres actifs ?
- [ ] **Différence Inactif / Suspendu** : confirmer les sémantiques (cf tableau §Statuts d'un membre)
- [ ] **Super-admin séparé d'Admin** ? (qui peut gérer les Admins)
- [ ] **Matrice de permissions** : valider chaque ligne ❓ (cf §Rôles & permissions)

### Utilisateurs (usagers finaux)
- [x] ~~Pattern colonne Action~~ → **Menu déroulant avec 4 actions par ligne** (propriétaire). La maquette est exemplaire.
- [x] ~~`Réinitialiser`~~ → **Email de reset envoyé à l'adresse de création** (propriétaire). Admin ne voit jamais le password.
- [x] ~~`Bloquer` / `Supprimer` motif~~ → **Motif obligatoire pour les 2 sanctions** (propriétaire). Motif intégré dans l'email user + audit log. Modal de confirmation avec textarea.
- [x] ~~`Supprimer` stratégie~~ → **Soft-delete avec restauration admin possible** (propriétaire). Use case : user qui s'excuse. Action `Restaurer` ajoutée au menu dropdown. RGPD : action `Purger définitivement` à valider en complément.
- [ ] **Compte `Supprimé`** : que deviennent ses signalements `PUBLISHED` (conserver anonyme) ? `SUBMITTED`/`UNDER_REVIEW` (annuler) ?
- [ ] **`Sélectionner tous`** : sélectionne tous les users de la page courante uniquement, ou tous les résultats du filtre ?
- [ ] **Click ID ou Nom** ouvre la fiche détail, ou seulement le bouton `Voir ›` est cliquable (cohérence avec Signalements §Écran 2) ?
- [ ] **Statut `Inactif`** auto-flag après combien de jours sans activité ? (proposition : 90 jours)

### Paramètres
- [x] ~~Typo "Parametres"~~ → **Corriger en `Paramètres` partout** (propriétaire)
- [x] ~~Architecture tab `Rôle`~~ → **Déplacer dans un menu "Administration" dédié** (pattern SaaS, propriétaire). Voir §Menu "Administration" ci-dessous.
- [x] ~~Matrice complète des permissions~~ → **Oui** (propriétaire). Matrice détaillée §Matrice complète des permissions ci-dessous.
- [x] ~~Format date (tab Général)~~ → **Format unique `JJ/MM/AAAA` (français)** — pas de choix multi-formats.
- [ ] **2FA** : activer plusieurs méthodes en même temps (recommandé) ou une seule ?
- [ ] **Historique connexions** : nombre de lignes à afficher, durée de rétention ?
- [ ] **Langue Admin** : FR uniquement ou bilingue FR/AR comme la partie user ?
- [ ] **Fuseau horaire** : global plateforme (tous les timestamps stockés en UTC, affichés dans la TZ choisie) ou par user ?

### Administration / Permissions (nouvelles)
- [ ] **Rôle `Super-admin`** : introduire ce 4e rôle pour protéger les actions ultra-sensibles (cf §Matrice) ?
- [ ] **Valider la matrice complète des permissions** ligne par ligne (~38 items) — défauts proposés OK ?
- [ ] **Logs d'audit** : périmètre (toutes actions admin ? uniquement sensibles ?), durée de rétention, qui peut les voir ?
- [ ] **Configuration plateforme** : liste précise des paramètres globaux éditables (mentions légales ? bandeau WhatsApp ? emails transactionnels ?) — à spécifier
- [x] ~~Motif de décision obligatoire~~ → **Obligatoire uniquement pour `Non retenu`** (propriétaire). Concern UX levé pour `À corriger` (cf §Écran 3).
- [ ] Pagination de la liste signalements (type + nombre par page) ?
- [ ] Filtres liste signalements (tri par colonne + filtres multi-critères par canal/type/statut/user) ?
- [ ] **Breadcrumb ou bouton Retour** sur page détail signalement ?
