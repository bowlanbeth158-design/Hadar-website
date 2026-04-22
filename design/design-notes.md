# Hadar.ma — Design system & analyse des maquettes

> Source : maquettes fournies par le propriétaire (images, partagées via chat).
> Ce document capture l'analyse détaillée pour servir de référence d'intégration.

---

## Écrans reçus

### Batch 1 — UX utilisateur de base
1. **Accueil public** (non connecté)
2. **Modal de connexion** (overlay)
3. **Accueil connecté**
4. **Résultat de recherche** (exemple WhatsApp — aucun signalement détecté)

### Batch 2 — Niveaux de risque
5. Spec texte des 4 niveaux de risque (voir section dédiée)

### Batch 3 — Formulaire de signalement
6. **Écran « Signaler un contact ou un profil »** (déclenché par le bouton rouge « Signaler » dans la nav)

### Batch 4 — Page « Comment ça marche »
7. **Écran « Comment ça marche »** (déclenché par le lien `Comment ça marche` dans la nav)

### Batch 5 — Pages légales (footer)
8. **Conditions générales d'utilisation** → `design/legal/01-conditions-generales-utilisation.md`
9. **Données personnelles & cookies** → `design/legal/02-donnees-personnelles-cookies.md`
10. **FAQ** → `design/legal/03-faq.md`
11. **Politique de confidentialité** → `design/legal/04-politique-confidentialite.md`
12. **Qui sommes-nous** → `design/legal/05-qui-sommes-nous.md`
13. **Règles de publication** → `design/legal/06-regles-publication.md`

Voir `design/legal/README.md` pour le mapping route, le composant générique, le workflow d'édition admin et les questions ouvertes (CGU « Contenus interdits » dupliqué, mentions CNDP).

Batches à venir : espace utilisateur (mes alertes, mes signalements, profil), modération, responsive mobile, inscription, reset password, détail d'un signalement, résultat de recherche avec signalements, etc.

---

## Palette de couleurs (détectée sur maquettes)

| Rôle | Couleur approx. | Usage |
|---|---|---|
| Bleu principal (navy) | `#0B2C5C` → `#0F3880` | Titres H1/H2, logo, bandeau top, footer, boutons primaires actifs |
| Bleu accent | `#1E5FC1` | Stat « Utilisateurs actifs », liens |
| Bleu ciel | `#29B6F6` / `#0EA5E9` | Stat « Vérifications réalisées » |
| Rouge | `#DC2626` / `#E53E3E` | Bouton « Signaler », stat rouge, badge notification |
| Vert (success) | `#22C55E` / `#16A34A` | Bouton « Vérifier maintenant », pill « Aucun signalement détecté », feu vert risque faible |
| Vert foncé | `#15803D` | Stat « Montant signalé » |
| Violet | `#8B5CF6` / `#A78BFA` | Stat « Contacts signalés », step 2 « Examen » |
| Orange | `#F59E0B` / `#FB923C` | Stat « Dernier signalement », bouton flottant « Support », step 3 « Modération » |
| Jaune | `#FACC15` | Feu tricolore risque modéré |
| Gris texte | `#6B7280` | Textes secondaires |
| Gris bordure | `#E5E7EB` | Bordures input / cards |
| Fond page | dégradé `#EAF2FB` → `#FFFFFF` | Arrière-plan dégradé bleu très clair |
| Blanc | `#FFFFFF` | Cards, modal |

### Variables Tailwind cibles (à mettre dans `tailwind.config.ts`)

```ts
colors: {
  brand: {
    navy:   '#0B2C5C',  // primary dark
    blue:   '#1E5FC1',  // primary
    sky:    '#0EA5E9',
    red:    '#DC2626',
    green:  '#16A34A',
    violet: '#8B5CF6',
    orange: '#F59E0B',
    yellow: '#FACC15',
  },
}
```

---

## Typographie

- Famille : sans-serif moderne type **Poppins / Inter / Manrope** (à confirmer avec le propriétaire). Probablement **Poppins** (courbes arrondies des chiffres).
- H1 grand titre : `text-5xl`/`text-6xl`, `font-bold`, `tracking-tight`, bleu navy
- H2 sections : `text-3xl`, `font-bold`, bleu navy
- Corps : `text-base`, `font-medium`, gris
- Petits textes : `text-sm`/`text-xs`, gris

