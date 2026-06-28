import express from 'express';
import { createInvoice, getInvoicesByProject, paystackWebhook } from '../controllers/invoiceController.js';
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
router.post('/', verifyToken, requireRole('ADMIN', 'OWNER'), createInvoice);
// Both Admin and Client can view invoices (Clients use JWT bound to trackingId)
router.get('/project/:projectId', verifyToken, requireRole('CLIENT', 'ADMIN', 'OWNER'), getInvoicesByProject);

export default router;