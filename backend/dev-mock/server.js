// ─── DEV-ONLY MOCK BACKEND ──────────────────────────────
// In-memory replacement for the real PostgreSQL-backed API.
// Activated only when the main server's DATABASE_URL is broken / unset,
// or when DEV_MOCK=true is set.
//
// Features:
//   - Any email + password logs you in (issues a real-shape JWT).
//   - Pre-seeded clients, projects, templates, secrets, invoices, feedback.
//   - POST/PUT/DELETE mutate the in-memory store for the session lifetime.
//   - Mirrors the real /api/* shape so the frontend works unchanged.
//
// SECURITY: This module is dev-only. Do not import in production.
// ─────────────────────────────────────────────────────────

import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const PORT = process.env.DEV_MOCK_PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-mock-secret-change-me';

// ── UUID v4 helper (we generate IDs locally for new rows) ──
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ── Seed data ─────────────────────────────────────────────
const seed = {
    clients: [
        { id: uuid(), name: 'Lami Studios', primary_contact_email: 'hello@lamistudios.test', billing_email: 'billing@lamistudios.test', paystack_customer_code: 'CUS_LAMI001', notes: 'High-priority retainer. Always ships on time.', created_at: '2025-09-12T10:00:00Z', updated_at: '2025-09-12T10:00:00Z' },
        { id: uuid(), name: 'Chidinma Okafor', primary_contact_email: 'chidinma@chefdidi.test', billing_email: null, paystack_customer_code: null, notes: 'Recipe blog + shop. Loves long-form content.', created_at: '2025-10-03T14:21:00Z', updated_at: '2025-10-03T14:21:00Z' },
        { id: uuid(), name: 'Adesola Logistics', primary_contact_email: 'ops@adesola.test', billing_email: 'finance@adesola.test', paystack_customer_code: 'CUS_ADSL002', notes: 'Fleet management portal. ERP-leaning.', created_at: '2025-11-18T09:00:00Z', updated_at: '2025-11-18T09:00:00Z' }
    ],
    projects: [
        {
            id: uuid(), tracking_id: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
            client_id: null, project_name: 'Studio Portfolio Refresh', progress: 80, status: 'DEVELOPMENT', notes: 'Phase 2 of brand refresh. Awaiting copy deck.',
            domain_name: 'lamistudios.test', domain_expiration: '2026-08-15',
            amount_due: 1500, payment_type: 'ONE_TIME', monthly_fee: 0, payment_status: 'PARTIAL',
            stages: [
                { name: 'Discovery & Planning', status: 'COMPLETED' },
                { name: 'Design & Mockups', status: 'COMPLETED' },
                { name: 'Development', status: 'IN_PROGRESS' },
                { name: 'Testing & Revisions', status: 'PENDING' },
                { name: 'Launch', status: 'PENDING' }
            ],
            intake_form_id: null, intake_completed: true,
            assets_url: '', training_video_url: '', maintenance_plan_url: '',
            offboarding_status: { assets_delivered: false, training_completed: false, credentials_documented: false, support_handoff: false, final_payment: false, client_feedback: false },
            created_at: '2025-09-15T10:00:00Z', updated_at: '2025-12-01T12:00:00Z'
        },
        {
            id: uuid(), tracking_id: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7',
            client_id: null, project_name: 'Recipe Blog + Shopify Bridge', progress: 45, status: 'DESIGN', notes: 'Need food photographer deliverables by Dec 20.',
            domain_name: 'chefdidi.test', domain_expiration: '2026-04-22',
            amount_due: 3200, payment_type: 'ONE_TIME', monthly_fee: 0, payment_status: 'PENDING',
            stages: [
                { name: 'Discovery & Planning', status: 'COMPLETED' },
                { name: 'Design & Mockups', status: 'IN_PROGRESS' },
                { name: 'Development', status: 'PENDING' },
                { name: 'Testing & Revisions', status: 'PENDING' },
                { name: 'Launch', status: 'PENDING' }
            ],
            intake_form_id: null, intake_completed: true,
            assets_url: '', training_video_url: '', maintenance_plan_url: '',
            offboarding_status: { assets_delivered: false, training_completed: false, credentials_documented: false, support_handoff: false, final_payment: false, client_feedback: false },
            created_at: '2025-10-05T14:30:00Z', updated_at: '2025-11-30T09:00:00Z'
        },
        {
            id: uuid(), tracking_id: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8',
            client_id: null, project_name: 'Adesola Fleet Portal', progress: 100, status: 'LAUNCHED', notes: 'Live. Monthly maintenance active.',
            domain_name: 'portal.adesola.test', domain_expiration: '2026-02-10',
            amount_due: 0, payment_type: 'MONTHLY', monthly_fee: 45000, payment_status: 'PAID',
            stages: [
                { name: 'Discovery & Planning', status: 'COMPLETED' },
                { name: 'Design & Mockups', status: 'COMPLETED' },
                { name: 'Development', status: 'COMPLETED' },
                { name: 'Testing & Revisions', status: 'COMPLETED' },
                { name: 'Launch', status: 'COMPLETED' }
            ],
            intake_form_id: null, intake_completed: true,
            assets_url: 'https://drive.google.com/drive/folders/sample-adesola-assets',
            training_video_url: 'https://www.loom.com/share/sample-training',
            maintenance_plan_url: 'https://paystack.com/pay/sample-maintenance',
            offboarding_status: { assets_delivered: true, training_completed: true, credentials_documented: true, support_handoff: true, final_payment: true, client_feedback: true },
            created_at: '2025-08-01T10:00:00Z', updated_at: '2025-11-01T10:00:00Z'
        }
    ],
    templates: [
        {
            id: uuid(),
            name: 'Standard Website Intake',
            description: 'Default intake form for new web projects.',
            schema: [
                { id: 's1', type: 'text', label: 'Business Name', required: true },
                { id: 's2', type: 'textarea', label: 'Tell us about your business', required: true },
                { id: 's3', type: 'select', label: 'Industry', required: true, options: ['SaaS', 'E-commerce', 'Agency', 'Personal Brand', 'Other'] },
                { id: 's4', type: 'email', label: 'Best contact email', required: true }
            ],
            created_at: '2025-09-01T10:00:00Z'
        },
        {
            id: uuid(),
            name: 'E-Commerce Website Intake',
            description: 'Comprehensive questionnaire for online stores.',
            schema: [
                { id: 'e1', type: 'text', label: 'Store Name', required: true },
                { id: 'e2', type: 'select', label: 'Primary Industry', required: true, options: ['Fashion', 'Electronics', 'Health', 'Food', 'Other'] },
                { id: 'e3', type: 'textarea', label: 'Target audience', required: true },
                { id: 'e4', type: 'checkbox', label: 'Required Payment Gateways', required: false, options: ['Paystack', 'Flutterwave', 'Stripe', 'PayPal'] }
            ],
            created_at: '2025-09-15T11:00:00Z'
        }
    ],
    submissions: [
        { id: uuid(), project_id: null, responses: { 'Business Name': 'Lami Studios', 'Tell us about your business': 'A boutique dev agency.', 'Industry': 'Agency', 'Best contact email': 'hello@lamistudios.test' }, submitted_at: '2025-09-20T10:00:00Z' }
    ],
    secrets: [
        { id: uuid(), client_id: null, project_id: null, key_name: 'GoDaddy Login', value: 'mock-password-1234', created_at: '2025-09-22T10:00:00Z' },
        { id: uuid(), client_id: null, project_id: null, key_name: 'Cloudflare API Token', value: 'cf-mock-token-abc123', created_at: '2025-10-12T10:00:00Z' }
    ],
    invoices: [
        { id: uuid(), client_id: null, project_id: null, amount: 1500, status: 'PENDING', due_date: '2025-12-30', created_at: '2025-12-01T10:00:00Z', payment_url: 'https://paystack.com/pay/sample-1' },
        { id: uuid(), client_id: null, project_id: null, amount: 45000, status: 'PAID', due_date: '2025-11-30', created_at: '2025-11-01T10:00:00Z', payment_url: null }
    ],
    feedback: [
        { id: uuid(), project_id: null, stage_index: 0, client_comment: 'Discovery notes look great. One small ask: include a competitor analysis in the deck.', admin_reply: 'Added! Updated deck is in your inbox.', status: 'RESOLVED', created_at: '2025-09-25T10:00:00Z' },
        { id: uuid(), project_id: null, stage_index: 2, client_comment: 'Can we add a sticky CTA to the pricing section?', admin_reply: null, status: 'OPEN', created_at: '2025-11-22T15:00:00Z' }
    ]
};

