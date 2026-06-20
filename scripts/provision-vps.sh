#!/usr/bin/env bash
#
# Amorcage d'un VPS Hostinger NEUF (Ubuntu/Debian) pour heberger le site.
# A lancer UNE SEULE FOIS, en root, sur le VPS, juste apres sa creation :
#
#   ssh root@IP_DU_VPS
#   curl -fsSL https://raw.githubusercontent.com/MAMAOUTALIBE/CLUB-VIRY/main/scripts/provision-vps.sh -o provision-vps.sh
#   bash provision-vps.sh
#
# Ce script est idempotent : on peut le relancer sans risque.
# Il installe Docker + le plugin compose, ouvre le pare-feu (22/80/443) et
# prepare /opt/esviry. Il ne clone PAS le repo et ne demarre RIEN : la suite
# (clone, .env.local, build, Traefik) est dans docs/deploiement-hostinger.md.

set -euo pipefail

VPS_DIR="${VPS_DIR:-/opt/esviry}"
# uid/gid du process applicatif dans le conteneur (Dockerfile : nextjs=1001).
APP_UID=1001
APP_GID=1001

log() { printf '\n\033[1;32m==>\033[0m %s\n' "$1"; }
warn() { printf '\033[1;33m[!]\033[0m %s\n' "$1" >&2; }

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  warn "Ce script doit etre lance en root (ou via sudo)."
  exit 1
fi

if ! grep -qiE 'ubuntu|debian' /etc/os-release 2>/dev/null; then
  warn "Distribution non Ubuntu/Debian detectee. Le script vise apt ; verifie manuellement."
fi

# --- 1. Mises a jour de base + outils ---------------------------------------
log "Mise a jour des paquets et outils de base"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl git ufw

# --- 2. Docker Engine + plugin compose --------------------------------------
if command -v docker >/dev/null 2>&1; then
  log "Docker deja installe ($(docker --version))"
else
  log "Installation de Docker Engine (script officiel get.docker.com)"
  curl -fsSL https://get.docker.com | sh
fi

log "Activation et demarrage du service Docker"
systemctl enable --now docker

if ! docker compose version >/dev/null 2>&1; then
  warn "Le plugin 'docker compose' n'est pas disponible. Installe docker-compose-plugin."
else
  log "docker compose : $(docker compose version | head -1)"
fi

# --- 3. Pare-feu (UFW) : on n'ouvre que SSH + HTTP + HTTPS -------------------
log "Configuration du pare-feu UFW (22, 80, 443)"
ufw allow OpenSSH         >/dev/null 2>&1 || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
# --force : ne pas demander de confirmation interactive.
ufw --force enable
ufw status verbose || true

# --- 4. Arborescence projet --------------------------------------------------
log "Preparation de $VPS_DIR"
mkdir -p "$VPS_DIR/var/leads"
# Le conteneur ecrit les demandes (contact/inscription...) en uid 1001.
chown -R "$APP_UID:$APP_GID" "$VPS_DIR/var" || warn "chown var/ a echoue (sera refait apres le clone)."

# --- 5. Prochaines etapes ----------------------------------------------------
cat <<EOF

============================================================================
 VPS pret. Etapes suivantes (voir docs/deploiement-hostinger.md) :

 1) DNS : faire pointer esvirychatillonfootball.org (et www) vers l'IP de ce VPS.
 2) Cloner le repo :
      git clone https://github.com/MAMAOUTALIBE/CLUB-VIRY.git $VPS_DIR
 3) Config CRM :
      cd $VPS_DIR
      cp .env.production.crm.example .env.local   # puis renseigner les cles Supabase
 4) Premier deploiement (depuis ton Mac) :
      VPS_HOST=root@IP_DU_VPS ./deploy.sh --check
    puis, UNE fois, demarrer Traefik (HTTPS) sur le VPS :
      cd $VPS_DIR/infra/traefik
      cp .env.example .env && touch acme.json && chmod 600 acme.json
      docker compose -f docker-compose.traefik.yml up -d
============================================================================
EOF
