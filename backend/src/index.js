// ─── src/index.js ────────────────────────────────────────
// buildwithlami.dev — Express API Server
// ──────────────────────────────────────────────────────────

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// ── Route modules ────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import clientProjectRoutes from './routes/clientProjectRoutes.js';
// Removed formRoutes as it was replaced by templateRoutes
import secretRoutes from './routes/secretRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import uptimeRoutes from './routes/uptimeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pool from './config/db.js';
import { startCronJobs } from './services/cronService.js';

// ── App setup ────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ── Rate limiters ────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many requests. Please try again later.' },
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: 'Too many submissions. Please try again later.' },
});

// ── Global middleware ────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://buildwithlami.vercel.app',
    'https://buildwithlami.onrender.com',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// ── Health-check (legacy, no DB) ─────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Uptime routes (/ping and /health with DB check) ──────
app.use('/', uptimeRoutes);

// ── Dashboard (admin overview) ───────────────────────────
app.use('/api/dashboard', dashboardRoutes);

// ── API routes ───────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/client-projects', clientProjectRoutes);
// Forms system deprecated in favor of /api/templates
app.use('/api/secrets', secretRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api', templateRoutes);

// ── 404 fallback ─────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found.' });
});

// ── Global error handler ─────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[Server] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`\n🚀 buildwithlami.dev API running on http://localhost:${PORT}\n`);
    startCronJobs();
});

// ── Graceful Shutdown ────────────────────────────────────
const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(async () => {
        console.log('[Server] Closed out remaining connections.');
        try {
            await pool.end();
            console.log('[Server] Database pool closed.');
        } catch (err) {
            console.error('[Server] Error closing database pool:', err.message);
        }
        process.exit(0);
    });

    // Force close if it takes too long
    setTimeout(() => {
        console.error('[Server] Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
