// ─── scripts/runUpdateSchema.js ──────────────────────────
// Runs every SQL file in `backend/migrations/` in numeric
// order. Migrations are idempotent — re-running this script
// on an already-migrated database is a no-op (apart from
// the harmless CREATE INDEX IF NOT EXISTS / DROP COLUMN IF
// EXISTS / DO $$ … checks inside each file).
//
// Usage:  node src/scripts/runUpdateSchema.js
// ──────────────────────────────────────────────────────────

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

// Ordered list of migration files. Update this array when a
// new vN_*.sql file is added to the migrations folder.
const MIGRATIONS = [
    'v2_update_schema.sql',
    'v3_paystack_invoices.sql',
    'v4_contact_qualification.sql',
    'v5_division.sql',
    'v6_offboarding.sql',
    'v7_roles_rbac.sql',
    'v8_bookings.sql',
    'v9_leads.sql',
    'v10_notifications.sql',
    'v11_audit_logs.sql',
    'v12_cms.sql',
    'v13_two_factor.sql',
    'v14_client_phone.sql',
    'v15_invoice_currency.sql',
    'v16_invoice_fx_rates.sql',
    'v17_contract_signed_pdf.sql',
    'v18_payment_proofs.sql',
    'v19_fx_live_source.sql',
    'v20_schema_cleanup.sql',
    'v21_pages_perf_index.sql',
    'v22_normalize_admin_roles.sql',
    'v23_jsonb_gin_indexes.sql',
    'v24_pages_division.sql',
    'v25_drop_cms.sql',
    'v26_portfolio_fields.sql',
    'v27_portfolio_polish.sql',
    'v28_pricing.sql',
    'v29_drop_resources.sql',
];

const run = async () => {
    let appliedCount = 0;
    let skippedCount = 0;

    try {
        for (const file of MIGRATIONS) {
            const filePath = path.join(MIGRATIONS_DIR, file);

            if (!fs.existsSync(filePath)) {
                console.error(`❌  Migration file missing: ${file}`);
                console.error(`    Expected at: ${filePath}`);
                process.exit(1);
            }

            const sql = fs.readFileSync(filePath, 'utf-8');

            // Heuristic: any file that contains only SELECT … AS note
            // statements (the v2/v3/v4 placeholders) is treated as a
            // no-op. We still execute it, but it returns no rows.
            const isPlaceholder = /^\s*--[^\n]*\n[\s\S]*?SELECT\s+['"][^'"]+['"]\s+AS\s+note[\s\S]*$/i.test(sql);

            console.log(`▶  Applying ${file}${isPlaceholder ? ' (no-op)' : ''} …`);
            await pool.query(sql);
            console.log(`✅  ${file} applied.`);
            if (isPlaceholder) skippedCount += 1;
            else appliedCount += 1;
        }

        console.log('');
        console.log(`🎉  Migrations complete — ${appliedCount} applied, ${skippedCount} placeholders.`);
    } catch (err) {
        console.error('❌  Error running migrations:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

run();
