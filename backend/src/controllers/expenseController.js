import pool from '../config/db.js';
import { z } from 'zod';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const expenseSchema = z.object({
    expenseDate: z.string().optional(),
    category: z.string().min(1),
    description: z.string().min(1),
    amount: z.number().positive(),
    division: z.enum(['SOFTWARE', 'SURVEY', 'DRONE']).optional(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CARD', 'OTHER']).optional(),
    receiptUrl: z.string().url().optional().or(z.literal('')),
});

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// Admin: Get all expenses (with filters)
export const getExpenses = async (req, res) => {
    try {
        const conditions = [];
        const params = [];
        
        if (req.query.division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(req.query.division)) {
            params.push(req.query.division);
            conditions.push(`division = $${params.length}`);
        }
        
        if (req.query.category) {
            params.push(req.query.category);
            conditions.push(`category = $${params.length}`);
        }
        
        if (req.query.startDate) {
            params.push(req.query.startDate);
            conditions.push(`expense_date >= $${params.length}`);
        }
        
        if (req.query.endDate) {
            params.push(req.query.endDate);
            conditions.push(`expense_date <= $${params.length}`);
        }
        
        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        
        const { rows } = await pool.query(`
            SELECT * FROM expenses
            ${where}
            ORDER BY expense_date DESC, created_at DESC
        `, params);
        
        res.json(rows);
    } catch (err) {
        console.error('[Expenses] getExpenses error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Create expense
export const createExpense = async (req, res) => {
    try {
        const { 
            expenseDate, category, description, amount, 
            division = 'SOFTWARE', paymentMethod = 'BANK_TRANSFER', receiptUrl 
        } = expenseSchema.parse(req.body);

        const { rows } = await pool.query(
            `INSERT INTO expenses (expense_date, category, description, amount, division, payment_method, receipt_url)
             VALUES (COALESCE($1, CURRENT_DATE), $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [expenseDate || null, category, description, amount, division, paymentMethod, receiptUrl || null]
        );

        await writeAuditLog({
            action: 'EXPENSE_CREATED',
            entityType: 'expenses',
            entityId: rows[0].id,
            details: { amount, category, division },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Expenses] createExpense error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Update expense
export const updateExpense = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    
    try {
        const { 
            expenseDate, category, description, amount, 
            division, paymentMethod, receiptUrl 
        } = expenseSchema.parse(req.body);

        const { rows } = await pool.query(
            `UPDATE expenses 
             SET expense_date = COALESCE($1, expense_date), 
                 category = $2, 
                 description = $3, 
                 amount = $4, 
                 division = COALESCE($5, division), 
                 payment_method = COALESCE($6, payment_method), 
                 receipt_url = $7,
                 updated_at = NOW()
             WHERE id = $8
             RETURNING *`,
            [expenseDate || null, category, description, amount, division, paymentMethod, receiptUrl || null, id]
        );

        if (rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });

        await writeAuditLog({
            action: 'EXPENSE_UPDATED',
            entityType: 'expenses',
            entityId: rows[0].id,
            details: { amount, category },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        res.json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Expenses] updateExpense error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin: Delete expense
export const deleteExpense = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    
    try {
        const { rows } = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Expense not found.' });
        
        await writeAuditLog({
            action: 'EXPENSE_DELETED',
            entityType: 'expenses',
            entityId: id,
            details: { amount: rows[0].amount, category: rows[0].category },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        
        res.json({ success: true, deleted: rows[0] });
    } catch (err) {
        console.error('[Expenses] deleteExpense error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
