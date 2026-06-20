# 🔄 Mettre à jour le site en ligne — esvirychatillonfootball.org

Le site tourne sur le **VPS `srv1768778`** (`213.130.144.215`), **derrière le nginx de l'hôte**
(qui sert aussi `lodene.org`), **pas** derrière Traefik. Le HTTPS est géré par **certbot**
(renouvellement automatique). Ce guide = comment publier une modification du site **déjà en ligne**.

## Fiche express

| Élément | Valeur |
|---|---|
| VPS (SSH) | `root@213.130.144.215` port **22**, clé `~/.ssh/esviry_deploy_ed25519` |
| Dossier sur le VPS | `/opt/esviry` |
| Conteneur | `es-viry-football`, publié sur **127.0.0.1:8090** (jamais exposé en direct) |
| Reverse-proxy | **nginx hôte** → `proxy_pass 127.0.0.1:8090` ; vhost `/etc/nginx/sites-available/esvirychatillonfootball.org` |
| HTTPS | certbot (Let's Encrypt), renouvellement auto |
| Mode | **vitrine** (sans Supabase). Bascule CRM = remplir les clés Supabase dans `.env.local` puis rebuild |
| Branche de prod | `main` |

Se connecter à la main : `ssh -i ~/.ssh/esviry_deploy_ed25519 root@213.130.144.215`

---

## La marche à suivre (à chaque mise à jour)

### 1. En local — vérifier puis pousser le code

```bash
cd ~/Desktop/CLUB-VIRY
npm run typecheck && npm run lint && npm run test && npm run build   # recommandé
git add -A && git commit -m "Décris ta modification"
git push origin main        # le VPS déploie depuis main
```

> Convention : on travaille sur une branche de feature, puis on **fusionne dans `main`**
> (le VPS ne tire que `main`).

### 2. Déployer — une seule commande depuis ton Mac

```bash
cd ~/Desktop/CLUB-VIRY
./scripts/deploy-nginx-vps.sh
```

Le script se connecte au VPS, `git pull`, **rebuild** l'image, redémarre le conteneur,
attend qu'il soit `healthy`, puis fait un **smoke test HTTPS**. Le HTTPS/nginx/vhost ne sont
pas touchés. (Variables surchargeables : `VPS_HOST`, `SSH_KEY`, `DOMAIN`…)

### …ou à la main, sur le VPS

```bash
ssh -i ~/.ssh/esviry_deploy_ed25519 root@213.130.144.215
cd /opt/esviry
git pull
docker compose -f docker-compose.nginx.yml --env-file .env.local build
docker compose -f docker-compose.nginx.yml --env-file .env.local up -d
docker compose -f docker-compose.nginx.yml ps     # "healthy" en ~30 s
```

> ⚠️ `.env.local` (config) et `var/leads` (demandes reçues) sont hors git → préservés à
> chaque mise à jour.

---

## Vérifier que c'est bon

```bash
D=esvirychatillonfootball.org
curl -sI https://$D/ | head -1                       # 200
curl -s -o /dev/null -w "%{http_code}\n" https://$D/equipes
curl -s -o /dev/null -w "%{http_code}\n" http://$D/  # 301 -> https
curl -fsS https://$D/api/backend/health              # publicSupabaseConfigured (false=vitrine)
```

---

## Dépannage

| Symptôme | Solution |
|---|---|
| Conteneur pas `healthy` | `cd /opt/esviry && docker compose -f docker-compose.nginx.yml logs --tail=80 web` — souvent un build cassé : corrige, re-push, redéploie. |
| Build « Killed » (OOM) | Peu probable (31 Go RAM). Sinon ajouter du swap. |
| 502 Bad Gateway | Le conteneur est tombé. `docker compose -f docker-compose.nginx.yml up -d` puis vérifier `docker ps`. |
| `git pull` bloqué par un fichier non suivi | Les artefacts de déploiement sont versionnés ; `git checkout -- . && git pull`. (Le script gère ce cas tout seul.) |
| Demandes (leads) | En mode vitrine : `ls /opt/esviry/var/leads` puis `cat /opt/esviry/var/leads/*.jsonl`. |
| HTTPS / certificat | certbot renouvelle seul. Forcer : `certbot renew` ; état : `certbot certificates`. **Ne pas** toucher au vhost de `lodene.org`. |

---

## Modifier la config (sans changer le code)

`.env.local` est sur le VPS dans `/opt/esviry/.env.local`. Après modification :
- variables **runtime** (ex. `NOTIFICATION_WEBHOOK_URL`) → `... up -d` suffit.
- variables **`NEXT_PUBLIC_*`** (URL, clés Supabase) → inlinées au **build** → il faut **rebuild**
  (`... build && ... up -d`). C'est le cas pour passer **vitrine → CRM**.

## Passer en mode CRM (plus tard)

1. Créer un projet **Supabase** (cloud), appliquer `supabase/migrations/*.sql` puis `seed.sql`.
2. Dans `/opt/esviry/.env.local`, renseigner `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **Rebuild** : `./scripts/deploy-nginx-vps.sh` (ou `... build && ... up -d` sur le VPS).
4. Vérifier : `curl -fsS https://esvirychatillonfootball.org/api/backend/health` doit montrer
   `publicSupabaseConfigured:true`.
