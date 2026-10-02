import express from 'express';
import { getClients, getClientById, checkDuplicateClient, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRole('Owner'));

router.get('/', getClients);
// Registered before /:id so "check-duplicate" isn't swallowed as an id.
router.get('/check-duplicate', checkDuplicateClient);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
