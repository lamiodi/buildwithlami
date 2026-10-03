// ─── src/routes/twoFactorRoutes.js ──────────────────────
// Routes for Email-OTP 2FA setup + login verification.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
    getTwoFactorStatus,
    setupTwoFactor,
    confirmTwoFactor,
    disableTwoFactorController,
    verifyLoginTwoFactor,
    resendLoginOtp,
} from '../controllers/twoFactorController.js';

const router = express.Router();

// ── Public: second-step login ────────────────────────────
router.post('/login/2fa', verifyLoginTwoFactor);
router.post('/login/2fa/resend', resendLoginOtp);

// ── Authenticated: 2FA management ────────────────────────
router.get('/2fa/status', verifyToken, getTwoFactorStatus);
router.post('/2fa/setup', verifyToken, setupTwoFactor);
router.post('/2fa/confirm', verifyToken, confirmTwoFactor);
router.post('/2fa/disable', verifyToken, disableTwoFactorController);

export default router;
