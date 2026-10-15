import test from 'node:test';
import assert from 'node:assert/strict';
import { monthlyCollected, totalsByCurrency, isOverdueInvoice, projectStages } from '../src/utils/adminWorkflow.js';

test('paid totals retain NGN and USD separately and exclude unpaid invoices', () => {
    assert.deepEqual(totalsByCurrency([
        { status: 'PAID', currency: 'NGN', amount: '500000' },
        { status: 'PAID', currency: 'USD', amount: '1000' },
        { status: 'PENDING', currency: 'USD', amount: 200 },
    ]), { NGN: 500000, USD: 1000 });
});

test('revenue buckets exclude previous years and use paid dates and one currency', () => {
    const months = monthlyCollected([
        { status: 'PAID', currency: 'USD', amount: 100, created_at: '2026-01-01', paid_at: '2026-10-01' },
        { status: 'PAID', currency: 'USD', amount: 999, paid_at: '2025-10-01' },
        { status: 'PAID', currency: 'NGN', amount: 500000, paid_at: '2026-10-01' },
    ], 'USD', new Date(2026, 9, 31));
    assert.equal(months.length, 6);
    assert.equal(new Set(months.map((m) => m.key)).size, 6);
    assert.equal(months.at(-1).value, 100);
    assert.equal(months.reduce((sum, m) => sum + m.value, 0), 100);
});

test('only unpaid past-due invoices are overdue', () => {
    const now = new Date('2026-10-13T12:00:00Z');
    assert.equal(isOverdueInvoice({ status: 'PAID', due_date: '2026-10-01' }, now), false);
    assert.equal(isOverdueInvoice({ status: 'PENDING', due_date: '2026-10-20' }, now), false);
    assert.equal(isOverdueInvoice({ status: 'PARTIAL', due_date: '2026-10-01' }, now), true);
});

test('the stage tracker uses canonical stages and supports legacy milestones safely', () => {
    assert.equal(projectStages({ stages: [{ name: 'Build', status: 'COMPLETED' }], milestones: [{ title: 'Old', status: 'PENDING' }] })[0].name, 'Build');
    assert.equal(projectStages({ milestones: '[{"title":"Legacy","status":"PENDING"}]' })[0].name, 'Legacy');
    assert.deepEqual(projectStages({ stages: 'broken', milestones: 'broken' }), []);
});
