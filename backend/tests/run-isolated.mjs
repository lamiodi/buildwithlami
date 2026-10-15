import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import pg from 'pg';
import bcrypt from 'bcrypt';

const root = fileURLToPath(new URL('../', import.meta.url));
const dbUrl = process.env.TEST_DATABASE_URL;
const database = dbUrl && new URL(dbUrl);
if (process.env.BWL_ISOLATED_TEST !== '1' || !database ||
    !['localhost', '127.0.0.1'].includes(database.hostname) || !/^\/bwl_.*test/.test(database.pathname)) {
    throw new Error('Set BWL_ISOLATED_TEST=1 and TEST_DATABASE_URL to a local bwl_*test database. Never use production.');
}
const port = process.env.TEST_PORT || '4311';
const env = {
    ...process.env, NODE_ENV: 'test', DATABASE_URL: dbUrl, PGSSL: 'disable',
    DOTENV_CONFIG_PATH: path.join(root, 'tests', '.unused-test-env'),
    PORT: port, HOST: '127.0.0.1', FRONTEND_URL: `http://localhost:${port}`,
    JWT_SECRET: 'isolated-test-jwt-secret-not-for-production',
    TEST_JWT_SECRET: 'isolated-test-jwt-secret-not-for-production',
    ENCRYPTION_KEY: '11'.repeat(32),
    PAYSTACK_SECRET_KEY: 'isolated-test-paystack-key', TEST_PAYSTACK_SECRET: 'isolated-test-paystack-key',
    TEST_BASE_URL: `http://localhost:${port}`, TEST_ADMIN_EMAIL: 'owner@isolated.test',
    TEST_ADMIN_PASSWORD: 'IsolatedTestOnly2026!',
    SMTP_HOST: '127.0.0.1', SMTP_USER: '', SMTP_PASS: '',
};
function run(args) {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, args, { cwd: root, env, stdio: 'inherit', windowsHide: true });
        child.on('error', reject);
        child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`Command failed (${code}): ${args.join(' ')}`)));
    });
}

if (process.env.TEST_SKIP_DB_SETUP !== '1') {
    await run(['src/scripts/runInit.js']);
    await run(['src/scripts/runUpdateSchema.js']);
}
const pool = new pg.Pool({ connectionString: dbUrl, ssl: false });
try {
    const password = await bcrypt.hash(env.TEST_ADMIN_PASSWORD, 4);
    await pool.query(`INSERT INTO users (email, password, role) VALUES ($1, $2, 'Owner')
        ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, two_factor_enabled = false,
        failed_login_count = 0, locked_until = NULL`, [env.TEST_ADMIN_EMAIL, password]);
    const { rows } = await pool.query('SELECT id FROM profile LIMIT 1');
    if (!rows.length) await pool.query("INSERT INTO profile (full_name, headline) VALUES ('Isolated Test Owner', 'Test fixture')");
} finally { await pool.end(); }

const logPath = path.join(os.tmpdir(), `bwl-isolated-${process.pid}.log`);
const logFd = fs.openSync(logPath, 'w');
const server = process.env.TEST_REUSE_SERVER === '1' ? null : spawn(process.execPath, ['--import', './tests/test-runtime.mjs', 'src/index.js'], {
    cwd: root, env, stdio: ['ignore', logFd, logFd], windowsHide: true,
});
let failed = false;
try {
    // Windows dependency loading can be slow on a cold filesystem cache.
    // This allowance only affects test startup, never API request limits.
    const startupTimeout = Number(process.env.TEST_STARTUP_TIMEOUT_MS) || (process.platform === 'win32' ? 180000 : 45000);
    const deadline = Date.now() + startupTimeout;
    let healthy = false;
    while (Date.now() < deadline) {
        try { const response = await fetch(`${env.TEST_BASE_URL}/api/health`, { signal: AbortSignal.timeout(1000) }); healthy = response.ok; } catch { /* Starting. */ }
        if (healthy) break;
        if (server && server.exitCode !== null) throw new Error('Isolated backend exited during startup.');
        await new Promise((resolve) => setTimeout(resolve, 150));
    }
    if (!healthy) throw new Error('Isolated backend did not start.');
    await run(['--test', 'tests/admin-workflow.test.mjs', 'tests/regression.test.mjs', 'tests/journey.test.mjs']);
} catch (error) {
    failed = true;
    console.error(error.message);
    console.error(`Backend diagnostics: ${logPath}`);
} finally {
    server?.kill();
    fs.closeSync(logFd);
}
if (failed) process.exitCode = 1;
