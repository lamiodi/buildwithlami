import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { normalizeStages, progressFromStages } from '../src/utils/projectWorkflow.js';

test('stage validation accepts legacy titles, derives progress, and rejects invalid states', () => {
    const stages = normalizeStages([{ title: 'Discovery', status: 'COMPLETED' }, { name: 'Build', status: 'PENDING' }]);
    assert.equal(progressFromStages(stages), 50);
    assert.equal(stages[0].name, 'Discovery');
    assert.throws(() => normalizeStages([{ name: 'Build', status: 'INVALID' }]));
});

const enabled = process.env.BWL_ISOLATED_TEST === '1' && process.env.TEST_BASE_URL && process.env.TEST_DATABASE_URL;
let pool, token, clientId, projectId;
let requestNumber = 0;
const api = async (method, pathname, body) => {
    const response = await fetch(`${process.env.TEST_BASE_URL}${pathname}`, {
        method, headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `10.91.1.${++requestNumber % 240 + 1}`, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
    });
    return { status: response.status, data: await response.json() };
};
const options = { skip: !enabled && 'Run through the isolated test runner.' };
after(async () => { if (pool) await pool.end(); });

test('admin audit fixture signs in and creates a client and active project', options, async () => {
    const login = await api('POST', '/api/auth/login', { email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD });
    assert.equal(login.status, 200);
    token = login.data.token;
    assert.ok(token);
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, ssl: false });
    const client = await api('POST', '/api/clients', { name: 'Admin audit fixture', primary_contact_email: `audit-${Date.now()}@isolated.test`, division: 'SOFTWARE' });
    assert.equal(client.status, 201);
    clientId = client.data.id;
    const project = await api('POST', '/api/client-projects', { client_id: clientId, project_name: 'Admin audit workflow', stages: [{ name: 'Plan', status: 'PENDING' }, { name: 'Build', status: 'PENDING' }] });
    assert.equal(project.status, 201);
    projectId = project.data.id;
});

test('project invoices require explicit currency and retain USD', options, async () => {
    const missing = await api('POST', '/api/invoices', { clientId, projectId, amount: 100 });
    assert.equal(missing.status, 400);
    const usd = await api('POST', '/api/invoices', { clientId, projectId, amount: 100, currency: 'USD' });
    assert.equal(usd.status, 201);
    assert.equal(usd.data.currency, 'USD');
    assert.equal(Number(usd.data.amount), 100);
    const ngn = await api('POST', '/api/invoices', { clientId, projectId, amount: 500000, currency: 'NGN' });
    assert.equal(ngn.status, 201);
    const invoices = await api('GET', `/api/invoices?client_id=${clientId}`);
    assert.ok(invoices.data.some((i) => i.currency === 'USD'));
    assert.ok(invoices.data.some((i) => i.currency === 'NGN'));
});

test('stage changes update progress and the legacy portal representation together', options, async () => {
    await pool.query("UPDATE client_projects SET status = 'IN_PROGRESS' WHERE id = $1", [projectId]);
    assert.equal((await api('PATCH', `/api/client-projects/${projectId}`, { status: 'DESIGN' })).status, 200, 'legacy active projects can still change work stages');
    const updated = await api('PATCH', `/api/client-projects/${projectId}`, { stages: [{ name: 'Plan', status: 'COMPLETED' }, { name: 'Build', status: 'IN_PROGRESS' }], progress: 99 });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.progress, 50);
    assert.equal(updated.data.milestones[0].title, 'Plan');
    assert.equal(updated.data.milestones[0].status, 'COMPLETED');
    assert.equal((await api('PATCH', `/api/client-projects/${projectId}`, { stages: [{ name: 'Build', status: 'BROKEN' }] })).status, 400);
});

test('legacy handover writes, direct paid status and lifecycle bypasses are blocked', options, async () => {
    for (const body of [{ offboarding_status: { final_payment: true } }, { payment_status: 'PAID' }, { status: 'LAUNCHED' }, { status: 'MAINTENANCE' }, { status: 'ARCHIVED' }]) {
        assert.equal((await api('PATCH', `/api/client-projects/${projectId}`, body)).status, 409);
    }
    assert.equal((await api('POST', `/api/client-projects/${projectId}/archive`, {})).status, 400);
});

test('client-scoped onboarding remains available beyond the global 200-record cap', options, async () => {
    const other = await api('POST', '/api/clients', { name: 'Other onboarding fixture', primary_contact_email: `other-${Date.now()}@isolated.test` });
    const old = await pool.query(`INSERT INTO client_onboardings (client_id, project_type, status, updated_at) VALUES ($1, 'BUSINESS', 'APPROVED', '2020-01-01') RETURNING id`, [clientId]);
    await pool.query(`INSERT INTO client_onboardings (client_id, project_type, status) SELECT $1, 'BUSINESS', 'APPROVED' FROM generate_series(1, 205)`, [other.data.id]);
    const briefs = await api('GET', `/api/onboarding?client_id=${clientId}`);
    assert.equal(briefs.status, 200);
    assert.ok(briefs.data.some((b) => b.id === old.rows[0].id));
    assert.ok(briefs.data.every((b) => b.client_id === clientId));
    const projects = await api('GET', `/api/client-projects?client_id=${clientId}`);
    assert.ok(projects.data.every((p) => p.client_id === clientId));
});

