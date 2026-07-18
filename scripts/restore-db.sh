#!/bin/bash
# ================================================================
# SchoolBee — Database Restore Script
# Restores a backup file to the target database
# Usage: ./restore-db.sh <backup-file> [--dry-run]
# ================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"
DRY_RUN="${2:-}"
DB_HOST="${SUPABASE_DB_HOST:-db.xxx.supabase.co}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME:-postgres}"
DB_USER="${SUPABASE_DB_USER:-postgres}"
DB_PASS="${SUPABASE_DB_PASSWORD}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $*"; }
warn()  { echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARN:${NC} $*"; }
error() { echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $*" >&2; }
info()  { echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $*"; }

# ── Input validation ──────────────────────────────────────────────────────────
if [ -z "$BACKUP_FILE" ]; then
  error "Usage: $0 <backup-file.sql.gz> [--dry-run]"
  error "Example: $0 /opt/schoolbee/backups/schoolbee_20260718_120000.sql.gz"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  error "Backup file not found: $BACKUP_FILE"
  exit 1
fi

# ── Safety confirmation ────────────────────────────────────────────────────────
echo ""
warn "⚠️  DATABASE RESTORE — THIS WILL OVERWRITE EXISTING DATA ⚠️"
echo ""
info "  Target database: ${DB_NAME} @ ${DB_HOST}:${DB_PORT}"
info "  Backup file:     ${BACKUP_FILE}"
info "  File size:       $(du -sh "$BACKUP_FILE" | cut -f1)"
echo ""

if [ "$DRY_RUN" = "--dry-run" ]; then
  log "DRY RUN mode — no changes will be made"
  log "Validating backup file integrity..."
  if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    log "✅ Backup file is valid and readable"
    log "✅ Dry run complete — backup looks healthy"
  else
    error "❌ Backup file appears corrupted"
    exit 1
  fi
  exit 0
fi

read -p "Type 'RESTORE' to confirm: " CONFIRM
if [ "$CONFIRM" != "RESTORE" ]; then
  log "Restore cancelled."
  exit 0
fi

# ── Pre-restore backup ─────────────────────────────────────────────────────────
log "Creating pre-restore backup of current database..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PRE_RESTORE_BACKUP="/opt/schoolbee/backups/pre_restore_${TIMESTAMP}.sql.gz"

PGPASSWORD="$DB_PASS" pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --format=plain \
  --schema=public \
  | gzip -9 > "$PRE_RESTORE_BACKUP"

log "Pre-restore backup saved: $PRE_RESTORE_BACKUP"

# ── Decrypt if needed ─────────────────────────────────────────────────────────
RESTORE_FILE="$BACKUP_FILE"

if [[ "$BACKUP_FILE" == *.enc ]]; then
  if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
    error "Encrypted backup detected but BACKUP_ENCRYPTION_KEY is not set"
    exit 1
  fi
  log "Decrypting backup..."
  RESTORE_FILE="/tmp/schoolbee_restore_${TIMESTAMP}.sql.gz"
  openssl enc -d -aes-256-cbc -pbkdf2 \
    -in "$BACKUP_FILE" \
    -out "$RESTORE_FILE" \
    -pass env:BACKUP_ENCRYPTION_KEY
  log "Decryption complete"
fi

# ── Restore ────────────────────────────────────────────────────────────────────
log "Starting restore from: $RESTORE_FILE"
START_TIME=$(date +%s)

gunzip -c "$RESTORE_FILE" | PGPASSWORD="$DB_PASS" psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --dbname="$DB_NAME" \
  --echo-errors \
  --set ON_ERROR_STOP=off   # Continue on minor errors (type conflicts etc)

RESTORE_EXIT_CODE=$?
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Cleanup temp decrypt file
[ "$RESTORE_FILE" != "$BACKUP_FILE" ] && rm -f "$RESTORE_FILE"

if [ $RESTORE_EXIT_CODE -eq 0 ]; then
  log "======================================"
  log "✅ Restore completed successfully!"
  log "   Duration:      ${DURATION}s"
  log "   Pre-restore backup: $PRE_RESTORE_BACKUP"
  log "======================================"
  log ""
  log "Post-restore checklist:"
  log "  1. Refresh materialized views in Supabase"
  log "  2. Run: SELECT count(*) FROM students; to verify row counts"
  log "  3. Restart API pods/containers to clear any cached data"
  log "  4. Run smoke tests against the API"
else
  error "Restore completed with errors (exit code: $RESTORE_EXIT_CODE)"
  warn "The pre-restore backup is available at: $PRE_RESTORE_BACKUP"
  warn "You can rollback by running: $0 $PRE_RESTORE_BACKUP"
fi
