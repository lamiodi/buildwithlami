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

// Baseline = init.sql (users, profile, projects, messages) + the
// business tables (clients, client_projects, invoices, intake_*,
// project_secrets, project_feedback) that live in
// createMissingTables.sql. The migrations (v5 onwards) ALTER those
// tables, so a fresh database cannot run db:migrate without both.
const BASELINE_FILES = ['init.sql', 'createMissingTables.sql'];

async function run() {
    try {
        for (const file of BASELINE_FILES) {
            const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', file), 'utf-8');
            await pool.query(sql);
            console.log(`✅  Applied ${file}`);
        }
        console.log('✅  Database baseline created successfully.');
    } catch (err) {
        console.error('❌  Error running db:init:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
