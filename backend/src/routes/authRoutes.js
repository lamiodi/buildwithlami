// ─── src/routes/authRoutes.js ─────────────────────────────
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { login, generateMagicLink, verifyMagicLink } from '../controllers/authController.js';

const router = Router();

// Public
router.post('/login', login);
router.get('/verify', verifyMagicLink);

// Admin only — only an admin can dispatch a magic link to a client
router.post('/magic-link', verifyToken, requireRole('ADMIN', 'SUPER_ADMIN'), generateMagicLink);

export default router;
