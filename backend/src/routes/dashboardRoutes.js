import express from 'express';
import { getDashboardOverview, getReports, getTodaySummary } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('Owner'), getDashboardOverview);
router.get('/reports', verifyToken, requireRole('Owner'), getReports);
router.get('/today', verifyToken, requireRole('Owner'), getTodaySummary);

export default router;
