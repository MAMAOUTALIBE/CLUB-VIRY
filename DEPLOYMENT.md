# Déploiement — ES Viry-Châtillon Football

Mise en production sur **Docker / VPS + Traefik**, en mode **CRM complet (Supabase)**.

## Pré-requis

- Un **VPS** avec Docker et `docker compose`.
- **Traefik** déjà en service avec un entrypoint `websecure` (443), un entrypoint `web` (80) et un
  certresolver `letsencrypt`.
- Un **domaine** dont l'enregistrement DNS (A/AAAA) pointe vers l'IP du VPS.
- Un **projet Supabase** (URL, `anon key`, `service_role key`).

## 1. Base de données Supabase

Dans le **SQL Editor** de Supabase (ou via `supabase db push` avec la CLI), exécuter **dans l'ordre** les
migrations puis le seed :

```
supabase/migrations/202606060001_backend_foundations.sql
supabase/migrations/202606060002_family_accounts.sql
supabase/migrations/202606060003_registrations.sql
supabase/migrations/202606060004_document_storage.sql
supabase/migrations/202606060005_teams_matches.sql
supabase/migrations/202606060006_content_partners.sql
supabase/migrations/202606060007_recruitment_shop.sql
supabase/migrations/202606060008_contact_notifications_admin.sql
supabase/migrations/202606060009_calendar_events.sql
supabase/seed.sql
```

Créer ensuite au moins un **compte admin** (rôle `ADMIN_CLUB` ou `SUPER_ADMIN`) pour accéder au CRM.

## 2. Récupérer le code sur le VPS

```bash
git clone https://github.com/MAMAOUTALIBE/CLUB-VIRY.git
cd CLUB-VIRY
```

## 3. Configurer `.env.local`

```bash
cat > .env.local <<'EOF'
NEXT_PUBLIC_SITE_URL=https://<domaine>
SITE_DOMAIN=<domaine>
TRAEFIK_NETWORK=traefik

# CRM (requis)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# Notifications (optionnel)
ADMIN_NOTIFICATIONS_EMAIL=<email admin>
# NOTIFICATION_WEBHOOK_URL=
# NOTIFICATION_WEBHOOK_SECRET=
EOF
```

## 4. Préparer l'hôte

```bash
mkdir -p var/leads
# Créer le réseau Traefik s'il n'existe pas déjà :
docker network create traefik 2>/dev/null || true
```

## 5. Build & démarrage

> Le `docker compose build` exécute `npm ci` + `next build` : c'est l'étape qui valide réellement la
> compilation TypeScript du projet.

```bash
docker compose build
docker compose up -d
docker compose logs -f
```

## 6. Smoke tests (après démarrage)

- `https://<domaine>/` — accueil + hero (photo drone du stade), HTTPS actif.
- `https://<domaine>/equipes/seniors-r1` — fiche « Seniors D1 ».
- `https://<domaine>/le-club/stade-henri-longuet` — galerie photos.
- `https://<domaine>/api/backend/health` — backend/Supabase OK.
- `https://<domaine>/calendrier` — calendrier (données Supabase ou repli).
- `https://<domaine>/admin` — connexion admin → dashboard CRM (barres KPI, graphiques par statut) et modules
  Finances / Détections / Messages / Partenaires.
- Envoyer le **formulaire de contact** et vérifier l'arrivée (table `contact_messages` / webhook).

## Mise à jour ultérieure

```bash
git pull
docker compose build
docker compose up -d
```

## Rollback

`main` est la branche de production. Pour revenir en arrière :

```bash
git checkout <commit_precedent>
docker compose up -d --build
```

## Notes

- **Mode vitrine** (sans Supabase) : le site public fonctionne avec des données mockées ; les demandes
  (contact / inscription / recrutement) sont enregistrées dans `var/leads` et/ou transmises au webhook.
- L'espace `/admin` est `noindex` ; l'accès aux données est protégé côté API par le token Supabase et la
  matrice de permissions par rôle.
- Les dépendances sont verrouillées par `package-lock.json` (`npm ci` reproductible).
