// ─── src/index.js ────────────────────────────────────────
// buildwithlami.com — Express API Server
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
import activityRoutes from './routes/activityRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminInboxRoutes from './routes/adminInboxRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import crmRoutes from './routes/crmRoutes.js';
import emailTemplateRoutes from './routes/emailTemplateRoutes.js';
import divisionRoutes from './routes/divisionRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import fxRateRoutes from './routes/fxRateRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pool from './config/db.js';
import { startCronJobs } from './services/cronService.js';

// ── App setup ────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
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

// General API limiter — protects all mutating routes from abuse.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: 'Too many requests. Please slow down.' },
});

// Stricter limiter for admin write endpoints (uploads, bulk actions).
const adminWriteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60,
    message: { error: 'Admin write limit reached. Please slow down.' },
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
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/clients', apiLimiter, clientRoutes);
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/profile', apiLimiter, profileRoutes);
app.use('/api/client-projects', apiLimiter, clientProjectRoutes);
// Forms system deprecated in favor of /api/templates
app.use('/api/secrets', apiLimiter, secretRoutes);
app.use('/api/feedback', apiLimiter, feedbackRoutes);
app.use('/api/invoices', apiLimiter, invoiceRoutes);
app.use('/api', apiLimiter, templateRoutes);
app.use('/api/activity', apiLimiter, activityRoutes);
app.use('/api/upload', apiLimiter, adminWriteLimiter, uploadRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);

// Unified admin inbox + global search + bulk actions (Phase 2).
app.use('/api/admin', apiLimiter, adminWriteLimiter, adminInboxRoutes);

// Booking submissions from /survey and /drone public pages (Phase 5).
app.use('/api/bookings', contactLimiter, bookingRoutes);

// CRM pipeline (Phase 3). Public lead submission shares the
// /api/crm/leads route; everything else is admin-gated inside
// the router.
app.use('/api/crm', apiLimiter, crmRoutes);

// Email templates (Phase 3). All endpoints are admin-gated.
app.use('/api/email-templates', apiLimiter, emailTemplateRoutes);

// Division-scoped admin reads (Phase 6). The router itself
// applies `requireDivision` so a Survey Manager token can only
// reach /api/divisions/survey/* and a Drone Pilot only
// /api/divisions/drone/*.
app.use('/api/divisions', apiLimiter, divisionRoutes);

// Phase 8 — Zoho Sign & Financial. The contracts router is now
// mounted (no longer commented out). It still operates in stub
// mode because ZOHO_SIGN_TOKEN is not yet set — see
// services/zohoSignService.js for the live/stub switch.
app.use('/api/contracts', apiLimiter, contractRoutes);

// Phase 8 — FX rates for multi-currency invoices.
app.use('/api/fx-rates', apiLimiter, fxRateRoutes);

// Phase 10 — International payment workflow (Paystack + Grey
// bank transfers + manual proof review). The /public/* routes
// are intentionally unauthenticated — the URL token is the auth.
app.use('/api/payments', apiLimiter, paymentRoutes);

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
    console.log(`\n🚀 buildwithlami.com API running on http://localhost:${PORT}\n`);
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

process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err);
});