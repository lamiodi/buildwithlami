// ─── phase6-test.mjs ──────────────────────────────────────
// Admin OS Phase 6 (Intelligence) — pure-logic tests.
// No DB writes, no network: the scorer, catalog picker, budget
// scaling, summary text builder and JSON repair are all pure.
//
// Run: node phase6-test.mjs
// ──────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import { scoreTonightQueue, buildRulesSummaryText } from './src/services/intelligenceService.js';
import { pickCatalogEntry, scaleToBudget } from './src/services/quotationDraftService.js';
import { parseJsonLoose, isAiConfigured } from './src/services/aiService.js';

let passed = 0;
const test = (name, fn) => {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        console.error(`  ✗ ${name}\n    ${err.message}`);
        process.exitCode = 1;
    }
};

const NO_CONTEXT = {};

console.log('\n── Tonight Queue scorer (§74) ──');

test('overdue outranks everything else at equal priority', () => {
    const rows = scoreTonightQueue([
        { id: 'a', title: 'Due task', priority: 'MEDIUM', due_at: new Date(), status: 'TODO' },
        { id: 'b', title: 'Overdue task', priority: 'MEDIUM', due_at: new Date(Date.now() - 86400000 * 2), status: 'TODO' },
    ], NO_CONTEXT);
    assert.equal(rows[0].id, 'b');
    assert.equal(rows[0].reason, 'Overdue');
    assert.ok(rows[0].score > rows[1].score);
});

test('due-today task beats due-tomorrow task', () => {
    const rows = scoreTonightQueue([
        { id: 'x', title: 'Tomorrow', priority: 'MEDIUM', due_at: new Date(Date.now() + 86400000), status: 'TODO' },
        { id: 'y', title: 'Today', priority: 'MEDIUM', due_at: new Date(), status: 'TODO' },
    ], NO_CONTEXT);
    assert.equal(rows[0].id, 'y');
    assert.equal(rows[0].reason, 'Due today');
});

test('urgent priority adds weight and a label', () => {
    const rows = scoreTonightQueue([
        { id: 'u', title: 'Urgent no date', priority: 'URGENT', due_at: null, status: 'TODO' },
        { id: 'm', title: 'Medium no date', priority: 'MEDIUM', due_at: null, status: 'TODO' },
    ], NO_CONTEXT);
    assert.equal(rows[0].id, 'u');
    assert.equal(rows[0].reason, 'Urgent priority');
    assert.ok(rows[0].reasons.includes('Urgent priority'));
});

test('blocked tasks sink to the bottom and say why', () => {
    const rows = scoreTonightQueue([
        { id: 'blk', title: 'Awaiting logo', priority: 'HIGH', due_at: new Date(), status: 'TODO', blocked: true, blocked_reason: 'waiting for logo' },
        { id: 'ok', title: 'Small fix', priority: 'LOW', due_at: new Date(), status: 'TODO' },
    ], NO_CONTEXT);
    assert.equal(rows[rows.length - 1].id, 'blk');
    assert.equal(rows[rows.length - 1].score, -1);
    assert.equal(rows[rows.length - 1].reason, 'Blocked');
    assert.ok(rows[rows.length - 1].reasons[0].includes('waiting for logo'));
});

test('payment task on a project with an overdue invoice flags Blocks payment', () => {
    const projectId = 'p1';
    const rows = scoreTonightQueue([
        { id: 'pay', title: 'Fix checkout flow', priority: 'MEDIUM', due_at: new Date(), status: 'TODO', project_id: projectId },
    ], { overdueInvoiceProjectIds: new Set([projectId]) });
    assert.ok(rows[0].reasons.includes('Blocks payment'));
});

test('launch-imminent project flags Blocks launch', () => {
    const rows = scoreTonightQueue([
        { id: 'l', title: 'Final QA pass', priority: 'MEDIUM', due_at: new Date(), status: 'TODO', project_id: 'p2' },
    ], { launchImminentProjectIds: new Set(['p2']) });
    assert.ok(rows[0].reasons.includes('Blocks launch'));
});

