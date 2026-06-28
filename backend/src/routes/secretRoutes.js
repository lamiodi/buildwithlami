import express from 'express';
import { createSecret, getSecretsByClient, submitSecretByTrackingId } from '../controllers/secretController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for clients to securely submit keys via their tracking link (write-only)
// Protected with verifyToken to ensure only authenticated clients with valid JWT can submit
router.post('/track/:trackingId/submit', verifyToken, requireRole('CLIENT', 'ADMIN', 'OWNER'), submitSecretByTrackingId);

// Only authenticated admins can access secrets
router.post('/', verifyToken, requireRole('ADMIN', 'OWNER'), createSecret);
router.get('/:clientId', verifyToken, requireRole('ADMIN', 'OWNER'), getSecretsByClient);

export default router;
