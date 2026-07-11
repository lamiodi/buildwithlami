import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getNotifications,
    getUnreadCount,
    markRead,
    markAllRead,
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator'));

router.get('/', getNotifications);
router.get('/count', getUnreadCount);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
