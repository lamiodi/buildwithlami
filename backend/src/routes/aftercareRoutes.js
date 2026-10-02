// ─── src/routes/aftercareRoutes.js ────────────────────────
// Admin OS Phase 5 — Offboarding / Retention (blueprint §47–§49,
// §51–§55). Mounted at /api/aftercare.
//
//   PUBLIC (declared before the auth middleware):
//     GET  /public/testimonials          — published testimonials (§54)
//     GET  /public/referrals/:code       — referral landing lookup (§55)
//     POST /public/referrals/:code/hit   — count a /ref/:code visit
//
//   OWNER-GATED:
//     GET/POST/PATCH/DELETE  /renewals            (§47)
//     POST                   /renewals/:id/renew
//     GET                    /renewals/upcoming   — command-center feed
//     GET/POST/PATCH/DELETE  /maintenance         (§48)
//     POST                   /maintenance/:id/hours
//     GET/POST/PATCH/DELETE  /testimonials        (§54)
//     GET/POST/PATCH/DELETE  /referrals           (§55)
//     GET/POST/PATCH/DELETE  /monitors            (§49)
//     GET                    /monitors/:id/events
//     POST                   /monitors/run-checks
//     GET/POST               /projects/:projectId/handover(+start)
//     PATCH                  /projects/:projectId/handover/checklist
//     POST                   /projects/:projectId/handover/complete
//     POST                   /projects/:projectId/launch
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getRenewals, createRenewal, updateRenewal, deleteRenewal, renewRenewal, getUpcomingRenewals,
    getMaintenancePlans, createMaintenancePlan, updateMaintenancePlan, deleteMaintenancePlan, logMaintenanceHours,
    getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, getPublicTestimonials,
    getReferrals, createReferral, updateReferral, deleteReferral, getReferralByCode, recordReferralHit,
    getMonitors, getMonitorEvents, createMonitor, updateMonitor, deleteMonitor, triggerMonitorChecks,
    getHandover, startHandoverAction, toggleHandoverItem, completeHandoverAction, launchProjectAction,
} from '../controllers/aftercareController.js';

const router = express.Router();
const ownerOnly = requireRole('Owner');

// ── Public routes (no auth) — keep BEFORE router.use(verifyToken) ──
router.get('/public/testimonials', getPublicTestimonials);
router.get('/public/referrals/:code', getReferralByCode);
router.post('/public/referrals/:code/hit', recordReferralHit);

// ── Everything below is admin-only ──
router.use(verifyToken);
router.use(ownerOnly);

// Renewals
router.get('/renewals', getRenewals);
router.get('/renewals/upcoming', getUpcomingRenewals);
router.post('/renewals', createRenewal);
router.patch('/renewals/:id', updateRenewal);
router.post('/renewals/:id/renew', renewRenewal);
router.delete('/renewals/:id', deleteRenewal);

// Maintenance plans
router.get('/maintenance', getMaintenancePlans);
router.post('/maintenance', createMaintenancePlan);
router.patch('/maintenance/:id', updateMaintenancePlan);
router.post('/maintenance/:id/hours', logMaintenanceHours);
router.delete('/maintenance/:id', deleteMaintenancePlan);

// Testimonials
router.get('/testimonials', getTestimonials);
router.post('/testimonials', createTestimonial);
router.patch('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Referrals
router.get('/referrals', getReferrals);
router.post('/referrals', createReferral);
router.patch('/referrals/:id', updateReferral);
router.delete('/referrals/:id', deleteReferral);

// Site monitors
router.get('/monitors', getMonitors);
router.post('/monitors/run-checks', triggerMonitorChecks);
router.get('/monitors/:id/events', getMonitorEvents);
router.post('/monitors', createMonitor);
router.patch('/monitors/:id', updateMonitor);
router.delete('/monitors/:id', deleteMonitor);

// Handover + launch (project lifecycle)
router.get('/projects/:projectId/handover', getHandover);
router.post('/projects/:projectId/handover/start', startHandoverAction);
router.patch('/projects/:projectId/handover/checklist', toggleHandoverItem);
router.post('/projects/:projectId/handover/complete', completeHandoverAction);
router.post('/projects/:projectId/launch', launchProjectAction);

export default router;
