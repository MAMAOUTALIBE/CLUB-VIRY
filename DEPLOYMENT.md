# Déploiement — ES Viry-Châtillon Football

Mise en production sur **Docker / VPS Hostinger + Traefik partagé**, en mode **vitrine**
(sans Supabase), sur **https://esvirychatillonfootball.org**.

> Mode vitrine : le site public et le module « Match en direct » fonctionnent ; les demandes
> (contact / inscription / recrutement) sont enregistrées dans `var/leads` (persistant sur le VPS)
> et, si un webhook est configuré, transmises en temps réel. L'espace `/admin` n'est pas exploité
> en vitrine (il nécessite Supabase — voir la dernière section).

## Pré-requis

- Un **VPS** avec Docker et `docker compose`.
- **Traefik** déjà en service sur le VPS (réseau partagé `traefik`), avec un entrypoint `websecure`
  (443), un entrypoint `web` (80) et un certresolver `letsencrypt` — comme pour e-formationgn.
- Le **DNS** de `esvirychatillonfootball.org` : un enregistrement **A** (et `AAAA` si IPv6) pointant
  vers l'IP du VPS. (Vérifier : `dig +short esvirychatillonfootball.org`.)

## 1. Récupérer le code sur le VPS

```bash
git clone https://github.com/MAMAOUTALIBE/CLUB-VIRY.git
cd CLUB-VIRY
```

## 2. Configurer `.env.local`

```bash
cp .env.production.example .env.local
# Le fichier est déjà rempli pour esvirychatillonfootball.org en mode vitrine.
# (Optionnel) décommenter NOTIFICATION_WEBHOOK_URL pour recevoir les demandes en direct.
```

Contenu minimal attendu :

```
NEXT_PUBLIC_SITE_URL=https://esvirychatillonfootball.org
SITE_DOMAIN=esvirychatillonfootball.org
TRAEFIK_NETWORK=traefik
LEADS_DIR=/app/var/leads
```

## 3. Préparer l'hôte

```bash
mkdir -p var/leads
# Le réseau Traefik partagé existe déjà ; sinon le créer :
docker network create traefik 2>/dev/null || true
```

## 4. Build & démarrage

> `docker compose build` exécute `npm ci` + `next build` : c'est l'étape qui valide réellement la
> compilation TypeScript et fige les dépendances (`package-lock.json`).

```bash
docker compose build
docker compose up -d
docker compose logs -f        # Ctrl-C pour quitter les logs
```

Vérifier l'état du conteneur (le HEALTHCHECK doit passer à `healthy` au bout de ~30 s) :

```bash
docker compose ps
```

## 5. Smoke tests (après démarrage)

- `https://esvirychatillonfootball.org/` — accueil + hero, **HTTPS actif** (cadenas, cert Let's Encrypt).
- `https://esvirychatillonfootball.org/actualites` — module **« Match en direct »** (score live + lecteur vidéo).
- `https://esvirychatillonfootball.org/equipes/seniors-r1` — fiche équipe.
- `https://esvirychatillonfootball.org/le-club/stade-henri-longuet` — galerie photos.
- `https://esvirychatillonfootball.org/calendrier` — calendrier (repli statique en vitrine).
- Redirection HTTP→HTTPS : `curl -sI http://esvirychatillonfootball.org` renvoie un `30x` vers `https://`.
- Envoyer le **formulaire de contact**, puis vérifier la capture (voir §6).
- `https://esvirychatillonfootball.org/admin` → redirige vers `/connexion` (espace admin non actif en vitrine).

## 6. Consulter les demandes reçues (mode vitrine)

Les demandes sont écrites en JSONL, lisibles directement sur le VPS :

```bash
ls -l var/leads
cat var/leads/contact.jsonl
cat var/leads/inscription.jsonl
cat var/leads/recrutement.jsonl
```

> Recommandé : configurer `NOTIFICATION_WEBHOOK_URL` (Make / Zapier / Discord / relais email) dans
> `.env.local` pour être prévenu en temps réel de chaque demande, en plus du stockage fichier.

## 7. Mise à jour ultérieure

```bash
git pull
docker compose build
docker compose up -d
```

## 8. Rollback

`main` est la branche de production.

```bash
git checkout <commit_precedent>
docker compose up -d --build
```

## 9. (Plus tard) Passer en CRM complet (Supabase)

Pour activer l'admin, l'authentification et les données dynamiques :

1. Créer un projet **Supabase** (URL, `anon key`, `service_role key`).
2. Exécuter **dans l'ordre** les migrations puis le seed (SQL Editor ou `supabase db push`) :
   `supabase/migrations/202606060001_*.sql` → `...0009_*.sql`, puis `supabase/seed.sql`.
3. Créer un compte **admin** (`ADMIN_CLUB` ou `SUPER_ADMIN`).
4. Renseigner dans `.env.local` : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, puis `docker compose up -d --build`.
5. Connexion via `https://esvirychatillonfootball.org/connexion`.

## Notes

- **HEALTHCHECK** : le conteneur s'auto-surveille (requête sur `/`) ; `docker compose ps` affiche `healthy`.
- **Sécurité** : en-têtes HSTS/CSP/X-Frame-Options actifs ; `/admin` est `noindex` et protégé (proxy
  valide la session Supabase, API protégée par token + permissions par rôle).
- **Persistance** : le volume `./var/leads:/app/var/leads` conserve les demandes entre les mises à jour.
- **Dépendances** : versions figées (`npm ci` reproductible).
