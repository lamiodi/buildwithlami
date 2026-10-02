// ─── src/routes/intelligenceRoutes.js ─────────────────────
// Admin OS Phase 6 (Intelligence) — Owner-only endpoints:
//   POST  /assistant              — natural-language Q&A (§101)
//   GET   /tonight-queue          — scored queue + capacity (§74)
//   GET   /workload               — weekly plan (§31)
//   PATCH /workload/settings      — capacity guardrails (§31)
//   GET   /profitability          — per-project money (§33)
//   POST  /clients/:id/summary    — generate §78 summary
//   PUT   /clients/:id/summary    — manual edit
//   POST  /quotation-draft        — propose a quote draft (§23)
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getTonightQueue,
    getWorkload,
    patchWorkloadSettings,
    getProfitability,
    postAssistant,
    postClientSummary,
    putClientSummary,
    postQuotationDraft,
} from '../controllers/intelligenceController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('Owner'));

router.post('/assistant', postAssistant);
router.get('/tonight-queue', getTonightQueue);
router.get('/workload', getWorkload);
router.patch('/workload/settings', patchWorkloadSettings);
router.get('/profitability', getProfitability);
router.post('/clients/:id/summary', postClientSummary);
router.put('/clients/:id/summary', putClientSummary);
router.post('/quotation-draft', postQuotationDraft);

export default router;
