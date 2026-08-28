import express from 'express';
import { 
    getQuotations, 
    getQuotationById, 
    createQuotation, 
    updateQuotationStatus, 
    convertQuotationToContract 
} from '../controllers/quotationController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All quotation routes require admin
router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/', getQuotations);
router.get('/:id', getQuotationById);
router.post('/', createQuotation);
router.patch('/:id/status', updateQuotationStatus);
router.post('/:id/convert', convertQuotationToContract);

export default router;
