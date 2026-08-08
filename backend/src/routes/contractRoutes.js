import express from 'express';
import { 
    createContract, 
    getContract, 
    getContracts, 
    downloadContractPDF, 
    zohoSignWebhook 
} from '../controllers/contractController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Webhook from Zoho Sign (must be public or use a specific webhook secret verification)
router.post('/webhook', express.json(), zohoSignWebhook);

// Protected Admin Routes
router.use(verifyToken);
router.use(requireRole('ADMIN', 'SUPERADMIN'));

router.get('/', getContracts);
router.post('/', createContract);
router.get('/:id', getContract);
router.get('/:id/pdf', downloadContractPDF);

export default router;