// Cross-link foreign keys
function linkRelations() {
    const c1 = seed.clients[0].id; // Lami
    const c2 = seed.clients[1].id; // Chidinma
    const c3 = seed.clients[2].id; // Adesola
    seed.projects[0].client_id = c1;
    seed.projects[1].client_id = c2;
    seed.projects[2].client_id = c3;
    seed.secrets[0].client_id = c1;
    seed.secrets[0].project_id = seed.projects[0].id;
    seed.secrets[1].client_id = c1;
    seed.secrets[1].project_id = seed.projects[0].id;
    seed.submissions[0].project_id = seed.projects[0].id;
    seed.invoices[0].client_id = c1;
    seed.invoices[0].project_id = seed.projects[0].id;
    seed.invoices[1].client_id = c3;
    seed.invoices[1].project_id = seed.projects[2].id;
    seed.feedback[0].project_id = seed.projects[0].id;
    seed.feedback[1].project_id = seed.projects[0].id;
    // Attach a template to one project so the intake UI is non-empty
    seed.projects[1].intake_form_id = seed.templates[1].id;
    seed.projects[1].intake_completed = false;
}
linkRelations();

const store = {
    clients: [...seed.clients],
    projects: [...seed.projects],
    templates: [...seed.templates],
    submissions: [...seed.submissions],
    secrets: [...seed.secrets],
    invoices: [...seed.invoices],
    feedback: [...seed.feedback]
};

