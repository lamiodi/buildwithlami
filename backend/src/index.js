// ─── src/index.js ────────────────────────────────────────
// DevAgency OS — Express API Server
// ──────────────────────────────────────────────────────────

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// ── Route modules ────────────────────────────────────────
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';

// ── Cron jobs ────────────────────────────────────────────
import { startDomainExpiryCron } from './utils/cronJobs.js';

// ── App setup ────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 4000;

// ── Rate limiters ────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    message: { error: 'Too many requests. Please try again later.' },
});

const leadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: 'Too many submissions. Please try again later.' },
});

// ── Global middleware ────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// ── Health-check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ───────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/leads', leadLimiter, leadRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/webhooks', webhookRoutes);

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
app.listen(PORT, () => {
    console.log(`\n🚀 DevAgency OS API running on http://localhost:${PORT}\n`);
    startDomainExpiryCron();
});
