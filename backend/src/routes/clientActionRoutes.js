// ─── src/routes/clientActionRoutes.js ─────────────────────
// Admin OS Phase 1 — Client Actions admin endpoints.
//   GET    /api/client-actions
//   POST   /api/client-actions
//   PATCH  /api/client-actions/:id
//   DELETE /api/client-actions/:id
//
// The portal-side endpoints (GET /client-portal/actions and
// PATCH /client-portal/actions/:id/complete) live in
// clientPortalRoutes.js behind verifyClientToken.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getActions,
    createAction,
    updateAction,
    deleteAction,
} from '../controllers/clientActionController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/', getActions);
router.post('/', createAction);
router.patch('/:id', updateAction);
router.delete('/:id', deleteAction);

export default router;
