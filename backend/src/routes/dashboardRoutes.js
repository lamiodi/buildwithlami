import express from 'express';
import { getDashboardOverview, getReports } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('ADMIN', 'OWNER'), getDashboardOverview);
router.get('/reports', verifyToken, requireRole('ADMIN', 'OWNER'), getReports);

export default router;
