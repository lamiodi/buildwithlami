# Backend Migrations

This folder contains all database migrations for the BuildWithLami (buildwithlami.com) backend.
Migrations are versioned (`v2_*`, `v3_*`, …) and are applied in numeric order
by `src/scripts/runUpdateSchema.js`.

## Naming Convention

```
vN_short_description.sql
```

- `vN` — monotonically increasing integer (starts at `v2` because `v1` is the
  baseline `init.sql` + `createMissingTables.sql`).
- `short_description` — lowercase, snake_case, under 40 chars.

## How To Add A New Migration

1. Pick the next number in the sequence (e.g. if the last one is `v12_cms.sql`,
   the new one is `v13_*.sql`).
2. Create `vN_short_description.sql` in this folder.
3. Make the SQL **idempotent** — every `CREATE` uses `IF NOT EXISTS`, every
   `ALTER TABLE … ADD COLUMN` uses `IF NOT EXISTS`, every `DROP` uses
   `IF EXISTS`. This way the script can be re-run without errors.
4. Append the new file to the `MIGRATIONS` array in
   `src/scripts/runUpdateSchema.js`.
5. Run the script: `node src/scripts/runUpdateSchema.js`.

## Idempotency Rules

- Tables: `CREATE TABLE IF NOT EXISTS …`
- Columns: `ALTER TABLE … ADD COLUMN IF NOT EXISTS …`
- Indexes: `CREATE INDEX IF NOT EXISTS …`
- Inserts that seed rows: use `ON CONFLICT (…) DO NOTHING` or `DO UPDATE`.
- Drops: `DROP TABLE IF EXISTS …`, `DROP COLUMN IF EXISTS …`.

## Rollback Strategy

Rollbacks are **not** automatic. If a migration breaks production:

1. Write a follow-up `vN+1_*.sql` that reverses the change (drop the column,
   drop the table, etc.).
2. Do **not** delete the original file — migrations must be append-only so the
   schema history stays auditable.

## File Index

| # | File | Purpose |
| :--- | :--- | :--- |
| 1 | `v2_update_schema.sql` | Placeholder (legacy, kept for `runUpdateSchema.js`) |
| 2 | `v3_paystack_invoices.sql` | Placeholder (legacy) |
| 3 | `v4_contact_qualification.sql` | Placeholder (legacy) |
| 4 | `v5_division.sql` | Adds `division` column to business tables |
| 5 | `v6_offboarding.sql` | Adds offboarding columns to `client_projects` |
| 6 | `v7_roles_rbac.sql` | Creates `roles` table, backfills `users.role` |
| 7 | `v8_bookings.sql` | Creates `bookings` table (Survey + Drone) |
| 8 | `v9_leads.sql` | Creates `leads` table (8-stage CRM pipeline) |
| 9 | `v10_notifications.sql` | Creates `notifications` table (in-app bell) |
| 10 | `v11_audit_logs.sql` | Creates `audit_logs` table (sensitive-action log) |
| 11 | `v12_cms.sql` | Creates CMS tables (`pages`, `testimonials`, `equipment`, `industries`, `email_templates`, `contracts`, `resources`, `conversations`) |
| 12 | `v13_two_factor.sql` | Adds 2FA columns to `users` (TOTP secret, enabled flag, recovery codes) |
| 13 | `v14_client_phone.sql` | Adds `phone` column to `clients` for WhatsApp deep-links |
| 14 | `v15_invoice_currency.sql` | Adds `currency` column to `invoices` (Phase 7) |
| 15 | `v16_invoice_fx_rates.sql` | Creates `fx_rates` table (Phase 8) |
| 16 | `v17_contract_signed_pdf.sql` | Adds `bytea` storage for signed contract PDFs (Phase 8) |
| 17 | `v18_payment_proofs.sql` | Adds `pay_token`, `bank_accounts`, `payment_proofs` (Phase 10) |
| 18 | `v19_fx_live_source.sql` | Adds `source` / `fetched_at` to `fx_rates` (Phase 11) |
| 19 | `v20_schema_cleanup.sql` | **Phase 12 — adds `invoices.invoice_number` + `invoices.paid_at`, creates `activity_logs` table, drops unused `conversations` table, adds 16 performance indexes** |

## Redundant Items Removed In Phase 0

The following columns were present in early schema drafts but never used by the
application code or any of the public forms. They have been removed from
`init.sql` and `createMissingTables.sql` and are not recreated by any migration:

| Table | Column | Reason for removal |
| :--- | :--- | :--- |
| `messages` | `subject` | Neither the `/contact` form nor the home-page `Contact` component sends a `subject` field. The column was always `NULL` in practice. |
| `client_projects` | `last_notified_at` | The `cronService.js` dedupe comment referenced this column, but the actual SELECT/UPDATE queries use an in-process `Map` instead. No code reads or writes the column. |

These were intentional no-ops in the new migration set — the columns were never
created in fresh databases, and the migrations do not add them.

## Items Removed In Phase 12 (Schema Cleanup)

The Phase 12 audit (v20) fixed three classes of issues:

1. **Missing migrations for code-referenced columns/tables.** `invoices.invoice_number`
   and `invoices.paid_at` were written by controllers but never declared in any
   migration. The `activity_logs` table was only created by the one-off
   `applyFixes.js` script. All three are now first-class migrations.
2. **Dead table.** The `conversations` table (defined in v12_cms) was never
   read or written by any controller — the unified inbox aggregates
   `messages`, `project_feedback`, and `intake_submissions` directly. Dropped.
3. **One-off / debug scripts in `src/scripts/`.** The following files were
   one-time utilities or scratch diagnostics and have been removed. Their work
   is now covered by the v20 migration:

   | Removed file | Replaced by |
   | :--- | :--- |
   | `applyFixes.js` | `v20_schema_cleanup.sql` (creates `activity_logs` + `invoices.paid_at`) |
   | `check_cms_tables.js` | (one-off diagnostic) |
   | `check_columns.js` | (one-off diagnostic) |
   | `drop_testimonials.js` | (destructive one-off; superseded by migration `DROP COLUMN IF EXISTS`) |
   | `recreate_leads.js` | (destructive one-off; superseded by migration `DROP TABLE IF EXISTS`) |
   | `test_otplib.js` | (dev scratch) |

   The `db:fixes` npm script was removed at the same time.

See `docs/SCHEMA.md` for the full schema reference generated alongside this
cleanup.
