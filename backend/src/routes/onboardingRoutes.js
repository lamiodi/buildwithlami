// ─── src/routes/onboardingRoutes.js ───────────────────────
// Admin OS Phase 1 — Client Onboarding admin endpoints.
//   GET   /api/onboarding
//   GET   /api/onboarding/:id
//   POST  /api/onboarding
//   POST  /api/onboarding/:id/invite
//   PATCH /api/onboarding/:id/status
//
// Portal-side endpoints live in clientPortalRoutes.js behind
// verifyClientToken.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getOnboardings,
    getOnboardingById,
    createOnboarding,
    resendOnboardingInvite,
    updateOnboardingStatus,
} from '../controllers/onboardingController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/', getOnboardings);
router.get('/:id', getOnboardingById);
router.post('/', createOnboarding);
router.post('/:id/invite', resendOnboardingInvite);
router.patch('/:id/status', updateOnboardingStatus);

export default router;
