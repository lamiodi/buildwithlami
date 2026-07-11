// ─── src/routes/crmRoutes.js ─────────────────────────────
// Phase 3 — CRM Pipeline endpoints.
//
// Public:
//   POST   /api/crm/leads                — submit a lead (rate-limited at the app level)
//
// Admin (requireRole 'Owner' / 'Administrator'):
//   GET    /api/crm/leads                — list, filtered
//   GET    /api/crm/leads/:id            — one
//   PATCH  /api/crm/leads/:id/stage      — drag-and-drop transition
//   PATCH  /api/crm/leads/:id            — partial edit
//   POST   /api/crm/leads/:id/convert    — promote to client
//   GET    /api/crm/stages               — the 8-stage list
// ──────────────────────────────────────────────────────────

import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    createLead,
    getLeads,
    getLeadById,
    updateLeadStage,
    updateLead,
    convertLead,
    getStages,
} from '../controllers/crmController.js';

const router = express.Router();

// Public-submission rate limit: 30 / hour / IP. Generous because
// the form is a real entry point for the business, but tight enough
// to keep bots from flooding the leads table.
const publicLeadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 30,
    message: { error: 'Too many submissions. Please try again later.' },
});

// Public route — anyone can submit a lead.
router.post('/leads', publicLeadLimiter, createLead);

// Admin routes below — all need a valid token.
router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator', 'Project Manager', 'Survey Manager', 'Drone Manager'));

router.get('/stages', getStages);
router.get('/leads', getLeads);
router.get('/leads/:id', getLeadById);
router.patch('/leads/:id/stage', updateLeadStage);
router.patch('/leads/:id', updateLead);
router.post('/leads/:id/convert', convertLead);

export default router;
