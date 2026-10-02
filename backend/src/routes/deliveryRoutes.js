// ─── src/routes/deliveryRoutes.js ─────────────────────────
// Admin OS Phase 3a — Delivery Control admin endpoints
// (all Owner-gated). Portal-side decision endpoints live in
// clientPortalRoutes.js behind verifyClientToken.
//
//   GET    /api/delivery/projects/:projectId/approvals
//   POST   /api/delivery/projects/:projectId/approvals
//   PATCH  /api/delivery/approvals/:id
//   GET    /api/delivery/projects/:projectId/change-requests
//   POST   /api/delivery/projects/:projectId/change-requests
//   PATCH  /api/delivery/change-requests/:id
//   GET    /api/delivery/projects/:projectId/decisions
//   POST   /api/delivery/projects/:projectId/decisions
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getApprovals,
    createApproval,
    updateApproval,
    getChangeRequests,
    createChangeRequest,
    updateChangeRequest,
    getDecisions,
    createDecision,
} from '../controllers/deliveryController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/projects/:projectId/approvals', getApprovals);
router.post('/projects/:projectId/approvals', createApproval);
router.patch('/approvals/:id', updateApproval);

router.get('/projects/:projectId/change-requests', getChangeRequests);
router.post('/projects/:projectId/change-requests', createChangeRequest);
router.patch('/change-requests/:id', updateChangeRequest);

router.get('/projects/:projectId/decisions', getDecisions);
router.post('/projects/:projectId/decisions', createDecision);

export default router;
