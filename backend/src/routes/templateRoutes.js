import express from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate, submitIntake, getIntakeSubmissionsByProject } from '../controllers/templateController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin routes for templates — all Owner-only in the one-man studio model.
router.post('/templates', verifyToken, requireRole('Owner'), createTemplate);
router.get('/templates', verifyToken, requireRole('Owner'), getTemplates);
router.get('/templates/:id', verifyToken, requireRole('Owner'), getTemplateById);
router.put('/templates/:id', verifyToken, requireRole('Owner'), updateTemplate);
router.delete('/templates/:id', verifyToken, requireRole('Owner'), deleteTemplate);
router.get('/submissions/:projectId', verifyToken, requireRole('Owner'), getIntakeSubmissionsByProject);

// Intake submission requires a Client JWT (issued by /client-projects/track/:id/auth)
// or an Owner credential. This prevents anyone with a projectId UUID from
// overwriting the submission row.
router.post('/submit-intake', verifyToken, requireRole('Client', 'Owner'), submitIntake);

export default router;