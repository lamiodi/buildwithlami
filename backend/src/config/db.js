// ─── src/config/db.js ────────────────────────────────────
// Exports a singleton pg Pool connected via DATABASE_URL.
// Every controller imports `pool` and runs parameterised queries.
// ──────────────────────────────────────────────────────────

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase hosted PG
  },
});

// Quick health-check on startup
pool.on('connect', () => {
  console.log('[DB] New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
  process.exit(1);
});

export default pool;
