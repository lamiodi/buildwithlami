import pool from '../config/db.js';

// ── Admin Dashboard Overview ──────────────────────────────
// Returns aggregated data for the admin dashboard:
// projects, clients, templates, feedback, invoices.
export async function getDashboardOverview(req, res) {
    try {
        const [projects, clients, templates, feedback, invoices] = await Promise.all([
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
        ]);

        res.json({
            projects: projects.rows,
            clients: clients.rows,
            templates: templates.rows,
            feedback: feedback.rows,
            invoices: invoices.rows,
        });
    } catch (err) {
        console.error('[Dashboard] Error:', err.message);
        res.status(500).json({ error: 'Failed to load dashboard data.' });
    }
}

// ── Admin Reports — Aggregated analytics for the Reports page ──
export async function getReports(req, res) {
    try {
        // Revenue by month (last 12 months)
        const revenueByMonth = await pool.query(`
            SELECT TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
                   SUM(amount) AS total,
                   COUNT(*) AS count
            FROM invoices
            WHERE status = 'PAID'
              AND created_at > NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month ASC
        `);

        // Projects by status
        const projectsByStatus = await pool.query(`
            SELECT status, COUNT(*) AS count
            FROM client_projects
            GROUP BY status
            ORDER BY count DESC
        `);

        // Top clients by revenue
        const topClients = await pool.query(`
            SELECT c.id, c.name,
                   SUM(i.amount) AS total_revenue,
                   COUNT(i.id) AS invoice_count
            FROM clients c
            JOIN invoices i ON i.client_id = c.id
            WHERE i.status = 'PAID'
            GROUP BY c.id, c.name
            ORDER BY total_revenue DESC
            LIMIT 10
        `);

        // Project completion rate
        const completionRate = await pool.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status IN ('LAUNCHED', 'MAINTENANCE')) AS completed,
                COUNT(*) FILTER (WHERE status = 'ARCHIVED') AS archived,
                COUNT(*) FILTER (WHERE status NOT IN ('LAUNCHED', 'MAINTENANCE', 'ARCHIVED')) AS in_progress
            FROM client_projects
        `);

        // Invoice summary
        const invoiceSummary = await pool.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'PAID') AS paid,
                COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
                COUNT(*) FILTER (WHERE status = 'PENDING' AND due_date < NOW()) AS overdue,
                COALESCE(SUM(amount) FILTER (WHERE status = 'PAID'), 0) AS revenue,
                COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS outstanding
            FROM invoices
        `);

        // Average project progress
        const avgProgress = await pool.query(`
            SELECT ROUND(AVG(progress)) AS average_progress
            FROM client_projects
            WHERE status NOT IN ('ARCHIVED')
        `);

        res.json({
            revenueByMonth: revenueByMonth.rows,
            projectsByStatus: projectsByStatus.rows,
            topClients: topClients.rows,
            completionRate: completionRate.rows[0],
            invoiceSummary: invoiceSummary.rows[0],
            avgProgress: avgProgress.rows[0]?.average_progress || 0,
        });
    } catch (err) {
        console.error('[Reports] Error:', err.message);
        res.status(500).json({ error: 'Failed to load reports data.' });
    }
}
