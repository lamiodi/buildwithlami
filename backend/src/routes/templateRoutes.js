import express from 'express';
import { createTemplate, getTemplates, getTemplateById, updateTemplate, deleteTemplate, submitIntake, getIntakeSubmissionsByProject } from '../controllers/templateController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin routes for templates
router.post('/templates', verifyToken, requireRole('ADMIN', 'OWNER'), createTemplate);
router.get('/templates', verifyToken, requireRole('ADMIN', 'OWNER'), getTemplates);
router.get('/templates/:id', verifyToken, requireRole('ADMIN', 'OWNER'), getTemplateById);
router.put('/templates/:id', verifyToken, requireRole('ADMIN', 'OWNER'), updateTemplate);
router.delete('/templates/:id', verifyToken, requireRole('ADMIN', 'OWNER'), deleteTemplate);
router.get('/submissions/:projectId', verifyToken, requireRole('ADMIN', 'OWNER'), getIntakeSubmissionsByProject);

// Public route to fetch a template by ID (needed for the client intake page)
router.get('/templates/:id', getTemplateById);

// Intake submission requires a CLIENT JWT (issued by /client-projects/track/:id/auth)
// or admin/owner credentials. This prevents anyone with a projectId UUID from
// overwriting the submission row.
router.post('/submit-intake', verifyToken, requireRole('CLIENT', 'ADMIN', 'OWNER'), submitIntake);

export default router;