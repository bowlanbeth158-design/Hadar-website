# Hadar.ma — Charte graphique officielle

> Source : planches **Brand Colors** + **Components** livrées par le propriétaire (avril 2026).
> Ce document est la **source de vérité** pour toute décision visuelle. En cas de divergence avec `design-notes.md`, ce fichier prévaut.

---

## 1. Logo

### Concept
Bouclier stylisé intégrant la lettre **H** capitale, dégradé de bleu clair vers bleu navy. Véhicule les valeurs : **protection, vérification, confiance**.

### Variantes livrées
| # | Variante | Usage recommandé |
|---|---|---|
| 1 | Logo principal couleur + baseline | Pages d'accueil, supports marketing, signature email |
| 2 | Lockup horizontal bleu (icône + wordmark) sur fond clair | Header du site, documents corporate |
| 3 | Lockup horizontal **blanc sur fond navy** | Footer, bandeaux sombres |
| 4 | Lockup horizontal **monochrome noir** | Impression N&B, fax, documents scannés |
| 5 | Rendus **3D isométriques** (3 angles) | Visuels marketing, hero illustrations, stickers |

### Baseline officielle
> **« Restez vigilant avant toute transaction. »**

À utiliser sous le logo principal dans les contextes où l'espace le permet (accueil, page "Qui sommes-nous", supports print). **Ne pas traduire** sans validation.

### Wordmark
Police du wordmark "Hadar" : **sans-serif bold arrondi** (type Poppins / Nunito / Manrope Extra-Bold — à confirmer avec le designer). Les deux jambages du **H** sont légèrement épaissis ; le pied du bouclier se termine par une goutte pointue vers le bas.

### Règles d'usage
- **Zone de protection** : minimum = hauteur du « H » tout autour du logo, libre de tout élément graphique
- **Taille minimale** : 24 px de haut à l'écran · 15 mm à l'impression
- **Fond admis** : blanc, navy `#00327D`, ou photo avec calque d'opacité suffisant pour contraste AAA
- **Fond interdit** : bleu clair pur (collision avec le dégradé), gris moyen (perte de lisibilité)
- **Ne jamais** : déformer, appliquer une ombre non prévue, changer la couleur des pixels du bouclier, séparer l'icône de son dégradé d'origine

### Fichiers sources attendus (à collecter)
- [ ] `logo-hadar-primary.svg` (icône + wordmark, couleur)
- [ ] `logo-hadar-white.svg` (blanc, pour fonds sombres)
- [ ] `logo-hadar-mono.svg` (noir monochrome)
- [ ] `logo-hadar-icon-only.svg` (bouclier H seul, favicon)
- [ ] `logo-hadar-3d-*.png` (3 rendus 3D, haute résolution)
- [ ] `favicon.ico` (16/32/48 px) + `apple-touch-icon.png` (180 px)

---

## 2. Système de couleurs

### 2.1 Primary (bleus + blanc)

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `primary.500` | `#0078BA` | 0, 120, 186 | Bleu principal — boutons primaires, liens, accents |
| `primary.100` | `#DBE5F3` | 219, 229, 243 | Bleu très clair — fonds alternés, hover doux |
| `primary.900` | `#00327D` | 0, 50, 125 | Navy — titres H1/H2, header/footer, logo |
| `primary.white` | `#FFFFFF` | 255, 255, 255 | Fond par défaut |

### 2.2 Secondary (gris neutres)

| Token | HEX | RGB | Usage |
|---|---|---|---|
| `gray.500` | `#989898` | 152, 152, 152 | Texte secondaire, placeholders |
| `gray.400` | `#A4A4A4` | 164, 164, 164 | Texte désactivé, labels inactifs |
| `gray.200` | `#E1E1E1` | 225, 225, 225 | Bordures input / cards |
| `gray.50`  | `#F7F9FB` | 251, 249, 247 | Fond alternatif très clair |

### 2.3 Accent (couleurs fonctionnelles)

