#!/usr/bin/env bash
#
# Mise à jour du site du club EN LIGNE — VPS srv1768778 (nginx reverse-proxy, PAS Traefik).
# À lancer DEPUIS TON MAC, depuis la racine du repo, APRÈS avoir poussé tes
# modifications sur la branche de production (main).
#
#   ./scripts/deploy-nginx-vps.sh
#
# Ce que fait le script (rien de destructif) :
#   1. SSH vers le VPS, `git pull` de la branche de prod dans /opt/esviry
#   2. rebuild de l'image Docker + redémarrage du conteneur (127.0.0.1:8090)
#   3. attend que le conteneur soit "healthy"
#   4. smoke test HTTPS public
#
# Le HTTPS (nginx + certbot) et le vhost ne sont PAS touchés : ils restent en place.
# Variables surchargeables : VPS_HOST, VPS_PORT, VPS_DIR, SSH_KEY, DOMAIN, PRODUCTION_BRANCH.

set -euo pipefail

VPS_HOST="${VPS_HOST:-root@213.130.144.215}"
VPS_PORT="${VPS_PORT:-22}"
VPS_DIR="${VPS_DIR:-/opt/esviry}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/esviry_deploy_ed25519}"
DOMAIN="${DOMAIN:-esvirychatillonfootball.org}"
BRANCH="${PRODUCTION_BRANCH:-main}"
# Override compose "derrière nginx" + fichier d'env présent sur le VPS.
COMPOSE="docker compose -f docker-compose.nginx.yml --env-file .env.local"

echo "==> Mise à jour de $DOMAIN sur $VPS_HOST ($VPS_DIR), branche $BRANCH"

ssh -i "$SSH_KEY" -o IdentitiesOnly=yes -p "$VPS_PORT" -o ConnectTimeout=20 "$VPS_HOST" "
  set -euo pipefail
  cd '$VPS_DIR'

  echo '--> git pull ($BRANCH)'
  git fetch origin '$BRANCH'
  git checkout '$BRANCH' >/dev/null 2>&1 || true
  # Les artefacts de déploiement (docker-compose.nginx.yml, vhost) sont versionnés ;
  # si une copie non suivie traîne sur le VPS et bloque le pull, on s'aligne sur l'origine.
  if ! git pull --ff-only origin '$BRANCH'; then
    echo '   (réconciliation des fichiers de déploiement non suivis)'
    git checkout -- . 2>/dev/null || true
    rm -f docker-compose.nginx.yml infra/nginx/$DOMAIN.conf 2>/dev/null || true
    git pull --ff-only origin '$BRANCH'
  fi

  echo '--> build + up'
  $COMPOSE build
  $COMPOSE up -d

  echo '--> attente healthcheck'
  for i in \$(seq 1 20); do
    st=\$(docker inspect -f '{{.State.Health.Status}}' es-viry-football 2>/dev/null || echo unknown)
    [ \"\$st\" = healthy ] && break
    sleep 3
  done
  st=\$(docker inspect -f '{{.State.Health.Status}}' es-viry-football 2>/dev/null || echo unknown)
  docker ps --filter name=es-viry-football --format '   {{.Names}} | {{.Status}}'
  if [ \"\$st\" != healthy ]; then
    echo 'ERREUR: le conteneur n est pas healthy' >&2
    $COMPOSE logs --tail=60 web >&2 || true
    exit 1
  fi
"

echo "==> Smoke test HTTPS public"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://$DOMAIN/")
echo "   https://$DOMAIN/ -> $code"
if [ "$code" != "200" ]; then
  echo "ERREUR: le site ne répond pas 200 en HTTPS (reçu $code)" >&2
  exit 1
fi
hcode=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://$DOMAIN/api/backend/health" || echo 000)
echo "   https://$DOMAIN/api/backend/health -> $hcode"
echo "==> Mise à jour terminée : https://$DOMAIN"
