# Hadar.ma — Design system & analyse des maquettes

> Source : maquettes fournies par le propriétaire (images, partagées via chat).
> Ce document capture l'analyse détaillée pour servir de référence d'intégration.

---

## Écrans reçus (batch 1 — UX utilisateur de base)

1. **Accueil public** (non connecté)
2. **Modal de connexion** (overlay)
3. **Accueil connecté**
4. **Résultat de recherche** (exemple WhatsApp — aucun signalement détecté)

Batches à venir : espace utilisateur (mes signalements, profil), formulaire de signalement, modération, responsive mobile, etc.

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
