# ES Viry-Châtillon Football

Site officiel moderne, responsive et administrable pour l'ES Viry-Châtillon Football.

## Stack

- Next.js App Router
- React + TypeScript strict
- TailwindCSS
- Données mockées centralisées
- Préparation Supabase pour auth, database et storage

## Installation

```bash
npm install
npm run dev
```

Le site sera disponible sur `http://localhost:3000`.

## Commandes

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Variables d'environnement

Copier `.env.example` vers `.env.local`, puis renseigner les variables Supabase si le backend est connecté.
`ADMIN_NOTIFICATIONS_EMAIL` permet de définir le destinataire admin des notifications en attente.

## Backend

Les fondations backend sont documentées dans `docs/backend-cahier-des-charges.md`.
La documentation API initiale est disponible dans `docs/backend-api.md`.

Première migration Supabase :

```bash
supabase/migrations/202606060001_backend_foundations.sql
```

Seed de démarrage :

```bash
supabase/seed.sql
```

Endpoint local de vérification :

```bash
/api/backend/health
```

## Structure Supabase prévue

- `profiles`: membres, éducateurs, administrateurs
- `news`: actualités, images, publication
- `teams`: catégories, saisons, staff
- `players`: fiches joueurs par équipe
- `matches`: calendrier et résultats
- `registrations`: inscriptions en ligne
- `recruitment_applications`: candidatures détections
- `products`: boutique
- `orders`: commandes
- `partners`: partenaires
- `media_assets`: galerie photos/vidéos
- `cms_pages`: pages éditoriales

Le logo est dans `public/club-logo.svg` et peut être remplacé par le logo officiel.