// ── App setup ─────────────────────────────────────────────
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mock: true, timestamp: now() }));

// ── Aggregated dashboard summary (powers AdminDashboard.jsx) ──
app.get('/api/dashboard', requireAuth, (_req, res) => {
    const projectsWithClient = store.projects.map(p => {
        const c = store.clients.find(c => c.id === p.client_id);
        return { ...p, client_name: c?.name || null };
    });
    res.json({
        stats: {
            total_clients: store.clients.length,
            active_projects: store.projects.filter(p => !['LAUNCHED', 'ARCHIVED'].includes(p.status)).length,
            launched_projects: store.projects.filter(p => p.status === 'LAUNCHED').length,
            pending_invoices: store.invoices.filter(i => i.status === 'PENDING').length,
            pending_invoice_amount: store.invoices.filter(i => i.status === 'PENDING').reduce((s, i) => s + Number(i.amount || 0), 0),
            paid_invoices: store.invoices.filter(i => i.status === 'PAID').length,
            open_feedback: store.feedback.filter(f => f.status === 'OPEN').length,
            templates: store.templates.length,
        },
        projects: projectsWithClient,
        clients: store.clients,
        templates: store.templates,
        feedback: store.feedback,
        invoices: store.invoices,
    });
});

// ── Helpers ───────────────────────────────────────────────
function calculateProgress(stages) {
    if (!stages || !Array.isArray(stages) || stages.length === 0) return 0;
    const completed = stages.filter(s => s.status === 'COMPLETED').length;
    return Math.round((completed / stages.length) * 100);
}

function signToken(payload, secret = JWT_SECRET, opts = { expiresIn: '7d' }) {
    return jwt.sign(payload, secret, opts);
}

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden — insufficient role.' });
        }
        next();
    };
}

