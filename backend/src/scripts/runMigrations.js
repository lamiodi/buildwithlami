import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const masterSchema = path.join(migrationsDir, 'v1_master_schema.sql');

    try {
        console.log('Running master schema migration...');
        const sql = fs.readFileSync(masterSchema, 'utf-8');
        await pool.query(sql);
        console.log('✅  Master schema applied successfully.');
    } catch (err) {
        console.error('❌  Error running migrations:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
