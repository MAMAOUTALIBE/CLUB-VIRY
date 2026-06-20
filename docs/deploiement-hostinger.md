# 🟧 Déploiement sur un VPS Hostinger NEUF — ES Viry-Châtillon Football

Guide complet pour mettre le site en ligne sur un **VPS Hostinger fraîchement créé**,
en **mode CRM** (Supabase), domaine **esvirychatillonfootball.org**, HTTPS automatique.

> Déjà un VPS avec Docker + Traefik en service ? → suis plutôt **[DEPLOYMENT.md](../DEPLOYMENT.md)**.
> Ce guide-ci part de **zéro** (Ubuntu nu) et installe tout : Docker, le reverse-proxy
> Traefik (HTTPS Let's Encrypt) et le site.

---

## Vue d'ensemble

```
1. Créer le VPS Hostinger (Ubuntu)        ─┐
2. Pointer le DNS du domaine vers son IP   │  côté Hostinger / registrar
3. Préparer Supabase (cloud) + migrations  ─┘
4. Amorcer le VPS  (provision-vps.sh)      ─┐
5. Cloner + .env.local (mode CRM)           │  sur le VPS / depuis ton Mac
6. Premier déploiement du site (manuel)     │
7. Démarrer Traefik (HTTPS) — une fois     ─┘
8. Smoke test + créer l'admin
9. Mises à jour ensuite : ./deploy.sh
```

Architecture obtenue : **Traefik** (conteneur, ports 80/443, certificats Let's Encrypt)
→ route vers le conteneur **es-viry-football** (Next.js standalone, port interne 3000),
les deux sur le réseau Docker `esviry-net`. Demandes/leads persistés dans `/opt/esviry/var/leads`.

---

## 1. Créer le VPS Hostinger

- hPanel Hostinger → **VPS** → choisir un plan (**2 Go RAM minimum**, le build Next.js
  est gourmand ; 4 Go plus confortable).
- Système : **Ubuntu 22.04 ou 24.04** (sans panneau type CyberPanel — on gère en Docker).
- Récupère **l'IPv4** du VPS et le mot de passe / la clé SSH root.

> 💡 Recommandé : ajoute ta clé SSH publique à la création pour te connecter sans mot de passe.

---

## 2. DNS — pointer le domaine vers le VPS

Chez le registrar du domaine `esvirychatillonfootball.org` (zone DNS) :

| Type | Nom | Valeur |
|------|-----|--------|
| `A`  | `@`   | `IPv4_DU_VPS` |
| `A`  | `www` | `IPv4_DU_VPS` |

Vérifie la propagation (depuis ton Mac) :
```bash
dig +short esvirychatillonfootball.org
dig +short www.esvirychatillonfootball.org
```
Les deux doivent renvoyer l'IP du VPS **avant** de lancer Traefik (sinon Let's Encrypt
ne pourra pas valider le certificat). La propagation peut prendre de quelques minutes à
quelques heures.

---

## 3. Préparer Supabase (mode CRM)

Recommandé : **Supabase Cloud** (plan gratuit suffisant pour démarrer ; rien de plus à
héberger sur le VPS).

1. Crée un projet sur https://supabase.com.
2. **Project Settings → API**, note :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - clé `anon` (public) → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - clé `service_role` (**secrète**, serveur uniquement) → `SUPABASE_SERVICE_ROLE_KEY`
3. **Applique les migrations dans l'ordre** (SQL Editor du dashboard, ou Supabase CLI) :
   tous les fichiers `supabase/migrations/*.sql` du plus ancien au plus récent
   (`202606060001_*` → … → `20260615143000_*`), **puis** `supabase/seed.sql`.

   Avec la Supabase CLI (option avancée) :
   ```bash
   supabase link --project-ref <ref-du-projet>
   supabase db push        # applique les migrations
   ```
4. Renforce l'auth si besoin (déjà reflété dans `supabase/config.toml` : mot de passe
   ≥ 10 caractères, mélange lettres/chiffres, re-auth pour changement de mot de passe).

> Alternative — **Supabase auto-hébergé sur le VPS** : possible mais nettement plus lourd
> (stack Supabase Docker + réseau `supabase-esviry` + `docker-compose.crm.yml`). À ne
> considérer que si l'hébergement des données 100 % sur le VPS est une exigence.

---

## 4. Amorcer le VPS (une seule fois)

Connecte-toi en root et lance le script d'amorçage (installe Docker + plugin compose,
ouvre le pare-feu 22/80/443, prépare `/opt/esviry`) :

```bash
ssh root@IPv4_DU_VPS
curl -fsSL https://raw.githubusercontent.com/MAMAOUTALIBE/CLUB-VIRY/main/scripts/provision-vps.sh -o provision-vps.sh
bash provision-vps.sh
```

Le script est **idempotent** (re-lançable sans risque).

---

## 5. Cloner le repo + configurer le mode CRM

Sur le VPS :
```bash
git clone https://github.com/MAMAOUTALIBE/CLUB-VIRY.git /opt/esviry
cd /opt/esviry
cp .env.production.crm.example .env.local
nano .env.local     # renseigner les 3 clés Supabase (étape 3)
```