// ── AUTH ──────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: [{ code: 'invalid_type', path: ['email'], message: 'Required' }] });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const token = signToken({ id: 'mock-admin-uuid', email, role: 'ADMIN' });
    return res.json({ token, user: { id: 'mock-admin-uuid', email, role: 'ADMIN' } });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role });
});

app.post('/api/auth/logout', requireAuth, (_req, res) => res.json({ success: true, message: 'Logged out successfully' }));

// ── CLIENTS ───────────────────────────────────────────────
app.get('/api/clients', requireAuth, (_req, res) => res.json(store.clients));
app.get('/api/clients/:id', requireAuth, (req, res) => {
    const c = store.clients.find(x => x.id === req.params.id);
    if (!c) return res.status(404).json({ error: 'Client not found' });
    res.json(c);
});
app.post('/api/clients', requireAuth, (req, res) => {
    const { name, primary_contact_email, billing_email, paystack_customer_code, notes } = req.body || {};
    if (!name || !primary_contact_email) return res.status(400).json({ error: 'Name and primary email are required.' });
    const row = { id: uuid(), name, primary_contact_email, billing_email: billing_email || null, paystack_customer_code: paystack_customer_code || null, notes: notes || null, created_at: now(), updated_at: now() };
    store.clients.unshift(row);
    res.status(201).json(row);
});
app.put('/api/clients/:id', requireAuth, (req, res) => {
    const i = store.clients.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Client not found' });
    store.clients[i] = { ...store.clients[i], ...req.body, updated_at: now() };
    res.json(store.clients[i]);
});
app.delete('/api/clients/:id', requireAuth, (req, res) => {
    const i = store.clients.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Client not found' });
    store.clients.splice(i, 1);
    res.status(204).send();
});

