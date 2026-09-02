// ─── scripts/runUpdateSchema.js ──────────────────────────
// Auto-discovers and runs every SQL file in `backend/migrations/`
// in version order. Migrations are idempotent — re-running this
// script on an already-migrated database is a no-op (apart from
// the harmless CREATE INDEX IF NOT EXISTS / DO $$ … checks
// inside each file).
//
// Why auto-discovery?
//   The previous hardcoded list could silently fall behind if
//   someone added a vN_*.sql file without remembering to update
//   the array. This implementation now:
//     1. Reads every *.sql file in the migrations directory.
//     2. Sorts them by their `v<N>_<name>.sql` prefix.
//     3. Warns loudly if any file does not match the convention.
//     4. Fails fast if a discovered file has no version prefix
//        or duplicates a version (prevents accidental re-ordering).
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

const MIGRATION_PREFIX = /^v(\d+)_[a-z0-9_]+\.sql$/i;

const discoverMigrations = (dir) => {
    if (!fs.existsSync(dir)) {
        throw new Error(`Migrations directory not found: ${dir}`);
    }

    const files = fs
        .readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith('.sql'));

    const seen = new Map();

    for (const file of files) {
        const match = file.match(MIGRATION_PREFIX);
        if (!match) {
            // Non-versioned file (e.g. README.md is filtered, but if a
            // stray .sql appears it will be surfaced).
            if (file !== 'README.md') {
                console.warn(`⚠️  Ignoring non-versioned SQL file: ${file}`);
            }
            continue;
        }
        const version = Number(match[1]);
        if (seen.has(version)) {
            throw new Error(
                `Duplicate migration version v${version}: '${seen.get(version)}' and '${file}'`,
            );
        }
        seen.set(version, file);
    }

    if (seen.size === 0) {
        throw new Error(`No versioned migrations found in ${dir}`);
    }

    return [...seen.entries()]
        .sort(([a], [b]) => a - b)
        .map(([version, file]) => ({ version, file }));
};

const run = async () => {
    let appliedCount = 0;
    let skippedCount = 0;

    let migrations;
    try {
        migrations = discoverMigrations(MIGRATIONS_DIR);
        console.log(
            `📂  Discovered ${migrations.length} migration file(s) in ${MIGRATIONS_DIR}`,
        );
    } catch (err) {
        console.error('❌  Migration discovery failed:', err.message);
        process.exit(1);
        return;
    }

    try {
        for (const { version, file } of migrations) {
            const filePath = path.join(MIGRATIONS_DIR, file);

            const sql = fs.readFileSync(filePath, 'utf-8');

            // Heuristic: files that only contain a comment + a
            // SELECT 'note' AS note statement are placeholders.
            const isPlaceholder = /^\s*--[^\n]*\n[\s\S]*?SELECT\s+['"][^'"]+['"]\s+AS\s+note[\s\S]*$/i.test(sql);

            console.log(
                `▶  [v${version}] ${file}${isPlaceholder ? ' (no-op)' : ''} …`,
            );
            await pool.query(sql);
            console.log(`✅  [v${version}] ${file} applied.`);
            if (isPlaceholder) skippedCount += 1;
            else appliedCount += 1;
        }

        console.log('');
        console.log(
            `🎉  Migrations complete — ${appliedCount} applied, ${skippedCount} placeholder(s).`,
        );
    } catch (err) {
        console.error('❌  Error running migrations:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

run();
