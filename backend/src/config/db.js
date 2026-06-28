// ─── src/config/db.js ────────────────────────────────────
// Exports a singleton pg Pool connected via DATABASE_URL.
// Every controller imports `pool` and runs parameterised queries.
// ──────────────────────────────────────────────────────────

import pg from 'pg';
const { Pool } = pg;

// SSL behaviour:
// - In production we require a valid CA chain (set sslmode=verify-full in
//   the connection string, or supply ssl.ca).
// - `rejectUnauthorized: true` is the default but we set it explicitly so the
//   intent is clear. A previous version of this file disabled it to work
//   around Supabase pooler quirks; that opens the door to MITM and must not
//   be re-enabled.
// - If a deployment truly cannot validate the cert, set the env var
//   DB_INSECURE_SSL=true as a last resort and the warning will be logged.
const useInsecureSSL = process.env.DB_INSECURE_SSL === 'true';
if (useInsecureSSL) {
    console.warn('[DB] WARNING: DB_INSECURE_SSL=true — TLS certificate validation is disabled. ' +
                 'Use only for local development.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useInsecureSSL ? { rejectUnauthorized: false } : { rejectUnauthorized: true },
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
