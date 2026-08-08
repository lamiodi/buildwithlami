import pool from '../config/db.js';

/**
 * Middleware to log specific agency actions.
 * Only logs events defined in the allowed list to save space.
 */
export const logActivity = (action, resourceType) => {
    return async (req, res, next) => {
        // Wait for the request to finish before logging so we know it succeeded
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // Map internal constants to human-readable allowed log types
                const allowedLogs = {
                    'CLIENT_CREATED': 'Client created',
                    'INVOICE_CREATED': 'Invoice created',
                    'INVOICE_PAID': 'Invoice paid',
                    'CONTRACT_SIGNED': 'Contract signed',
                    'CREATE_EXPENSE': 'Expense added',
                    'UPDATE_EXPENSE': 'Expense added', // Treating updates as added for simplicity or mapping correctly
                    'PROJECT_COMPLETED': 'Project completed',
                    'DOCUMENT_UPLOADED': 'Document uploaded',
                    'PORTAL_LOGIN': 'Portal login'
                };

                const mappedAction = allowedLogs[action] || action;
                
                const validActions = [
                    'Client created', 'Invoice created', 'Invoice paid', 
                    'Contract signed', 'Expense added', 'Project completed', 
                    'Document uploaded', 'Portal login'
                ];

                if (!validActions.includes(mappedAction)) {
                    return; // Skip logging for uninteresting events
                }

                const userId = req.user?.id || req.client?.id;
                const userName = req.user?.name || req.user?.email || req.client?.email || 'System';
                
                // For expenses, resource_id could be in req.params or req.body depending on route
                let resourceId = req.params?.id || req.body?.id || null;
                if (!resourceId && res.locals.resourceId) {
                    resourceId = res.locals.resourceId;
                }

                try {
                    await pool.query(
                        `INSERT INTO activity_logs (user_id, user_name, action, resource_type, resource_id)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [userId, userName, mappedAction, resourceType, resourceId]
                    );
                } catch (err) {
                    console.error('[ActivityMiddleware] Failed to log activity:', err.message);
                }
            }
        });
        next();
    };
};
