import express from 'express';
import { createInvoice, getAllInvoices, getInvoicesByProject, deleteInvoice, markInvoicePaid, paystackWebhook } from '../controllers/invoiceController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Webhook (unprotected, verified via crypto signature inside controller).
// The `verify` hook stores the raw request body so the controller can compute
// an exact HMAC over what Paystack signed.
const paystackRawBody = express.json({
    type: 'application/json',
    limit: '100kb',
    verify: (req, _res, buf) => {
        req.rawBody = buf.toString('utf8');
    }
});

router.post('/webhook/paystack', paystackRawBody, paystackWebhook);

// Protected Routes
router.get('/', verifyToken, requireRole('Owner'), getAllInvoices);
router.post('/', verifyToken, requireRole('Owner'), createInvoice);
router.delete('/:id', verifyToken, requireRole('Owner'), deleteInvoice);
router.patch('/:id/pay', verifyToken, requireRole('Owner'), markInvoicePaid);
// No refund endpoint: the studio does not refund. Paid is terminal —
// disputes are handled outside the system (see docs/WEBSITE_AUDIT_2026-10-03.md).
// Both Admin and Client can view invoices (Clients use JWT bound to trackingId)
router.get('/project/:projectId', verifyToken, requireRole('Client', 'Owner'), getInvoicesByProject);

export default router;