import express from 'express';
import { login, getMe, changePassword, refresh, forgotPassword, resetPassword, COOKIE_OPTIONS } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import twoFactorRoutes from './twoFactorRoutes.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', verifyToken, getMe);
router.post('/refresh', verifyToken, refresh);
router.put('/password', verifyToken, changePassword);
router.post('/logout', verifyToken, (req, res) => {
    // Clear with exactly the attributes the cookie was set with —
    // mismatched attributes leave the HttpOnly cookie stranded.
    res.clearCookie('access_token', { ...COOKIE_OPTIONS, maxAge: undefined });
    res.json({ success: true, message: 'Logged out successfully' });
});

// 2FA routes (most require auth; /login/2fa is public).
// Mounted here so every /api/auth/* lives behind the same
// authLimiter and `origin` policy as the regular login.
router.use(twoFactorRoutes);

export default router;
