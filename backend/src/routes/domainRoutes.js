// ─── src/routes/domainRoutes.js ───────────────────────────
// Admin-only. Domain tracking is an internal management tool.
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getDomains, getDomainById, createDomain,
    updateDomain, deleteDomain,
} from '../controllers/domainController.js';

const router = Router();
const isAdmin = [verifyToken, requireRole('ADMIN', 'SUPER_ADMIN')];

router.get('/', ...isAdmin, getDomains);
router.get('/:id', ...isAdmin, getDomainById);
router.post('/', ...isAdmin, createDomain);
router.put('/:id', ...isAdmin, updateDomain);
router.delete('/:id', ...isAdmin, deleteDomain);

export default router;
