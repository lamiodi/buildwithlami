import express from 'express';
import { getProjects, getProjectById, getProjectBySlug, createProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
//
// /projects/division/:division?status=PUBLISHED is the endpoint
// the Survey and Drone home pages call to fetch their
// showcase cards. It only returns PUBLISHED rows so DRAFT
// items never leak to the public.
router.get('/division/:division', async (req, res, next) => {
    req.query.division = req.params.division;
    if (!req.query.status) req.query.status = 'PUBLISHED';
    return getProjects(req, res, next);
});

router.get('/', getProjects);
router.get('/slug/:slug', getProjectBySlug);
router.get('/:id', getProjectById);

// Protected routes — any admin-level role (Owner, Administrator,
// Project Manager, Finance). requireRole is case-insensitive so
// legacy 'ADMIN' / 'OWNER' tokens still pass.
router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator', 'Project Manager', 'Finance'));

router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
