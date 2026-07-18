#!/bin/bash
# ================================================================
# SchoolBee — Database Backup Script
# Backs up Supabase PostgreSQL to local storage + S3/GCS
# Usage: ./backup-db.sh [backup-name]
# ================================================================

set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
BACKUP_NAME="${1:-$(date +%Y%m%d_%H%M%S)}"
BACKUP_DIR="/opt/schoolbee/backups"
DB_HOST="${SUPABASE_DB_HOST:-db.xxx.supabase.co}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASS="${SUPABASE_DB_PASSWORD}"
S3_BUCKET="${BACKUP_S3_BUCKET:-schoolbee-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $*"; }
warn() { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $*"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*" >&2; }

notify_slack() {
  local msg="$1"
  if [ -n "$SLACK_WEBHOOK" ]; then
    curl -s -X POST -H 'Content-type: application/json' \
      --data "{\"text\":\"$msg\"}" \
      "$SLACK_WEBHOOK" || warn "Slack notification failed"
  fi
}

# ── Pre-flight checks ─────────────────────────────────────────────────────────
log "Starting SchoolBee database backup: $BACKUP_NAME"

command -v pg_dump >/dev/null 2>&1 || { error "pg_dump not found"; exit 1; }
command -v gzip >/dev/null 2>&1    || { error "gzip not found"; exit 1; }

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/schoolbee_${BACKUP_NAME}.sql.gz"
BACKUP_FILE_ENCRYPTED="${BACKUP_FILE}.enc"

# ── Database dump ─────────────────────────────────────────────────────────────
log "Dumping database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}"

START_TIME=$(date +%s)

PGPASSWORD="$DB_PASS" pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=plain \
  --verbose \
  --no-password \
  --schema=public \
  --schema=auth \
  --exclude-table-data='audit_logs' \   # Exclude high-volume tables if needed
  2>/tmp/pg_dump_stderr.log \
  | gzip -9 > "$BACKUP_FILE"

DUMP_EXIT_CODE=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

if [ $DUMP_EXIT_CODE -ne 0 ]; then
  error "pg_dump failed with exit code $DUMP_EXIT_CODE"
  cat /tmp/pg_dump_stderr.log >&2
  notify_slack "🚨 *SchoolBee DB Backup FAILED* | Name: \`${BACKUP_NAME}\` | Error: pg_dump exit code ${DUMP_EXIT_CODE}"
  exit 1
fi

BACKUP_SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
log "Dump complete: $BACKUP_FILE ($BACKUP_SIZE) in ${DURATION}s"

# ── Encrypt backup ────────────────────────────────────────────────────────────
if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  log "Encrypting backup..."
  openssl enc -aes-256-cbc -salt -pbkdf2 \
    -in "$BACKUP_FILE" \
    -out "$BACKUP_FILE_ENCRYPTED" \
    -pass env:BACKUP_ENCRYPTION_KEY
  rm "$BACKUP_FILE"
  BACKUP_FILE="$BACKUP_FILE_ENCRYPTED"
  log "Backup encrypted: $BACKUP_FILE"
fi

# ── Upload to cloud storage ───────────────────────────────────────────────────
if command -v aws >/dev/null 2>&1 && [ -n "${AWS_ACCESS_KEY_ID:-}" ]; then
  log "Uploading to S3: s3://${S3_BUCKET}/$(basename $BACKUP_FILE)"
  aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/$(basename $BACKUP_FILE)" \
    --storage-class STANDARD_IA \
    --metadata "school=all,env=production,created=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  log "S3 upload complete ✅"

elif command -v gsutil >/dev/null 2>&1 && [ -n "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]; then
  log "Uploading to GCS: gs://${S3_BUCKET}/$(basename $BACKUP_FILE)"
  gsutil cp "$BACKUP_FILE" "gs://${S3_BUCKET}/$(basename $BACKUP_FILE)"
  log "GCS upload complete ✅"

else
  warn "No cloud storage credentials found — backup kept locally only"
fi

# ── Cleanup old backups ────────────────────────────────────────────────────────
log "Cleaning up local backups older than ${RETENTION_DAYS} days..."
find "$BACKUP_DIR" -name "schoolbee_*.sql.gz*" -mtime +${RETENTION_DAYS} -exec rm -f {} \;
REMAINING=$(ls -1 "$BACKUP_DIR" | wc -l)
log "Cleanup done. $REMAINING backup(s) retained."

# ── Verify backup integrity ────────────────────────────────────────────────────
log "Verifying backup integrity..."
if [[ "$BACKUP_FILE" == *.enc ]]; then
  log "Skipping verification for encrypted backup (decrypt to verify)"
else
  if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "Backup integrity check passed ✅"
  else
    error "Backup file is corrupted!"
    notify_slack "🚨 *SchoolBee DB Backup CORRUPTED* | File: \`$(basename $BACKUP_FILE)\`"
    exit 1
  fi
fi

# ── Success notification ──────────────────────────────────────────────────────
notify_slack "✅ *SchoolBee DB Backup Complete* | Name: \`${BACKUP_NAME}\` | Size: ${BACKUP_SIZE} | Duration: ${DURATION}s"

log "========================================"
log "Backup complete!"
log "  Name:     $BACKUP_NAME"
log "  File:     $BACKUP_FILE"
log "  Size:     $BACKUP_SIZE"
log "  Duration: ${DURATION}s"
log "========================================"
