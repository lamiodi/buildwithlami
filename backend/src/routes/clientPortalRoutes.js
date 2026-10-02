import express from 'express';
import { getDashboard, getProjects, getProjectDetails, getInvoices, getDocuments, updateProfile, getClientContracts, getClientQuotations } from '../controllers/clientPortalController.js';
import { getMyActions, completeMyAction } from '../controllers/clientActionController.js';
import { getMyOnboarding, saveMyOnboarding, submitMyOnboarding } from '../controllers/onboardingController.js';
import { getMyApprovals, decideMyApproval, decideMyChangeRequest } from '../controllers/deliveryController.js';
import { verifyClientToken } from '../middlewares/clientAuthMiddleware.js';

const router = express.Router();

router.use(verifyClientToken);

router.get('/dashboard', getDashboard);
router.get('/projects', getProjects);
router.get('/projects/:id', getProjectDetails);
router.get('/invoices', getInvoices);
router.get('/contracts', getClientContracts);
router.get('/quotations', getClientQuotations);
router.get('/documents', getDocuments);
router.put('/profile', updateProfile);

// Admin OS Phase 1 — Action Required panel + onboarding wizard.
router.get('/actions', getMyActions);
router.patch('/actions/:id/complete', completeMyAction);
router.get('/onboarding', getMyOnboarding);
router.patch('/onboarding', saveMyOnboarding);
router.post('/onboarding/submit', submitMyOnboarding);

// Admin OS Phase 3a — approvals & change requests (client decides
// in the portal; sign-offs become records, not WhatsApp messages).
router.get('/approvals', getMyApprovals);
router.patch('/approvals/:id/decide', decideMyApproval);
router.patch('/change-requests/:id/decide', decideMyChangeRequest);

export default router;

