import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { decrypt } from '../utils/crypto.js';
import cloudinary from '../utils/cloudinary.js';
import { normalizeStages, progressFromStages, WORK_STATUSES } from '../utils/projectWorkflow.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const authClientPortalSchema = z.object({
    email: z.string().email().max(254),
});

const uploadFileSchema = z.object({
    category: z.string().max(100).optional().nullable(),
    fileName: z.string().max(255).optional().nullable(),
});

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
    'stages',
    'milestones',
    'intake_form_id',
    'intake_completed',
    'assets_url',
    'training_video_url',
    'maintenance_plan_url',
    'client_id',
    // Admin OS Phase 1 — next action (blueprint §30).
    'next_action',
    'next_action_due_at',
]);

export const getClientProjects = async (req, res) => {
    try {
        const conditions = [];
        const params = [];
        if (req.query.client_id) {
            if (!isUuid(req.query.client_id)) return res.status(400).json({ error: 'Invalid client_id.' });
            params.push(req.query.client_id);
            conditions.push(`p.client_id = $${params.length}`);
        }
        
        // Add division filter if provided
        if (req.query.division && ['SOFTWARE', 'SURVEY', 'DRONE'].includes(req.query.division)) {
            params.push(req.query.division);
            conditions.push(`p.division = $${params.length}`);
        }
        
        const where = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';
        
        const result = await pool.query(`
            SELECT p.*, c.name as client_name
            FROM client_projects p
            LEFT JOIN clients c ON p.client_id = c.id
            ${where}
            ORDER BY p.created_at DESC
        `, params);
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
        const [secretsResult, templatesResult, submissionsResult, invoicesResult, feedbackResult, filesResult, approvalsResult, changeRequestsResult, decisionsResult] = await Promise.all([
            pool.query('SELECT id, client_id, project_id, key_name, encrypted_value, iv, auth_tag, created_at, updated_at FROM project_secrets WHERE client_id = $1 ORDER BY created_at DESC', [project.client_id]),
            pool.query('SELECT * FROM intake_templates ORDER BY created_at DESC'),
            pool.query('SELECT * FROM intake_submissions WHERE project_id = $1 ORDER BY submitted_at DESC', [id]),
            pool.query('SELECT * FROM invoices WHERE project_id = $1 ORDER BY created_at DESC', [id]),
            pool.query('SELECT * FROM project_feedback WHERE project_id = $1 ORDER BY created_at ASC', [id]),
            pool.query('SELECT * FROM project_files WHERE project_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC', [id]),
            // Admin OS Phase 3a — delivery control records.
            pool.query(`SELECT * FROM approvals WHERE project_id = $1 ORDER BY (status = 'PENDING') DESC, created_at DESC`, [id]),
            pool.query(`SELECT * FROM change_requests WHERE project_id = $1 ORDER BY (status = 'SENT') DESC, created_at DESC`, [id]),
            pool.query(`SELECT * FROM project_decisions WHERE project_id = $1 ORDER BY created_at DESC LIMIT 100`, [id])
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
            feedback: feedbackResult.rows,
            files: filesResult.rows,
            approvals: approvalsResult.rows,
            change_requests: changeRequestsResult.rows,
            decisions: decisionsResult.rows
        });
    } catch (err) {
        console.error('[ClientProjects] getProjectDashboard error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const createClientProject = async (req, res) => {
    const {
        client_id, project_name, status: requestedStatus, notes,
        domain_name, domain_expiration, amount_due, payment_type, monthly_fee, payment_status, stages,
        intake_form_id, intake_completed, assets_url, training_video_url, maintenance_plan_url
    } = req.body;
    const status = requestedStatus === 'IN_PROGRESS' ? 'DEVELOPMENT' : requestedStatus;

    if (!isUuid(client_id)) return res.status(400).json({ error: 'Invalid client_id.' });
    if (!project_name || typeof project_name !== 'string') {
        return res.status(400).json({ error: 'project_name is required.' });
    }

    try {
        if (status && !WORK_STATUSES.includes(status)) return res.status(409).json({ error: 'Create an active project first, then use Launch or Handover to complete it.' });
        if (payment_status && payment_status !== 'PENDING') return res.status(409).json({ error: 'Record payments through an invoice to update payment status.' });
        const normalizedStages = normalizeStages(stages || []);
        const calculatedProgress = progressFromStages(normalizedStages);
        const result = await pool.query(
            `INSERT INTO client_projects
            (client_id, project_name, progress, status, notes,
             domain_name, domain_expiration, amount_due, payment_type, monthly_fee, payment_status, stages,
             intake_form_id, intake_completed, assets_url, training_video_url, maintenance_plan_url,
             tracking_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                    encode(gen_random_bytes(16), 'hex')) RETURNING *`,
            [client_id, project_name, calculatedProgress, status || 'PLANNING', notes,
             domain_name, domain_expiration || null, amount_due || 0, payment_type || 'ONE_TIME', monthly_fee || 0, 'PENDING', JSON.stringify(normalizedStages),
             isUuid(intake_form_id) ? intake_form_id : null, !!intake_completed, assets_url, training_video_url, maintenance_plan_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError || err instanceof TypeError) return res.status(400).json({ error: 'Each stage needs a name and a valid status.' });
        console.error('[ClientProjects] createClientProject error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

export const updateClientProject = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });

    const fields = { ...req.body };
    if (fields.status === 'IN_PROGRESS') fields.status = 'DEVELOPMENT';
    try {
        const { rows } = await pool.query('SELECT status, payment_status FROM client_projects WHERE id = $1', [id]);
        if (!rows[0]) return res.status(404).json({ error: 'Project not found.' });
        if ('offboarding_status' in fields || 'offboarding_checklist' in fields) {
            return res.status(409).json({ error: 'Update the checklist through the Handover panel.' });
        }
        if (fields.payment_status && fields.payment_status !== rows[0].payment_status) {
            return res.status(409).json({ error: 'Record payments through an invoice to update payment status.' });
        }
        delete fields.payment_status;
        if (fields.status === rows[0].status) delete fields.status;
        if (fields.status && !WORK_STATUSES.includes(fields.status)) {
            return res.status(409).json({ error: 'Use Launch, Complete Handover, or Archive with a reason to finish a project.' });
        }
        const currentStatus = rows[0].status === 'IN_PROGRESS' ? 'DEVELOPMENT' : rows[0].status;
        if (fields.status && !WORK_STATUSES.includes(currentStatus)) {
            return res.status(409).json({ error: 'A launched or closed project cannot be moved back through the ordinary stage editor.' });
        }
        delete fields.progress;
        if ('stages' in fields || 'milestones' in fields) {
            const stages = normalizeStages(fields.stages ?? fields.milestones);
            fields.progress = progressFromStages(stages);
            fields.stages = JSON.stringify(stages);
            // Keep the legacy portal representation in sync with the same tracker.
            fields.milestones = JSON.stringify(stages.map((s) => ({ ...s, title: s.name })));
        }
    } catch (err) {
        if (err instanceof z.ZodError || err instanceof TypeError) return res.status(400).json({ error: 'Each stage needs a name and a valid status.' });
        console.error('[ClientProjects] validation failed:', err.message);
        return res.status(500).json({ error: 'Could not validate the project update.' });
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

export const archiveClientProject = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim().slice(0, 1000) : '';
    if (reason.length < 3) return res.status(400).json({ error: 'Explain why this project is being archived.' });
    try {
        const { rows } = await pool.query(`UPDATE client_projects SET status = 'ARCHIVED',
            notes = concat_ws(E'\\n', NULLIF(notes, ''), $2::text), next_action = NULL,
            next_action_due_at = NULL, updated_at = NOW()
            WHERE id = $1 AND status <> 'ARCHIVED' RETURNING *`, [id, `Archived: ${reason}`]);
        if (!rows[0]) return res.status(409).json({ error: 'Project is missing or already archived.' });
        await writeAuditLog({ action: 'PROJECT_ARCHIVED', entityType: 'client_projects', entityId: id,
            user: req.user, ipAddress: getClientIp(req), details: { reason, handoverCompleted: rows[0].offboarding_status === 'COMPLETED' } });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[ClientProjects] archive failed:', err.message);
        return res.status(500).json({ error: 'Could not archive project.' });
    }
};

export const reopenClientProject = async (req, res) => {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim().slice(0, 1000) : '';
    if (reason.length < 3) return res.status(400).json({ error: 'Explain the new work before reopening this project.' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query('SELECT * FROM client_projects WHERE id = $1 FOR UPDATE', [id]);
        if (!rows[0] || !['LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].includes(rows[0].status)) {
            await client.query('ROLLBACK');
            return res.status(409).json({ error: 'Only a launched or closed project can be reopened.' });
        }
        const result = await client.query(`UPDATE client_projects SET status = 'PLANNING',
            offboarding_status = 'NOT_STARTED', offboarding_checklist = '[]'::jsonb,
            offboarding_started_at = NULL, offboarding_completed_at = NULL,
            next_action = 'Agree the scope of the reopened work', next_action_due_at = NULL,
            notes = concat_ws(E'\\n', NULLIF(notes, ''), $2::text), updated_at = NOW()
            WHERE id = $1 RETURNING *`, [id, `Reopened: ${reason}`]);
        await client.query('COMMIT');
        await writeAuditLog({ action: 'PROJECT_REOPENED', entityType: 'client_projects', entityId: id,
            user: req.user, ipAddress: getClientIp(req), details: { reason, previousStatus: rows[0].status, previousChecklist: rows[0].offboarding_checklist } });
        return res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('[ClientProjects] reopen failed:', err.message);
        return res.status(500).json({ error: 'Could not reopen project.' });
    } finally { client.release(); }
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
        // No client_id in the public projection — internal identifiers
        // stay out of the unauthenticated surface.
        const result = await pool.query(
            `SELECT p.id, p.project_name, p.tracking_id, p.progress, p.status,
                    p.domain_name, p.domain_expiration, p.stages, p.milestones,
                    p.intake_form_id, p.intake_completed,
                    p.assets_url, p.training_video_url, p.maintenance_plan_url,
                    c.name as client_name
             FROM client_projects p
             LEFT JOIN clients c ON p.client_id = c.id
             WHERE p.tracking_id = $1`,
            [trackingId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        
        const project = result.rows[0];
        
        const { rows: files } = await pool.query(
            `SELECT id, file_name, file_url, category, file_size, created_at
             FROM project_files
             WHERE project_id = $1 AND deleted_at IS NULL
             ORDER BY created_at DESC`,
            [project.id]
        );

        res.json({ ...project, files });
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
    const parsed = authClientPortalSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'A valid email is required.' });
    }
    const { email } = parsed.data;

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

export const uploadProjectFile = async (req, res) => {
    const { id } = req.params;
    const parsed = uploadFileSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid upload payload.' });
    }
    const { category, fileName } = parsed.data;

    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid project ID format.' });
    if (!req.file) return res.status(400).json({ error: 'No file provided.' });

    const validCategories = ['Proposal', 'Contract', 'Invoice', 'Brief', 'Asset', 'Other'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({ error: 'Invalid category. Must be one of: ' + validCategories.join(', ') });
    }

    try {
        let fileUrl = '';
        if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
            // Mock mode for local testing without Cloudinary
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            fileUrl = `data:${req.file.mimetype};base64,${b64}`;
        } else {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'buildwithlami_projects',
                resource_type: 'auto' // Handle non-image files like PDFs
            });
            fileUrl = uploadResponse.secure_url;
        }

        const name = fileName || req.file.originalname;
        const size = req.file.size;

        const result = await pool.query(
            `INSERT INTO project_files (project_id, uploader_id, file_name, file_url, category, file_size)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [id, req.user.id, name, fileUrl, category, size]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[ClientProjects] uploadProjectFile error:', err);
        res.status(500).json({ error: 'Internal server error during upload.' });
    }
};

export const deleteProjectFile = async (req, res) => {
    const { id, fileId } = req.params;
    if (!isUuid(id) || !isUuid(fileId)) return res.status(400).json({ error: 'Invalid ID format.' });

    try {
        // Soft delete the file
        const result = await pool.query(
            `UPDATE project_files SET deleted_at = NOW() WHERE id = $1 AND project_id = $2 RETURNING *`,
            [fileId, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'File not found.' });

        res.json({ success: true, message: 'File deleted successfully.' });
    } catch (err) {
        console.error('[ClientProjects] deleteProjectFile error:', err.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