> ⚠️ Si arabe prévu (bilingue FR/AR), ajouter une famille compatible : **Cairo** ou **Noto Sans Arabic**.

---

## Composants UI identifiés

### Header
- **Bandeau top bleu navy** : « Rejoignez notre chaîne WhatsApp pour rester informé des alertes » (bandeau fin pleine largeur, texte blanc centré)
- **Barre nav blanche** :
  - Logo « Hadar.ma » (icône H dans bouclier bleu navy + texte navy)
  - Liens : `Accueil` | `Comment ça marche` | [état connecté: `Mes alertes` avec badge rouge notif] | bouton rouge `Signaler` (avec icône gyrophare 🚨)
  - Sélecteur langue : `FR | MAD` (drapeau marocain). En étendu : `FR`, `EN` (drapeau UK), devise `$ MAD`
  - État non connecté : pill outline `Se connecter / S'inscrire` (icône compte)
  - État connecté : pill `Mon compte` → dropdown (`Mon compte`, `Mes signalements`, `Mon profil`, `Déconnexion`)

### Section Hero / Recherche
- **Titre H1 centré** : « Avant d'acheter, vérifiez. » (navy, bold, très grand)
- **Sous-titre** : « Recherchez un numéro, un email, un site web ou un moyen de paiement pour vérifier s'il a déjà été signalé. » (gris, centré)
- **Pills filtres type de contact** (2 lignes de 4, centrés) :
  - Ligne 1 : `Téléphone` 📞 | `WhatsApp` 🟢 | `Email` ✉️ | `RIB` 💳
  - Ligne 2 : `Site web` 🌐 | `Réseaux sociaux` 📡 | `PayPal` | `Binance`
  - État inactif : fond blanc, bordure gris clair, texte bleu navy
  - État actif : fond navy, texte blanc
- **Barre de recherche** grande :
  - Fond blanc, bordure arrondie pill complète
  - Icône loupe à gauche
  - Placeholder : « Ex : 212 6 00 00 00 00 »
  - Icône microphone à droite (recherche vocale)
  - Bouton CTA vert collé à droite : `Vérifier maintenant`

### Section résultats rapides (4 KPI cards)
- 4 cards blanches en ligne (même quand pas de recherche → affiche 0)
- Métriques :
  - `Non livraison`
  - `Bloqué après paiement`
  - `Produit non conforme`
  - `Usurpation d'identité`

