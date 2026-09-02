// ── src/routes/contractRoutes.js ────────────────────────────
// Native contract routes: public signing endpoints and protected admin management.
// ──────────────────────────────────────────────────────────

import express from 'express';
import {
    createContract,
    getContract,
    getContracts,
    getContractForSigning,
    signContract,
    downloadContractPDF,
} from '../controllers/contractController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ── Public Signing Endpoints (Token-Gated) ──────────────────
router.get('/sign/:token', getContractForSigning);
router.post('/sign/:token', signContract);
router.get('/:id/pdf', downloadContractPDF);

// ── Protected Admin Routes (Owner Only) ─────────────────────
router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/', getContracts);
router.post('/', createContract);
router.get('/:id', getContract);

export default router;
