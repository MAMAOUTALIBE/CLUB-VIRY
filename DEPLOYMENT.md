# 🚀 Dossier de déploiement — ES Viry-Châtillon Football

Site **en production** sur **https://esvirychatillonfootball.org** (mode vitrine, sans Supabase).
Hébergé en **Docker + Traefik** sur le VPS, à côté d'autres sites (e-formationgn, etc.).

> **À lire en premier** si tu veux juste mettre à jour le site après une modification :
> saute directement à la section **[2. Mettre à jour le site](#2-mettre-à-jour-le-site-à-chaque-modification)**.

---

## 0. Fiche d'infos (à garder sous la main)

| Élément | Valeur |
|---|---|
| **Domaine** | `esvirychatillonfootball.org` (+ `www`) |
| **Site en ligne** | https://esvirychatillonfootball.org |
| **VPS (SSH)** | `root@187.127.228.197` — port `22` |
| **Dossier sur le VPS** | `/opt/esviry` |
| **Branche de production** | `main` |
| **Conteneur Docker** | `es-viry-football` |
| **Réseau Docker** | `esviry-net` (créé tout seul par compose) |
| **Reverse-proxy** | Traefik partagé (HTTPS auto via Let's Encrypt) |
| **Demandes (contact/inscription/recrutement)** | `/opt/esviry/var/leads/*.jsonl` |
| **Repo GitHub** | https://github.com/MAMAOUTALIBE/CLUB-VIRY |

**Se connecter au VPS** :
```bash
ssh -p 22 root@187.127.228.197
```

---

## 1. Le principe

```
Tu modifies le code (en local)
        │
        ▼
Tu vérifies en local        →   npm run typecheck / lint / test / build
        │
        ▼
Tu envoies sur GitHub       →   git add / commit / push  (branche main)
        │
        ▼
Tu déploies sur le VPS      →   ./deploy.sh   (ou les 3 commandes manuelles)
        │
        ▼
Traefik sert la nouvelle version en HTTPS, automatiquement.
```

> Le build (`docker compose build`) tourne **sur le VPS** : c'est lui qui exécute
> `npm ci` + `next build`. Tu n'as donc rien à builder en local pour déployer.

---

## 2. Mettre à jour le site (à CHAQUE modification)

### A. En local — vérifier puis envoyer le code

```bash
cd ~/CLUB-VIRY

# 1) (recommandé) vérifier que tout est sain AVANT d'envoyer
npm run typecheck && npm run lint && npm run test && npm run build

# 2) envoyer sur GitHub (branche main = production)
git add -A
git commit -m "Décris ta modification ici"
git push origin main
```

### B. Déployer sur le VPS — au choix

**Option rapide (recommandée) — une seule commande depuis ton Mac :**
```bash
cd ~/CLUB-VIRY
./deploy.sh
```
Le script se connecte au VPS, récupère la dernière version, rebuild, redémarre,
attend que le conteneur soit `healthy` et fait un smoke test. (Voir le script `deploy.sh`.)

**Option manuelle — sur le VPS :**
```bash
ssh -p 22 root@187.127.228.197
cd /opt/esviry
git pull --ff-only
docker compose build
docker compose up -d
docker compose ps        # le conteneur doit passer à "healthy" (~30 s)
```

> ✅ `git pull` ne touche **jamais** à `.env.local` ni à `var/leads` (ils sont ignorés par Git) :
> ta config et tes demandes reçues sont préservées à chaque mise à jour.

---

## 3. Vérifier que la mise à jour est OK (smoke test)

Depuis ton Mac (ou un navigateur) :
```bash
D=esvirychatillonfootball.org
curl -sI https://$D/ | head -1                       # doit répondre 200
curl -s -o /dev/null -w "%{http_code}\n" https://$D/equipes
curl -s -o /dev/null -w "redirect: %{http_code}\n" http://$D/      # 301 -> https
curl -s -o /dev/null -w "admin: %{http_code}\n" https://$D/admin   # 307 -> /connexion
```
Et à l'œil : ouvre **https://esvirychatillonfootball.org** et vérifie ta modification + le cadenas HTTPS.

---

## 4. En cas de problème — revenir en arrière (rollback)

Sur le VPS :
```bash
cd /opt/esviry
git log --oneline -5                 # repère le commit qui marchait
git checkout <hash_du_commit_ok>     # ex: 557ba0c
docker compose build && docker compose up -d
```
Pour revenir ensuite à la dernière version : `git checkout main && git pull && docker compose build && docker compose up -d`.

---

## 5. Surveiller / consulter

```bash
# État du conteneur
cd /opt/esviry && docker compose ps

# Logs en direct (Ctrl-C pour quitter)
docker compose logs -f

# Demandes reçues (contact / inscription / recrutement), en mode vitrine
ls -l var/leads
cat var/leads/contact.jsonl
cat var/leads/registration.jsonl
cat var/leads/recruitment.jsonl
```

> 💡 Pour être **prévenu en temps réel** de chaque demande (en plus du fichier),
> renseigne `NOTIFICATION_WEBHOOK_URL` dans `/opt/esviry/.env.local` (Make / Zapier /
> Discord / relais email), puis `docker compose up -d`.

---

## 6. Dépannage

| Symptôme | Cause probable / solution |
|---|---|
| **Conteneur `unhealthy`** | `docker compose logs --tail=50` pour voir l'erreur. Souvent un build cassé : corrige le code, re-`git push`, redéploie. |
| **HTTPS / cadenas KO** | Le DNS de `esvirychatillonfootball.org` doit pointer vers `187.127.228.197`. Vérifie : `dig +short esvirychatillonfootball.org` → doit renvoyer `187.127.228.197`. Traefik régénère le certificat automatiquement une fois le DNS bon. |
| **Build qui échoue sur la RAM** | Le VPS est partagé. Réessaie quand il est moins chargé, ou libère de la mémoire. |
| **`git pull` refusé (divergence)** | Tu as dû committer sur le VPS par erreur. Fais `git fetch origin && git reset --hard origin/main` (⚠️ écrase les modifs locales du VPS, mais pas `.env.local`/`var/leads`). |
| **Demandes non enregistrées dans `var/leads`** | Vérifie le propriétaire : `chown -R 1001:1001 /opt/esviry/var/leads` (le conteneur tourne en uid 1001). |

---

## 7. Première installation (déjà faite — pour mémoire / nouveau serveur)

```bash
ssh -p 22 root@187.127.228.197
cd /opt
git clone https://github.com/MAMAOUTALIBE/CLUB-VIRY.git esviry
cd esviry
cp .env.production.example .env.local          # déjà rempli pour esvirychatillonfootball.org
mkdir -p var/leads && chown -R 1001:1001 var/leads
docker compose build
docker compose up -d
```
Prérequis : Docker + un Traefik en service (entrypoints `web`/`websecure`, certresolver
`letsencrypt`) et le DNS du domaine pointant vers le VPS. Le réseau `esviry-net` est créé
automatiquement ; Traefik le détecte via le label `traefik.docker.network`.

---

## 8. (Plus tard) Activer le CRM complet (Supabase)

Pour l'admin, l'authentification et les données dynamiques :
1. Créer un projet **Supabase** (URL, `anon key`, `service_role key`).
2. Appliquer **dans l'ordre** les migrations `supabase/migrations/202606060001_*.sql` → `...0009_*.sql`, puis `supabase/seed.sql`.
3. Créer un compte **admin** (`ADMIN_CLUB` ou `SUPER_ADMIN`).
4. Renseigner dans `/opt/esviry/.env.local` : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Si Supabase est auto-hébergé sur le même VPS et accessible via le réseau Docker interne, utiliser l'override CRM :
   `docker compose -f docker-compose.yml -f docker-compose.crm.yml up -d --build`.
   En mode vitrine, garder simplement `docker compose up -d --build`.
6. Connexion via `https://esvirychatillonfootball.org/connexion`.

---

## Notes

- **Sécurité** : en-têtes HSTS/CSP/X-Frame-Options actifs ; `/admin` redirige vers `/connexion` (non exploité en vitrine).
- **HTTPS** : certificat Let's Encrypt **auto-renouvelé** par Traefik — rien à faire.
- **Persistance** : `./var/leads` est monté en volume → les demandes survivent aux mises à jour et reboots.
- **Reboot du VPS** : le conteneur redémarre tout seul (`restart: unless-stopped`).
- ⚠️ **Domaine** : seul `esvirychatillonfootball.org` (avec « es ») est actif. `virychatillonfootball.org` (sans « es ») n'existe pas en DNS — si tu le possèdes, on peut le rediriger vers le bon.
