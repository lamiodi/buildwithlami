import express from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyToken, requireRole('Administrator', 'Owner'));

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
