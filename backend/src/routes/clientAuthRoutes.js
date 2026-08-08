import express from 'express';
import { loginClient, logoutClient, verifyClientSession } from '../controllers/clientAuthController.js';
import { verifyClientToken } from '../middlewares/clientAuthMiddleware.js';

const router = express.Router();

router.post('/login', loginClient);
router.post('/logout', logoutClient);
router.get('/me', verifyClientToken, verifyClientSession);

export default router;
