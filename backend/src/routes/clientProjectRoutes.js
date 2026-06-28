import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    getClientProjects,
    getClientProjectById,
    getProjectDashboard,
    createClientProject,
    updateClientProject,
    deleteClientProject,
    getProjectByTrackingId,
    authClientPortal,
    regenerateTrackingId,
    generatePortalLink
} from '../controllers/clientProjectController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Strict limiter on the client portal auth endpoint to prevent
// tracking-ID enumeration and email brute-forcing. 5 attempts / 15 min / IP.
const portalAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public route for clients
router.get('/track/:trackingId', getProjectByTrackingId);
router.post('/track/:trackingId/auth', portalAuthLimiter, authClientPortal);

// Protected admin routes
router.get('/', verifyToken, getClientProjects);
router.get('/:id/dashboard', verifyToken, getProjectDashboard);
router.get('/:id', verifyToken, getClientProjectById);
router.post('/', verifyToken, createClientProject);
router.put('/:id', verifyToken, updateClientProject);
router.patch('/:id', verifyToken, updateClientProject);
router.delete('/:id', verifyToken, deleteClientProject);
router.post('/:id/regenerate-tracking', verifyToken, regenerateTrackingId);
router.get('/:id/portal-link', verifyToken, generatePortalLink);

export default router;
