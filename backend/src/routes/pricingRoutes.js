// ─── src/routes/pricingRoutes.js ────────────────────────
// /api/pricing — public pricing tiers + admin CRUD.
//
// Public reads (PUBLISHED only) are unauthenticated so the
// marketing /pricing page can render without a token. Admin
// CRUD requires Owner / Administrator.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getPublicPricing,
    getAdminPricing,
    createPricing,
    updatePricing,
    deletePricing,
} from '../controllers/pricingController.js';

const router = express.Router();

router.get('/', getPublicPricing);

router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator'));

router.get('/admin', getAdminPricing);
router.post('/', createPricing);
router.put('/:id', updatePricing);
router.delete('/:id', deletePricing);

export default router;
