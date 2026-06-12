#!/usr/bin/env bash
#
# Déploiement du site ES Viry-Châtillon sur le VPS, en une commande.
# Usage :  ./deploy.sh
#
# Ce que fait le script :
#   1. (optionnel) lance les vérifs locales si --check est passé
#   2. se connecte au VPS, récupère la dernière version de `main`,
#      rebuild l'image Docker, redémarre le conteneur,
#   3. attend que le conteneur soit "healthy",
#   4. fait un smoke test HTTPS public.
#
# Pré-requis : avoir poussé tes modifications sur `main` (git push origin main).

set -euo pipefail

VPS_HOST="root@187.127.228.197"
VPS_PORT="22"
VPS_DIR="/opt/esviry"
DOMAIN="esvirychatillonfootball.org"

ssh_run() { ssh -p "$VPS_PORT" -o ConnectTimeout=15 "$VPS_HOST" "$@"; }

echo "▶  Déploiement de $DOMAIN"

# --- Vérifs locales optionnelles -------------------------------------------
if [[ "${1:-}" == "--check" ]]; then
  echo "▶  Vérifications locales (typecheck / lint / test / build)…"
  npm run typecheck && npm run lint && npm run test && npm run build
  echo "✓  Vérifs locales OK"
fi

# --- Rappel : le code doit être poussé sur main ----------------------------
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️  Tu as des modifications locales non envoyees."
  echo "    Pense a : git add -A && git commit -m '…' && git push origin main"
fi

# --- Déploiement sur le VPS -------------------------------------------------
echo "▶  Mise à jour sur le VPS ($VPS_DIR)…"
ssh_run "set -e
  cd '$VPS_DIR'
  git pull --ff-only
  echo '▶  Build de l image Docker…'
  docker compose build
  echo '▶  Redémarrage du conteneur…'
  docker compose up -d
  echo '▶  Attente du healthcheck…'
  for i in \$(seq 1 20); do
    st=\$(docker inspect -f '{{.State.Health.Status}}' es-viry-football 2>/dev/null || echo unknown)
    [ \"\$st\" = healthy ] && { echo \"✓  conteneur healthy\"; break; }
    sleep 3
  done
  docker compose ps
"

# --- Smoke test public -----------------------------------------------------
echo "▶  Smoke test https://$DOMAIN …"
code=$(curl -s -o /dev/null -w '%{http_code}' "https://$DOMAIN/" || echo 000)
if [[ "$code" == "200" ]]; then
  echo "✅  En ligne — https://$DOMAIN répond 200"
else
  echo "⚠️  https://$DOMAIN a répondu $code — vérifie les logs : ssh -p $VPS_PORT $VPS_HOST 'cd $VPS_DIR && docker compose logs --tail=50'"
  exit 1
fi

echo "🎉  Déploiement terminé."
