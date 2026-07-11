// ── routes/paymentRoutes.js ──────────────────────────────
// Phase 10 — International payment workflow.
//
// Public surface: /api/payments/public/*  (token-based, no auth)
// Admin surface:  /api/payments/*        (auth + role-gated)

import express from 'express';
import multer from 'multer';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getInvoiceByToken,
    submitProof,
    listProofs,
    reviewProof,
    listBankAccounts,
    upsertBankAccount,
    deactivateBankAccount,
} from '../controllers/paymentController.js';

const router = express.Router();

// 10 MB limit — proof uploads are receipts / screenshots.
// Tighter than the global /api/upload limit because these are
// single-shot attachments, not portfolio images.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Public ──────────────────────────────────────────────
router.get('/public/:token', getInvoiceByToken);
router.post('/public/:token/proof', upload.single('proof_file'), submitProof);

// ── Admin (auth required) ───────────────────────────────
router.get('/proofs', verifyToken, requireRole('Administrator', 'Owner', 'Finance'), listProofs);
router.post('/proofs/:id/review', verifyToken, requireRole('Administrator', 'Owner', 'Finance'), reviewProof);

router.get('/bank-accounts', verifyToken, requireRole('Administrator', 'Owner', 'Finance'), listBankAccounts);
router.post('/bank-accounts', verifyToken, requireRole('Administrator', 'Owner', 'Finance'), upsertBankAccount);
router.delete('/bank-accounts/:id', verifyToken, requireRole('Administrator', 'Owner', 'Finance'), deactivateBankAccount);

export default router;
