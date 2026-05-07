import express from 'express';
import { getProjects, getProjectById, getProjectBySlug, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProjects);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProjectById);

// Protected routes (Admin/Owner only)
router.use(verifyToken);
router.use(requireRole('OWNER'));

router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
