// ─── src/routes/clientRoutes.js ───────────────────────────
// Admin-only. Clients access their own data via /api/portal.
import { Router } from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getClients, getClientById, createClient,
    updateClient, deleteClient,
} from '../controllers/clientController.js';

const router = Router();
const isAdmin = [verifyToken, requireRole('ADMIN', 'SUPER_ADMIN')];

router.get('/', ...isAdmin, getClients);
router.get('/:id', ...isAdmin, getClientById);
router.post('/', ...isAdmin, createClient);
router.put('/:id', ...isAdmin, updateClient);
router.delete('/:id', ...isAdmin, deleteClient);

export default router;
