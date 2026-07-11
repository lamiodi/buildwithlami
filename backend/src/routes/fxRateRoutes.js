// ── routes/fxRateRoutes.js ───────────────────────────────
// Phase 8 + Phase 11 — Multi-currency FX rate management.
//   GET  /api/fx-rates         — any authenticated user
//   PUT  /api/fx-rates         — Owner/Administrator (manual edit)
//   POST /api/fx-rates/refresh — Owner/Administrator (live API fetch)

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { listFxRates, upsertFxRates, refreshFxRates } from '../controllers/fxRateController.js';

const router = express.Router();

router.get('/', verifyToken, listFxRates);
router.put('/', verifyToken, requireRole('Administrator', 'Owner'), upsertFxRates);
router.post('/refresh', verifyToken, requireRole('Administrator', 'Owner'), refreshFxRates);

export default router;
