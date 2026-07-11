import pool from '../config/db.js';
import { getAllRates, BASE_CURRENCY, toBase } from '../utils/fx.js';

// Helper to build date filter (returns { clause, params }).
// Parameters are appended to the params array — never interpolated
// into the SQL string — so ?start=… is safe from injection.
const dateFilter = (start, end, params) => {
    const conditions = [];
    if (start) {
        params.push(start);
        conditions.push(`created_at >= $${params.length}`);
    }
    if (end) {
        params.push(end);
        conditions.push(`created_at < $${params.length}`);
    }
    return conditions.length ? conditions.join(' AND ') : '';
};

// ── Admin Dashboard Overview ──────────────────────────────
// Returns aggregated data for the admin dashboard:
// projects, clients, templates, feedback, invoices, recentActivities.
export async function getDashboardOverview(req, res) {
    try {
        const [projects, clients, templates, feedback, invoices, recentActivities] = await Promise.all([
            pool.query(`
                SELECT id, project_name, status, progress, amount_due, payment_status,
                       client_id, created_at, updated_at
                FROM client_projects
                ORDER BY updated_at DESC NULLS LAST
            `),
            pool.query(`
                SELECT id, name, primary_contact_email, billing_email, notes, created_at
                FROM clients
                ORDER BY created_at DESC
            `),
            pool.query(`
                SELECT id, name, description, schema, created_at
                FROM intake_templates
                ORDER BY created_at DESC
            `),
            pool.query(`
                SELECT id, project_id, stage_index, client_comment, admin_reply, status, created_at
                FROM project_feedback
                ORDER BY created_at DESC
                LIMIT 20
            `),
            pool.query(`
                SELECT id, project_id, client_id, amount, status, due_date, payment_url, created_at
                FROM invoices
                ORDER BY created_at DESC
            `),
            pool.query(`
                SELECT action, user_name, details, created_at
                FROM activity_logs
                ORDER BY created_at DESC
                LIMIT 10
            `),
        ]);

        res.json({
            projects: projects.rows,
            clients: clients.rows,
            templates: templates.rows,
            feedback: feedback.rows,
            invoices: invoices.rows,
            recentActivities: recentActivities.rows,
        });
    } catch (err) {
        console.error('[Dashboard] Error:', err.message);
        res.status(500).json({ error: 'Failed to load dashboard data.' });
    }
}