test('launch creates follow-ups once; handover is gated and completion is idempotent', options, async () => {
    const launched = await api('POST', `/api/aftercare/projects/${projectId}/launch`, {});
    assert.equal(launched.status, 200);
    const before = await pool.query('SELECT COUNT(*)::int AS count FROM tasks WHERE project_id = $1', [projectId]);
    assert.ok(before.rows[0].count > 0);
    await api('POST', `/api/aftercare/projects/${projectId}/launch`, {});
    const repeated = await pool.query('SELECT COUNT(*)::int AS count FROM tasks WHERE project_id = $1', [projectId]);
    assert.equal(repeated.rows[0].count, before.rows[0].count);
    assert.equal((await api('POST', `/api/aftercare/projects/${projectId}/handover/complete`, { next_status: 'MAINTENANCE' })).status, 400);
    await api('POST', `/api/aftercare/projects/${projectId}/handover/start`, {});
    const state = await api('GET', `/api/aftercare/projects/${projectId}/handover`);
    for (const item of state.data.checklist.filter((i) => i.required)) {
        assert.equal((await api('PATCH', `/api/aftercare/projects/${projectId}/handover/checklist`, { key: item.key, done: true })).status, 200);
    }
    const unpaid = await api('POST', `/api/aftercare/projects/${projectId}/handover/complete`, { next_status: 'MAINTENANCE' });
    assert.equal(unpaid.status, 400, 'checking a box cannot bypass an unpaid invoice');
    assert.match(unpaid.data.error, /outstanding project invoices/);
    const invoices = await api('GET', `/api/invoices?client_id=${clientId}`);
    for (const invoice of invoices.data) {
        const paid = await api('PATCH', `/api/invoices/${invoice.id}/pay`, {
            paymentReference: `ISOLATED-${invoice.id}`, paidVia: 'BANK_TRANSFER',
        });
        assert.equal(paid.status, 200, JSON.stringify(paid.data));
    }
    assert.equal((await api('POST', `/api/aftercare/projects/${projectId}/handover/complete`, { next_status: 'MAINTENANCE' })).status, 200);
    const first = await pool.query('SELECT offboarding_completed_at FROM client_projects WHERE id = $1', [projectId]);
    assert.equal((await api('POST', `/api/aftercare/projects/${projectId}/handover/complete`, { next_status: 'MAINTENANCE' })).status, 200);
    const second = await pool.query('SELECT offboarding_completed_at FROM client_projects WHERE id = $1', [projectId]);
    assert.equal(first.rows[0].offboarding_completed_at.getTime(), second.rows[0].offboarding_completed_at.getTime());
    assert.equal((await api('PATCH', `/api/aftercare/projects/${projectId}/handover/checklist`, { key: 'final_invoice_paid', done: false })).status, 409);
    assert.equal((await api('POST', `/api/client-projects/${projectId}/archive`, { reason: 'Archive after completing the test handover' })).status, 200);
    assert.equal((await api('POST', `/api/client-projects/${projectId}/reopen`, { reason: 'New agreed work' })).status, 200);
});

test('two-factor mail failure and timeout return retryable errors without granting access', options, async () => {
    const bcrypt = (await import('bcrypt')).default;
    const password = 'IsolatedOtpTest2026!';
    for (const email of ['otp-failure@isolated.test', 'otp-timeout@isolated.test']) {
        await pool.query(`INSERT INTO users (email, password, role, two_factor_enabled) VALUES ($1, $2, 'Owner', true)
            ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, two_factor_enabled = true`, [email, await bcrypt.hash(password, 4)]);
        const start = Date.now();
        const result = await api('POST', '/api/auth/login', { email, password });
        assert.equal(result.status, 503);
        assert.match(result.data.error, /could not be delivered.*retry/i);
        assert.equal(result.data.token, undefined);
        assert.equal(result.data.challengeToken, undefined);
        assert.ok(Date.now() - start < 14000, 'mail delivery must fail within the browser request window');
        const stored = await pool.query('SELECT two_factor_enabled FROM users WHERE email = $1', [email]);
        assert.equal(stored.rows[0].two_factor_enabled, true);
    }
});

test('dashboard exposes client names and division without mixing invoice currencies', options, async () => {
    const result = await api('GET', '/api/dashboard');
    assert.equal(result.status, 200);
    assert.equal(result.data.projects.find((p) => p.id === projectId).client_name, 'Admin audit fixture');
    assert.equal(result.data.clients.find((c) => c.id === clientId).division, 'SOFTWARE');
    assert.ok(result.data.invoices.some((i) => i.project_id === projectId && i.currency === 'USD'));
});
