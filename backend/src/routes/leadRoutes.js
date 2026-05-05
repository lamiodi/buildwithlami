// ─── src/routes/leadRoutes.js ──────────────────────────────
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getLeads, getLeadById, createLead,
    updateLead, convertLead, deleteLead,
} from '../controllers/leadController.js';

const router = Router();
const isAdmin = [verifyToken, requireRole('ADMIN', 'SUPER_ADMIN')];

// Public — visitor submits onboarding form
router.post('/', createLead);

// Admin only
router.get('/', ...isAdmin, getLeads);
router.get('/:id', ...isAdmin, getLeadById);
router.patch('/:id', ...isAdmin, updateLead);
router.post('/:id/convert', ...isAdmin, convertLead);
router.delete('/:id', ...isAdmin, deleteLead);

export default router;