### Résultat recherche (quand une vérification est faite)
- **Pill statut** (couleur selon niveau de risque) — ex. vert « Aucun signalement détecté »
- Ligne statut : `{n} signalement(s) • {label fréquence} • Risque {niveau}` + **indicateur 4 paliers** (🟢🟡🟠🔴, seul le niveau courant est allumé)
- Puis les 4 cards KPI par catégorie avec les chiffres trouvés (Non livraison, Bloqué après paiement, Produit non conforme, Usurpation d'identité)
- Message bas adapté au niveau de risque (voir tableau « Niveaux de risque » plus bas)

### Section « Statistiques de la plateforme »
- Titre H2 bleu navy centré
- Grid 3×2 de cards colorées (fond couleur pleine, texte blanc, icône à droite) :
  1. Bleu navy — `12 593 · Utilisateurs actifs` (icône personnes)
  2. Rouge — `19 840 · Signalements enregistrés` (icône gyrophare)
  3. Violet — `9 594 · Contacts signalés` (icône téléphone)
  4. Bleu ciel — `18 978 · Vérifications réalisées` (icône bouclier)
  5. Vert — `504 000 · Montant signalé` (icône sac + badge « MAD »)
  6. Orange — `il y a 2h · Dernier signalement` (icône horloge)
- Bouton pill outline `↗ Voir plus`
- Disclaimer gris : « Les informations affichées sont basées sur les signalements et les expériences des utilisateurs, vérifiées lorsque cela est possible, et fournies à titre indicatif uniquement. »

### Section « Signalements récents de la communauté »
- Titre H2 bleu navy centré
- 4 cards blanches alignées (peut défiler horizontalement sur mobile) :
  - Avatar + « Utilisateur anonyme »
  - Indicateurs visuels (points jaune + rouge = badge priorité ?)
  - Titre : « Signalement avec éléments fournis » (avec ✅)
  - Description : « Ce contact demande un paiement via PayPal puis cesse de répondre après réception »
  - Footer : `5 signalements similaires` + `il y a 1 jour`
- Disclaimer gris : « Les contenus sont examinés avant publication et peuvent être modifiés ou supprimés s'ils ne respectent pas nos règles. »

### Section « Processus des signalements »
- Titre H2 bleu navy centré
- 4 cards stepper (chacune colorée) :
  1. **Step 1 — bleu** : `Signalement` — « Un utilisateur partage un signalement sur un contact ou un moyen de paiement. »
  2. **Step 2 — violet** : `Examen` — « Le contenu est examiné selon les règles de la plateforme. »
  3. **Step 3 — orange** : `Modération` — « Le contenu peut être modifié ou supprimé si nécessaire. »
  4. **Step 4 — vert** : `Publication` — « Les signalements conformes sont publiés sur la plateforme. »
- Chaque card : icône en haut-gauche, gros numéro « 1 » gris en filigrane à droite + « Step », barre de progression colorée en bas
- Lignes de liaison pointillées entre les steps

### Bouton flottant
- `💬 Support` — orange, en bas à droite, fixed

### Footer
- Fond bleu navy, texte blanc
- Gauche :
  - Logo `Hadar.ma`
  - « Plateforme de vérification des contacts. Prenez des décisions éclairées avant toute transaction. »
  - Ligne verte : `• Données issues des contributions utilisateurs`
  - Ligne blanche : `• Mise à jour en temps réel`
- Colonne liens 1 : `▸ Qui sommes nous ?` · `▸ Comment ça marche` · `▸ Statistiques` · `▸ FAQ`
- Colonne liens 2 : `▸ Conditions générales d'utilisation` · `▸ Politique de confidentialité` · `▸ Données personnelles & cookies` · `▸ Règles de publication`
- Colonne droite :
  - `Contactez-nous` + `✉️ support@hadar.ma`
  - `Suivez-nous :` → icônes LinkedIn, Facebook, Instagram, TikTok, X, YouTube, Threads
  - « L'application est disponible sur iOS et Android » + boutons `App Store` + `Google Play`
- Illustration ville (skyline) en bas à droite
- Copyright bas centre : `© 2026 HADAR — Tous droits réservés`

### Modal de connexion
- Overlay flou sur la page (backdrop-filter: blur)
- Card blanche centrée, ombre douce, coins arrondis
- Contenu :
  - Logo `Hadar.ma` centré
  - Titre `Se connecter` (bold, centré)
  - Badge vert : `✓ Plateforme sécurisée | + 1200 signalements`
  - Bouton `Continuer avec Google` (outline, logo Google)
  - Séparateur « ou »
  - Input `Email` (icône enveloppe gauche)
  - Input `Mot de passe` (icône cadenas gauche, icône œil droite pour toggle visibility)
  - Bouton primaire bleu `Se connecter`
  - Lien `S'inscrire`
  - Lien `Mot de passe oublié ?`
  - Bas : `Conditions | Confidentialité | Cookies`

---

## Types de contact supportés (routes recherche)

- `telephone` (format marocain ex. +212 6 XX XX XX XX)
- `whatsapp` (même format téléphone)
- `email`
- `rib` (Relevé d'Identité Bancaire marocain — 24 chiffres)
- `site_web` (URL)
- `reseaux_sociaux` (handle Facebook / Instagram / TikTok / X)
- `paypal` (email ou identifiant)
- `binance` (ID ou email)

## Catégories de fraude (taxonomie)

1. `non_livraison` — Non livraison
2. `bloque_apres_paiement` — Bloqué après paiement
3. `produit_non_conforme` — Produit non conforme
4. `usurpation_identite` — Usurpation d'identité

## Niveaux de risque (4 paliers — basés sur le nombre de signalements)

| Niveau | Code | Couleur | Seuil | Message à afficher |
|---|---|---|---|---|
| 🟢 Faible | `faible` | vert `#16A34A` | 0 signalement | « Aucun signalement détecté. Vous pouvez continuer, tout en restant vigilant. » |
| 🟡 Vigilance | `vigilance` | jaune `#FACC15` | 1 à 2 signalements | « Quelques signalements ont été enregistrés. Nous vous invitons à vérifier les informations avant de continuer. » |
| 🟠 Modéré | `modere` | orange `#F97316` | 3 à 4 signalements | « Plusieurs signalements ont été enregistrés. La prudence est recommandée avant toute interaction. » |
| 🔴 Élevé | `eleve` | rouge `#DC2626` | ≥ 5 signalements | « Un nombre important de signalements a été enregistré. Nous vous recommandons d'être particulièrement vigilant. » |

### Logique de calcul (pseudo-code)

```ts
function computeRiskLevel(reportCount: number): RiskLevel {
  if (reportCount === 0) return 'faible';
  if (reportCount <= 2) return 'vigilance';
  if (reportCount <= 4) return 'modere';
  return 'eleve';
}
```

### Indicateur visuel

- 4 cercles alignés dans le résultat de recherche (vert / jaune / orange / rouge)
- Seul le cercle du niveau courant est « allumé » (couleur saturée + ombre) — les 3 autres sont pâles
- Pill texte à côté : « Risque faible » / « Vigilance » / « Risque modéré » / « Risque élevé »
- Le bandeau pill en haut du résultat change de couleur selon le niveau :
  - Faible → fond vert clair, texte vert foncé (« Aucun signalement détecté »)
  - Vigilance → fond jaune clair, texte jaune foncé (« Signalements détectés »)
  - Modéré → fond orange clair, texte orange foncé (« Plusieurs signalements »)
  - Élevé → fond rouge clair, texte rouge foncé (« Signalements nombreux »)

---

## Formulaire de signalement (écran dédié)

**Trigger** : clic sur le bouton rouge `Signaler` de la nav → route dédiée (ex. `/signaler`).

**Layout** :
- Bouton pill `← Retour` en haut à gauche
- Watermark : grand logo H en bouclier en arrière-plan droit (opacité faible)
- Titre H1 centré **rouge** (`#DC2626`) : « Signaler un contact ou un profil »
- Sous-titre gris centré : « Votre signalement aide à protéger d'autres utilisateurs. »

### Champs (dans l'ordre d'affichage)

| # | Champ | Requis | Type UI | Notes |
|---|---|---|---|---|
| 1 | **Type de contact** | ✅ | 8 pills en grid 4×2 (sélection unique) | Même liste que les filtres de recherche (Téléphone, WhatsApp, Email, PayPal, Site web, Réseaux sociaux, RIB, Binance). Active = fond navy + texte blanc. |
| 2 | **Information à signaler** | ✅ | Input texte large | Placeholder dynamique selon type (ex. « Ex : 212 6 00 00 00 00 » pour téléphone, email pour Email, etc.). Bordure rouge si invalide. |
| 3 | **Type de problème** | ✅ | 4 pills en ligne (sélection unique) | `Non livraison` · `Bloqué après paiement` · `Produit non conforme` · `Usurpation d'identité`. Active = fond navy + texte blanc. |
| 4 | Montant estimé | ⬜ | Input numérique + suffixe **devise courante** | Placeholder adapté à la devise active (ex. « Ex : 5 000 MAD », « Ex : 500 € », « Ex : 500 $ »). Champ optionnel. |
| 5 | Description | ⬜ | Textarea | « Décrivez brièvement la situation (informations factuelles uniquement) ». Compteur « 200–300 caractères max ». Hint rouge permanent sous le champ : « Merci de décrire la situation de manière factuelle. Évitez les jugements ou accusations. » |
| 6 | Preuves | ⬜ | Dropzone (drag & drop + file picker) | « Ajouter une preuve (fortement recommandé) ». Placeholder : « Choisir un fichier ou glisser ici (capture d'écran, reçu, conversation…) ». Icône poubelle pour retirer. |

### Validation finale

- Checkbox requise : « Je confirme que les informations fournies respectent les règles de la plateforme. »
- Bouton primary rouge : `📢 Envoyer le signalement`
- Note bas : « Les informations fournies sont utilisées uniquement dans le cadre du signalement et restent confidentielles. »

### Règles de validation (Zod — côté client **et** serveur)

```ts
const reportSchema = z.object({
  contactType: z.enum(['telephone','whatsapp','email','paypal','site_web','reseaux_sociaux','rib','binance']),
  contactValue: z.string().min(3).max(256), // raffiné par type (regex) via z.discriminatedUnion
  problemType: z.enum(['non_livraison','bloque_apres_paiement','produit_non_conforme','usurpation_identite']),
  estimatedAmount: z.number().int().nonnegative().max(10_000_000).optional(),
  description: z.string().max(300).optional(),
  evidenceFileIds: z.array(z.string().uuid()).max(5).optional(),
  rulesAccepted: z.literal(true),
});
```

### Sécurité spécifique à ce formulaire (CRITIQUE)

1. **Auth obligatoire** — aucune soumission anonyme (évite spam et responsabilise). L'UI reflète déjà que l'utilisateur est connecté (« Mon compte »).
2. **Rate-limit par utilisateur** : max 5 signalements / heure, 20 / jour (ajustable).
3. **CAPTCHA** (Cloudflare Turnstile) sur la soumission pour bloquer les bots même authentifiés.
4. **Upload de preuves — défense en profondeur** :
   - **Types acceptés (confirmé par le propriétaire)** :
     - Images : `image/jpeg`, `image/png`, `image/webp` (JPG / PNG / screenshots)
     - Vidéos : `video/mp4`, `video/webm`, `video/quicktime` (.mov)
     - ❌ Pas de SVG, HTML, PDF avec JS actif, exécutables, archives
   - Vérification des **magic bytes** côté serveur (pas juste l'extension ou le header `Content-Type`)
   - Taille max :
     - Images : **10 MB** / fichier
     - Vidéos : **100 MB** / fichier (durée max conseillée : 2 min)
     - **5 fichiers max** au total par signalement
   - **Nettoyage EXIF** des images (pas de géolocalisation/appareil en clair)
   - **Transcodage vidéo côté serveur** (ffmpeg → H.264/WebM, strip métadonnées) avant mise à dispo — évite exploits codec et normalise les formats
   - Stockage **hors webroot** (ou bucket S3 privé avec URLs pré-signées à expiration courte 5–15 min)
   - Noms de fichiers **régénérés** (UUID), le nom original conservé en metadata DB
   - **Scan antivirus** (ClamAV) avant publication ; vidéos mises en quarantaine jusqu'à scan OK
   - Accès aux preuves **restreint** aux modérateurs et à l'auteur (pas de lien public)
   - **Ne jamais servir les preuves** depuis le domaine principal (sous-domaine isolé type `cdn-private.hadar.ma` avec `Content-Disposition: attachment` si possible, ou en iframe sandboxée pour aperçu)
5. **Contenu texte — anti-diffamation / abus** :
   - Longueur stricte (≤ 300 chars)
   - Filtre de mots-clés injurieux / données personnelles évidentes (emails, CB, etc.) côté serveur
   - `Content-Type` et encodage UTF-8 imposés, nettoyage des caractères de contrôle
3. **Modération obligatoire** — tout signalement créé en statut `PENDING`, invisible jusqu'à approbation manuelle par un modérateur.
4. **Hashage du contactValue** :
   - Stocker **en plus** du clair un hash SHA-256 `hmac(secret, normalized(contactValue))`
   - Permet la recherche exacte rapide sans exposer tous les contacts en clair si la DB fuit
   - Le clair reste stocké (obligatoire pour afficher le contact signalé dans l'UI) mais chiffré au repos (column-level encryption ou full-disk + `pgcrypto` pour les plus sensibles)
5. **Audit log** immuable :
   - Qui a signalé (user_id), quand, hash du contact, IP (si légalement autorisé), User-Agent
   - Toute action de modération (approve/reject/edit) loggée
6. **CSRF** : token double-submit ou `SameSite=Strict` sur session cookies + en-tête `Origin` vérifié.
7. **Normalisation avant hash + avant stockage** :
   - Téléphone : passer par libphonenumber → format E.164 (`+2126XXXXXXXX`)
   - Email : lowercase + trim
   - URL : lowercase host, strip tracking params (utm_*), forcer https si possible
   - RIB : retirer espaces/tirets

---

## Page « Comment ça marche »

**Trigger** : clic sur le lien `Comment ça marche` de la nav → route dédiée (ex. `/comment-ca-marche`).

### Layout
- Bouton pill `← Retour` en haut à gauche
- Watermark logo H bouclier en arrière-plan droit
- Titre H1 centré navy : « Restez en sécurité en 4 étapes »
- Sous-titre gris centré : « Vérifiez, signalez, protégez et suivez en quelques clics »
- **Grid 2×2 de cartes vidéo** (chaque carte a une bordure de couleur distincte) :

| # | Titre | Couleur bordure & titre | Sujet |
|---|---|---|---|
| 1 | **Vérifiez** | Vert `#22C55E` | Comment vérifier un contact avant transaction |
| 2 | **Signalez** | Rouge `#DC2626` | Comment signaler un contact suspect |
| 3 | **Protégez** | Orange `#F97316` | Bonnes pratiques pour se protéger |
| 4 | **Suivez** | Violet `#8B5CF6` | Suivre les alertes / la communauté |

### Composant carte vidéo
- Bordure colorée arrondie épaisse
- Vignette (thumbnail) avec illustration + bouton play rouge YouTube en bas à gauche + durée en bas à droite (ex. `2:17`)
- Titre coloré (assorti à la bordure)
- Description courte (200–300 caractères max recommandé)
- Au clic : lecture inline (modal lightbox plein écran avec lecteur)

### CTA bas de page
Phrase centrée navy bold : « Vérifiez avant d'agir et signalez pour protéger les autres. »

### Décision (confirmée par le propriétaire) — 2 cartes au lancement
- **Au lancement** : seules **2 cartes** affichées :
  - **Vérifiez** (vert) — vidéo « Comment vérifier un contact »
  - **Signalez** (rouge) — vidéo « Comment signaler un contact suspect »
- Layout au lancement : **2 cartes côte à côte** (grid 2×1 desktop, 1×2 mobile)
- Les cartes **Protégez** (orange) et **Suivez** (violet) restent prévues dans la palette / le système de design pour un ajout futur via l'espace admin (pas codées en dur — la page s'adapte automatiquement au nombre de vidéos publiées en DB)

### Gestion via espace admin (CMS-style)
**Confirmé par le propriétaire** : cette page est éditable depuis l'espace admin.

Champs éditables par carte (rôle `ADMIN` uniquement) :
- Titre
- Description (texte court, 300 chars max)
- Couleur (palette restreinte : vert / rouge / orange / violet / bleu / jaune)
- Vignette (image uploadée — mêmes règles sécurité que les preuves)
- Source vidéo : URL **YouTube**, **Vimeo** ou fichier MP4 hébergé
- Ordre d'affichage
- Statut : `published` / `draft`

### Sécurité de la page « Comment ça marche »

1. **Hébergement vidéo — choix recommandé** :
   - Option **A (recommandée pour MVP)** : **YouTube unlisted** (lien non listé) ou **Vimeo Pro** → simple, scalable, pas de bande passante côté serveur, pas de stockage
     - Embed via `<iframe>` avec `sandbox="allow-scripts allow-same-origin allow-presentation"`
     - **Privacy mode** YouTube (`youtube-nocookie.com`) pour limiter le tracking
   - Option **B (alternative)** : **self-hosted** → plus de contrôle, mais nécessite transcodage, CDN, protection hotlinking, plus coûteux
2. **CSP** doit autoriser les domaines vidéo : `frame-src https://www.youtube-nocookie.com https://player.vimeo.com;`
3. **Admin / édition de la page** :
   - Auth + RBAC : seul rôle `ADMIN`
   - Validation Zod stricte des URLs vidéo (whitelist domaines : `youtube.com`, `youtu.be`, `youtube-nocookie.com`, `vimeo.com`)
   - Sanitization HTML des descriptions (DOMPurify si rich text, sinon texte brut + React échappe automatiquement)
   - **Audit log** de chaque édition (qui, quand, ancien/nouveau contenu)
   - CSRF token sur le formulaire d'édition
4. **Cache & ISR** : page mise en cache (ex. revalidation Next.js ISR à chaque édition admin) pour limiter les hits DB et améliorer perf.

---

## Devises supportées

**3 devises** : `MAD` (Dirham marocain) · `EUR` (€) · `USD` ($).

### Règles
- **Devise par défaut : MAD** (projet au Maroc)
- L'utilisateur peut changer à tout moment via **un bouton persistant dans le header** (à côté du sélecteur de langue) — ce bouton reste visible sur toutes les pages
- Le choix est **mémorisé** :
  - Non connecté : localStorage
  - Connecté : colonne `preferredCurrency` en DB (prime sur localStorage)
- Tous les montants (formulaire signalement, stats « Montant signalé », détail signalement) utilisent la devise courante
- **Stockage DB** :
  - Colonne `amount` (INT, en plus petite unité : centimes MAD, cents EUR/USD) **+** `currency` (CHAR(3) ENUM `MAD|EUR|USD`)
  - **Jamais de conversion à l'écriture** — on conserve la devise d'origine déclarée par l'utilisateur
  - Conversion faite à l'affichage selon la devise courante (taux de change stocké en DB, mis à jour quotidiennement via API fiable)
- Les conversions sont **indicatives** et affichent toujours : « ≈ 5 200 MAD (converti depuis 500 €) »

### Sécurité
- Taux de change : source fiable (ex. API Banque Centrale Maroc ou équivalent) ; **jamais de saisie manuelle par un utilisateur**
- Validation montant : borne haute (`10 000 000` en plus petite unité) pour éviter overflow / abus
- Type serveur strict : bigint, parsing via Zod (`z.coerce.number().int().nonnegative().max(10_000_000)`)

---

## Anonymisation & visibilité des signalements

**Règle confirmée par le propriétaire** :

| Audience | Ce qu'ils voient |
|---|---|
| **Public (visiteurs et autres utilisateurs)** | Toujours **« Utilisateur anonyme »** — jamais de lien vers l'auteur, jamais de nom, photo, ID, contact, IP |
| **Équipe interne (admin / modérateur Hadar)** | Accès complet : identité de l'auteur, email, historique, IP, User-Agent, timestamps, preuves brutes |

### Implémentation
- DB : chaque `Report` garde `authorId` (FK vers `User`) — **jamais exposé via l'API publique**
- API publique : le champ `authorId` est explicitement **stripé** dans le serializer public ; seul un champ dérivé `displayName: "Utilisateur anonyme"` est renvoyé
- API admin (route séparée `/api/admin/*`, protégée par rôle `MODERATOR` ou `ADMIN`) : retourne l'objet complet
- Front : le composant `ReportCard` n'appelle **jamais** l'API admin ; séparation stricte des endpoints
- **Pas de notification automatique** qui pourrait leak l'auteur (pas d'email « X a signalé Y » envoyé à Y, etc.)
- **Procédure interne de partage** (documenté ultérieurement par le propriétaire) — à clarifier : dans quels cas et comment l'équipe partage-t-elle des infos (ex. avec autorités) ?

### Rôles utilisateurs (RBAC)

```
USER        → signaler, rechercher, voir signalements publics
MODERATOR   → tout ce que USER peut + approuver/rejeter/éditer signalements, voir identités
ADMIN       → tout ce que MODERATOR peut + gérer utilisateurs, configuration, taux de change, bannissement
```

---

## Implications techniques pour l'intégration

1. **Auth** : OAuth Google + email/password — prévoir NextAuth ou Lucia. Les deux flux avec argon2 côté password, + 2FA optionnel.
2. **i18n** : FR par défaut, EN prévu (drapeau UK visible), AR à confirmer.
3. **Recherche vocale** : Web Speech API côté client (optionnel MVP).
4. **Temps réel** : « il y a 2h », « Mise à jour en temps réel » → compteurs live, probablement via polling + SWR (WebSocket overkill pour MVP).
5. **Hashing des contacts cherchés** : pour protéger la vie privée, stocker le contact en hash SHA-256 (+ sel) en plus du clair — permet recherche exacte sans exposer en clair en cas de fuite DB.
6. **Modération** : queue de reports `PENDING` → `APPROVED` / `REJECTED` — rôle `MODERATOR` distinct de `USER`.
7. **Anti-abus** : rate-limit sévère sur recherche (éviter scraping) et sur création de signalement (éviter flood/diffamation).

---

## Écrans manquants (à recevoir)

- [ ] Page « Comment ça marche »
- [ ] Page « Statistiques » (détail)
- [ ] Page « FAQ »
- [ ] Formulaire de signalement
- [ ] Mes alertes
- [ ] Mon compte / Mes signalements / Mon profil
- [ ] Résultat recherche **avec** signalements trouvés (vs. aucun)
- [ ] Détail d'un signalement
- [ ] Espace modération
- [ ] Inscription
- [ ] Mot de passe oublié / reset
- [ ] Versions mobile (responsive)
- [ ] Pages légales (Conditions, Confidentialité, Cookies, Règles)
