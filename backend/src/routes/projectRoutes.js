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

// Protected routes — Owner only. Buildwith_lami is a one-man studio,
// so the only admin identity is the studio owner.
router.use(verifyToken);
router.use(requireRole('Owner'));

router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
