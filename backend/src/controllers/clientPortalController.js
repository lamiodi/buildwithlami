import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import { z } from 'zod';

export async function getDashboard(req, res) {
    const clientId = req.clientUser.id;
    try {
        const { rows: projects } = await pool.query(
            `SELECT id, project_name as title, status, created_at, division, progress 
             FROM client_projects 
             WHERE client_id = $1 
             ORDER BY created_at DESC`,
            [clientId]
        );

        const activeProjects = projects.filter(p => !['COMPLETED', 'ARCHIVED'].includes(p.status));
        const completedProjects = projects.filter(p => p.status === 'COMPLETED' || p.status === 'LAUNCHED');

        const { rows: invoices } = await pool.query(
            `SELECT id, invoice_number, status, amount AS total, currency, created_at
             FROM invoices
             WHERE client_id = $1
             ORDER BY created_at DESC LIMIT 5`,
            [clientId]
        );

        res.json({
            activeProjects,
            completedProjects,
            recentInvoices: invoices
        });
    } catch (err) {
        console.error('[ClientPortal] getDashboard error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getProjects(req, res) {
    const clientId = req.clientUser.id;
    try {
        const { rows } = await pool.query(
            `SELECT id, project_name, status, progress, domain_expiration as expected_completion_date, division, created_at, assets_url, milestones
             FROM client_projects 
             WHERE client_id = $1 
             ORDER BY created_at DESC`,
            [clientId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[ClientPortal] getProjects error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getProjectDetails(req, res) {
    const clientId = req.clientUser.id;
    const projectId = req.params.id;
    try {
        const { rows: projectRows } = await pool.query(
            `SELECT id, project_name, status, progress, notes, domain_name, 
                    amount_due, payment_status, stages, milestones, assets_url, training_video_url, 
                    maintenance_plan_url, created_at 
             FROM client_projects 
             WHERE id = $1 AND client_id = $2`,
            [projectId, clientId]
        );
        if (projectRows.length === 0) return res.status(404).json({ error: 'Project not found' });
        
        const project = projectRows[0];

        // Ensure stages is parsed JSON
        if (typeof project.stages === 'string') {
            try { project.stages = JSON.parse(project.stages); } catch (e) { project.stages = []; }
        }
        
        // Ensure milestones is parsed JSON
        if (typeof project.milestones === 'string') {
            try { project.milestones = JSON.parse(project.milestones); } catch (e) { project.milestones = []; }
        }

        const { rows: files } = await pool.query(
            `SELECT id, file_name, file_url, category, file_size, created_at 
             FROM project_files 
             WHERE project_id = $1 AND deleted_at IS NULL
             ORDER BY created_at DESC`,
            [projectId]
        );

        res.json({ project, files });
    } catch (err) {
        console.error('[ClientPortal] getProjectDetails error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getInvoices(req, res) {
    const clientId = req.clientUser.id;
    try {
        const { rows } = await pool.query(
            `SELECT id, invoice_number, status, amount AS total, amount, currency, due_date, pay_token, created_at 
             FROM invoices 
             WHERE client_id = $1 
             ORDER BY created_at DESC`,
            [clientId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[ClientPortal] getInvoices error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getDocuments(req, res) {
    const clientId = req.clientUser.id;
    try {
        // Collect documents from projects and contracts
        const { rows: projects } = await pool.query(
            `SELECT id, project_name, assets_url, training_video_url, maintenance_plan_url 
             FROM client_projects 
             WHERE client_id = $1`,
            [clientId]
        );
        
        const { rows: files } = await pool.query(
            `SELECT pf.id, pf.file_name, pf.file_url, pf.category, pf.file_size, pf.created_at, cp.project_name
             FROM project_files pf
             JOIN client_projects cp ON pf.project_id = cp.id
             WHERE cp.client_id = $1 AND pf.deleted_at IS NULL
             ORDER BY pf.created_at DESC`,
            [clientId]
        );

        const { rows: contracts } = await pool.query(
            `SELECT id, title, signed_pdf, created_at 
             FROM contracts 
             WHERE client_id = $1 AND status = 'SIGNED'`,
            [clientId]
        );

        let documents = [];
        
        projects.forEach(p => {
            if (p.assets_url) documents.push({ id: `assets-${p.id}`, project_name: p.project_name, type: 'Deliverables', url: p.assets_url });
            if (p.training_video_url) documents.push({ id: `video-${p.id}`, project_name: p.project_name, type: 'Training Video', url: p.training_video_url });
            if (p.maintenance_plan_url) documents.push({ id: `maint-${p.id}`, project_name: p.project_name, type: 'Maintenance Plan', url: p.maintenance_plan_url });
        });

        files.forEach(f => {
            documents.push({ 
                id: f.id, 
                project_name: f.project_name, 
                type: f.category, 
                url: f.file_url,
                file_name: f.file_name,
                file_size: f.file_size,
                created_at: f.created_at
            });
        });

        contracts.forEach(c => {
            documents.push({ id: `contract-${c.id}`, project_name: c.title, type: 'Contract PDF', url: `/portal/contracts/${c.id}/pdf`, created_at: c.created_at });
        });

        res.json(documents);
    } catch (err) {
        console.error('[ClientPortal] getDocuments error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const updateProfileSchema = z.object({
    phone: z.string().optional(),
    name: z.string().optional(),
    password: z.string().min(6).optional()
});

export async function updateProfile(req, res) {
    const clientId = req.clientUser.id;
    try {
        const { phone, name, password } = updateProfileSchema.parse(req.body);

        let queryParams = [clientId];
        let setClauses = [];
        let paramIndex = 2;

        if (phone !== undefined) {
            setClauses.push(`phone = $${paramIndex++}`);
            queryParams.push(phone);
        }
        if (name !== undefined) {
            setClauses.push(`name = $${paramIndex++}`);
            queryParams.push(name);
        }
        if (password) {
            const hash = await bcrypt.hash(password, 12);
            setClauses.push(`password_hash = $${paramIndex++}`);
            queryParams.push(hash);
        }

        if (setClauses.length === 0) {
            return res.json({ message: 'No changes provided' });
        }

        await pool.query(
            `UPDATE clients SET ${setClauses.join(', ')} WHERE id = $1`,
            queryParams
        );

        res.json({ success: true });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[ClientPortal] updateProfile error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getClientContracts(req, res) {
    const clientId = req.clientUser.id;
    try {
        const { rows } = await pool.query(
            `SELECT c.*, p.project_name 
             FROM contracts c
             LEFT JOIN client_projects p ON c.project_id = p.id
             WHERE c.client_id = $1 
             ORDER BY c.created_at DESC`,
            [clientId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[ClientPortal] getClientContracts error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getClientQuotations(req, res) {
    const clientId = req.clientUser.id;
    try {
        const { rows } = await pool.query(
            `SELECT id, title, amount, status, line_items, notes, valid_until, created_at 
             FROM quotations 
             WHERE client_id = $1 AND status != 'DRAFT'
             ORDER BY created_at DESC`,
            [clientId]
        );
        res.json(rows);
    } catch (err) {
        console.error('[ClientPortal] getClientQuotations error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

