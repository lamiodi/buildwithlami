// ─── scripts/runInit.js ──────────────────────────────────
// Reads init.sql and executes it against the database.
// Usage:  npm run db:init
// ──────────────────────────────────────────────────────────

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

// __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    const sql = fs.readFileSync(
        path.join(__dirname, '..', 'sql', 'init.sql'),
        'utf-8',
    );

    try {
        await pool.query(sql);
        console.log('✅  Database tables created successfully.');
    } catch (err) {
        console.error('❌  Error running init.sql:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
