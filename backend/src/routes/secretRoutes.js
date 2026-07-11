import express from 'express';
import { createSecret, getSecretsByClient, submitSecretByTrackingId } from '../controllers/secretController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route for clients to securely submit keys via their tracking link (write-only)
// Protected with verifyToken to ensure only authenticated clients with valid JWT can submit
router.post('/track/:trackingId/submit', verifyToken, requireRole('Client', 'Administrator', 'Owner'), submitSecretByTrackingId);

// Only authenticated admins can access secrets
router.post('/', verifyToken, requireRole('Administrator', 'Owner'), createSecret);
router.get('/:clientId', verifyToken, requireRole('Administrator', 'Owner'), getSecretsByClient);

export default router;
