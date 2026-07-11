import pool from '../config/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/notifications
 * Returns all notifications for the authenticated user, newest first.
 * Query: ?unread=true → only unread
 */
export async function getNotifications(req, res) {
    try {
        const userId = req.user.id;
        const unreadOnly = req.query.unread === 'true';

        const { rows } = await pool.query(
            `SELECT id, type, title, body, link, is_read, created_at
             FROM notifications
             WHERE user_id = $1 ${unreadOnly ? 'AND is_read = false' : ''}
             ORDER BY created_at DESC
             LIMIT 50`,
            [userId]
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Notifications] getNotifications error:', err.message);
        return res.status(500).json({ error: 'Failed to load notifications.' });
    }
}

/**
 * GET /api/notifications/count
 * Returns the count of unread notifications for the badge.
 */
export async function getUnreadCount(req, res) {
    try {
        const userId = req.user.id;
        const { rows } = await pool.query(
            `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return res.json({ count: rows[0].count });
    } catch (err) {
        console.error('[Notifications] getUnreadCount error:', err.message);
        return res.status(500).json({ error: 'Failed to load notification count.' });
    }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
export async function markRead(req, res) {
    try {
        const { id } = req.params;
        if (!UUID_REGEX.test(id)) return res.status(400).json({ error: 'Invalid ID.' });

        const { rows } = await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, req.user.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Notification not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Notifications] markRead error:', err.message);
        return res.status(500).json({ error: 'Failed to update notification.' });
    }
}

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for the authenticated user.
 */
export async function markAllRead(req, res) {
    try {
        await pool.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
            [req.user.id]
        );
        return res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('[Notifications] markAllRead error:', err.message);
        return res.status(500).json({ error: 'Failed to update notifications.' });
    }
}

/**
 * Utility — create a notification (called from other controllers, not a route).
 */
export async function createNotification({ userId, type, title, body, link }) {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, body, link)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, type, title, body || null, link || null]
        );
    } catch (err) {
        // Fire-and-forget — don't crash the parent request.
        console.error('[Notifications] createNotification error:', err.message);
    }
}
