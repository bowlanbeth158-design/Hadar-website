# Pages légales — Hadar.ma

Source de vérité du contenu éditorial des pages légales.

## Mapping fichier → route

| Fichier | Route prévue | Lien dans le footer |
|---|---|---|
| `01-conditions-generales-utilisation.md` | `/conditions-generales-utilisation` | « Conditions générales d'utilisation » |
| `02-donnees-personnelles-cookies.md` | `/donnees-personnelles-cookies` | « Données personnelles & cookies » |
| `03-faq.md` | `/faq` | « FAQ » |
| `04-politique-confidentialite.md` | `/politique-confidentialite` | « Politique de confidentialité » |
| `05-qui-sommes-nous.md` | `/qui-sommes-nous` | « Qui sommes nous ? » |
| `06-regles-publication.md` | `/regles-publication` | « Règles de publication » |

## Mise en page commune

Toutes les pages légales partagent le même layout :

- Header standard (bandeau alerte + nav)
- Bouton pill `← Retour` en haut à gauche
- Watermark logo H bouclier en arrière-plan droit
- Titre H1 navy bold centré (titre de la page)
- Première section avec un titre **rouge** (ex. « Objet », « Mission », « Introduction », « Données personnelles », « Objectif »)
- Sections suivantes avec titres **navy bold**
- Texte gris/navy, listes à puces
- Footer standard

## Composant React proposé

Une seule page Next.js générique `app/(legal)/[slug]/page.tsx` qui :
1. Lit le contenu Markdown depuis la DB (CMS-driven, éditable depuis l'admin)
2. Sanitize le HTML rendu (DOMPurify si rich text autorisé en admin, sinon `react-markdown` avec composants stricts)
3. Cache via ISR (revalidation à chaque édition admin)
4. Set headers `Cache-Control: public, max-age=60, s-maxage=3600, stale-while-revalidate`

## Édition côté admin

- Rôle requis : `ADMIN`
- Éditeur : Markdown (simple, sûr, versionnable) plutôt que WYSIWYG (qui nécessite plus de sanitization)
- Audit log : qui a édité, quand, diff
- Versioning : garder les anciennes versions (table `LegalPageVersion`) pour rollback
- Publication : workflow `draft` → `published` (les modifs ne sont visibles que quand publiées)

## Sécurité

- Le Markdown est rendu **côté serveur** dans Next.js (RSC) → pas d'eval client
- Whitelist d'éléments autorisés : titres `h1-h4`, paragraphes, listes, citations, gras, italique, liens (avec `rel="noopener noreferrer"` et `target="_blank"`)
- **Interdits** : balises `<script>`, `<iframe>`, `<style>`, attributs `on*`, URLs `javascript:`
- Si on autorise les liens : valider que le protocole est `https://` ou `mailto:`

## ⚠️ À clarifier avec le propriétaire

- **CGU section « Contenus interdits »** : la maquette duplique le texte de « Accès à la plateforme » — probablement un placeholder. Récupérer le contenu réel attendu (sans doute aligné avec la page « Règles de publication »).
- **DPO / mention légale** : pas de DPO ni d'adresse de société dans les pages reçues. Si Hadar.ma traite des données personnelles d'utilisateurs marocains, la **loi marocaine 09-08** (et le RGPD si utilisateurs européens) imposent :
  - Identité de l'éditeur du site (raison sociale, adresse, RC, IF, ICE)
  - Coordonnées du responsable du traitement (CNDP au Maroc)
  - Mention de l'inscription / autorisation CNDP si applicable
  → À ajouter probablement comme 7ème page « Mentions légales » ou dans les CGU.
