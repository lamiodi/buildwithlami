import express from 'express';
import { login, getMe, changePassword, refresh } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import twoFactorRoutes from './twoFactorRoutes.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.post('/refresh', verifyToken, refresh);
router.put('/password', verifyToken, changePassword);
router.post('/logout', verifyToken, (req, res) => {
    // Clear the HttpOnly access_token cookie
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

// 2FA routes (most require auth; /login/2fa is public).
// Mounted here so every /api/auth/* lives behind the same
// authLimiter and `origin` policy as the regular login.
router.use(twoFactorRoutes);

export default router;
