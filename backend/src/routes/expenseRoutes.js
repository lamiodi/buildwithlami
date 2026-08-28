import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import { logActivity } from '../middlewares/activityMiddleware.js';
import { 
    getExpenses, 
    createExpense, 
    updateExpense, 
    deleteExpense 
} from '../controllers/expenseController.js';

const router = express.Router();

const ownerRole = requireRole('Owner');

router.get('/', verifyToken, ownerRole, getExpenses);
router.post('/', verifyToken, ownerRole, logActivity('CREATE_EXPENSE', 'expenses'), createExpense);
router.put('/:id', verifyToken, ownerRole, logActivity('UPDATE_EXPENSE', 'expenses'), updateExpense);
router.delete('/:id', verifyToken, ownerRole, logActivity('DELETE_EXPENSE', 'expenses'), deleteExpense);

export default router;
