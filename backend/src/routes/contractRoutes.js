import express from 'express';
import {
    createContract,
    getContract,
    getContracts,
    downloadContractPDF,
    zohoSignWebhook,
    zohoSignWebhookAuth,
    forceSignContract,
} from '../controllers/contractController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Webhook from Zoho Sign — must be publicly reachable, but
// every request is authenticated by HMAC signature.
// `express.json()` here re-parses the body for this router
// after the global one already populated `req.rawBody`.
router.post(
    '/webhook',
    express.json({
        limit: '100kb',
        verify: (req, _res, buf) => {
            if (buf && buf.length) {
                req.rawBody = buf.toString('utf8');
            }
        },
    }),
    zohoSignWebhookAuth,
    zohoSignWebhook,
);

// Protected Admin Routes
router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/', getContracts);
router.post('/', createContract);
router.get('/:id', getContract);
router.get('/:id/pdf', downloadContractPDF);

// Manual signing action — Owner + 2FA + audit log. Used in
// dev/stub to advance a contract to SIGNED without waiting
// for a real Zoho callback.
router.post('/:id/force-sign', forceSignContract);

export default router;
