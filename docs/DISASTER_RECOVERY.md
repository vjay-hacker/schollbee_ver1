# SchoolBee — Disaster Recovery Runbook

> **Classification**: Internal Operations  
> **Last Updated**: July 2026  
> **Owner**: Platform Engineering Team

---

## RTO / RPO Targets

| Scenario | RTO (Recovery Time) | RPO (Data Loss) |
|----------|--------------------:|----------------:|
| Single API pod crash | < 30 seconds | 0 (no data loss) |
| All API pods down | < 5 minutes | 0 |
| Redis failure | < 10 minutes | Up to 1 second (AOF) |
| Database partial corruption | < 2 hours | Up to 15 minutes |
| Complete database loss | < 4 hours | Up to 24 hours (daily backup) |
| Full datacenter failure | < 8 hours | Up to 24 hours |

---

## Incident Severity Levels

| Level | Criteria | Response Time |
|-------|----------|---------------|
| P0 🔴 | Complete outage — all users affected | Immediate — 24/7 on-call |
| P1 🟠 | Partial outage — >25% users affected | < 15 minutes |
| P2 🟡 | Degraded performance or minor feature loss | < 1 hour |
| P3 🟢 | Cosmetic issue, single user affected | Next business day |

---

## Runbook 1 — API Service Outage

### Symptoms
- Health endpoint `/api/v1/health` returning non-200
- Grafana alert: `schoolbee_http_requests_total` drops to 0
- Mobile apps showing connection errors

### Investigation
```bash
# Check pod/container status
make k8s-status
# OR for Docker:
docker compose -f docker/docker-compose.prod.yml ps

# Check recent logs
make logs-api

# Check if database is accessible
curl https://api.schoolbee.app/api/v1/health
```

### Resolution Steps

1. **If pods are CrashLooping:**
   ```bash
   kubectl describe pod -l app=schoolbee-api -n schoolbee
   kubectl logs -l app=schoolbee-api -n schoolbee --previous
   ```
   - Check for env var misconfiguration
   - Check Supabase URL reachability
   - Rollback if recent deploy: `make k8s-rollback`

2. **If OOMKilled (memory):**
   ```bash
   kubectl get events -n schoolbee --sort-by='.lastTimestamp'
   ```
   - Increase memory limits in `k8s/api-deployment.yaml`
   - Check for memory leaks in metrics dashboard

3. **If Redis connection failure:**
   ```bash
   kubectl exec -it $(kubectl get pod -l app=schoolbee-redis -n schoolbee -o name) \
     -n schoolbee -- redis-cli ping
   ```

4. **Emergency restart:**
   ```bash
   kubectl rollout restart deployment/schoolbee-api -n schoolbee
   kubectl rollout status deployment/schoolbee-api -n schoolbee
   ```

---

## Runbook 2 — Database Corruption / Data Loss

### IMPORTANT: Stop writes before any recovery operation

```bash
# Scale API to 0 replicas to stop all DB writes
kubectl scale deployment schoolbee-api --replicas=0 -n schoolbee
```

### Determine backup to restore

```bash
# List available backups
ls -lhtr /opt/schoolbee/backups/
# OR in S3:
aws s3 ls s3://schoolbee-backups/ --recursive | tail -20
```

### Restore from backup

```bash
# Download from S3 if needed
aws s3 cp s3://schoolbee-backups/schoolbee_20260718_000000.sql.gz /tmp/

# Dry run first (always)
bash scripts/restore-db.sh /tmp/schoolbee_20260718_000000.sql.gz --dry-run

# Execute restore (requires RESTORE confirmation)
bash scripts/restore-db.sh /tmp/schoolbee_20260718_000000.sql.gz
```

### Post-restore steps

```bash
# 1. Refresh materialized views
supabase db execute "
  REFRESH MATERIALIZED VIEW CONCURRENTLY school_attendance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY student_performance_summary;
"

# 2. Verify row counts
supabase db execute "
  SELECT 'students', count(*) FROM students
  UNION ALL SELECT 'schools', count(*) FROM schools
  UNION ALL SELECT 'users', count(*) FROM users;
"

# 3. Restore API replicas
kubectl scale deployment schoolbee-api --replicas=3 -n schoolbee

# 4. Run smoke tests
make health
```

---

## Runbook 3 — Redis Failure

Redis stores: rate limit counters, session caches, pub/sub channels.  
**Data loss impact**: Rate limits reset, user sessions expire (must re-login).

### Recovery

```bash
# Check Redis status
kubectl exec -it schoolbee-redis-0 -n schoolbee -- redis-cli info server

# If StatefulSet pod is dead, delete it (will auto-restart with PVC data)
kubectl delete pod schoolbee-redis-0 -n schoolbee

# For Docker compose:
docker compose -f docker/docker-compose.prod.yml restart redis
```

### If PVC data is lost

Redis data is treated as **soft state** — API has graceful fallback:
- Rate limiting will be temporarily disabled (acceptable)
- Users must re-authenticate (acceptable)
- No permanent data loss (all permanent data is in Supabase)

Simply restart Redis and it will repopulate from API usage.

---

## Runbook 4 — Complete Infrastructure Failure

In the event of a complete provider failure:

### Step 1: Spin up on new provider (< 30 min)

```bash
# Clone repo on new server
git clone https://github.com/your-org/schoolbee.git /opt/schoolbee

# Copy .env.production from secrets manager
# (Bitwarden / AWS Secrets Manager / 1Password)

# Start production stack
make docker-prod
```

### Step 2: Restore latest database backup (< 3 hours)

```bash
# Download latest backup from S3 (or GCS)
aws s3 cp s3://schoolbee-backups/schoolbee_latest.sql.gz /tmp/

# Restore
bash scripts/restore-db.sh /tmp/schoolbee_latest.sql.gz
```

### Step 3: Update DNS

Point your domain DNS A records to the new server IP.
- TTL should already be set to 60s (update immediately after failover)
- Test: `dig api.schoolbee.app`

### Step 4: Verify

```bash
make health
curl -I https://api.schoolbee.app/api/v1/health
```

---

## Backup Schedule

| Backup Type | Frequency | Retention | Storage |
|-------------|-----------|-----------|---------|
| Full database | Daily at 02:00 UTC | 30 days | S3 + Local |
| Pre-deploy backup | Every production deploy | 7 days | S3 |
| Redis AOF | Continuous | N/A | Container volume |

### Setup automated backups (cron)

```bash
# Add to server crontab
crontab -e

# Daily backup at 2 AM UTC
0 2 * * * /opt/schoolbee/scripts/backup-db.sh >> /var/log/schoolbee-backup.log 2>&1
```

---

## Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| On-call Engineer | PagerDuty rotation | 24/7 |
| Database Admin | DBA team Slack #db-ops | Business hours + P0 |
| Supabase Support | support@supabase.io | Business hours |
| Cloud Provider | AWS/GCP support portal | 24/7 (paid support) |

---

## Post-Incident Checklist

- [ ] Service fully restored and verified
- [ ] All stakeholders notified (status page updated)
- [ ] Root cause identified
- [ ] Timeline documented
- [ ] Post-mortem meeting scheduled (within 48h)
- [ ] Action items created in JIRA/Linear
- [ ] Monitoring/alerting gaps addressed
- [ ] Runbook updated with learnings
