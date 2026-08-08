import express from 'express';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import { logActivity } from '../middlewares/activityMiddleware.js';
import { 
    getExpenses, 
    createExpense, 
    updateExpense, 
    deleteExpense 
} from '../controllers/expenseController.js';

const router = express.Router();

const financeRoles = ['Owner', 'Administrator', 'Finance'];

router.get('/', requireAuth, requireRole(financeRoles), getExpenses);
router.post('/', requireAuth, requireRole(financeRoles), logActivity('CREATE_EXPENSE', 'expenses'), createExpense);
router.put('/:id', requireAuth, requireRole(financeRoles), logActivity('UPDATE_EXPENSE', 'expenses'), updateExpense);
router.delete('/:id', requireAuth, requireRole(financeRoles), logActivity('DELETE_EXPENSE', 'expenses'), deleteExpense);

export default router;
