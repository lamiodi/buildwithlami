import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginClient, logoutClient, verifyClientSession } from '../controllers/clientAuthController.js';
import { verifyClientToken } from '../middlewares/clientAuthMiddleware.js';

const router = express.Router();

// Client passwords are the portal's front door — give them the same
// brute-force budget as admin login (the mount-level apiLimiter alone
// allowed 100 attempts per 15 minutes per IP).
const clientLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many sign-in attempts. Please try again in a few minutes.' },
});

router.post('/login', clientLoginLimiter, loginClient);
router.post('/logout', logoutClient);
router.get('/me', verifyClientToken, verifyClientSession);

export default router;
