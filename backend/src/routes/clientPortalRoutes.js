import express from 'express';
import { getDashboard, getProjects, getProjectDetails, getInvoices, getDocuments, updateProfile, getClientContracts, getClientQuotations } from '../controllers/clientPortalController.js';
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

export default router;

