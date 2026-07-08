import 'dotenv/config';
import pool from '../config/db.js';

async function run() {
    try {
        console.log('Applying database fixes...');
        
        // 1. Create activity_logs table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID,
                user_name TEXT,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                details TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);
        console.log('✅ activity_logs table created or verified.');

        // 2. Add paid_at to invoices
        await pool.query(`
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
        `);
        console.log('✅ paid_at column added to invoices.');
        
        console.log('All fixes applied successfully!');
    } catch (err) {
        console.error('❌ Error applying fixes:', err.message);
    } finally {
        await pool.end();
    }
}

run();
