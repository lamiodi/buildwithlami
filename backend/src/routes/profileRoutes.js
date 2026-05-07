import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to get profile
router.get('/', getProfile);

// Protected route to update profile
router.put('/', verifyToken, requireRole('OWNER'), updateProfile);

export default router;
