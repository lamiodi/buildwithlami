export const WORK_STATUSES = ['ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW'];
export const CURRENCIES = ['NGN', 'USD', 'EUR', 'GBP'];

export const formatMoney = (amount, currency = 'NGN') => new Intl.NumberFormat('en-NG', {
    style: 'currency', currency, maximumFractionDigits: 2,
}).format(Number(amount || 0));

export function totalsByCurrency(invoices, status = 'PAID') {
    return invoices.filter((i) => i.status === status).reduce((totals, invoice) => {
        const currency = invoice.currency || 'NGN';
        totals[currency] = (totals[currency] || 0) + Number(invoice.amount || 0);
        return totals;
    }, {});
}

export const isOverdueInvoice = (invoice, now = new Date()) =>
    ['PENDING', 'PARTIAL', 'OVERDUE'].includes(invoice.status) &&
    !!invoice.due_date && new Date(invoice.due_date).getTime() < now.getTime();

function readArray(value) {
    if (Array.isArray(value)) return value;
    try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

export function projectStages(project) {
    const stages = readArray(project?.stages);
    return (stages.length ? stages : readArray(project?.milestones)).map((s) => ({ ...s, name: s.name || s.title || 'Stage' }));
}

export function monthlyCollected(invoices, currency, now = new Date()) {
    const months = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        return { key: `${date.getFullYear()}-${date.getMonth()}`, month: date.toLocaleDateString('en', { month: 'short', year: '2-digit' }), value: 0 };
    });
    for (const invoice of invoices) {
        if (invoice.status !== 'PAID' || (invoice.currency || 'NGN') !== currency) continue;
        const date = new Date(invoice.paid_at || invoice.created_at);
        const bucket = months.find((m) => m.key === `${date.getFullYear()}-${date.getMonth()}`);
        if (bucket) bucket.value += Number(invoice.amount || 0);
    }
    const max = Math.max(...months.map((m) => m.value), 1);
    return months.map((m) => ({ ...m, height: m.value / max * 100 }));
}
