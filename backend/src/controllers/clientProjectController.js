import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { decrypt } from '../utils/crypto.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// Allow-list of columns that admins are permitted to mutate on client_projects.
// Anything else in the body is silently dropped.
const UPDATABLE_COLUMNS = new Set([
    'project_name',
    'progress',
    'status',
    'notes',
    'domain_name',
    'domain_expiration',
    'amount_due',
    'payment_type',
    'monthly_fee',
    'payment_status',
    'stages',
    'intake_form_id',
    'intake_completed',
    'assets_url',
    'training_video_url',
    'maintenance_plan_url',
    'offboarding_status',
    'offboarding_checklist',
    'client_id',
]);

export const getClientProjects = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.name as client_name
            FROM client_projects p
            LEFT JOIN clients c ON p.client_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('[ClientProjects] getClientProjects error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const getClientProjectById = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const result = await pool.query(
            `SELECT p.*, c.name as client_name, c.primary_contact_email
             FROM client_projects p
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[ClientProjects] getClientProjectById error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const getProjectDashboard = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const projectResult = await pool.query(
            `SELECT p.*, c.name as client_name, c.primary_contact_email
             FROM client_projects p
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.id = $1`,
            [id]
        );

        if (projectResult.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        const project = projectResult.rows[0];

        // Fetch related data in parallel
        const [secretsResult, templatesResult, submissionsResult, invoicesResult, feedbackResult] = await Promise.all([
            pool.query('SELECT id, client_id, project_id, key_name, encrypted_value, iv, auth_tag, created_at, updated_at FROM project_secrets WHERE client_id = $1 ORDER BY created_at DESC', [project.client_id]),
            pool.query('SELECT * FROM intake_templates ORDER BY created_at DESC'),
            pool.query('SELECT * FROM intake_submissions WHERE project_id = $1 ORDER BY submitted_at DESC', [id]),
            pool.query('SELECT * FROM invoices WHERE project_id = $1 ORDER BY created_at DESC', [id]),
            pool.query('SELECT * FROM project_feedback WHERE project_id = $1 ORDER BY created_at ASC', [id])
        ]);

        // Decrypt secrets server-side using the same crypto helper, so admins
        // don't have to deal with raw ciphertext + IVs.
        const secrets = secretsResult.rows.map((row) => {
            try {
                return {
                    id: row.id,
                    client_id: row.client_id,
                    project_id: row.project_id,
                    key_name: row.key_name,
                    value: decrypt(row.encrypted_value, row.iv, row.auth_tag),
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                };
            } catch (decryptErr) {
                console.error(`[ClientProjects] Failed to decrypt secret ${row.id}:`, decryptErr.message);
                return {
                    id: row.id,
                    client_id: row.client_id,
                    project_id: row.project_id,
                    key_name: row.key_name,
                    value: null,
                    decrypt_error: true,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                };
            }
        });

        res.json({
            project,
            secrets,
            templates: templatesResult.rows,
            submissions: submissionsResult.rows,
            invoices: invoicesResult.rows,
            feedback: feedbackResult.rows
        });
    } catch (err) {
        console.error('[ClientProjects] getProjectDashboard error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const calculateProgress = (stages) => {
    if (!stages || !Array.isArray(stages) || stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'COMPLETED').length;
    return Math.round((completed / stages.length) * 100);
};

export const createClientProject = async (req, res) => {
    const {
        client_id, project_name, status, notes,
        domain_name, domain_expiration, amount_due, payment_type, monthly_fee, payment_status, stages,
        intake_form_id, intake_completed, assets_url, training_video_url, maintenance_plan_url
    } = req.body;

    if (!isUuid(client_id)) return res.status(400).json({ error: 'Invalid client_id.' });
    if (!project_name || typeof project_name !== 'string') {
        return res.status(400).json({ error: 'project_name is required.' });
    }

    const calculatedProgress = calculateProgress(stages);

    try {
        const result = await pool.query(
            `INSERT INTO client_projects
            (client_id, project_name, progress, status, notes,
             domain_name, domain_expiration, amount_due, payment_type, monthly_fee, payment_status, stages,
             intake_form_id, intake_completed, assets_url, training_video_url, maintenance_plan_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [client_id, project_name, calculatedProgress, status || 'PLANNING', notes,
             domain_name, domain_expiration || null, amount_due || 0, payment_type || 'ONE_TIME', monthly_fee || 0, payment_status || 'PENDING', JSON.stringify(stages || []),
             isUuid(intake_form_id) ? intake_form_id : null, !!intake_completed, assets_url, training_video_url, maintenance_plan_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[ClientProjects] createClientProject error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const updateClientProject = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });

    const fields = { ...req.body };

    // If stages are updated, recalculate progress server-side so it can't be
    // tampered with via the body.
    if (fields.stages) {
        fields.progress = calculateProgress(fields.stages);
        fields.stages = JSON.stringify(fields.stages);
    }

    const setClause = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(fields)) {
        if (!UPDATABLE_COLUMNS.has(key)) continue;
        setClause.push(`${key} = $${idx}`);
        values.push(val === '' ? null : val);
        idx++;
    }

    if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update.' });
    }

    values.push(id);

    try {
        const query = `UPDATE client_projects SET ${setClause.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
        const result = await pool.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[ClientProjects] updateClientProject error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const deleteClientProject = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const result = await pool.query('DELETE FROM client_projects WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('[ClientProjects] deleteClientProject error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Public Route: Client views their project by tracking_id.
// SECURITY: Only returns fields safe for unauthenticated access.
// Billing amounts and payment details are intentionally excluded; they are
// only revealed after the client authenticates via /auth and gets a JWT.
export const getProjectByTrackingId = async (req, res) => {
    const { trackingId } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.id, p.client_id, p.project_name, p.tracking_id, p.progress, p.status,
                    p.domain_name, p.domain_expiration, p.stages,
                    p.intake_form_id, p.intake_completed,
                    p.assets_url, p.training_video_url, p.maintenance_plan_url,
                    c.name as client_name
             FROM client_projects p
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.tracking_id = $1`,
            [trackingId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[ClientProjects] getProjectByTrackingId error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const regenerateTrackingId = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const result = await pool.query(
            `UPDATE client_projects
             SET tracking_id = encode(gen_random_bytes(16), 'hex'), updated_at = NOW()
             WHERE id = $1 RETURNING tracking_id`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json({ message: 'Tracking ID regenerated', tracking_id: result.rows[0].tracking_id });
    } catch (err) {
        console.error('[ClientProjects] regenerateTrackingId error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const authClientPortal = async (req, res) => {
    const { trackingId } = req.params;
    const { email } = req.body;

    if (!email) {
        // Don't distinguish "missing field" from "bad credentials" — both leak
        // information to an attacker probing valid tracking IDs.
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    try {
        const result = await pool.query(
            `SELECT p.client_id as id, p.tracking_id, c.primary_contact_email, c.billing_email
             FROM client_projects p
             JOIN clients c ON p.client_id = c.id
             WHERE p.tracking_id = $1`,
            [trackingId]
        );

        if (result.rows.length === 0) {
            // Generic message regardless of whether the tracking ID is invalid
            // or the email doesn't match — prevents enumeration.
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const client = result.rows[0];
        const providedEmail = email.toLowerCase().trim();
        const primaryEmail = (client.primary_contact_email || '').toLowerCase().trim();
        const billingEmail = (client.billing_email || '').toLowerCase().trim();

        // Timing-safe comparison to prevent email enumeration via response timing.
        const providedBuf = Buffer.from(providedEmail);
        const primaryBuf = Buffer.from(primaryEmail);
        const billingBuf = billingEmail ? Buffer.from(billingEmail) : null;

        const matchesPrimary = providedBuf.length === primaryBuf.length && crypto.timingSafeEqual(providedBuf, primaryBuf);
        const matchesBilling = billingBuf && providedBuf.length === billingBuf.length && crypto.timingSafeEqual(providedBuf, billingBuf);

        if (matchesPrimary || matchesBilling) {
            // Generate JWT bound to tracking_id
            const token = jwt.sign(
                { trackingId: client.tracking_id, clientId: client.id, role: 'CLIENT' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.json({ message: 'Authenticated successfully', token });
        }

        return res.status(401).json({ error: 'Invalid credentials.' });
    } catch (err) {
        console.error('[ClientProjects] authClientPortal error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Admin-only: Generate a pre-authenticated portal link (magic link) for a client
export const generatePortalLink = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    try {
        const result = await pool.query(
            `SELECT p.tracking_id, p.client_id
             FROM client_projects p
             WHERE p.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const project = result.rows[0];
        const token = jwt.sign(
            { trackingId: project.tracking_id, clientId: project.client_id, role: 'CLIENT' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const portalLink = `${frontendUrl}/portal/${project.tracking_id}?token=${token}`;

        res.json({
            portal_link: portalLink,
            tracking_id: project.tracking_id,
            expires_in: '7 days'
        });
    } catch (err) {
        console.error('[ClientProjects] generatePortalLink error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
