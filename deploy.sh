#!/usr/bin/env bash
#
# Deploiement du site ES Viry-Chatillon sur un VPS Docker/Traefik.
#
# Usage courant :
#   VPS_HOST=deploy@votre-vps ./deploy.sh --check
#
# Variables utiles :
#   VPS_HOST                 SSH user@host. Obligatoire, volontairement pas commite.
#   VPS_PORT                 Port SSH, defaut 22.
#   VPS_DIR                  Dossier projet sur le VPS, defaut /opt/esviry.
#   DOMAIN                   Domaine public, defaut esvirychatillonfootball.org.
#   DEPLOY_ENV_FILE          Fichier env sur le VPS, defaut .env.local.
#   DEPLOY_MODE              crm ou vitrine, defaut crm.
#   USE_SUPABASE_NETWORK     1 pour ajouter docker-compose.crm.yml, defaut 0.
#   PRODUCTION_BRANCH        Branche de prod, defaut main.

set -euo pipefail

VPS_HOST="${VPS_HOST:-}"
VPS_PORT="${VPS_PORT:-22}"
VPS_DIR="${VPS_DIR:-/opt/esviry}"
DOMAIN="${DOMAIN:-esvirychatillonfootball.org}"
DEPLOY_ENV_FILE="${DEPLOY_ENV_FILE:-.env.local}"
DEPLOY_MODE="${DEPLOY_MODE:-crm}"
USE_SUPABASE_NETWORK="${USE_SUPABASE_NETWORK:-0}"
PRODUCTION_BRANCH="${PRODUCTION_BRANCH:-main}"
RUN_LOCAL_CHECKS=0

usage() {
  cat <<'EOF'
Usage:
  VPS_HOST=deploy@votre-vps ./deploy.sh [--check] [--mode=crm|vitrine] [--env-file=.env.local] [--with-supabase-network]

Options:
  --check                    Lance typecheck, lint, tests et build avant le deploy.
  --mode=crm|vitrine         En crm, les variables Supabase sont obligatoires sur le VPS.
  --env-file=PATH            Fichier env present dans le dossier VPS. Defaut .env.local.
  --with-supabase-network    Ajoute docker-compose.crm.yml pour joindre un Supabase auto-heberge.
  --host=user@host           Alternative a VPS_HOST.
  --port=22                  Alternative a VPS_PORT.
  --dir=/opt/esviry          Alternative a VPS_DIR.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --check)
      RUN_LOCAL_CHECKS=1
      ;;
    --mode=crm)
      DEPLOY_MODE="crm"
      ;;
    --mode=vitrine)
      DEPLOY_MODE="vitrine"
      ;;
    --env-file=*)
      DEPLOY_ENV_FILE="${arg#*=}"
      ;;
    --with-supabase-network)
      USE_SUPABASE_NETWORK=1
      ;;
    --host=*)
      VPS_HOST="${arg#*=}"
      ;;
    --port=*)
      VPS_PORT="${arg#*=}"
      ;;
    --dir=*)
      VPS_DIR="${arg#*=}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Option inconnue: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$VPS_HOST" ]]; then
  echo "VPS_HOST est obligatoire. Exemple: VPS_HOST=deploy@votre-vps ./deploy.sh --check" >&2
  exit 2
fi

if [[ "$DEPLOY_MODE" != "crm" && "$DEPLOY_MODE" != "vitrine" ]]; then
  echo "DEPLOY_MODE doit valoir crm ou vitrine." >&2
  exit 2
fi

ssh_run() {
  ssh -p "$VPS_PORT" -o ConnectTimeout=15 "$VPS_HOST" "$@"
}

shell_quote() {
  printf "%q" "$1"
}

compose_files=(-f docker-compose.yml)
if [[ "$USE_SUPABASE_NETWORK" == "1" ]]; then
  compose_files+=(-f docker-compose.crm.yml)
fi

compose_files_remote=""
for file in "${compose_files[@]}"; do
  compose_files_remote+=" $(shell_quote "$file")"
done

echo "Deploiement de $DOMAIN en mode $DEPLOY_MODE"

