// ─── src/routes/invoiceRoutes.js ──────────────────────────
// Admin manages all invoices. Clients see only their own
// via GET /api/invoices (filtered by JWT client_id).
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getInvoices, getInvoiceById, createInvoice,
    updateInvoice, deleteInvoice,
} from '../controllers/invoiceController.js';

const router = Router();
const isAdmin = [verifyToken, requireRole('ADMIN', 'SUPER_ADMIN')];

// Clients can view their own invoices — controller filters by role
router.get('/', verifyToken, getInvoices);
router.get('/:id', verifyToken, getInvoiceById);

// Write operations — admin only
router.post('/', ...isAdmin, createInvoice);
router.put('/:id', ...isAdmin, updateInvoice);
router.delete('/:id', ...isAdmin, deleteInvoice);

export default router;
