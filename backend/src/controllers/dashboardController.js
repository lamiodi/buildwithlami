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