if [[ "$RUN_LOCAL_CHECKS" == "1" ]]; then
  echo "Verification locale: typecheck / lint / test / build"
  npm run typecheck
  npm run lint
  npm run test
  npm run build
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Le repo local contient des modifications non committees."
  echo "Le deploy tirera uniquement ce qui est present sur la branche distante $PRODUCTION_BRANCH."
fi

remote_env_file="$(shell_quote "$DEPLOY_ENV_FILE")"
remote_mode="$(shell_quote "$DEPLOY_MODE")"
remote_branch="$(shell_quote "$PRODUCTION_BRANCH")"
remote_dir="$(shell_quote "$VPS_DIR")"

echo "Mise a jour du VPS ($VPS_DIR)"
ssh_run "set -euo pipefail
  cd $remote_dir

  if [ ! -f $remote_env_file ]; then
    echo 'Fichier env introuvable sur le VPS: $DEPLOY_ENV_FILE' >&2
    exit 1
  fi

  git fetch origin $remote_branch
  current_branch=\$(git rev-parse --abbrev-ref HEAD)
  if [ \"\$current_branch\" != \"$PRODUCTION_BRANCH\" ]; then
    echo \"Branche VPS inattendue: \$current_branch, attendu: $PRODUCTION_BRANCH\" >&2
    exit 1
  fi
  git pull --ff-only origin $remote_branch

  if [ $remote_mode = crm ]; then
    set -a
    . ./$DEPLOY_ENV_FILE
    set +a
    for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
      eval value=\\\${\$var:-}
      if [ -z \"\$value\" ]; then
        echo \"Variable CRM manquante dans $DEPLOY_ENV_FILE: \$var\" >&2
        exit 1
      fi
    done
  fi

  compose_cmd=\"docker compose --env-file $DEPLOY_ENV_FILE $compose_files_remote\"

  echo 'Validation de la configuration Docker Compose'
  \$compose_cmd config >/tmp/esviry-compose.config.yml

  echo 'Build Docker'
  \$compose_cmd build --pull

  echo 'Redemarrage du conteneur'
  \$compose_cmd up -d

  echo 'Attente du healthcheck'
  healthy=0
  for i in \$(seq 1 30); do
    st=\$(docker inspect -f '{{.State.Health.Status}}' es-viry-football 2>/dev/null || echo unknown)
    if [ \"\$st\" = healthy ]; then
      healthy=1
      break
    fi
    sleep 3
  done

  if [ \"\$healthy\" != 1 ]; then
    echo 'Le conteneur ne devient pas healthy.' >&2
    \$compose_cmd ps
    \$compose_cmd logs --tail=120 web >&2
    exit 1
  fi

  \$compose_cmd ps
"

expect_status() {
  local url="$1"
  local expected="$2"
  local code
  code=$(curl -sS -o /dev/null -w "%{http_code}" "$url" || echo 000)
  if [[ "$code" != "$expected" ]]; then
    echo "Smoke test KO: $url a repondu $code, attendu $expected" >&2
    exit 1
  fi
}

echo "Smoke tests publics"
expect_status "https://$DOMAIN/" "200"
expect_status "https://$DOMAIN/connexion" "200"

admin_code=$(curl -sS -o /dev/null -w "%{http_code}" "https://$DOMAIN/admin" || echo 000)
if [[ "$admin_code" != "307" && "$admin_code" != "308" && "$admin_code" != "302" ]]; then
  echo "Smoke test KO: /admin doit rediriger sans session, recu $admin_code" >&2
  exit 1
fi

health_payload=$(curl -fsS "https://$DOMAIN/api/backend/health")
if [[ "$DEPLOY_MODE" == "crm" ]]; then
  if [[ "$health_payload" != *'"publicSupabaseConfigured":true'* || "$health_payload" != *'"adminSupabaseConfigured":true'* ]]; then
    echo "Smoke test KO: Supabase n'est pas annonce configure par /api/backend/health" >&2
    exit 1
  fi
fi

echo "Deploiement termine: https://$DOMAIN"
