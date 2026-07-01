// Centralized activity logging middleware
// Logs all admin actions that mutate data (POST, PUT, PATCH, DELETE)

const ACTION_MAP = {
    POST: {
        '/clients': 'CREATE_CLIENT',
        '/client-projects': 'CREATE_PROJECT',
        '/invoices': 'CREATE_INVOICE',
        '/templates': 'CREATE_TEMPLATE',
    },
    PUT: {
        '/clients/': 'UPDATE_CLIENT',
        '/client-projects/': 'UPDATE_PROJECT',
        '/invoices/': 'UPDATE_INVOICE',
        '/templates/': 'UPDATE_TEMPLATE',
    },
    PATCH: {
        '/invoices/': 'UPDATE_INVOICE',
    },
    DELETE: {
        '/clients/': 'DELETE_CLIENT',
        '/client-projects/': 'DELETE_PROJECT',
        '/invoices/': 'DELETE_INVOICE',
        '/templates/': 'DELETE_TEMPLATE',
    },
};

const logAction = async (req, userId, action, resourceId = null, details = null) => {
    try {
        await fetch(`${process.env.BACKEND_URL || 'http://localhost:4000'}/api/activity/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || '',
            },
            body: JSON.stringify({ action, resource_id: resourceId, details })
        });
    } catch (err) {
        // Silently fail - logging shouldn't break main operations
        console.error('[Activity] Log failed:', err.message);
    }
};

export const activityLogger = (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    // Only log on successful mutations
    const logSuccess = (data) => {
        const originalUrl = req.originalUrl || req.url;
        const method = req.method;
        
        // Find matching action
        let action = null;
        let resourceId = null;
        
        if (method === 'POST') {
            for (const [path, act] of Object.entries(ACTION_MAP.POST || {})) {
                if (originalUrl.includes(path)) {
                    action = act;
                    break;
                }
            }
        } else if (method === 'PUT') {
            for (const [path, act] of Object.entries(ACTION_MAP.PUT || {})) {
                if (originalUrl.includes(path)) {
                    action = act;
                    resourceId = req.params.id || req.params.clientId || req.params.projectId || req.params.invoiceId || req.params.templateId;
                    break;
                }
            }
        } else if (method === 'PATCH') {
            const url = req.originalUrl || req.url;
            for (const [path, act] of Object.entries(ACTION_MAP.PATCH || {})) {
                if (url.includes(path)) {
                    action = act;
                    resourceId = req.params.id || req.params.invoiceId;
                    break;
                }
            }
            // Special cases for mark-paid and refund
            if (url.endsWith('/pay')) action = 'MARK_PAID';
            else if (url.endsWith('/refund')) action = 'REFUND';
            resourceId = req.params.id || resourceId;
        } else if (method === 'DELETE') {
            for (const [path, act] of Object.entries(ACTION_MAP.DELETE || {})) {
                if (originalUrl.includes(path)) {
                    action = act;
                    resourceId = req.params.id;
                    break;
                }
            }
        }

        if (action && req.user) {
            // Extract details from response
            let details = {};
            if (data?.name) details.name = data.name;
            else if (data?.project_name) details.project_name = data.project_name;
            else if (data?.total_billed) details.total_billed = data.total_billed;
            
            logAction(req, req.user.id, action, resourceId, details);
        }

        return data;
    };

    res.json = function (data) {
        logSuccess(data);
        return originalJson.call(this, data);
    };

    res.send = function (data) {
        logSuccess(data);
        return originalSend.call(this, data);
    };

    next();
};

// Simpler inline logger for direct database calls
export const logActivityInline = async (pool, userId, userName, action, resourceId = null, details = null) => {
    try {
        await pool.query(
            `INSERT INTO activity_logs (user_id, user_name, action, resource_id, details)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, userName, action, resourceId, details]
        );
    } catch (err) {
        console.error('[Activity] Inline log failed:', err.message);
    }
};