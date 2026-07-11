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

// Pool sizing — overridable per environment.
// Default: max=10, min=0, idleTimeoutMillis=30s. These are the
// values recommended for Supabase/Neon shared poolers where
// each backend instance shares a fixed number of server-side
// connections. Tuning: bump `PG_POOL_MAX` if you see
// "remaining connection slots are reserved" errors in
// production logs; lower `PG_IDLE_TIMEOUT` if you want the
// pooler to release sockets faster between traffic bursts.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isPooler ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
    connectionTimeoutMillis: Number(process.env.PG_CONNECTION_TIMEOUT_MS) || 10_000,
    idleTimeoutMillis:    Number(process.env.PG_IDLE_TIMEOUT_MS)        || 30_000,
    max:                   Number(process.env.PG_POOL_MAX)              || 10,
    min:                   Number(process.env.PG_POOL_MIN)              || 0,
    // Per-session statement timeout (ms) — refuses to run a single query
    // for more than 30s, preventing one slow query from exhausting the pool.
    statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT_MS) || 30_000,
    // Allow Node to exit if every client in the pool is idle and
    // the process is otherwise quiet. The `index.js` shutdown
    // handler still closes the pool cleanly on SIGINT/SIGTERM.
    allowExitOnIdle: false,
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
