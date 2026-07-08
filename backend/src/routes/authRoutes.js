import express from 'express';
import { login, getMe, changePassword } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.put('/password', verifyToken, changePassword);
router.post('/logout', verifyToken, (req, res) => {
    // Client side clears token. Server responds success.
    res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
