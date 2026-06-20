#!/usr/bin/env bash
#
# Sauvegarde quotidienne du Supabase auto-hébergé (VPS srv1768778).
# - dump de la base Postgres "postgres" (schémas public + auth + storage + ...)
# - archive des fichiers uploadés (bucket storage)
# - rotation : conserve les RETENTION_DAYS derniers jours
#
# Installé sur le VPS dans /opt/supabase/backup-supabase.sh et lancé par cron.
# Restauration d'un dump :
#   gunzip -c db-AAAAMMJJ-HHMMSS.sql.gz | docker exec -i supabase-db psql -U postgres -d postgres

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/backups/supabase}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DB_CONTAINER="${DB_CONTAINER:-supabase-db}"
STORAGE_CONTAINER="${STORAGE_CONTAINER:-supabase-storage}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
LOG="$BACKUP_DIR/backup.log"
log() { echo "$(date '+%F %T') $*" | tee -a "$LOG" >&2; }

log "=== début sauvegarde $STAMP ==="

# 1) Dump Postgres (gzip)
DUMP="$BACKUP_DIR/db-$STAMP.sql.gz"
if docker exec -i "$DB_CONTAINER" pg_dump -U postgres -d postgres 2>>"$LOG" | gzip -9 > "$DUMP"; then
  # garde-fou : un dump valide pèse plus que quelques centaines d'octets
  size=$(stat -c %s "$DUMP" 2>/dev/null || echo 0)
  if [ "$size" -lt 500 ]; then log "ERREUR: dump trop petit ($size o)"; rm -f "$DUMP"; exit 1; fi
  log "dump Postgres OK -> $(basename "$DUMP") ($(du -h "$DUMP" | cut -f1))"
else
  log "ERREUR: pg_dump a échoué"; rm -f "$DUMP"; exit 1
fi

# 2) Fichiers du storage (uploads : galerie, documents). Peut être vide.
STO="$BACKUP_DIR/storage-$STAMP.tar.gz"
if docker run --rm --volumes-from "$STORAGE_CONTAINER" -v "$BACKUP_DIR":/backup alpine \
     tar czf "/backup/storage-$STAMP.tar.gz" -C /var/lib/storage . 2>>"$LOG"; then
  log "storage OK -> $(basename "$STO") ($(du -h "$STO" | cut -f1))"
else
  log "AVERTISSEMENT: archive storage échouée (storage peut-être vide)"
  rm -f "$STO" 2>/dev/null || true
fi

# 3) Rotation
deleted=$(find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.sql.gz' -o -name 'storage-*.tar.gz' \) -mtime "+$RETENTION_DAYS" -print -delete 2>>"$LOG" | wc -l)
kept=$(find "$BACKUP_DIR" -maxdepth 1 -type f -name 'db-*.sql.gz' | wc -l)
log "rotation: $deleted fichier(s) supprimé(s) (> $RETENTION_DAYS j), $kept dump(s) conservé(s)"
log "=== fin sauvegarde $STAMP ==="
