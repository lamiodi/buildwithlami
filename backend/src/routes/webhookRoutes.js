// ─── src/routes/webhookRoutes.js ──────────────────────────
import { Router } from 'express';
import { handleContactForm } from '../controllers/webhookController.js';

const router = Router();

// Public — no auth required (frontend contact form)
router.post('/contact', handleContactForm);

export default router;
