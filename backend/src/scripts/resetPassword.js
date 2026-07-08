// ─── src/scripts/resetPassword.js ───────────────────────
// Resets an existing admin's password directly in the DB.
// Usage:
//   node src/scripts/resetPassword.js <email> <newPassword>
// Example:
//   node src/scripts/resetPassword.js tygaodibenuah@gmail.com 'bwlPortal2026!'
//
// Connects using DATABASE_URL from .env.
// ─────────────────────────────────────────────────────────

import 'dotenv/config';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const [, , emailArg, passwordArg] = process.argv;

if (!emailArg || !passwordArg) {
    console.error('\n❌  Usage: node src/scripts/resetPassword.js <email> <newPassword>\n');
    process.exit(1);
}

if (passwordArg.length < 6) {
    console.error('\n❌  Password must be at least 6 characters.\n');
    process.exit(1);
}

const EMAIL = emailArg.toLowerCase().trim();
const NEW_PASSWORD = passwordArg;
const SALT_ROUNDS = 12;

async function reset() {
    console.log(`\n🔐 Resetting password for: ${EMAIL}\n`);

    try {
        const passwordHash = await bcrypt.hash(NEW_PASSWORD, SALT_ROUNDS);

        // Update by email; if the user doesn't exist, create them as ADMIN.
        const { rows } = await pool.query(
            `INSERT INTO users (email, password, role)
             VALUES ($1, $2, 'ADMIN')
             ON CONFLICT (email) DO UPDATE
               SET password   = EXCLUDED.password,
                   updated_at = NOW()
             RETURNING id, email, role`,
            [EMAIL, passwordHash],
        );

        console.log('✅  Password reset successfully:');
        console.table(rows);
        console.log(`\n   Email:    ${EMAIL}`);
        console.log(`   Password: ${NEW_PASSWORD}\n`);
        console.log('   You can now log in with these credentials.\n');
    } catch (err) {
        console.error('❌  Reset failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

reset();
