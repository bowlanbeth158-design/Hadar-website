# Règles de publication

> Source : maquette fournie par le propriétaire.
> Slug : `/regles-publication`

## Objectif
**HADAR** est un espace de partage d'expériences entre utilisateurs.
Ces règles visent à garantir des publications responsables, factuelles et respectueuses.

## Ce qui est autorisé
Les utilisateurs peuvent publier des signalements à condition que les informations :

- reposent sur une expérience personnelle réelle
- soient factuelles et vérifiables
- soient rédigées de manière claire et objective
- concernent un contact, un profil ou un moyen de paiement

## Ce qui est interdit
Les contenus suivants ne sont pas autorisés :

- accusations directes ou affirmations non vérifiables
- propos diffamatoires, injurieux ou offensants
- jugements de valeur ou attaques personnelles
- informations fausses, trompeuses ou exagérées
- publication de données sensibles sans lien direct avec l'expérience
- contenus sans lien avec une expérience réelle

## Règles de rédaction
Pour être publié, un signalement doit :

- décrire une situation de manière factuelle
- éviter les jugements et interprétations
- se limiter aux éléments observés
- rester neutre dans le ton

**Exemple recommandé** :
> « Paiement effectué, absence de réponse après réception »

## Modération
Toute personne concernée par un signalement peut :

- demander une révision
- demander une modification ou suppression

Les demandes sont examinées selon les règles de la plateforme.

## Responsabilité
Les contenus publiés :

- sont fournis par les utilisateurs
- reflètent leurs expériences personnelles
- sont diffusés à titre informatif uniquement

---

## ⚙️ Implémentation côté code (à appliquer)

Cette page est la **source de vérité éditoriale** pour les règles automatiques de validation des signalements. Quand on construira le formulaire :

- **Liste de mots interdits** (à constituer côté serveur) basée sur « accusations directes / propos diffamatoires / injurieux »
- **Filtre données sensibles** : regex serveur pour détecter et bloquer dans la description :
  - numéros de carte bancaire (Luhn check)
  - numéros nationaux marocains (CIN)
  - mots de passe / clés API en clair
- **Hint UI** dans le formulaire : la phrase rouge « Évitez les jugements ou accusations » est l'application directe de ces règles
- **Affichage à la modération** : la queue admin doit lier vers cette page (« Vérifier la conformité aux règles de publication »)
