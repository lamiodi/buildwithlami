// ─── backend/tests/regression.test.mjs ─────────────────────
// Regression suite for defects confirmed during the 2026-10 audit.
//
// These are INTEGRATION tests: they exercise a running backend over HTTP.
// They are env-gated so a bare `node --test` without configuration is a
// clean SKIP, never a false failure:
//
//   TEST_BASE_URL       e.g. http://localhost:4100        (required)
//   TEST_ADMIN_EMAIL    admin login (defaults to local values)
//   TEST_ADMIN_PASSWORD
//
// Point them at an ISOLATED local/staging stack (local Postgres +
// `node --env-file=<your test env> src/index.js`). Never aim them at
// production: they create and delete synthetic clients/projects/invoices.
//
// Covered regressions (audit 2026-10):
//   R1  Client tokens cannot read another client's project invoices
//       (was: SELECT * WHERE project_id = $1 with no tenant filter).
//   R2  Contract document requires the owner token or the signing
//       token (was: fully public by UUID).
//   R3  GET /api/tasks lists without 500 (was: ORDER BY t.priority_rank,
//       a select alias qualified as a column).
//   R4  GET /api/profile responds 200/404, never 500 (was: WHERE id = 1
//       against a UUID primary key).
//   R5  Owner token still reads a project's invoices (no over-tightening).
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.TEST_BASE_URL;
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'owner@test.local';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';

const skipped = !BASE || !ADMIN_PASSWORD;
const why = !BASE
    ? 'TEST_BASE_URL not set (point at an isolated local/staging stack)'
    : !ADMIN_PASSWORD ? 'TEST_ADMIN_PASSWORD not set' : '';

test('R0 admin login works', { skip: skipped && why }, async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.token, 'login must mint a token');
    adminToken = body.token;
});

let adminToken = null;

async function api(method, path, { body, token } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let json = null;
    try { json = await res.json(); } catch { /* html responses */ }
    return { status: res.status, body: json };
}

const uniq = (p) => `${p}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function makeClientWithProject(name) {
    const email = `${uniq(name).toLowerCase()}@regression.test`;
    const c = await api('POST', '/api/clients', { token: adminToken, body: { name, primary_contact_email: email, division: 'SOFTWARE' } });
    assert.ok([200, 201].includes(c.status), `client create ${c.status}`);
    const clientId = c.body.id || c.body.client?.id;
    const p = await api('POST', '/api/client-projects', { token: adminToken, body: { client_id: clientId, project_name: `Regression ${name}`, status: 'IN_PROGRESS', division: 'SOFTWARE' } });
    assert.ok([200, 201].includes(p.status), `project create ${p.status}`);
    const project = p.body.project || p.body;
    return { clientId, email, projectId: project.id, trackingId: project.tracking_id };
}

test('R1 client token cannot read another project\u2019s invoices', { skip: skipped && why }, async (t) => {
    if (!adminToken) t.skip('login failed');
    const A = await makeClientWithProject('R1-A');
    const B = await makeClientWithProject('R1-B');
    const inv = await api('POST', '/api/invoices', { token: adminToken, body: { clientId: B.clientId, projectId: B.projectId, amount: 1000, currency: 'NGN', description: 'R1' } });
    assert.ok([200, 201].includes(inv.status), `invoice create ${inv.status} ${JSON.stringify(inv.body)}`);

    const auth = await api('POST', `/api/client-projects/track/${A.trackingId}/auth`, { body: { email: A.email } });
    assert.equal(auth.status, 200, 'client A portal auth');
    const aToken = auth.body.token;

    // The hole: A could read B's invoices (incl. pay_token) by project UUID.
    const cross = await api('GET', `/api/invoices/project/${B.projectId}`, { token: aToken });
    const leaked = cross.status === 200 && Array.isArray(cross.body) && cross.body.length > 0;
    assert.ok(!leaked, 'client A must not see client B invoices');
    assert.ok(cross.status === 403 || cross.status === 404 || (cross.status === 200 && cross.body.length === 0),
        `deny or empty, got ${cross.status}`);

    // R5: A still reads their own; owner still reads everything.
    const own = await api('GET', `/api/invoices/project/${A.projectId}`, { token: aToken });
    assert.equal(own.status, 200, 'client A own invoices remain readable');
    const owner = await api('GET', `/api/invoices/project/${B.projectId}`, { token: adminToken });
    assert.equal(owner.status, 200, 'owner invoices-by-project remains readable');
});

test('R2 contract document requires owner token or signing token', { skip: skipped && why }, async (t) => {
    if (!adminToken) t.skip('login failed');
    const A = await makeClientWithProject('R2');
    const c = await api('POST', '/api/contracts', {
        token: adminToken,
        body: {
            clientId: A.clientId, projectId: A.projectId,
            contractType: 'SOFTWARE', signatoryName: 'R Signer', signatoryEmail: A.email,
            amount: 1000, currency: 'NGN',
        },
    });
    assert.ok([200, 201].includes(c.status), `contract create ${c.status}`);
    const contract = c.body.contract || c.body;
    const pdfPath = `/api/contracts/${contract.id}/pdf`;

    const anon = await fetch(`${BASE}${pdfPath}`);
    assert.equal(anon.status, 401, 'anonymous PDF fetch must be 401');

    const withToken = await fetch(`${BASE}${pdfPath}?token=${encodeURIComponent(contract.signing_token)}`);
    assert.equal(withToken.status, 200, 'signing token grants the document');

    const owner = await fetch(`${BASE}${pdfPath}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.equal(owner.status, 200, 'owner token grants the document');

    const bad = await fetch(`${BASE}/api/contracts/not-a-uuid/pdf`);
    assert.equal(bad.status, 400, 'malformed id is a 400, not a 500');
});

test('R3 GET /api/tasks lists without server error', { skip: skipped && why }, async (t) => {
    if (!adminToken) t.skip('login failed');
    const r = await api('GET', '/api/tasks', { token: adminToken });
    assert.equal(r.status, 200, `tasks list must not 500 (ORDER BY alias fix), got ${r.status}`);
    assert.ok(Array.isArray(r.body), 'tasks list is an array');
});

test('R4 GET /api/profile never 500s', { skip: skipped && why }, async () => {
    const r = await fetch(`${BASE}/api/profile`);
    assert.ok(r.status === 200 || r.status === 404, `profile must be 200/404 (uuid-id fix), got ${r.status}`);
});
