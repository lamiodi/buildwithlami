import express from 'express';
import { getActivities, getRecentActivities, logActivity } from '../controllers/activityController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Log action (used by controllers/middleware)
router.post('/log', verifyToken, requireRole('ADMIN', 'OWNER'), logActivity);

// Get all or recent activity logs (admin only)
router.get('/', verifyToken, requireRole('ADMIN', 'OWNER'), getActivities);
router.get('/recent', verifyToken, requireRole('ADMIN', 'OWNER'), getRecentActivities);

export default router;