// ── CLIENT PROJECTS ───────────────────────────────────────
app.get('/api/client-projects', requireAuth, (_req, res) => {
    const rows = store.projects.map(p => {
        const client = store.clients.find(c => c.id === p.client_id);
        return { ...p, client_name: client ? client.name : null };
    });
    res.json(rows);
});
app.get('/api/client-projects/:id/dashboard', requireAuth, (req, res) => {
    const p = store.projects.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const client = store.clients.find(c => c.id === p.client_id);
    const project = { ...p, client_name: client?.name, primary_contact_email: client?.primary_contact_email };
    const secrets = store.secrets.filter(s => s.client_id === p.client_id).map(s => ({ ...s, decrypt_error: false }));
    const submissions = store.submissions.filter(s => s.project_id === p.id);
    const invoices = store.invoices.filter(i => i.project_id === p.id);
    const feedback = store.feedback.filter(f => f.project_id === p.id);
    res.json({ project, secrets, templates: store.templates, submissions, invoices, feedback });
});
app.get('/api/client-projects/:id', requireAuth, (req, res) => {
    const p = store.projects.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const client = store.clients.find(c => c.id === p.client_id);
    res.json({ ...p, client_name: client?.name, primary_contact_email: client?.primary_contact_email });
});
app.post('/api/client-projects', requireAuth, (req, res) => {
    const body = req.body || {};
    if (!body.client_id || !body.project_name) return res.status(400).json({ error: 'client_id and project_name are required.' });
    const row = {
        id: uuid(),
        tracking_id: crypto.randomBytes(16).toString('hex'),
        client_id: body.client_id,
        project_name: body.project_name,
        progress: calculateProgress(body.stages),
        status: body.status || 'PLANNING',
        notes: body.notes || '',
        domain_name: body.domain_name || '',
        domain_expiration: body.domain_expiration || null,
        amount_due: body.amount_due || 0,
        payment_type: body.payment_type || 'ONE_TIME',
        monthly_fee: body.monthly_fee || 0,
        payment_status: body.payment_status || 'PENDING',
        stages: body.stages || [],
        intake_form_id: body.intake_form_id || null,
        intake_completed: !!body.intake_completed,
        assets_url: body.assets_url || '',
        training_video_url: body.training_video_url || '',
        maintenance_plan_url: body.maintenance_plan_url || '',
        offboarding_status: body.offboarding_status || { assets_delivered: false, training_completed: false, credentials_documented: false, support_handoff: false, final_payment: false, client_feedback: false },
        created_at: now(), updated_at: now()
    };
    store.projects.unshift(row);
    res.status(201).json(row);
});
app.put('/api/client-projects/:id', requireAuth, (req, res) => {
    const i = store.projects.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Project not found' });
    const updated = { ...store.projects[i], ...req.body, updated_at: now() };
    if (req.body.stages) updated.progress = calculateProgress(req.body.stages);
    store.projects[i] = updated;
    res.json(updated);
});
app.patch('/api/client-projects/:id', requireAuth, (req, res) => {
    const i = store.projects.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Project not found' });
    store.projects[i] = { ...store.projects[i], ...req.body, updated_at: now() };
    res.json(store.projects[i]);
});
app.delete('/api/client-projects/:id', requireAuth, (req, res) => {
    const i = store.projects.findIndex(x => x.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'Project not found' });
    store.projects.splice(i, 1);
    res.json({ message: 'Project deleted successfully' });
});
app.post('/api/client-projects/:id/regenerate-tracking', requireAuth, (req, res) => {
    const p = store.projects.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    p.tracking_id = crypto.randomBytes(16).toString('hex');
    p.updated_at = now();
    res.json({ message: 'Tracking ID regenerated', tracking_id: p.tracking_id });
});
app.get('/api/client-projects/:id/portal-link', requireAuth, (req, res) => {
    const p = store.projects.find(x => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const token = signToken({ trackingId: p.tracking_id, clientId: p.client_id, role: 'CLIENT' });
    res.json({ portal_link: `http://localhost:3000/track/${p.tracking_id}`, tracking_id: p.tracking_id, expires_in: '7 days' });
});

// Public client-tracking endpoint (no auth)
app.get('/api/client-projects/track/:trackingId', (req, res) => {
    const p = store.projects.find(x => x.tracking_id === req.params.trackingId);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const client = store.clients.find(c => c.id === p.client_id);
    res.json({
        id: p.id, client_id: p.client_id, project_name: p.project_name, tracking_id: p.tracking_id,
        progress: p.progress, status: p.status, domain_name: p.domain_name, domain_expiration: p.domain_expiration,
        stages: p.stages, intake_form_id: p.intake_form_id, intake_completed: p.intake_completed,
        assets_url: p.assets_url, training_video_url: p.training_video_url, maintenance_plan_url: p.maintenance_plan_url,
        client_name: client?.name
    });
});
app.post('/api/client-projects/track/:trackingId/auth', (req, res) => {
    const p = store.projects.find(x => x.tracking_id === req.params.trackingId);
    const { email } = req.body || {};
    if (!p || !email) return res.status(401).json({ error: 'Invalid credentials.' });
    const client = store.clients.find(c => c.id === p.client_id);
    if (!client) return res.status(401).json({ error: 'Invalid credentials.' });
    const provided = String(email).toLowerCase().trim();
    if (provided !== String(client.primary_contact_email).toLowerCase() && provided !== String(client.billing_email || '').toLowerCase()) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = signToken({ trackingId: p.tracking_id, clientId: client.id, role: 'CLIENT' });
    res.json({ message: 'Authenticated successfully', token });
});

// ── TEMPLATES ─────────────────────────────────────────────
app.get('/api/templates', requireAuth, (_req, res) => res.json(store.templates));
app.get('/api/templates/:id', (req, res) => {
    const t = store.templates.find(x => x.id === req.params.id);
    if (!t) return res.status(404).json({ error: 'Template not found' });
    res.json(t);
});
app.post('/api/templates', requireAuth, (req, res) => {
    const { name, description, schema } = req.body || {};
    if (!name || !Array.isArray(schema)) return res.status(400).json({ error: 'name and schema[] are required.' });
    const row = { id: uuid(), name, description: description || null, schema, created_at: now() };
    store.templates.unshift(row);
    res.status(201).json(row);
});
app.get('/api/submissions/:projectId', requireAuth, (req, res) => {
    res.json(store.submissions.filter(s => s.project_id === req.params.projectId));
});
app.post('/api/submit-intake', requireAuth, (req, res) => {
    const { projectId, responses } = req.body || {};
    const p = store.projects.find(x => x.id === projectId);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const row = { id: uuid(), project_id: projectId, responses, submitted_at: now() };
    store.submissions = [row, ...store.submissions.filter(s => s.project_id !== projectId)];
    p.intake_completed = true;
    res.status(201).json(row);
});

// ── SECRETS ───────────────────────────────────────────────
app.get('/api/secrets/:clientId', requireAuth, (req, res) => {
    res.json(store.secrets.filter(s => s.client_id === req.params.clientId).map(s => ({ ...s, decrypt_error: false })));
});
app.post('/api/secrets', requireAuth, (req, res) => {
    const { clientId, keyName, value } = req.body || {};
    if (!clientId || !keyName || !value) return res.status(400).json({ error: 'clientId, keyName, value required.' });
    const row = { id: uuid(), client_id: clientId, project_id: null, key_name: keyName, value, created_at: now() };
    store.secrets.unshift(row);
    res.status(201).json(row);
});
app.post('/api/secrets/track/:trackingId/submit', (req, res) => {
    const p = store.projects.find(x => x.tracking_id === req.params.trackingId);
    if (!p) return res.status(404).json({ error: 'Project not found.' });
    const { keyName, value } = req.body || {};
    if (!keyName || !value) return res.status(400).json({ error: 'Service name and secret value are required.' });
    const row = { id: uuid(), client_id: p.client_id, project_id: p.id, key_name: keyName, value, created_at: now() };
    store.secrets.unshift(row);
    res.status(201).json({ message: 'Secret securely stored in vault.', id: row.id });
});

// ── INVOICES ──────────────────────────────────────────────
app.get('/api/invoices/project/:projectId', requireAuth, (req, res) => {
    res.json(store.invoices.filter(i => i.project_id === req.params.projectId));
});
app.post('/api/invoices', requireAuth, (req, res) => {
    const { clientId, projectId, amount, dueDate } = req.body || {};
    if (!clientId || !projectId || !amount) return res.status(400).json({ error: 'clientId, projectId, amount required.' });
    const row = { id: uuid(), client_id: clientId, project_id: projectId, amount, status: 'PENDING', due_date: dueDate || null, created_at: now(), payment_url: 'https://paystack.com/pay/mock-' + Math.random().toString(36).slice(2, 10) };
    store.invoices.unshift(row);
    res.status(201).json(row);
});

// ── FEEDBACK ──────────────────────────────────────────────
app.get('/api/feedback/project/:projectId', requireAuth, (req, res) => {
    res.json(store.feedback.filter(f => f.project_id === req.params.projectId));
});
app.post('/api/feedback/submit', requireAuth, (req, res) => {
    const { projectId, stageIndex, clientComment } = req.body || {};
    const row = { id: uuid(), project_id: projectId, stage_index: stageIndex, client_comment: clientComment, admin_reply: null, status: 'OPEN', created_at: now() };
    store.feedback.push(row);
    res.status(201).json(row);
});
app.put('/api/feedback/:id/reply', requireAuth, (req, res) => {
    const f = store.feedback.find(x => x.id === req.params.id);
    if (!f) return res.status(404).json({ error: 'Feedback not found' });
    if (req.body.adminReply !== undefined) f.admin_reply = req.body.adminReply;
    if (req.body.status) f.status = req.body.status;
    res.json(f);
});

// ── 404 ───────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found.' }));

app.listen(PORT, () => {
    console.log(`\n🧪 [DEV-MOCK] Listening on http://localhost:${PORT}`);
    console.log(`   Pre-seeded: ${store.clients.length} clients, ${store.projects.length} projects, ${store.templates.length} templates`);
    console.log(`   Login with ANY email + password (6+ chars)\n`);
});
