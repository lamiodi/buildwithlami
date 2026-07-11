// ─── src/routes/emailTemplateRoutes.js ───────────────────
// Phase 3 — Email Templates.
//
// All admin routes require Owner or Administrator.
// The /render and /send endpoints stay inside that gate so a
// stolen PM token can't exfiltrate template content.
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    renderTemplatePreview,
    sendTemplate,
} from '../controllers/emailTemplateController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator'));

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/:id/render', renderTemplatePreview);
router.post('/:id/send', sendTemplate);

export default router;