// ── Admin Reports — Aggregated analytics for the Reports page ──
export async function getReports(req, res) {
    try {
        const { start, end } = req.query;
        const invoiceParams = [];
        const invoiceFilter = dateFilter(start, end, invoiceParams);
        const projectParams = [];
        const projectFilter = dateFilter(start, end, projectParams);

        // Fetch the FX rate map once. Used to convert each invoice's
        // native-currency amount to the base (NGN) for reporting.
        const rates = await getAllRates();

        // Revenue by month — PAID invoices, converted to base currency.
        // The COALESCE(rate, 0) protects against currencies that aren't
        // in fx_rates yet (a fresh admin-side currency addition); such
        // rows contribute 0 to the converted total rather than erroring.
        const revenueByMonth = await pool.query(`
            SELECT TO_CHAR(DATE_TRUNC('month', i.created_at), 'YYYY-MM') AS month,
                   COALESCE(SUM(i.amount * COALESCE(r.rate, 0)), 0) AS total,
                   COUNT(*) AS count
            FROM invoices i
            LEFT JOIN fx_rates r
              ON r.base_currency = $1 AND r.target_currency = i.currency
            WHERE i.status = 'PAID' ${invoiceFilter ? `AND ${invoiceFilter}` : ''}
            GROUP BY DATE_TRUNC('month', i.created_at)
            ORDER BY month ASC
        `, [BASE_CURRENCY, ...invoiceParams]);

        // Projects by status
        const projectsByStatus = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM client_projects
            ${projectFilter ? `WHERE ${projectFilter}` : ''}
            GROUP BY status
            ORDER BY count DESC
        `, projectParams);

        // Top clients by revenue (filtered, converted to base currency)
        const topClients = await pool.query(`
            SELECT c.id, c.name,
                   COALESCE(SUM(i.amount * COALESCE(r.rate, 0)), 0) AS total_revenue,
                   COUNT(i.id) AS invoice_count
            FROM clients c
            JOIN invoices i ON i.client_id = c.id
            LEFT JOIN fx_rates r
              ON r.base_currency = $1 AND r.target_currency = i.currency
            WHERE i.status = 'PAID' ${invoiceFilter ? `AND ${invoiceFilter}` : ''}
            GROUP BY c.id, c.name
            ORDER BY total_revenue DESC
            LIMIT 10
        `, [BASE_CURRENCY, ...invoiceParams]);

        // Project completion rate
        const completionRate = await pool.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status IN ('LAUNCHED', 'MAINTENANCE')) AS completed,
                COUNT(*) FILTER (WHERE status = 'ARCHIVED') AS archived,
                COUNT(*) FILTER (WHERE status NOT IN ('LAUNCHED', 'MAINTENANCE', 'ARCHIVED')) AS in_progress
            FROM client_projects
            ${projectFilter ? `WHERE ${projectFilter}` : ''}
        `, projectParams);

        // Invoice summary — revenue & outstanding converted to base currency
        const invoiceSummary = await pool.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'PAID') AS paid,
                COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                COUNT(*) FILTER (WHERE status = 'PENDING' AND due_date < NOW()) AS overdue,
                COALESCE(SUM(i.amount * COALESCE(r.rate, 0)) FILTER (WHERE status = 'PAID'), 0) AS revenue,
                COALESCE(SUM(i.amount * COALESCE(r.rate, 0)) FILTER (WHERE status = 'PENDING'), 0) AS outstanding
            FROM invoices i
            LEFT JOIN fx_rates r
              ON r.base_currency = $1 AND r.target_currency = i.currency
            ${invoiceFilter ? `WHERE ${invoiceFilter}` : ''}
        `, [BASE_CURRENCY, ...invoiceParams]);

        // Average project progress (exclude archived)
        const avgProgress = await pool.query(`
            SELECT ROUND(AVG(progress)) AS average_progress
            FROM client_projects
            ${projectFilter ? `WHERE ${projectFilter} AND status NOT IN ('ARCHIVED')` : 'WHERE status NOT IN (\'ARCHIVED\')'}
        `, projectParams);

        res.json({
            revenueByMonth: revenueByMonth.rows,
            projectsByStatus: projectsByStatus.rows,
            topClients: topClients.rows,
            completionRate: completionRate.rows[0],
            invoiceSummary: invoiceSummary.rows[0],
            avgProgress: avgProgress.rows[0]?.average_progress || 0,
            // Expose the rates the frontend needs to compute the
            // "Total Revenue (NGN equivalent)" stat on the invoices
            // page (which the dashboard doesn't currently cover).
            fxRates: rates,
            baseCurrency: BASE_CURRENCY,
        });
    } catch (err) {
        console.error('[Reports] Error:', err.message);
        res.status(500).json({ error: 'Failed to load reports data.' });
    }
}

// ── Today Summary — Quick operational snapshot ───────────
// Returns a small payload with exactly what the CEO needs first thing.
export async function getTodaySummary(req, res) {
    try {
        const [
            leadsNeedReply,
            overdueInvoices,
            domainsExpiring,
            projectsInReview,
            unreadNotifs,
            openFeedback,
            recentMessages,
        ] = await Promise.all([
            // Leads that haven't been touched in 48+ hours
            pool.query(`
                SELECT COUNT(*)::int AS count FROM leads
                WHERE stage IN ('LEAD', 'QUALIFIED')
                  AND updated_at < NOW() - INTERVAL '48 hours'
            `),
            // Invoices past their due date
            pool.query(`
                SELECT COUNT(*)::int AS count FROM invoices
                WHERE status = 'PENDING' AND due_date < NOW()
            `),
            // Domains expiring within 30 days
            pool.query(`
                SELECT COUNT(*)::int AS count FROM client_projects
                WHERE domain_expiration IS NOT NULL
                  AND domain_expiration <= NOW() + INTERVAL '30 days'
                  AND domain_expiration >= NOW()
                  AND status NOT IN ('ARCHIVED')
            `),
            // Projects currently in review
            pool.query(`
                SELECT COUNT(*)::int AS count FROM client_projects
                WHERE status = 'REVIEW'
            `),
            // Unread notifications for this user
            pool.query(`
                SELECT COUNT(*)::int AS count FROM notifications
                WHERE user_id = $1 AND is_read = false
            `, [req.user.id]),
            // Open feedback items
            pool.query(`
                SELECT COUNT(*)::int AS count FROM project_feedback
                WHERE status = 'OPEN'
            `),
            // Unread contact messages
            pool.query(`
                SELECT COUNT(*)::int AS count FROM messages
                WHERE is_read = false
            `),
        ]);

        res.json({
            leadsNeedReply: leadsNeedReply.rows[0].count,
            overdueInvoices: overdueInvoices.rows[0].count,
            domainsExpiring: domainsExpiring.rows[0].count,
            projectsInReview: projectsInReview.rows[0].count,
            unreadNotifications: unreadNotifs.rows[0].count,
            openFeedback: openFeedback.rows[0].count,
            unreadMessages: recentMessages.rows[0].count,
        });
    } catch (err) {
        console.error('[Today] Error:', err.message);
        res.status(500).json({ error: 'Failed to load today summary.' });
    }
}