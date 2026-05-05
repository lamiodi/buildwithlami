// ─── src/routes/projectRoutes.js ──────────────────────────
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getProjects, getProjectById, getProjectBySlug,
    createProject, updateProject, deleteProject,
} from '../controllers/projectController.js';

const router = Router();
const isAdmin = [verifyToken, requireRole('ADMIN', 'SUPER_ADMIN')];

// Public — portfolio / slug lookup (no auth)
router.get('/slug/:slug', getProjectBySlug);

// Read — any authenticated user (CLIENT sees own, ADMIN sees all — filtered in controller)
router.get('/', verifyToken, getProjects);
router.get('/:id', verifyToken, getProjectById);

// Write — admin only
router.post('/', ...isAdmin, createProject);
router.put('/:id', ...isAdmin, updateProject);
router.delete('/:id', ...isAdmin, deleteProject);

export default router;
