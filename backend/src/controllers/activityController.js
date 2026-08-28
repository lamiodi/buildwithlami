import pool from '../config/db.js';
import { z } from 'zod';

const logActivitySchema = z.object({
    action: z.string().min(1).max(100),
    resource_id: z.string().max(200).optional().nullable(),
    details: z.unknown().optional().nullable(),
});

// Log an admin action (used by middleware)
export const logActivity = async (req, res) => {
    const parsed = logActivitySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid payload.', details: parsed.error.flatten() });
    }
    const { action, resource_id, details } = parsed.data;
    const userId = req.user?.id;
    const userName = req.user?.name || 'Admin';

    try {
        const { rows } = await pool.query(
            `INSERT INTO activity_logs (user_id, user_name, action, resource_id, details)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, userName, action, resource_id || null, details || null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('[Activity] logActivity error:', err.message);
        res.status(500).json({ error: 'Logging failed.' });
    }
};

// Get all activity logs (admin only)
export const getActivities = async (req, res) => {
    const { limit = 100, offset = 0 } = req.query;
    try {
        const { rows } = await pool.query(
            `SELECT id, user_id, user_name, action, resource_type, resource_id, details, created_at
             FROM activity_logs
             ORDER BY created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        res.json(rows);
    } catch (err) {
        console.error('[Activity] getActivities error:', err.message);
        res.status(500).json({ error: 'Failed to fetch activity logs.' });
    }
};

// Get recent activities for dashboard
export const getRecentActivities = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT action, resource_type, details, created_at
             FROM activity_logs
             ORDER BY created_at DESC
             LIMIT 10`
        );
        res.json(rows);
    } catch (err) {
        console.error('[Activity] getRecentActivities error:', err.message);
        res.status(500).json({ error: 'Failed to fetch recent activities.' });
    }
};