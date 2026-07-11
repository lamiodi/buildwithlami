# Backup & Recovery — BuildWithLami

> Phase 2 / Phase 9 deliverable. Documents the production database
> backup strategy, the quick "Backup Now" check used by the CEO,
> the step-by-step recovery procedure, and the weekly backup
> routine.
>
> Looking for the 60-second emergency card? See
> [CEO_QUICK_REFERENCE.md](./CEO_QUICK_REFERENCE.md). Looking for
> the docs index? See [README.md](./README.md).

## TL;DR

- **Where the data lives:** Render-managed PostgreSQL instance
  (the `DATABASE_URL` env var in the backend service).
- **Automatic backups:** Render takes daily snapshots and retains
  them for 7 days. They can be restored from the Render dashboard
  in under 10 minutes.
- **Manual backup (recommended weekly):** `pg_dump` to a
  versioned file, uploaded to a private S3 bucket.
- **Quick "is my data there?" check:** the admin footer button
  calls `GET /api/admin/backup-status` which returns a per-table
  row count and a total. Use it to confirm the database is
  reachable and roughly the right size.

## 1. What's in the database

`/api/admin/backup-status` (Owner / Administrator only) returns:

```json
{
    "timestamp": "2026-07-10T20:00:00.000Z",
    "counts": {
        "users": 8,
        "clients": 42,
        "client_projects": 67,
        "projects": 24,
        "messages": 312,
        "project_feedback": 19,
        "invoices": 134,
        "leads": 88,
        "bookings": 6,
        "notifications": 215,
        "audit_logs": 1024
    },
    "totalRows": 1939
}
```

If `totalRows` is suddenly much smaller than yesterday's reading
(e.g. halved for no reason), **stop the app and investigate**.

## 2. Manual full backup

Run from any machine that has `psql` client + the production
`DATABASE_URL` exported. Stores a single `.sql.gz` per run.

```bash
# One-time per session
export DATABASE_URL='postgresql://user:pass@host:5432/dbname'

# Dated filename
FNAME="buildwithlami-$(date +%Y%m%d-%H%M).sql.gz"

# pg_dump, gzip, upload to S3
pg_dump --no-owner --no-acl --clean --if-exists "$DATABASE_URL" | gzip > "$FNAME"
aws s3 cp "$FNAME" "s3://buildwithlami-backups/$FNAME"
```

Keep the last **12 weekly** backups (≈ 3 months) and the last
**30 daily** backups (1 month). Anything older than that can be
deleted to control storage cost.

## 3. Restore procedure

1. **Stop the backend service** (Render dashboard → Service →
   Manual Deploy → "Stop Service"). This prevents in-flight
   requests from writing during the restore.
2. **Restore from backup:**

   ```bash
   # Local test (use a scratch database)
   createdb scratch
   gunzip -c backup.sql.gz | psql scratch

   # Production
   gunzip -c backup.sql.gz | psql "$DATABASE_URL"
   ```
3. **Re-run the migrations** that were applied after the
   backup was taken:

   ```bash
   cd backend
   node src/scripts/runUpdateSchema.js
   ```
4. **Restart the backend service** and verify with
   `GET /api/admin/backup-status`.
5. **Spot-check the UI** for one client + one project.

## 4. What "Backup Now" is NOT

- It does **not** write a new `pg_dump` — that's a 1–10 s
  blocking operation that doesn't belong in the admin request
  path.
- It does **not** push to S3.
- It is purely a **liveness + row-count probe**. Use it as a
  "is the database online and roughly the right size?" check.

If you actually want a fresh backup, run the `pg_dump` command
in §2 from your laptop or from a scheduled Render Cron Job
(documented in UPDATE.md §13 once that lands).

## 5. Recovery checklist

- [ ] Identify the most recent *good* backup
- [ ] Stop backend service
- [ ] Restore to a scratch DB and verify row counts
- [ ] Restore to production
- [ ] Re-run migrations
- [ ] Restart backend
- [ ] Verify `/api/admin/backup-status` is in the expected ballpark
- [ ] Spot-check UI
- [ ] Notify the team in the #ops channel

## 6. Contacts

- **Database owner:** Odibenuah Eugene (CEO) —
  `EUGENEODIBENUAH@GMAIL.COM`
- **Render account holder:** same
- **S3 bucket owner:** same

## 7. Audit trail

`audit_logs` is **not** a substitute for a database backup. It
records *who did what*; it does not contain the business data
itself. If you restore from a backup that is older than the
audit log, the audit log will reference entities that no longer
exist. This is expected — restore events should themselves be
written to `audit_logs` once the system is back online.
