// ─── src/routes/resourceRoutes.js ───────────────────────
// /api/resources — knowledge-base articles.
//
// Public reads (PUBLISHED only) are unauthenticated so the
// marketing /resources page can render without a token.
// Admin CRUD requires Owner / Administrator.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getPublicResources,
    getAdminResources,
    createResource,
    updateResource,
    deleteResource,
} from '../controllers/resourceController.js';

const router = express.Router();

// Public listing
router.get('/', getPublicResources);

// Admin write surface — verify first, then gate on role.
router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator'));

router.get('/admin', getAdminResources);
router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);

export default router;