test('quick wins under 30 minutes get the quick-win reason', () => {
    const rows = scoreTonightQueue([
        { id: 'q', title: 'Reply to client', priority: 'LOW', due_at: new Date(), status: 'TODO', estimated_minutes: 15 },
    ], NO_CONTEXT);
    assert.ok(rows[0].reasons.includes('Quick win (≤30 min)'));
});

test('stable tie-break on title', () => {
    const rows = scoreTonightQueue([
        { id: 'b', title: 'Beta fix', priority: 'LOW', due_at: null, status: 'TODO' },
        { id: 'a', title: 'Alpha fix', priority: 'LOW', due_at: null, status: 'TODO' },
    ], NO_CONTEXT);
    assert.equal(rows[0].id, 'a');
});

console.log('\n── Quotation draft catalog ──');

test('ecommerce keywords pick the e-commerce package', () => {
    assert.equal(pickCatalogEntry({ notes: 'client wants an online shop for clothes' }).id, 'ecom_launch');
});

test('survey division falls back to the survey pack', () => {
    assert.equal(pickCatalogEntry({ division: 'SURVEY' }).id, 'service_survey');
    assert.equal(pickCatalogEntry({ division: 'DRONE' }).id, 'service_drone');
});

test('default software lead gets the business package', () => {
    assert.equal(pickCatalogEntry({ division: 'SOFTWARE', notes: 'needs a website' }).id, 'web_business');
});

test('scaleToBudget lands on the requested total', () => {
    const items = [
        { description: 'A', qty: 1, rate: 110000 },
        { description: 'B', qty: 1, rate: 110000 },
        { description: 'C', qty: 1, rate: 50000 },
    ];
    const scaled = scaleToBudget(items, 500000);
    const total = scaled.reduce((s, it) => s + it.qty * it.rate, 0);
    assert.equal(total, 500000);
    // Never scales down below the package price.
    const untouched = scaleToBudget(items, 100000);
    assert.equal(untouched.reduce((s, it) => s + it.qty * it.rate, 0), 270000);
});

console.log('\n── AI service JSON repair ──');

test('parses fenced JSON', () => {
    assert.deepEqual(parseJsonLoose('```json\n{"a": 1}\n```'), { a: 1 });
});

test('parses JSON wrapped in prose', () => {
    assert.deepEqual(parseJsonLoose('Here you go:\n{"subject": "Hi", "body": "Long enough body."}\nThanks!'), { subject: 'Hi', body: 'Long enough body.' });
});

test('throws a parse error on garbage', () => {
    assert.throws(() => parseJsonLoose('no json here at all'), /could not extract JSON/);
});

test('AI is not configured without a key', () => {
    delete process.env.AI_API_KEY;
    assert.equal(isAiConfigured(), false);
});

console.log('\n── Client summary text (§78) ──');

test('rules summary renders the blueprint shape', () => {
    const text = buildRulesSummaryText('StyleSence', {
        type: 'ECOMMERCE',
        markets: ['Nigeria', 'UK'],
        currencies: ['NGN', 'GBP'],
        paymentMethods: ['Paystack', 'Stripe'],
        shipping: 'Nigeria + international',
        social: { instagram: '@stylesence', tiktok: null, facebook: null },
        mainGoal: 'Direct online purchasing',
        assetsOutstanding: ['Product spreadsheet'],
    }, {});
    assert.ok(text.startsWith('StyleSence'));
    assert.ok(text.includes('Markets: Nigeria, UK'));
    assert.ok(text.includes('Social: instagram @stylesence'));
    assert.ok(text.includes('Assets Outstanding: Product spreadsheet'));
});

test('missing data renders as em-dashes, not undefined', () => {
    const text = buildRulesSummaryText('New Client', { type: null, markets: [], currencies: [], paymentMethods: [], shipping: null, social: {}, mainGoal: null, assetsOutstanding: [] }, {});
    assert.ok(!text.includes('undefined'));
    assert.ok(text.includes('Markets: —'));
    assert.ok(text.includes('Assets Outstanding: None'));
});

console.log(`\n${passed} test(s) passed${process.exitCode ? ' — FAILURES above' : ''}\n`);