Vérifie que `.env.local` contient bien, non vides :
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

> `.env.local` est **ignoré par Git** : tes clés et tes leads ne sont jamais committés et
> survivent à chaque `git pull` / mise à jour.

---

## 6. Premier déploiement du site (sur le VPS)

⚠️ Pour ce **tout premier** déploiement, on build et démarre le site **manuellement** sur
le VPS — pas encore avec `deploy.sh`, car son smoke-test final tape en HTTPS, ce qui
échouerait tant que Traefik (étape 7) n'est pas lancé. On utilisera `deploy.sh` pour les
mises à jour suivantes (étape 9), une fois le HTTPS en place.

```bash
cd /opt/esviry
docker compose --env-file .env.local build      # build de l'image (long la 1re fois)
docker compose --env-file .env.local up -d
docker compose ps        # es-viry-football doit passer "healthy" (~30 s)
```

Ce premier `up` crée le réseau `esviry-net` dont Traefik a besoin à l'étape suivante.

> Si le build manque de RAM (« Killed ») : ajoute du swap, p. ex.
> `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`.

---

## 7. Démarrer Traefik (HTTPS) — une seule fois

À ce stade le site tourne mais n'est pas encore exposé en HTTPS. On lance le reverse-proxy
**après** le site (pour que le réseau `esviry-net` existe déjà) :

```bash
cd /opt/esviry/infra/traefik
cp .env.example .env
nano .env                       # mettre une vraie adresse dans ACME_EMAIL
touch acme.json && chmod 600 acme.json   # fichier de stockage des certificats
docker compose -f docker-compose.traefik.yml up -d
docker logs -f traefik          # observer l'obtention du certificat Let's Encrypt
```

Traefik détecte le conteneur du site (label `traefik.enable=true`), demande le certificat
pour `esvirychatillonfootball.org` (+ `www`) et route le HTTPS. Le challenge **TLS-ALPN**
exige que le DNS (étape 2) pointe déjà sur le VPS.

> Pour répéter des essais sans risquer le rate-limit Let's Encrypt (5 certs/semaine), active
> temporairement le serveur **staging** (ligne commentée dans `docker-compose.traefik.yml`),
> puis reviens en production et supprime `acme.json` pour reprendre un vrai certificat.

Traefik et le site redémarrent seuls au reboot (`restart: unless-stopped`).

---

## 8. Vérifier + créer le compte admin

Smoke test (depuis ton Mac ou un navigateur) :
```bash
D=esvirychatillonfootball.org
curl -sI https://$D/ | head -1                                   # 200
curl -s -o /dev/null -w "redirect: %{http_code}\n" http://$D/    # 301 -> https
curl -s -o /dev/null -w "admin: %{http_code}\n" https://$D/admin # 307 -> /connexion
curl -fsS https://$D/api/backend/health                          # publicSupabaseConfigured:true
```
`deploy.sh` exécute déjà ces vérifications et, en mode CRM, contrôle que
`/api/backend/health` annonce Supabase configuré.

**Créer le 1er administrateur** (`SUPER_ADMIN` ou `ADMIN_CLUB`) : crée l'utilisateur dans
Supabase (Auth → Users), puis renseigne son `role`/`status=ACTIVE` dans la table `profiles`
(voir `supabase/seed.sql` pour la structure). Connexion ensuite via
`https://esvirychatillonfootball.org/connexion`.

---

## 9. Mises à jour suivantes

À chaque modification, après `git push origin main` :
```bash
VPS_HOST=root@IPv4_DU_VPS ./deploy.sh --check
```
Traefik n'a **plus** à être relancé (il tourne en continu). Voir
[DEPLOYMENT.md](../DEPLOYMENT.md) §2–6 pour le détail (rollback, logs, leads, dépannage).

---

## Dépannage spécifique premier déploiement

| Symptôme | Cause / solution |
|---|---|
| **Pas de HTTPS / certificat invalide** | DNS pas encore propagé, ou `acme.json` est un dossier (doit être un fichier 600). `docker logs traefik` montre l'erreur ACME. |
| **`network esviry-net not found`** (au `up` de Traefik) | Le site n'a pas encore été déployé. Fais d'abord l'étape 6 (le site crée le réseau). |
| **Traefik renvoie 404** | Le conteneur du site n'est pas `healthy` ou le DNS ne pointe pas le bon `Host`. Vérifie `docker compose ps` dans `/opt/esviry`. |
| **Rate-limit Let's Encrypt** | Trop d'essais. Bascule sur le serveur staging (cf. étape 7) le temps de régler le DNS. |
| **Build « Killed » (OOM)** | RAM insuffisante : ajoute du swap (cf. étape 6) ou prends un plan VPS supérieur. |
| **Mode resté vitrine** (admin inaccessible) | Une des 3 clés Supabase était vide au **build**. Corrige `.env.local` et **rebuild** (`deploy.sh`), un simple restart ne suffit pas. |
| **Ports 80/443 déjà pris** | Un autre service (Apache/Nginx Hostinger) écoute. `ss -tlnp | grep -E ':80|:443'` puis désactive-le. |
