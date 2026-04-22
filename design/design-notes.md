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

### Batch 6 — Page Statistiques détaillées
14. **Écran « Statistiques de la plateforme »** (déclenché par le bouton « Voir plus » sous les stats de l'accueil, et par le lien « Statistiques » du footer)

### Batch 7 — « Mes alertes »
15. **Dropdown « Mes alertes » — état vide** (popover déclenché par le clic sur le lien `Mes alertes` de la nav)
16. **Dropdown « Mes alertes » — avec alertes** (max 4 visibles, lien « Voir tous les détails » en bas)
17. **Page « Mes alertes »** complète (déclenchée par « Voir tous les détails » du popover)

### Batch 8 — « Mon profil »
18. **Page « Mon profil »** (Mon compte → dropdown → Mon profil) — édition identité + mot de passe, badges utilisateur, taux de validation

### Batch 9 — « Mes signalements »
19. **Page liste « Mes signalements »** (Mon compte → dropdown → Mes signalements) — onglets par statut, cards avec bordure colorée + statut + type de problème
20. **Page « Détail de signalement »** (clic sur « Voir les détails » d'un signalement de l'utilisateur) — résumé, infos fournies, description, preuves (modifiable), timeline horizontale, boutons Modifier/Supprimer

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

## Page « Statistiques de la plateforme » (détail)

**Trigger** : bouton `↗ Voir plus` sous la section stats de l'accueil, ou lien « Statistiques » dans le footer → route `/statistiques`.

### Layout
- Bouton pill `← Retour`
- Titre H1 navy : « Statistiques de la plateforme »
- Sous-titre gris : « Analysez l'évolution et les tendances des signalements sur la plateforme. »

### Filtres temporels (4 onglets / pills, sélection unique)
- `Aujourd'hui` (active par défaut)
- `Hier`
- `Derniers 7 jours`
- `Derniers 30 jours`

> Tous les blocs ci-dessous se recalculent selon la plage sélectionnée.

### Bloc 1 — 6 cards KPI (mêmes que sur l'accueil mais filtrées par période)
Reprend exactement le même composant que `<StatsGrid />` de la page d'accueil (Utilisateurs actifs · Signalements enregistrés · Contacts signalés · Vérifications réalisées · Montant signalé · Dernier signalement).

### Bloc 2 — Card « Types de problèmes signalés »
Liste verticale avec barres de progression horizontales :

| Catégorie | Exemple % |
|---|---|
| Non livraison | 50 % |
| Blocage après paiement | 25 % |
| Produit non conforme | 15 % |
| Usurpation d'identité | 5 % |

→ Composant `<ProgressList items=[{label, percent, icon}] />` réutilisable.

### Bloc 3 — Card « Canaux plus signalés »
Grid 2×2 de pills colorées (couleur assortie au type de canal) :

| Canal | Couleur | Exemple % |
|---|---|---|
| RIB | Orange/jaune | 35 % |
| WhatsApp | Vert | 17 % |
| Réseaux sociaux | Violet | 15 % |
| Site web | Bleu ciel | 7 % |

> Liste à étendre dynamiquement selon les top N canaux signalés (téléphone, email, PayPal, Binance peuvent apparaître si majoritaires).

### Bloc 4 — Card « Niveau d'activité des signalements »
**Bar chart vertical** affichant la répartition par niveau de risque (les 4 niveaux définis plus haut) :

| Niveau | Exemple |
|---|---|
| Faible (bleu) | 10 % |
| Vigilance (jaune/vert) | 30 % |
| Modéré (orange) | 80 % |
| Élevé (rouge) | 45 % |

**Décision (confirmée par le propriétaire)** : afficher des **pourcentages**, axe Y `0 – 100 %` (pas les nombres absolus). Les labels au-dessus des barres restent au format `XX %`. La maquette sera corrigée côté UI pour retirer la graduation 0–80 numérique.

### Bloc 5 — Card « Évolution des signalements »
- Texte gauche : `+12 % vs semaine dernière` → `1 900 signalements`
- Texte gauche : `+45 % aujourd'hui` → `345 signalements`
- **Donut chart** à droite avec `12 %` au centre (en rouge), arc rouge représentant la croissance

### Bloc 6 — Card « Statut des signalements »
3 KPI alignés horizontalement avec icône gyrophare colorée :

| Statut | Couleur | Exemple |
|---|---|---|
| Soumis (= en attente de modération) | Orange | 1 900 |
| Refusés | Gris | 655 |
| Publiés | Vert | 1 245 |

→ **Barre de progression horizontale** en bas (`65 %`) = **taux de publication** = `publiés ÷ soumis` (confirmé par le propriétaire).

### Filtres supplémentaires (ajout validé par le propriétaire)
En complément des 4 filtres temporels, prévoir 2 filtres optionnels :
- **Filtre par canal** (multi-select) : Téléphone · WhatsApp · Email · PayPal · Site web · Réseaux sociaux · RIB · Binance
- **Filtre par type de problème** (multi-select) : Non livraison · Bloqué après paiement · Produit non conforme · Usurpation d'identité

Position UI : sous les onglets temporels, dans une rangée discrète « Affiner : [Canal ▾] [Type de problème ▾] [Réinitialiser] ». Les filtres recombinent toutes les cards. Valeurs reflétées dans l'URL (`?period=today&canal=whatsapp,rib&problem=non_livraison`) pour permettre partage et navigation arrière.

### CTA bas de page
2 boutons grands :
- Bleu navy : `🛡 Vérifier un contact` → `/` (accueil avec focus sur la barre de recherche)
- Rouge : `🚨 Signaler un contact` → `/signaler`

### Disclaimer
« Les données présentées sont issues de signalements publiés et sont fournies à titre indicatif. **Aucune donnée personnelle n'est affichée.** »

### Sécurité & performance pour cette page

1. **Cache d'agrégats critique** :
   - Aucun `COUNT(*)` en live à chaque hit — la page peut recevoir beaucoup de trafic
   - **Vues matérialisées** PostgreSQL **ou** table `StatsSnapshot` rafraîchie par cron (toutes les 15 min suffit largement)
   - Une ligne `StatsSnapshot` par combinaison (period, currency) → 4 périodes × 3 devises = 12 lignes seulement
   - ISR Next.js avec `revalidate: 60` → page servie depuis le CDN

2. **Visibilité — réservée aux utilisateurs connectés** (confirmé par le propriétaire) :
   - Route `/statistiques` protégée par middleware d'auth → redirection vers `/connexion?next=/statistiques` si non authentifié
   - Le bouton « Voir plus » de l'accueil ouvre la modal de connexion si l'utilisateur n'est pas encore connecté, puis redirige vers la page une fois connecté
   - Stats agrégées **sans aucune PII** : aucun contact / auteur / IP n'apparaît
   - **Risque d'inférence** : si une catégorie a très peu de signalements, le pourcentage peut leak un cas individuel
   - Appliquer **k-anonymity** : ne pas afficher de bucket si `n < 5` dans une catégorie (afficher « < 5 » plutôt qu'un pourcentage exact)
   - Rate-limit par utilisateur (200 req/h) en plus du rate-limit IP
   - Pas d'endpoint public retournant le JSON brut

3. **Anti-scraping** :
   - Rate-limit global 60 req/min/IP sur cette route
   - Fingerprinting léger (Cloudflare ou équivalent) pour éviter aspirations massives
   - JSON brut des stats jamais exposé sans rate-limit (pas d'endpoint `/api/stats.json` public sans throttle)

4. **Bibliothèque charts** : **Recharts** (SVG, accessible, SSR-friendly, pas de tracking tiers, léger) — éviter Chart.js (Canvas, moins accessible) ou les libs hébergées par des tiers.

5. **Timezone** : tous les calculs « Aujourd'hui » / « Hier » faits en **UTC+1 (Maroc)** côté serveur, pas selon le navigateur du visiteur (sinon les chiffres varient pour rien).

6. **Devise pour « Montant signalé »** : convertie selon la devise courante de l'utilisateur (cf. section Devises) — affichage uniquement, le stockage reste en devise d'origine.

---

## Mes alertes (popover + page complète)

**Logique** : un utilisateur connecté peut **suivre** un contact (depuis la page de résultat de recherche). À chaque nouveau signalement publié sur un contact suivi, une alerte est générée et apparaît dans son centre d'alertes.

### Badge dans la nav
- Le lien `Mes alertes` de la nav affiche un badge cloche **rouge** avec un compteur = **nombre de nouvelles alertes** (statut `NEW`, pas encore lues, hors archivées)
- Le badge se met à jour en temps réel (polling SWR toutes les 60 s ou Server-Sent Events)

### Popover (dropdown depuis la nav)

Layout :
- Header :
  - Titre `Mes alertes` à gauche
  - À droite : `Gérer mes alertes ⚙` → ouvre un mini-panneau avec 2 toggles :
    - `Activer notifications` (in-app)
    - `Recevoir par email`
- Liste : **max 4 alertes** affichées en mode compact
- Footer : bouton `⌄⌄ Voir tous les détails` → navigue vers `/mes-alertes`

**État vide** :
- Icône cloche barrée
- Titre : « Aucune alerte pour le moment »
- Sous-texte : « Suivez un contact après une recherche pour recevoir les nouvelles mises à jour. »

**État avec alertes** : chaque carte compact affiche :
- Icône type de canal + valeur (téléphone, URL, RIB masqué, email, etc.)
- Texte standard : « Un nouveau signalement a été publié. »
- Footer : `🕐 Il y a X heures/jour` + lien `Voir les détails` (vers le détail du contact ou du signalement)

### Page complète `/mes-alertes`

Layout :
- Bouton pill `← Retour`
- Titre H1 navy : « Mes alertes »
- Sous-titre : « Suivez les contacts et recevez les mises à jour. »
- En haut à droite : `Gérer mes alertes ⚙` + panneau toggles (mêmes que dans le popover)
- Watermark logo H

**Onglets / pills filtres** (sélection unique, avec compteurs) :
- `Toutes (N)` (active par défaut)
- `Nouvelles (N)` — non lues
- `Archivées (N)`

**Carte alerte (mode étendu)** :
- **Bordure colorée à gauche** = niveau de risque du contact :
  - 🟢 Vert = Faible
  - 🟡 Jaune = Vigilance
  - 🟠 Orange = Modéré
  - 🔴 Rouge = Élevé
- Ligne 1 : icône canal + valeur du contact (ex. `📞 212 600 00 00 00`, `🌐 www.example.com`, `💳 50XX XXXX XXXX XX86`, `✉️ user@example.com`)
- Ligne 2 : texte « Un nouveau signalement a été publié. »
- Ligne 3 : `🕐 Il y a X heures` + lien `Voir les détails`
- Menu **trois points `…`** en haut à droite → popup avec :
  - `📥 Archiver`
  - `🗑 Supprimer` (icône rouge)
- **Détail expandé** (visible si l'utilisateur clique sur la carte ou si niveau = Élevé par défaut) :
  - Bandeau coloré (cadre rouge si Élevé) avec :
    - « 5 signalements enregistrés »
    - « Dernier signalement : il y a 2 heures »
  - 4 mini KPI cards (les 4 catégories de problèmes avec compteur par catégorie pour ce contact)

**Pagination** : bouton chevron `⌄` en bas pour charger plus (infinite scroll ou « Charger plus »).

### Masquage des données sensibles dans l'affichage
Le RIB est affiché sous forme **masquée** (`50XX XXXX XXXX XX86`) — bonne pratique déjà respectée dans la maquette. À appliquer aussi pour :
- Carte bancaire (si jamais on en accepte) : 4 premiers + 4 derniers
- Téléphone : pas de masquage (le contact lui-même est l'objet du signalement)
- Email : pas de masquage non plus

### Modèle de données

```prisma
model AlertSubscription {
  id           String      @id @default(cuid())
  userId       String
  contactHash  String      // HMAC du contact normalisé
  contactType  ContactType
  contactValue String      // affichage (RIB masqué, etc.) — chiffré au repos
  createdAt    DateTime    @default(now())
  user         User        @relation(fields: [userId], references: [id])
  alerts       Alert[]
  @@unique([userId, contactHash])
  @@index([contactHash])
}

model Alert {
  id              String        @id @default(cuid())
  subscriptionId  String
  reportId        String        // signalement déclencheur
  status          AlertStatus   @default(NEW)  // NEW | READ | ARCHIVED | DELETED
  createdAt       DateTime      @default(now())
  readAt          DateTime?
  archivedAt      DateTime?
  subscription    AlertSubscription @relation(fields: [subscriptionId], references: [id])
  @@index([subscriptionId, status, createdAt])
}

model UserNotificationPrefs {
  userId                   String          @id
  inAppEnabled             Boolean         @default(true)
  emailEnabled             Boolean         @default(false) // double opt-in requis
  emailFrequency           EmailFrequency  @default(INSTANT) // INSTANT | DAILY | WEEKLY
  emailVerifiedForAlertsAt DateTime?
}

enum EmailFrequency {
  INSTANT
  DAILY
  WEEKLY
}
```

### Trigger : génération automatique d'alertes
Lorsqu'un signalement passe en statut `PUBLISHED` (après modération) :
1. Hash le `contactValue` du nouveau signalement (HMAC normalisé)
2. SELECT toutes les `AlertSubscription` matchant ce `contactHash`
3. Pour chaque subscription → INSERT `Alert(status: NEW)`
4. Si `emailEnabled` ET `emailVerifiedForAlertsAt` non null : enqueue email selon la **fréquence** choisie par l'utilisateur

### Fréquence des emails d'alerte (spec propriétaire)
L'utilisateur choisit dans ses préférences notifications :

| Option | Code | Comportement |
|---|---|---|
| Immédiat | `INSTANT` | Email envoyé dès qu'un nouveau signalement est publié sur un contact suivi (avec throttle technique min 5 min entre 2 emails) — **valeur par défaut** |
| Résumé quotidien | `DAILY` | Worker cron à 09:00 (Africa/Casablanca) groupe toutes les nouvelles alertes de la journée précédente en un seul email |
| Résumé hebdomadaire | `WEEKLY` | Worker cron lundi 09:00 groupe toutes les nouvelles alertes de la semaine en un seul email |

Tous les emails restent **opt-in** (toggle « Recevoir par email » à activer + double opt-in sur l'adresse). Le bouton « Se désabonner en 1 clic » reste présent dans chaque email (RFC 8058).

### Sécurité spécifique « Mes alertes »

1. **Auth obligatoire** sur le popover et la page (`/mes-alertes` + endpoints `/api/alerts/*`)
2. **Isolation stricte** : un utilisateur ne voit **jamais** les alertes/abonnements d'un autre. Toujours filtrer par `userId = session.userId` côté serveur (jamais faire confiance au client).
3. **Email opt-in** :
   - **Double opt-in** : activer `emailEnabled` envoie un email de vérification avec token signé (JWT court, 24 h) ; tant que `emailVerifiedForAlertsAt` n'est pas set, aucun email d'alerte n'est envoyé
   - **Lien de désabonnement** dans chaque email (token signé permettant 1-clic unsubscribe sans login — RFC 8058)
   - Throttle 6 h par subscription pour éviter le spam
4. **Limite anti-abus** :
   - **Pas de limite** sur le nombre d'abonnements actifs par utilisateur (décision propriétaire)
   - **Throttle technique uniquement** (anti-bot) : max **20 nouvelles subscriptions / jour** par utilisateur — pas pour brider l'usage légitime mais pour bloquer les scripts d'aspiration
   - Surveillance : si un compte dépasse 1 000 abonnements, alerte côté admin pour vérifier qu'il ne s'agit pas d'un usage automatisé suspect
5. **Suppression vs archivage** :
   - `Archiver` : statut `ARCHIVED`, reste visible dans l'onglet « Archivées »
   - `Supprimer` : **soft delete** (statut `DELETED`, masqué de toutes les listes mais conservé en DB pendant 30 jours pour audit/rollback) ; purge réelle après 30 j
6. **Privacy des préférences** : les préférences notification ne sont **jamais** exposées via l'API publique (réservées à l'utilisateur lui-même via `/api/me/notifications`)

### Mécanisme « Suivre un contact » (confirmé propriétaire)
Sur la page de résultat de recherche (à recevoir en maquette), un bouton `🔔 Suivre ce contact` apparaît à côté du résultat. Le clic crée une `AlertSubscription`. Comportement :
- Si non connecté → ouvre la modal de connexion d'abord, puis exécute l'abonnement après login
- Si déjà abonné → bouton devient `🔕 Ne plus suivre` (toggle)
- Position UI exacte à confirmer une fois la maquette « résultat avec signalements » reçue.

---

## Page « Mes signalements » (liste)

**Trigger** : nav `Mon compte` → dropdown → `Mes signalements` → route `/mes-signalements` (auth obligatoire).

### Layout
- Bouton pill `← Retour`
- Watermark logo H
- Titre H1 navy : « Mes signalements »
- Sous-titre : « Suivez l'état de vos signalements en temps réel. »

### Onglets / pills filtres (compteurs entre parenthèses)
- `Tous (N)` — actif par défaut, navy
- `Publiés (N)` — point vert
- `En cours d'examen (N)` — point orange (regroupe `SUBMITTED` + `UNDER_REVIEW`)
- `Non retenus (N)` — point rouge
- `À corriger (N)` — point bleu

### Card signalement (en mode liste)
- **Bordure colorée à gauche** = couleur du statut (vert/orange/rouge/bleu)
- Icône type de canal + valeur du contact (RIB masqué partiellement)
- `Signalé le DD mois YYYY à HH:mm` 🕐
- Pill statut à droite : libellé + point coloré
- Pill type de problème à gauche en bas (navy avec icône)
- Lien `Voir les détails` à droite en bas

### Pagination
Chevron `⌄` pour charger plus (infinite scroll ou « Charger plus »).

### Disclaimer footer
> Vos signalements sont traités de manière confidentielle.
> Seuls vous et nos équipes ont accès à vos signalements.

### Sécurité
- Filtrage strict par `authorId = session.userId` côté serveur
- Pas d'endpoint qui retourne les signalements d'un autre utilisateur, même pour un modérateur sur cette route (les modérateurs ont leur propre interface)
- Rate-limit lecture : 200 req/h/user (largement suffisant)

---

## Page « Détail de signalement » (vue auteur)

**Trigger** : clic sur `Voir les détails` d'un signalement de l'utilisateur connecté → route `/mes-signalements/[id]`.

### Layout

#### Header
- Bouton pill `← Retour`
- Titre H1 navy : « Détail de signalement »
- Sous-titre : « Suivez les contacts et recevez les mises à jour. »
- Watermark logo H

#### Card résumé (haut)
- Reprend la même card que dans la liste : bordure colorée gauche, icône canal + valeur, date, pill statut

#### Card « Informations fournies »
- `Type de contact :` valeur (ex. WhatsApp)
- `Type de problème :` pill bleu (ex. Bloqué après paiement)
- `Montant estimé :` valeur + devise (ex. 200 MAD)

#### Card « Description du signalement »
- Zone readonly affichant le texte saisi
- Si `NEEDS_CORRECTION` : zone éditable (cf. action `Modifier`)

#### Card « Preuves »
- Affichage des fichiers attachés (vignette + nom + taille)
- Zone drop pour ajouter une preuve (icône download + texte)
- Icône poubelle pour retirer
- ⚠️ **À clarifier** : l'auteur peut-il ajouter/retirer des preuves **après** soumission ? Si oui, dans quels statuts ? Hypothèse : oui dans `SUBMITTED` et `NEEDS_CORRECTION`, non dans `UNDER_REVIEW`/`PUBLISHED`/`REJECTED`/`ARCHIVED` (sauf rouvrir un ticket).

#### Timeline horizontale (stepper)
3 étapes connectées par lignes pointillées :

1. **Signalement envoyé** — `Signalé le DD mois YYYY à HH:mm` — point jaune rempli (passé)
2. **En cours d'examen** — `Vérification des informations` — point orange rempli (état actuel)
3. **Publié** — date estimée — point gris vide (futur)

> ⚠️ La maquette affiche `Publié le 05 avril 2026 à 19:30` même quand le signalement n'est pas encore publié → c'est probablement une **estimation SLA** (« nous publions sous 5 h en moyenne »). À confirmer avec le propriétaire :
> - **A** = afficher une SLA estimée (« publication estimée le X »)
> - **B** = laisser le 3ᵉ point sans date tant que pas publié
> - **C** = afficher la vraie date une fois publié, sinon « En attente »

#### Bandeau statut (orange large)
- Texte adaptatif selon le statut :
  - `SUBMITTED` / `UNDER_REVIEW` → « Votre signalement est en cours d'examen »
  - `NEEDS_CORRECTION` → « Votre signalement nécessite des corrections avant publication »
  - `PUBLISHED` → « Votre signalement est publié »
  - `REJECTED` → « Votre signalement n'a pas été retenu » + lien « Voir le motif »

#### Boutons d'action
- 📝 `Modifier` (bleu navy)
- 🗑 `Supprimer` (rouge)

#### Disclaimer footer
> Votre signalement contribue à protéger la communauté.
> Vos informations restent confidentielles. Seules nos équipes peuvent y accéder.

### Règles d'édition (proposition à valider)

| Statut | Modifier ? | Supprimer ? |
|---|---|---|
| `SUBMITTED` | ✅ tous champs | ✅ |
| `UNDER_REVIEW` | ❌ (verrouillé pendant examen) | ⚠️ demande de retrait → modérateur |
| `NEEDS_CORRECTION` | ✅ champs concernés (re-soumet en `UNDER_REVIEW`) | ✅ |
| `PUBLISHED` | ❌ (mais peut demander archivage) | ⚠️ demande de retrait → modérateur |
| `REJECTED` | ❌ | ✅ (passe en `ARCHIVED`) |

> Le **type de contact** et la **valeur du contact** ne sont **jamais éditables** après soumission (clé d'intégrité) — il faut supprimer et recréer un signalement.

### Sécurité

1. **Auth + ownership check** : avant toute action, vérifier `report.authorId === session.userId`. Sinon 403.
2. **CSRF token** sur les mutations (Modifier / Supprimer / Ajouter preuve).
3. **Re-validation Zod** complète à chaque modification (mêmes règles que la création initiale).
4. **Audit log** : toute modification enregistrée (champs avant/après, IP, timestamp, acteur).
5. **Suppression** = soft delete → passage en `ARCHIVED` (pas de hard delete immédiat) ; les preuves restent en stockage 30 jours puis purgées.
6. **Visibilité des preuves** : l'auteur peut télécharger ses propres preuves via URL signée (expirée 5 min) ; les modérateurs ont leur propre route admin.
7. **Versioning** : conserver l'historique des modifications (table `ReportRevision`) pour permettre aux modérateurs de comparer avant/après une correction.

---

## Page « Mon profil »

**Trigger** : nav `Mon compte` → dropdown → `Mon profil` → route `/mon-profil` (auth obligatoire).

### Layout

- Bouton pill `← Retour`
- Watermark logo H

#### Section identité (header de la page)
- Avatar circulaire (placeholder si non défini)
- Nom complet : `Prénom NOM` (NOM en majuscules)
- Badge utilisateur (voir taxonomie ci-dessous) avec étoiles ★ représentant le niveau
- `Taux de validation : X %`

#### Bandeau 4 KPI cards (mêmes composants que les stats home, scope = utilisateur courant)
| Card | Couleur | Données |
|---|---|---|
| Signalements envoyés | Rouge | total signalements créés par l'utilisateur (tous statuts) |
| Signalements publiés | Vert | sous-ensemble en statut `PUBLISHED` |
| Vérifications réalisées | Bleu ciel | total recherches effectuées par l'utilisateur |
| Dernier signalement | Orange | horodatage relatif (« Il y a 2 h ») |

#### Section « Informations personnelles »
- Champ `Prénom`
- Champ `Nom de famille`
- Champ `Numéro de téléphone` (avec hint « Inclure l'indicatif pays (ex : 212…), sans 0 ni +»)
  > ⚠️ **Anomalie maquette** : le champ a actuellement le label « Type de contact » et son contenu affiche un email — c'est probablement une erreur. Le hint indique clairement un téléphone. À renommer en `Numéro de téléphone` côté UI.
- Champ `Adresse e-mail`
- Bouton vert `✅ Enregistrer les modifications`

#### Section « Mot de passe »
- Sous-titre : « Pour votre sécurité, utilisez un mot de passe unique et sécurisé. »
- Champ `Mot de passe actuel` (vérification re-auth obligatoire)
- Champ `Nouveau mot de passe`
- Champ `Confirmer le nouveau mot de passe`
- Bouton bleu `🔄 Mettre à jour le mot de passe`

#### Footer
- Note : « Vos informations sont protégées et traitées de manière confidentielle. »

### Taxonomie des badges utilisateur (spec officielle propriétaire)

| Badge | Code | Étoiles | Critère |
|---|---|---|---|
| Nouveau membre | `nouveau_membre` | — | 0 signalement validé |
| Contributeur | `contributeur` | ★ | 1 à 2 signalements validés |
| Contributeur actif | `contributeur_actif` | ★★ | 3 à 5 signalements validés |
| Contributeur fiable | `contributeur_fiable` | ★★★ | 6 à 9 signalements validés **avec preuves** |
| Membre de confiance | `membre_de_confiance` | ★★★★ | 10+ signalements validés, **avec preuves régulières**, **sans abus détecté** |

> **Règle complémentaire confirmée** : les badges sont calculés **en priorité sur les signalements validés** (statut `PUBLISHED`), pas sur le total envoyé.

> ⚠️ **Note** : la maquette affiche « Contributeur régulier ★★★★ » qui n'est plus dans la taxonomie officielle. À remplacer par la nouvelle liste ci-dessus côté UI.

#### Fonction de calcul (référence)
```ts
function computeUserBadge(args: {
  validatedReports: number;
  withEvidenceCount: number;     // # signalements validés contenant au moins 1 preuve
  abuseDetected: boolean;        // signalements rejetés pour abus dans les 90 derniers jours
}): UserBadge {
  const { validatedReports, withEvidenceCount, abuseDetected } = args;
  if (validatedReports === 0) return 'nouveau_membre';
  if (validatedReports >= 10 && withEvidenceCount >= 5 && !abuseDetected) return 'membre_de_confiance';
  if (validatedReports >= 6 && withEvidenceCount >= 3) return 'contributeur_fiable';
  if (validatedReports >= 3) return 'contributeur_actif';
  return 'contributeur';
}
```

### Taux de validation (spec officielle propriétaire)

```
tauxValidation = signalementsValides / signalementsEnvoyés × 100
```

- Si `signalementsEnvoyés == 0` → afficher « N/A » (pas d'historique)
- Arrondi à l'entier (`100 %`, `83 %`, etc.)
- **Calculé côté serveur** (pas côté client) à partir de la table `Report` filtrée par `authorId`

### Statuts d'un signalement

> ⚠️ **Conflit à résoudre** : Le propriétaire a confirmé 5 statuts (`SUBMITTED`, `UNDER_REVIEW`, `PUBLISHED`, `REJECTED`, `ARCHIVED`), **mais** la maquette « Mes signalements » introduit un nouveau statut **« À corriger »** non prévu, et n'affiche pas `ARCHIVED` dans les onglets utilisateur.
>
> **Hypothèse retenue (à valider)** : `À corriger` est en fait un sous-état où le modérateur demande une modification à l'auteur avant publication ; `ARCHIVED` reste un statut backend (résultat d'une suppression / retrait) qui sort de la liste utilisateur.

#### Modèle proposé

```prisma
enum ReportStatus {
  SUBMITTED          // Soumis (en attente de prise en charge par un modérateur)
  UNDER_REVIEW       // En cours d'examen (modérateur en cours de revue)
  NEEDS_CORRECTION   // À corriger (modérateur a demandé des modifications à l'auteur)
  PUBLISHED          // Publié (validé et visible publiquement → compte dans le taux de validation)
  REJECTED           // Non retenu (refusé définitivement avec motif)
  ARCHIVED           // Archivé (retiré sur demande — n'apparaît pas dans les onglets utilisateur)
}
```

#### Mapping statut → onglet utilisateur (spec maquette)

| Onglet UI | Couleur point | Inclut |
|---|---|---|
| Tous (N) | navy actif | Tous sauf `ARCHIVED` |
| Publiés (N) | vert | `PUBLISHED` |
| En cours d'examen (N) | orange | `SUBMITTED` + `UNDER_REVIEW` |
| Non retenus (N) | rouge | `REJECTED` |
| À corriger (N) | bleu | `NEEDS_CORRECTION` |

#### Transitions autorisées (état machine)

```
SUBMITTED ──► UNDER_REVIEW (mod prend en charge)
UNDER_REVIEW ──► NEEDS_CORRECTION (mod demande modif)
UNDER_REVIEW ──► PUBLISHED (validation)
UNDER_REVIEW ──► REJECTED (refus définitif)
NEEDS_CORRECTION ──► UNDER_REVIEW (auteur a re-soumis modifs)
PUBLISHED ──► ARCHIVED (sur demande)
REJECTED ──► ARCHIVED (modérateur)
SUBMITTED / UNDER_REVIEW / NEEDS_CORRECTION ──► ARCHIVED (suppression par auteur)
```

Toute transition est loggée dans l'audit log (horodatage + acteur + ancien/nouveau statut + motif si rejet).

### Sécurité critique pour cette page

#### Édition des informations personnelles
1. **Auth + CSRF token** sur tous les POST/PATCH
2. **Re-authentication** avant toute modification sensible (déjà respecté pour le password — étendre à l'email)
3. **Changement d'email** = workflow vérification :
   - L'email **ne change pas immédiatement**
   - Envoi d'un mail de confirmation au **nouveau** + notification à l'**ancien** (anti-takeover)
   - Le changement n'est effectif qu'après clic sur le lien (token signé, 24 h max)
4. **Changement de téléphone** : validation E.164 via libphonenumber, optionnel : code OTP par SMS pour confirmer (si on intègre un provider SMS plus tard)
5. **Validation Zod** stricte côté serveur pour chaque champ (longueur min/max, regex)
6. **Rate-limit** : max 5 modifications profil / heure, max 10 / jour
7. **Audit log** : chaque modification enregistrée (qui, quand, ancien → nouveau ; jamais le mot de passe en clair évidemment)

#### Changement de mot de passe
1. **Vérification du mot de passe actuel obligatoire** (déjà dans la maquette ✅)
2. **Politique mot de passe** :
   - Minimum **12 caractères**
   - Mix recommandé (majuscule + minuscule + chiffre + symbole) — **mais privilégier la longueur** sur la complexité
   - Vérification contre **HaveIBeenPwned** (k-anonymity API : on n'envoie que les 5 premiers caractères du SHA-1)
   - Pas identique à l'ancien
   - Pas l'email/prénom/nom de l'utilisateur
3. **Hashing** : **argon2id** (paramètres OWASP 2024 : `memoryCost: 19456, timeCost: 2, parallelism: 1`)
4. **Après changement** :
   - **Invalider toutes les autres sessions** (les tokens existants deviennent invalides ; l'utilisateur reste connecté seulement sur la session courante)
   - **Email de notification** envoyé à l'utilisateur : « Votre mot de passe a été changé le X depuis l'IP Y. Si ce n'est pas vous, [lien de récupération] »
5. **Rate-limit strict** : 3 tentatives sur « current password » par heure ; lockout 30 min si échec répété
6. **Audit log** : changement enregistré (timestamp, IP, User-Agent — pas le hash)

### Manquant dans la maquette (à compléter ultérieurement)

1. **2FA / TOTP** : option à ajouter dans la section sécurité (recommandé pour comptes à risque). Pas visible — à clarifier avec le propriétaire si on prévoit pour le MVP.
2. **Suppression du compte** ✅ — confirmé propriétaire, à ajouter en bas de la page profil :
   - Bouton rouge `🗑 Supprimer mon compte` (séparé visuellement du reste, dans une « zone danger »)
   - **Modal de confirmation** :
     - Re-saisie du mot de passe actuel (re-auth)
     - Saisie littérale du mot `SUPPRIMER` dans un input
     - Checkbox : « Je comprends que cette action est irréversible »
   - **Workflow** :
     - **Soft delete 30 jours** : compte désactivé, login impossible, mais données conservées pour permettre annulation (lien dans l'email de confirmation « Annuler la suppression »)
     - Au bout de 30 jours : **purge définitive** des données personnelles (email, nom, téléphone, hash mot de passe, sessions, préférences, abonnements alertes)
     - Les **signalements publiés sont conservés** mais l'`authorId` est dissocié (mis à `NULL`) — ils restent affichés en « Utilisateur anonyme » comme c'est déjà le cas publiquement
     - Les **signalements en attente / refusés** sont supprimés
     - Les **preuves uploadées** liées aux signalements supprimés sont purgées du stockage
   - **Email de confirmation** envoyé immédiatement avec lien d'annulation (token signé, valable 30 jours)
   - **Audit log** : événement `account.deletion_requested` puis `account.purged`
   - Décision finale du propriétaire à venir sur la durée exacte (« on décide après ») — 30 j proposé par défaut
3. **Téléchargement des données personnelles** ❌ — **non prévu** (décision propriétaire). À noter : le RGPD impose le droit à la portabilité (Art. 20) ; si la plateforme accueille des utilisateurs européens, cela pourrait poser un problème légal à terme — à réévaluer avec un juriste.
4. **Sessions actives** : liste des sessions ouvertes avec possibilité de déconnecter (un par un ou « Déconnecter toutes les autres sessions »)
5. **Préférences** :
   - Langue (FR / EN, futur AR ?)
   - Devise (MAD / EUR / USD) — déjà géré via le sélecteur header, pourrait avoir un miroir ici aussi

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
