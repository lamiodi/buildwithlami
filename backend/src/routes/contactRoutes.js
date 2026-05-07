import express from 'express';
import { submitContactForm, getMessages, markMessageRead, deleteMessage } from '../controllers/contactController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for visitors to submit messages
router.post('/', submitContactForm);

// Protected routes for admin
router.use(verifyToken);
router.use(requireRole('OWNER'));

router.get('/', getMessages);
router.put('/:id/read', markMessageRead);
router.delete('/:id', deleteMessage);

export default router;
