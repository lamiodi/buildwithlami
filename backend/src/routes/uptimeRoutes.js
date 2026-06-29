// ─── src/routes/uptimeRoutes.js ─────────────────────────
// Health-check endpoints for uptime monitors (e.g. UptimeRobot,
// Better Stack, cron-job.org). Returns 200 when the API and
// database are reachable, 503 otherwise.
// ──────────────────────────────────────────────────────────

import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// Lightweight ping — no DB hit. Uptime bots can hit this to
// confirm the Node process is alive.
router.get('/ping', (_req, res) => {
    res.json({ status: 'ok', message: 'pong' });
});

// Full health check — verifies DB connectivity with a simple
// query. Uptime bots should hit this endpoint to catch DB
// outages, SSL issues, or pool exhaustion.
router.get('/health', async (_req, res) => {
    try {
        const start = Date.now();
        const result = await pool.query('SELECT 1 AS ok, NOW() AS db_time');
        const latencyMs = Date.now() - start;

        res.json({
            status: 'ok',
            database: 'connected',
            dbTime: result.rows[0].db_time,
            latencyMs,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Uptime] Health check failed:', error.message);
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

export default router;
