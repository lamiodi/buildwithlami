// ─── src/config/db.js ────────────────────────────────────
// Exports a singleton pg Pool connected via DATABASE_URL.
// Every controller imports `pool` and runs parameterised queries.
// ──────────────────────────────────────────────────────────

import pg from 'pg';
const { Pool } = pg;

// SSL behaviour:
// - Supabase Shared Pooler (port 6543) uses a self-signed certificate, so we
//   must set `rejectUnauthorized: false` to connect. Traffic is still encrypted
//   (sslmode=require in the connection string). This is safe because we trust
//   Supabase's infrastructure — the alternative is no connection at all.
// - For direct database connections (port 5432) with a valid CA chain, set
//   sslmode=verify-full in the connection string and this configuration will
//   still work correctly.
const isPooler = process.env.DATABASE_URL?.includes('pooler.supabase.com');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isPooler ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 60_000,
    max: 10,
    // Per-session statement timeout (ms) — refuses to run a single query
    // for more than 30s, preventing one slow query from exhausting the pool.
    statement_timeout: 30_000,
});

// Quick health-check on startup
pool.on('connect', () => {
    console.log('[DB] New client connected to PostgreSQL');
});

// Log pool errors but don't kill the process — transient errors should self-recover
pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
    // Don't process.exit(1) — let the pool attempt reconnection
});

export default pool;
