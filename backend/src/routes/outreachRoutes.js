// ─── src/routes/outreachRoutes.js ─────────────────────────
// Admin OS Phase 4 — Outreach endpoints (blueprint §18–§22).
//
// Public (rate-limited; the unguessable token is the auth):
//   GET /api/outreach/unsubscribe/:token — one-click unsubscribe
//
// Admin (verifyToken + requireRole 'Owner'):
//   everything else — see outreachController.js for the map.
// ──────────────────────────────────────────────────────────

import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    listProspects,
    createProspect,
    getProspect,
    updateProspect,
    deleteProspect,
    generateDraft,
    sendProspect,
    recordReply,
    convertProspect,
    updateMessage,
    cancelMessage,
    listSequences,
    createSequence,
    getSequence,
    updateSequence,
    deleteSequence,
    listAudits,
    createAudit,
    updateAudit,
    deleteAudit,
    listSuppressions,
    addSuppression,
    removeSuppression,
    getSettings,
    updateSettings,
    getAnalytics,
    triggerFollowUps,
    publicUnsubscribe,
} from '../controllers/outreachController.js';

const router = express.Router();

// ── Public: one-click unsubscribe ────────────────────────
const unsubscribeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { error: 'Too many requests. Please try again later.' },
});
router.get('/unsubscribe/:token', unsubscribeLimiter, publicUnsubscribe);

// ── Admin routes ─────────────────────────────────────────
router.use(verifyToken);
router.use(requireRole('Owner'));

// Prospects
router.get('/prospects', listProspects);
router.post('/prospects', createProspect);
router.get('/prospects/:id', getProspect);
router.patch('/prospects/:id', updateProspect);
router.delete('/prospects/:id', deleteProspect);
router.post('/prospects/:id/generate-draft', generateDraft);
router.post('/prospects/:id/send', sendProspect);
router.post('/prospects/:id/record-reply', recordReply);
router.post('/prospects/:id/convert', convertProspect);

// Messages
router.patch('/messages/:id', updateMessage);
router.post('/messages/:id/cancel', cancelMessage);

// Sequences
router.get('/sequences', listSequences);
router.post('/sequences', createSequence);
router.get('/sequences/:id', getSequence);
router.patch('/sequences/:id', updateSequence);
router.delete('/sequences/:id', deleteSequence);

// Website audits
router.get('/audits', listAudits);
router.post('/audits', createAudit);
router.patch('/audits/:id', updateAudit);
router.delete('/audits/:id', deleteAudit);

// Suppression list
router.get('/suppressions', listSuppressions);
router.post('/suppressions', addSuppression);
router.delete('/suppressions/:id', removeSuppression);

// Settings + analytics + manual cron trigger
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/analytics', getAnalytics);
router.post('/follow-ups/run', triggerFollowUps);

export default router;
