import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('ADMIN', 'OWNER'), getDashboardOverview);

export default router;
