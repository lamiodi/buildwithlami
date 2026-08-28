import pool from '../config/db.js';
import { getAllRates, BASE_CURRENCY } from '../utils/fx.js';

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
        const [projects, clients, templates, feedback, invoices, recentActivities, financialSummary, pipelineStats, missingFxCurrencies] = await Promise.all([
            pool.query(`
                SELECT id, project_name, division, status, progress, amount_due, payment_status,
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
                SELECT id, project_id, client_id, amount, currency, division, status, due_date, payment_url, created_at, paid_at
                FROM invoices
                ORDER BY created_at DESC
            `),
            pool.query(`
                SELECT action, user_name, details, created_at
                FROM activity_logs
                ORDER BY created_at DESC
                LIMIT 10
            `),
            // P2-5: revenue calculation now only counts invoices whose
            // currency has an FX rate. Currencies with no rate (other
            // than the base NGN) are returned separately so the UI
            // can surface a "missing FX rate" warning.
            pool.query(`
                SELECT
                    (SELECT COALESCE(SUM(conv), 0)
                       FROM (
                         SELECT i.amount * r.rate AS conv
                           FROM invoices i
                           JOIN fx_rates r
                             ON r.base_currency = $1 AND r.target_currency = i.currency
                          WHERE i.status = 'PAID'
                       ) rev
                    ) AS total_revenue,

                    (SELECT COALESCE(SUM(conv), 0)
                       FROM (
                         SELECT i.amount * r.rate AS conv
                           FROM invoices i
                           JOIN fx_rates r
                             ON r.base_currency = $1 AND r.target_currency = i.currency
                          WHERE i.status = 'PAID'
                            AND DATE_TRUNC('month', i.created_at) = DATE_TRUNC('month', CURRENT_DATE)
                       ) rev
                    ) AS revenue_this_month,

                    (SELECT COALESCE(SUM(amount), 0) FROM expenses) AS total_expenses,

                    (SELECT COALESCE(SUM(amount), 0)
                     FROM expenses
                     WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)) AS expenses_this_month
            `, [BASE_CURRENCY]),
            pool.query(`
                SELECT
                    (SELECT COUNT(*)::int FROM leads WHERE stage NOT IN ('COMPLETED', 'RETENTION')) AS active_leads,
                    (SELECT COUNT(*)::int FROM quotations WHERE status IN ('DRAFT', 'SENT', 'ACCEPTED')) AS active_quotations,
                    (SELECT COUNT(*)::int FROM bookings WHERE status = 'PENDING') AS pending_bookings,
                    (SELECT COUNT(*)::int FROM contracts WHERE status = 'SENT') AS pending_contracts
            `),
            // P2-5: distinct currencies on PAID invoices that have no
            // matching fx_rate row. Returned to the UI so the dashboard
            // can warn "X PAID invoices in {USD,EUR} are not counted in
            // total revenue because no FX rate is configured".
            pool.query(`
                SELECT DISTINCT i.currency
                  FROM invoices i
             LEFT JOIN fx_rates r
                    ON r.base_currency = $1 AND r.target_currency = i.currency
                 WHERE i.status = 'PAID'
                   AND i.currency <> $1
                   AND r.rate IS NULL
            `, [BASE_CURRENCY]),
        ]);

        const missingFxList = missingFxCurrencies.rows.map((r) => r.currency);
        const baseCurrency = BASE_CURRENCY;
        res.json({
            projects: projects.rows,
            clients: clients.rows,
            templates: templates.rows,
            feedback: feedback.rows,
            invoices: invoices.rows,
            recentActivities: recentActivities.rows,
            financialSummary: {
                ...financialSummary.rows[0],
                // Convert Decimal string → number so the JSON consumer
                // can sum without juggling types.
                total_revenue: Number(financialSummary.rows[0]?.total_revenue || 0),
                revenue_this_month: Number(financialSummary.rows[0]?.revenue_this_month || 0),
                total_expenses: Number(financialSummary.rows[0]?.total_expenses || 0),
                expenses_this_month: Number(financialSummary.rows[0]?.expenses_this_month || 0),
            },
            pipelineStats: pipelineStats.rows[0],
            // P2-5: surface missing FX rates so the admin can fix them
            // instead of seeing revenue silently drop to zero for
            // affected currencies.
            fxWarning: missingFxList.length > 0
                ? {
                    missingCurrencies: missingFxList,
                    message: `${missingFxList.join(', ')} invoice revenue is not included in totals because no FX rate is configured. Add rates in Settings → FX Rates.`,
                    baseCurrency,
                }
                : null,
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
        const expenseParams = [];
        let expenseFilter = '';
        if (start) {
            expenseParams.push(start);
            expenseFilter += `expense_date >= $${expenseParams.length}`;
        }
        if (end) {
            expenseParams.push(end);
            if (expenseFilter) expenseFilter += ' AND ';
            expenseFilter += `expense_date < $${expenseParams.length}`;
        }

        // Fetch the FX rate map once. Used to convert each invoice's
        // native-currency amount to the base (NGN) for reporting.
        const rates = await getAllRates();

        const [
            revenueByMonth,
            expensesByMonth,
            revenueByDivision,
            projectsByDivision,
            projectsByStatus,
            topClients,
            revenueByCountry,
            completionRate,
            invoiceSummary,
            avgProgress,
            expenseSummary,
        ] = await Promise.all([
            // Revenue by month — PAID invoices, converted to base currency.
            pool.query(`
                SELECT TO_CHAR(DATE_TRUNC('month', i.created_at), 'YYYY-MM') AS month,
                       COALESCE(SUM(i.amount * COALESCE(r.rate, 0)), 0) AS total,
                       COUNT(*) AS count
                FROM invoices i
                LEFT JOIN fx_rates r
                  ON r.base_currency = $1 AND r.target_currency = i.currency
                WHERE i.status = 'PAID' ${invoiceFilter ? `AND ${invoiceFilter}` : ''}
                GROUP BY DATE_TRUNC('month', i.created_at)
                ORDER BY month ASC
            `, [BASE_CURRENCY, ...invoiceParams]),

            // Expenses by month
            pool.query(`
                SELECT TO_CHAR(DATE_TRUNC('month', expense_date), 'YYYY-MM') AS month,
                       COALESCE(SUM(amount), 0) AS total,
                       COUNT(*) AS count
                FROM expenses
                ${expenseFilter ? `WHERE ${expenseFilter}` : ''}
                GROUP BY DATE_TRUNC('month', expense_date)
                ORDER BY month ASC
            `, expenseParams),

            // Revenue by division
            pool.query(`
                SELECT COALESCE(division, 'SOFTWARE') AS division,
                       COALESCE(SUM(i.amount * COALESCE(r.rate, 0)), 0) AS total,
                       COUNT(i.id) AS count
                FROM invoices i
                LEFT JOIN fx_rates r
                  ON r.base_currency = $1 AND r.target_currency = i.currency
                WHERE i.status = 'PAID' ${invoiceFilter ? `AND ${invoiceFilter}` : ''}
                GROUP BY division
                ORDER BY total DESC
            `, [BASE_CURRENCY, ...invoiceParams]),

            // Projects by division
            pool.query(`
                SELECT COALESCE(division, 'SOFTWARE') AS division,
                       COUNT(*) AS count
                FROM client_projects
                ${projectFilter ? `WHERE ${projectFilter}` : ''}
                GROUP BY division
                ORDER BY count DESC
            `, projectParams),

            // Projects by status
            pool.query(`
                SELECT status, COUNT(*) AS count
                FROM client_projects
                ${projectFilter ? `WHERE ${projectFilter}` : ''}
                GROUP BY status
                ORDER BY count DESC
            `, projectParams),

            // Top clients by revenue (filtered, converted to base currency)
            pool.query(`
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
            `, [BASE_CURRENCY, ...invoiceParams]),

            // Revenue by country
            pool.query(`
                SELECT COALESCE(c.country, 'Unknown') AS country,
                       COALESCE(SUM(i.amount * COALESCE(r.rate, 0)), 0) AS total,
                       COUNT(i.id) AS invoice_count
                FROM invoices i
                JOIN clients c ON i.client_id = c.id
                LEFT JOIN fx_rates r
                  ON r.base_currency = $1 AND r.target_currency = i.currency
                WHERE i.status = 'PAID' ${invoiceFilter ? `AND ${invoiceFilter}` : ''}
                GROUP BY c.country
                ORDER BY total DESC
            `, [BASE_CURRENCY, ...invoiceParams]),

            // Project completion rate
            pool.query(`
                SELECT
                    COUNT(*) AS total,
                    COUNT(*) FILTER (WHERE status IN ('LAUNCHED', 'MAINTENANCE')) AS completed,
                    COUNT(*) FILTER (WHERE status = 'ARCHIVED') AS archived,
                    COUNT(*) FILTER (WHERE status NOT IN ('LAUNCHED', 'MAINTENANCE', 'ARCHIVED')) AS in_progress
                FROM client_projects
                ${projectFilter ? `WHERE ${projectFilter}` : ''}
            `, projectParams),

            // Invoice summary — revenue & outstanding converted to base currency
            pool.query(`
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
            `, [BASE_CURRENCY, ...invoiceParams]),

            // Average project progress (exclude archived)
            pool.query(`
                SELECT ROUND(AVG(progress)) AS average_progress
                FROM client_projects
                ${projectFilter ? `WHERE ${projectFilter} AND status NOT IN ('ARCHIVED')` : 'WHERE status NOT IN (\'ARCHIVED\')'}
            `, projectParams),

            // Expense summary
            pool.query(`
                SELECT
                    COUNT(*) AS total_count,
                    COALESCE(SUM(amount), 0) AS total_amount
                FROM expenses
                ${expenseFilter ? `WHERE ${expenseFilter}` : ''}
            `, expenseParams),
        ]);

        const totalRevenue = Number(invoiceSummary.rows[0]?.revenue || 0);
        const totalExpenses = Number(expenseSummary.rows[0]?.total_amount || 0);
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

        res.json({
            revenueByMonth: revenueByMonth.rows,
            expensesByMonth: expensesByMonth.rows,
            revenueByDivision: revenueByDivision.rows,
            projectsByDivision: projectsByDivision.rows,
            projectsByStatus: projectsByStatus.rows,
            topClients: topClients.rows,
            revenueByCountry: revenueByCountry.rows,
            completionRate: completionRate.rows[0],
            invoiceSummary: invoiceSummary.rows[0],
            expenseSummary: expenseSummary.rows[0],
            financialSummary: {
                totalRevenue,
                totalExpenses,
                netProfit,
                profitMargin,
            },
            avgProgress: avgProgress.rows[0]?.average_progress || 0,
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