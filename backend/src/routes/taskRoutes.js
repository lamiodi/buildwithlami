// ─── src/routes/taskRoutes.js ─────────────────────────────
// Admin OS Phase 1 — Task system endpoints (all Owner-gated).
//   GET    /api/tasks
//   GET    /api/tasks/:id
//   POST   /api/tasks
//   PATCH  /api/tasks/:id
//   DELETE /api/tasks/:id
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('Owner'));

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
