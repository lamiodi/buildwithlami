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
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const SALT_ROUNDS = 12;

async function seed() {
    console.log(`\n🌱 Seeding admin user: ${ADMIN_EMAIL}\n`);

    try {
        // Hash the password
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

        // Upsert — safe to run more than once
        const { rows } = await pool.query(
            `INSERT INTO users (email, password, role)
       VALUES ($1, $2, 'ADMIN')
       ON CONFLICT (email) DO UPDATE
         SET password   = EXCLUDED.password,
             updated_at = NOW()
       RETURNING id, email, role`,
            [ADMIN_EMAIL, passwordHash],
        );

        console.log('✅  Admin user ready:');
        console.table(rows);
        console.log(`\n   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`\n   ⚠️  Change this password immediately after first login!\n`);
    } catch (err) {
        console.error('❌  Seed failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

seed();
