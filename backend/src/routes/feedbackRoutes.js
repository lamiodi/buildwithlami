import express from 'express';
import { getFeedbackByProject, submitFeedback, replyToFeedback } from '../controllers/feedbackController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Client routes (Requires tracking ID auth / client JWT)
router.post('/submit', verifyToken, requireRole('Client', 'Owner'), submitFeedback);
router.get('/project/:projectId', verifyToken, requireRole('Client', 'Owner'), getFeedbackByProject);

// Admin routes
router.put('/:id/reply', verifyToken, requireRole('Owner'), replyToFeedback);

export default router;