Chaque famille propose une **saturée** (CTA, icône, badge plein) et parfois une **pastel** (fond de badge, feu tricolore, pills d'état).

#### Rouge — danger / signaler / risque élevé
| Token | HEX | Usage |
|---|---|---|
| `red.500` | `#EE4444` | Bouton Signaler, badges "Risque élevé", icônes danger |
| `red.700` | `#C0272D` | Rouge foncé — hover, dégradé, états pressés |
| `red.100` | `#F8B8B8` | Rose pâle — fond pastel badge "Risque élevé" |

#### Vert — succès / publié / risque faible
| Token | HEX | Usage |
|---|---|---|
| `green.500` | `#22C45E` | Vert succès — "Vérifier maintenant", publié, feu risque faible |
| `green.700` | `#009145` | Vert foncé — dégradés, icônes, montants |
| `green.100` | `#BAFFCC` | Vert pastel — fond badge "Risque faible" |

#### Orange — alerte modérée / support
| Token | HEX | Usage |
|---|---|---|
| `orange.500` | `#F29B11` | Orange principal — bouton Support, stat "Dernier signalement", "Risque modéré" |
| `orange.600` | `#FFB500` | Orange vif — dégradés statistiques |
| `orange.100` | `#FBD185` | Orange pâle — fond badge "Risque modéré" |

#### Jaune — vigilance
| Token | HEX | Usage |
|---|---|---|
| `yellow.500` | `#D8C100` | Jaune moutarde — dégradé alerte, feu tricolore |
| `yellow.300` | `#FBED21` | Jaune vif — dégradé "Vigilance" |
| `yellow.100` | `#FFF5A3` | Jaune pâle — fond badge "Vigilance requise" |

#### Bleu ciel — vérifications
| Token | HEX | Usage |
|---|---|---|
| `sky.500` | `#00BFEE` | Bleu ciel — stat "Vérifications réalisées" |
| `sky.400` | `#29AAE1` | Bleu ciel secondaire — dégradés |

#### Violet — contacts signalés / examen
| Token | HEX | Usage |
|---|---|---|
| `violet.500` | `#8652FB` | Violet — stat "Numéros signalés", step "Examen" |
| `violet.200` | `#BCA6F9` | Lavande — dégradé, badge secondaire |

---

## 3. Système de dégradés

Les dégradés sont **au cœur** de l'identité Hadar (cards KPI, boutons hero, états). Respecter les paires exactes ci-dessous.

### 3.1 Dégradés "Statistique" (6 variantes — cards KPI)
| Nom | Stops | Usage card |
|---|---|---|
| `stat.navy`   | `#0078BA` → `#00327D` | Utilisateurs actifs |
| `stat.sky`    | `#00BFEE` → `#29AAE1` | Vérifications réalisées |
| `stat.red`    | `#EE4444` → `#C0272D` | Signalements enregistrés |
| `stat.green`  | `#22C45E` → `#009145` | Signalements publiés / Montant signalé |
| `stat.orange` | `#F29B11` → `#FFB500` | Dernier signalement |
| `stat.violet` | `#BCA6F9` → `#8652FB` | Numéros signalés |

Direction par défaut : **135°** (haut-gauche → bas-droit).

### 3.2 Dégradés "Alertes notification" (4 variantes)
| Nom | Stops |
|---|---|
| `alert.orange` | `#F29B11` → `#FFB500` |
| `alert.red`    | `#EE4444` → `#C0272D` |
| `alert.green`  | `#22C45E` → `#009145` |
| `alert.yellow` | `#D8C100` → `#FBED21` |

### 3.3 Dégradés "État de signalement" (timeline 3 étapes)
| Étape | Stops | Couleur globale |
|---|---|---|
| Signalement envoyé | `#FFA200` → `#E8D50E` | Jaune / or |
| En cours d'examen | `#FF0000` → `#F29B11` | Rouge → orange |
| Publié | `#FFB600` → `#1BBA59` | Orange → vert |

---

## 4. Iconographie

Style : **outline + solid mixte**, traits épais (~2 px), angles légèrement arrondis, couleur principale `#00327D` (navy) sauf exceptions mentionnées.

### 4.1 Icônes produit
| Icône | Usage |
|---|---|
| Bouclier + check | "Vérifications réalisées", badge de confiance |
| Horloge + check | "Dernier signalement" (+temps écoulé) |
| Sac d'argent **$** / **€** / **MAD** | "Montant signalé" (variante selon devise sélectionnée) |
| User + (personne avec plus) | "Utilisateurs actifs", invitation |
| Gyrophare / sirène | Action "Signaler" (utilisée sur bouton rouge) |
| User + bouclier | "Mon profil", "Vérifier un contact" |
| Mégaphone + flèche descendante | Notification / alerte entrante |
| Chat bulle + drapeau | Signalement avec commentaire |
| Téléphone + 3 points | "Numéros signalés" |
| Cadenas | Sécurité, mot de passe |
| Enveloppe | Email |
| Crayon édition | "Modifier" |
| Copie (stack) | Dupliquer, références |
| Scan / QR | Import, vérification documentaire |
| Base de données + flèche haut | Upload preuves |
| Poubelle | "Supprimer" (rouge quand destructive) |
| Œil | "Voir les détails" |
| Étoiles (1 à 5) | Système de badges utilisateur / rating |
| Badge vérifié bleu (coché) | Badge "compte vérifié" (style Twitter/X) |

### 4.2 Icônes réseaux sociaux (footer + partage)
LinkedIn · Facebook · Instagram · TikTok · X (ex-Twitter) · YouTube · **WhatsApp Channels** (bulle avec bouclier)

Toutes en **pastille navy pleine** avec glyph blanc centré.

### 4.3 Icônes système
| Icône | Usage |
|---|---|
| Avatar placeholder (cercle gris + silhouette) | Utilisateur sans photo |
| Toggle off (gris) / Toggle on (vert `#22C45E`) | Préférences booléennes |
| Chevron down | Dropdown |
| Drapeau FR / MA / UK | Sélecteur de langue (FR / AR / EN) |
| Glyphes $ / € / MAD | Sélecteur de devise |

### 4.4 Dots / feux tricolores (niveaux de risque)
Pastilles pleines — 4 tailles / 4 couleurs :
- 🟢 Vert `#22C45E` — risque faible
- 🟡 Jaune `#D8C100` — vigilance
- 🟠 Orange `#F29B11` — risque modéré
- 🔴 Rouge `#EE4444` — risque élevé

Variante **pastel** (fond de badge) : `#BAFFCC` · `#FFF5A3` · `#FBD185` · `#F8B8B8`.

### Fichiers sources attendus
- [ ] Set d'icônes SVG unifié (~40 glyphes) sous `public/icons/`
- [ ] Icônes réseaux sociaux colorisées (original brand colors) **+** version monochrome navy

---

## 5. Composants (synthèse)

> Les détails d'intégration et de comportement sont dans `design-notes.md`. Ci-dessous, le catalogue visuel livré.

### 5.1 Boutons primaires
| Label | Fond | Texte | Usage |
|---|---|---|---|
| `Signaler` (petit, nav) | `#EE4444` | blanc | Header, mobile FAB |
| `Signaler un contact` (pill large) | `#EE4444` | blanc | CTA formulaire |
| `Vérifier un contact` (pill large) | `#00327D` | blanc | CTA formulaire |
| `Vérifier maintenant` (search) | `#22C45E` | blanc | Barre de recherche |
| `Enregistrer les modifications` | `#22C45E` | blanc | Profil, signalement |
| `Mettre à jour le mot de passe` | `#00327D` | blanc | Profil |
| `Envoyer le signalement` | `#EE4444` | blanc | Formulaire signalement (étape finale) |
| `Support` (flottant) | `#F29B11` | blanc | FAB bas-droite, toutes pages |

### 5.2 Boutons secondaires
- `Se connecter / S'inscrire` — pill outline navy, variantes active (navy) / inactive (gris)
- `Retour` — chevron + label, outline navy ou gris
- `Modifier` — pill bleu plein + icône crayon ; désactivé : gris
- `Supprimer` — pill rouge plein + icône poubelle ; désactivé : gris
- `Archiver` / `Supprimer` — petits boutons outline (gestion alertes)
- `Voir plus` — pill outline navy + flèche ↗

### 5.3 Badges "Type de signalement"
2 variantes (outline bleu ciel, solid navy), chacune avec icône à gauche :
- `Non livraison`
- `Bloqué après paiement`
- `Produit non conforme`
- `Usurpation d'identité`

### 5.4 Badges "Moyen de preuve" (formulaire signalement)
2 variantes (outline, solid navy) + icône :
- `Téléphone` · `WhatsApp` · `Email` · `Site web` · `Réseaux sociaux` · `Voir plus` · `PayPal` · `Identité (CIN)` · `Binance` · `RIB`

### 5.5 Badges "Niveau de risque" (pills pastel)
- `Risque faible` — fond `#BAFFCC`, texte `#009145`
- `Vigilance requise` — fond `#FFF5A3`, texte `#7A6B00`
- `Risque modéré` — fond `#FBD185`, texte `#8A4E00`
- `Risque élevé` — fond `#F8B8B8`, texte `#C0272D`

### 5.6 Cards "Statistiques" (gradients)
Fond dégradé (cf §3.1), texte blanc, chiffre gros + label petit + icône à droite.

Exemples livrés :
- Rouge `#EE4444→#C0272D` : `5 Signalements envoyés`
- Vert `#22C45E→#009145` : `5 Signalements publiés` · `504 000 Montant signalé`
- Bleu ciel `#00BFEE→#29AAE1` : `26 Vérifications réalisées` · `18 978 Vérifications réalisées`
- Orange `#F29B11→#FFB500` : `Il y a 2h Dernier signalement`
- Navy `#0078BA→#00327D` : `593 12 Utilisateurs actifs`
- Violet `#BCA6F9→#8652FB` : `9 594 Numéros signalés`

### 5.7 Selectors
- Langue : `FR` 🇫🇷 / `AR` 🇲🇦 / `EN` 🇬🇧
- Devise : `MAD` / `$` / `€`

### 5.8 Dropdown "Mon compte"
Items : `Mes signalements` · `Mon profil` · `Déconnexion`

### 5.9 Paramètres "Gérer mes alertes"
Ligne avec roue dentée + label, toggle "Activer notifications / Recevoir par email".

### 5.10 Barre de recherche
Pill blanc + loupe gauche, micro droite, CTA vert `Vérifier maintenant` collé à l'extrémité droite.

### 5.11 Progress bar
Track `#E1E1E1`, fill `#0078BA`, hauteur ~4 px, coins arrondis.

### 5.12 Cards notification (popover "Mes alertes")
- Anonyme : avatar + titre + description + footer `{n} signalements similaires · {date}`
- Avec contact : numéro masqué `50XX XXXX XXXX XX86` + texte + `Voir les détails`
- Avec compteur par type : bordure rouge gauche, liste `Non livraison · Bloqué après paiement · Produit non conforme · Usurpation d'identité` + chiffre

### 5.13 Step card (processus)
Icône gyrophare haut-gauche, gros numéro "1" gris en filigrane + "Step", titre, description, barre de progression colorée en bas. Variante par step (couleur + icône).

### 5.14 Timeline horizontale (détail signalement)
3 étapes, pastilles colorées + dates + lignes pointillées :
1. `Signalement envoyé` — jaune
2. `En cours d'examen` — orange
3. `Publié` — gris (ou vert quand atteint)

### 5.15 Stats pills (petites)
Pill horizontale avec icône + chiffre + label :
- Orange `1900 Signalements soumis`
- Gris `655 Signalements refusés`
- Vert `1245 Signalements publiés`

---

## 6. Typographie

> ⚠️ **Police exacte à confirmer** avec le designer. Candidats compatibles avec le wordmark :
> - **Poppins** (Google Fonts, SemiBold/Bold)
> - **Nunito** (Google Fonts, Bold)
> - **Manrope** (Google Fonts, ExtraBold)
>
> Mon choix par défaut en attendant : **Poppins** (très proche du wordmark, gratuite, supporte l'arabe via une police complémentaire).

### Pairing bilingue (FR / AR)
- Latin : **Poppins** (400, 500, 600, 700)
- Arabe : **Cairo** ou **Noto Sans Arabic** (poids équivalents)

### Échelle
| Style | Taille | Poids | Couleur |
|---|---|---|---|
| H1 hero | 48–64 px | 700 | `#00327D` |
| H2 section | 32 px | 700 | `#00327D` |
| H3 sous-section | 24 px | 600 | `#00327D` |
| Body | 16 px | 500 | `#6B7280` (ou gris neutre) |
| Small | 14 px | 400 | `#989898` |
| Caption | 12 px | 500 | `#A4A4A4` |
| Button | 14–16 px | 600 | blanc ou navy selon variante |

---

## 7. Tokens pour `tailwind.config.ts`

Pré-traduction prête à copier-coller au moment du scaffolding code.

```ts
colors: {
  brand: {
    navy:   '#00327D',  // primary.900
    blue:   '#0078BA',  // primary.500
    sky:    '#DBE5F3',  // primary.100
  },
  gray: {
    50:  '#F7F9FB',
    200: '#E1E1E1',
    400: '#A4A4A4',
    500: '#989898',
  },
  red:    { 100: '#F8B8B8', 500: '#EE4444', 700: '#C0272D' },
  green:  { 100: '#BAFFCC', 500: '#22C45E', 700: '#009145' },
  orange: { 100: '#FBD185', 500: '#F29B11', 600: '#FFB500' },
  yellow: { 100: '#FFF5A3', 300: '#FBED21', 500: '#D8C100' },
  sky:    { 400: '#29AAE1', 500: '#00BFEE' },
  violet: { 200: '#BCA6F9', 500: '#8652FB' },
},
backgroundImage: {
  'grad-stat-navy':   'linear-gradient(135deg, #0078BA 0%, #00327D 100%)',
  'grad-stat-sky':    'linear-gradient(135deg, #00BFEE 0%, #29AAE1 100%)',
  'grad-stat-red':    'linear-gradient(135deg, #EE4444 0%, #C0272D 100%)',
  'grad-stat-green':  'linear-gradient(135deg, #22C45E 0%, #009145 100%)',
  'grad-stat-orange': 'linear-gradient(135deg, #F29B11 0%, #FFB500 100%)',
  'grad-stat-violet': 'linear-gradient(135deg, #BCA6F9 0%, #8652FB 100%)',

  'grad-alert-orange': 'linear-gradient(135deg, #F29B11 0%, #FFB500 100%)',
  'grad-alert-red':    'linear-gradient(135deg, #EE4444 0%, #C0272D 100%)',
  'grad-alert-green':  'linear-gradient(135deg, #22C45E 0%, #009145 100%)',
  'grad-alert-yellow': 'linear-gradient(135deg, #D8C100 0%, #FBED21 100%)',

  'grad-state-sent':     'linear-gradient(135deg, #FFA200 0%, #E8D50E 100%)',
  'grad-state-review':   'linear-gradient(135deg, #FF0000 0%, #F29B11 100%)',
  'grad-state-published':'linear-gradient(135deg, #FFB600 0%, #1BBA59 100%)',
},
```

---

## 8. Questions ouvertes à remonter au designer / propriétaire

- [ ] Nom exact de la police utilisée pour "Hadar" (wordmark) ?
- [ ] Livraison des **fichiers SVG** du logo (5 variantes listées en §1) ?
- [ ] Livraison du **set d'icônes** en SVG ?
- [ ] Couleur de texte exacte sur les badges pastels (§5.5) — valeurs proposées ci-dessus à valider
- [ ] Direction standard des dégradés (135° proposé, à confirmer vs 90° / 180°)
- [ ] Nom de la police compagnon pour l'arabe (support bilingue à venir)
- [ ] Existe-t-il une **version sombre** de la charte (dark mode), ou uniquement la version claire ?
- [ ] Logo avec baseline en arabe (si usage bilingue prévu) ?
