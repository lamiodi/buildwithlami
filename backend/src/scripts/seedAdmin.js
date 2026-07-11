// ─── src/scripts/seedAdmin.js ────────────────────────────
// Creates the first ADMIN user in the database.
// Run once after db:init:   node src/scripts/seedAdmin.js
//
// Set ADMIN_EMAIL and ADMIN_PASSWORD as env vars or edit below.
// ──────────────────────────────────────────────────────────

import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@devagency.os';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SHOW_PASSWORD = process.argv.includes('--show-password');

if (!ADMIN_PASSWORD) {
    console.error('❌  Missing ADMIN_PASSWORD environment variable.');
    process.exit(1);
}

const SALT_ROUNDS = 12;

async function seed() {
    console.log(`\n🌱 Seeding admin user: ${ADMIN_EMAIL}\n`);

    try {
        // Hash the password
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

        // Upsert — safe to run more than once.
        // Writes the canonical role name ('Owner') so the admin
        // can immediately hit role-gated endpoints like
        // /api/dashboard without needing v22_normalize_admin_roles
        // to run. The v22 migration is still idempotent for any
        // other admin rows that pre-date this fix.
        const { rows } = await pool.query(
            `INSERT INTO users (email, password, role)
       VALUES ($1, $2, 'Owner')
       ON CONFLICT (email) DO UPDATE
         SET password   = EXCLUDED.password,
             role       = 'Owner',
             updated_at = NOW()
       RETURNING id, email, role`,
            [ADMIN_EMAIL, passwordHash],
        );

        console.log('✅  Admin user ready:');
        console.table(rows);
        console.log(`\n   Email:    ${ADMIN_EMAIL}`);
        if (SHOW_PASSWORD) {
            console.log(`   Password: ${ADMIN_PASSWORD}`);
        } else {
            console.log('   Password: (hidden — re-run with --show-password to reveal)');
        }
        console.log(`\n   ⚠️  Change this password immediately after first login!\n`);
    } catch (err) {
        console.error('❌  Seed failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
