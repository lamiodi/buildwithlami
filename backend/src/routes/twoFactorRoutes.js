// ─── src/routes/twoFactorRoutes.js ──────────────────────
// Routes for TOTP 2FA setup + the second-step login endpoint.
// Most routes require an admin JWT; the login/2fa endpoint
// is public (it consumes a short-lived challenge token).
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
    getTwoFactorStatus,
    setupTwoFactor,
    confirmTwoFactor,
    disableTwoFactorController,
    regenerateRecoveryCodes,
    verifyLoginTwoFactor,
} from '../controllers/twoFactorController.js';

const router = express.Router();

// ── Public: second-step login ────────────────────────────
router.post('/login/2fa', verifyLoginTwoFactor);

// ── Authenticated: 2FA management ────────────────────────
router.get('/2fa/status', verifyToken, getTwoFactorStatus);
router.post('/2fa/setup', verifyToken, setupTwoFactor);
router.post('/2fa/confirm', verifyToken, confirmTwoFactor);
router.post('/2fa/disable', verifyToken, disableTwoFactorController);
router.post('/2fa/recovery-codes/regenerate', verifyToken, regenerateRecoveryCodes);

export default router;
