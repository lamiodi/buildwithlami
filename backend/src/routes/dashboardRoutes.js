import express from 'express';
import { getDashboardOverview, getReports, getTodaySummary } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('Owner', 'Administrator'), getDashboardOverview);
router.get('/reports', verifyToken, requireRole('Owner', 'Administrator'), getReports);
router.get('/today', verifyToken, requireRole('Owner', 'Administrator'), getTodaySummary);

export default router;
