import express from 'express';
import { createContract, getContracts, getContractStatus, downloadContractPDF, handleWebhook } from '../controllers/contractController.js';
import { verifyToken as requireAuth, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('Administrator', 'Owner'), getContracts);
router.post('/', requireAuth, requireRole('Administrator', 'Owner'), createContract);
router.get('/:id', requireAuth, requireRole('Administrator', 'Owner'), getContractStatus);
router.get('/:id/pdf', requireAuth, requireRole('Administrator', 'Owner'), downloadContractPDF);
router.post('/webhook', handleWebhook);

export default router;
