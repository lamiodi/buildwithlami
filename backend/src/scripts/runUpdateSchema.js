import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    const migrationsDir = path.join(__dirname, '..', '..', 'migrations');
    const updateSchemaV2 = path.join(migrationsDir, 'v2_update_schema.sql');
    const updateSchemaV3 = path.join(migrationsDir, 'v3_paystack_invoices.sql');
    const updateSchemaV4 = path.join(migrationsDir, 'v4_contact_qualification.sql');

    try {
        console.log('Running v2 update schema migration...');
        const sqlV2 = fs.readFileSync(updateSchemaV2, 'utf-8');
        await pool.query(sqlV2);
        console.log('✅  V2 update schema migration applied successfully.');

        console.log('Running v3 paystack invoices migration...');
        const sqlV3 = fs.readFileSync(updateSchemaV3, 'utf-8');
        await pool.query(sqlV3);
        console.log('✅  V3 paystack migration applied successfully.');

        console.log('Running v4 contact qualification migration...');
        const sqlV4 = fs.readFileSync(updateSchemaV4, 'utf-8');
        await pool.query(sqlV4);
        console.log('✅  V4 contact qualification migration applied successfully.');
    } catch (err) {
        console.error('❌  Error running update migration:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

run();
