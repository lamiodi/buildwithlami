// ─── src/services/assistantService.js ─────────────────────
// Admin OS Phase 6 — natural-language admin assistant
// (blueprint §91 Phase 6.7, §101).
//
// Deterministic first: a keyword intent router answers the
// operating questions the blueprint names verbatim ("Who owes
// me money?", "What should I do tonight?", …) with real query
// results. When AI is configured and no intent matches, a
// compact data snapshot goes to the LLM with a strict
// answer-only-from-data prompt — the AI narrates, it never
// invents numbers. Without AI, the fallback is an honest
// "here's what I can answer" list.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { BASE_CURRENCY } from '../utils/fx.js';
import { isAiConfigured, chat } from './aiService.js';

const money = (amount, currency = BASE_CURRENCY) =>
    `${currency} ${Number(amount || 0).toLocaleString()}`;
const shortDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—');

// ── Intent handlers ───────────────────────────────────────
// Each returns { answer, data?, link? } or null when there is
// nothing to report. Handlers must be cheap — single queries.
const HANDLERS = {
    async outstanding() {
        const { rows } = await pool.query(`
            SELECT currency, COUNT(*)::int AS count, COALESCE(SUM(amount), 0) AS amount
              FROM invoices WHERE status IN ('PENDING', 'OVERDUE')
             GROUP BY currency ORDER BY amount DESC
        `);
        if (rows.length === 0) return { answer: 'Nobody owes you anything right now — all invoices are settled. 🎉' };
        const parts = rows.map((r) => `${money(r.amount, r.currency)} across ${r.count} invoice${r.count === 1 ? '' : 's'}`);
        const { rows: top } = await pool.query(`
            SELECT i.invoice_number, i.amount, i.currency, i.due_date, c.name AS client_name
              FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
             WHERE i.status IN ('PENDING', 'OVERDUE')
             ORDER BY (i.status = 'OVERDUE') DESC, i.due_date ASC NULLS LAST LIMIT 3
        `);
        const lines = top.map((i) => `• ${i.client_name || 'Client'} — ${money(i.amount, i.currency)}${i.due_date ? `, due ${shortDate(i.due_date)}` : ''}`);
        return {
            answer: `Outstanding: ${parts.join('; ')}.\nTop open invoices:\n${lines.join('\n')}`,
            data: rows,
            link: '/admin/invoices',
        };
    },

    async overdue() {
        const { rows } = await pool.query(`
            SELECT i.invoice_number, i.amount, i.currency, i.due_date, c.name AS client_name
              FROM invoices i LEFT JOIN clients c ON c.id = i.client_id
             WHERE i.status IN ('PENDING', 'OVERDUE') AND i.due_date < NOW()
             ORDER BY i.due_date ASC LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'No overdue invoices. 👍' };
        const lines = rows.map((i) => `• ${i.client_name || 'Client'} — ${money(i.amount, i.currency)} (${i.invoice_number || 'invoice'}), overdue since ${shortDate(i.due_date)}`);
        return { answer: `${rows.length} overdue invoice${rows.length === 1 ? '' : 's'}:\n${lines.join('\n')}`, data: rows, link: '/admin/invoices' };
    },

    async tonight() {
        const { rows } = await pool.query(`
            SELECT t.title, t.priority, t.estimated_minutes, t.due_at,
                   c.name AS client_name, p.project_name,
                   (t.due_at < NOW()) AS overdue
              FROM tasks t
              LEFT JOIN clients c         ON c.id = t.client_id
              LEFT JOIN client_projects p ON p.id = t.project_id
             WHERE t.status NOT IN ('DONE', 'CANCELLED') AND t.owner_type = 'ADMIN'
               AND (t.due_at < NOW() + INTERVAL '1 day' OR t.priority = 'URGENT')
             ORDER BY t.due_at ASC NULLS LAST LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'Nothing due tonight. 🌙' };
        const time = (m) => (m ? (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`) : '');
        const lines = rows.map((t) => `• ${t.title}${t.client_name || t.project_name ? ` — ${t.client_name || t.project_name}` : ''}${time(t.estimated_minutes) ? ` (${time(t.estimated_minutes)})` : ''}${t.overdue ? ' — OVERDUE' : ''}`);
        return { answer: `Tonight's queue:\n${lines.join('\n')}`, data: rows, link: '/admin/tasks' };
    },

    async waiting() {
        const { rows } = await pool.query(`
            SELECT a.title, a.type, a.due_at, c.name AS client_name,
                   (a.due_at < NOW()) AS overdue
              FROM client_actions a
              LEFT JOIN clients c ON c.id = a.client_id
             WHERE a.status = 'PENDING'
             ORDER BY a.due_at ASC NULLS LAST LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'Nothing is pending from clients right now.' };
        const lines = rows.map((a) => `• ${a.client_name || 'Client'} — ${a.title}${a.due_at ? ` (due ${shortDate(a.due_at)}${a.overdue ? ', overdue' : ''})` : ''}`);
        return { answer: `Waiting on clients:\n${lines.join('\n')}`, data: rows, link: '/admin/tasks' };
    },

    async leads() {
        const { rows } = await pool.query(`
            SELECT full_name, stage, division, updated_at, next_action, next_action_due_at
              FROM leads
             WHERE stage IN ('LEAD', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION')
               AND updated_at < NOW() - INTERVAL '48 hours'
             ORDER BY updated_at ASC LIMIT 8
        `);
        const { rows: fresh } = await pool.query(`
            SELECT COUNT(*)::int AS count FROM leads
             WHERE created_at > NOW() - INTERVAL '7 days'
        `);
        if (rows.length === 0 && fresh[0].count === 0) return { answer: 'No leads need follow-up, and none arrived in the last 7 days.' };
        const stale = rows.map((l) => `• ${l.full_name} (${l.stage}${l.division ? `, ${l.division}` : ''}) — quiet since ${shortDate(l.updated_at)}${l.next_action ? `; next: ${l.next_action}` : ''}`);
        const head = `${fresh[0].count} new lead${fresh[0].count === 1 ? '' : 's'} in the last 7 days.`;
        return {
            answer: rows.length
                ? `${head}\nNeed follow-up:\n${stale.join('\n')}`
                : `${head} All active leads have been touched recently.`,
            data: rows,
            link: '/admin/crm',
        };
    },

    async revenue() {
        const { rows } = await pool.query(`
            SELECT
                (SELECT COALESCE(SUM(conv), 0) FROM (
                    SELECT i.amount * r.rate AS conv
                      FROM invoices i
                      JOIN fx_rates r ON r.base_currency = $1 AND r.target_currency = i.currency
                     WHERE i.status = 'PAID'
                       AND DATE_TRUNC('month', i.created_at) = DATE_TRUNC('month', CURRENT_DATE)
                ) rev) AS month_revenue,
                (SELECT COALESCE(SUM(conv), 0) FROM (
                    SELECT i.amount * r.rate AS conv
                      FROM invoices i
                      JOIN fx_rates r ON r.base_currency = $1 AND r.target_currency = i.currency
                     WHERE i.status = 'PAID'
                ) rev) AS total_revenue,
                (SELECT COALESCE(SUM(amount), 0) FROM expenses
                  WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)) AS month_expenses
        `, [BASE_CURRENCY]);
        const r = rows[0];
        return {
            answer: `Revenue this month: ${money(r.month_revenue)} (base ${BASE_CURRENCY}). All-time collected: ${money(r.total_revenue)}. Expenses this month: ${money(r.month_expenses)}.`,
            data: r,
            link: '/admin/reports',
        };
    },

    async renewals() {
        const { rows } = await pool.query(`
            SELECT project_name, domain_name, domain_expiration
              FROM client_projects
             WHERE domain_expiration IS NOT NULL
               AND domain_expiration BETWEEN NOW() AND NOW() + INTERVAL '60 days'
               AND status NOT IN ('ARCHIVED')
             ORDER BY domain_expiration ASC LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'No domain renewals due in the next 60 days.' };
        const lines = rows.map((p) => `• ${p.domain_name || p.project_name} — expires ${shortDate(p.domain_expiration)}`);
        return { answer: `Upcoming renewals:\n${lines.join('\n')}`, data: rows, link: '/admin/projects' };
    },

    async blocked() {
        const { rows } = await pool.query(`
            SELECT t.title, t.blocked_reason, c.name AS client_name, p.project_name
              FROM tasks t
              LEFT JOIN clients c         ON c.id = t.client_id
              LEFT JOIN client_projects p ON p.id = t.project_id
             WHERE t.blocked AND t.status NOT IN ('DONE', 'CANCELLED')
             LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'Nothing is blocked right now.' };
        const lines = rows.map((t) => `• ${t.title}${t.client_name || t.project_name ? ` — ${t.client_name || t.project_name}` : ''}${t.blocked_reason ? `: ${t.blocked_reason}` : ''}`);
        return { answer: `Blocked work:\n${lines.join('\n')}`, data: rows, link: '/admin/tasks' };
    },

    async onboarding() {
        const { rows } = await pool.query(`
            SELECT o.status, o.completion_percent, o.updated_at, c.name AS client_name
              FROM client_onboardings o
              LEFT JOIN clients c ON c.id = o.client_id
             WHERE o.status <> 'APPROVED'
             ORDER BY o.updated_at ASC LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'All onboardings are approved — nothing open.' };
        const lines = rows.map((o) => `• ${o.client_name || 'Client'} — ${o.status.toLowerCase().replace('_', ' ')}, ${o.completion_percent}% complete (updated ${shortDate(o.updated_at)})`);
        return { answer: `Open onboardings:\n${lines.join('\n')}`, data: rows, link: '/admin/clients' };
    },

    async quotations() {
        const { rows } = await pool.query(`
            SELECT q.title, q.amount, q.currency, q.status, q.valid_until,
                   l.full_name AS lead_name
              FROM quotations q
              LEFT JOIN leads l ON l.id = q.lead_id
             WHERE q.status IN ('DRAFT', 'SENT')
             ORDER BY q.created_at DESC LIMIT 8
        `);
        if (rows.length === 0) return { answer: 'No active quotations (draft or awaiting reply).' };
        const lines = rows.map((q) => `• ${q.title} — ${money(q.amount, q.currency || BASE_CURRENCY)} (${q.status.toLowerCase()}${q.lead_name ? `, for ${q.lead_name}` : ''}${q.valid_until ? `, valid until ${shortDate(q.valid_until)}` : ''})`);
        return { answer: `Active quotations:\n${lines.join('\n')}`, data: rows, link: '/admin/quotations' };
    },

    async expenses() {
        const { rows } = await pool.query(`
            SELECT COALESCE(SUM(amount), 0) AS total,
                   COALESCE(SUM(amount) FILTER (WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)), 0) AS month_total
              FROM expenses
        `);
        const { rows: byCat } = await pool.query(`
            SELECT category, COALESCE(SUM(amount), 0) AS total
              FROM expenses
             WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
             GROUP BY category ORDER BY total DESC LIMIT 5
        `);
        const cats = byCat.map((c) => `${c.category}: ${money(c.total)}`).join(', ');
        return {
            answer: `Expenses this month: ${money(rows[0].month_total)} (all-time ${money(rows[0].total)}).${cats ? `\nTop categories: ${cats}` : ''}`,
            data: rows[0],
            link: '/admin/expenses',
        };
    },

    async profitability() {
        const { rows } = await pool.query(`
            SELECT p.project_name,
                   COALESCE(SUM(i.amount * COALESCE(r.rate, 0)) FILTER (WHERE i.status = 'PAID'), 0) AS revenue,
                   COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.project_id = p.id), 0) AS expenses,
                   COALESCE((SELECT SUM(COALESCE(t.actual_minutes, t.estimated_minutes)) FROM tasks t
                              WHERE t.project_id = p.id AND t.status = 'DONE'), 0)::int AS minutes
              FROM client_projects p
              LEFT JOIN invoices i ON i.project_id = p.id
              LEFT JOIN fx_rates r ON r.base_currency = $1 AND r.target_currency = i.currency
             WHERE p.status <> 'ARCHIVED'
             GROUP BY p.id, p.project_name
             ORDER BY revenue DESC LIMIT 5
        `, [BASE_CURRENCY]);
        if (rows.length === 0) return { answer: 'No active projects yet.' };
        const lines = rows.map((p) => {
            const gross = Math.round(Number(p.revenue) - Number(p.expenses));
            const hours = p.minutes > 0 ? (p.minutes / 60).toFixed(1) : null;
            const perHour = p.minutes > 0 ? Math.round(Number(p.revenue) / (p.minutes / 60)) : null;
            return `• ${p.project_name} — revenue ${money(p.revenue)}, expenses ${money(p.expenses)}, gross ${money(gross)}${hours ? `, ${hours}h${perHour ? ` (${money(perHour)}/h)` : ''}` : ''}`;
        });
        return { answer: `Most profitable active projects:\n${lines.join('\n')}\nHours use logged actual time, falling back to task estimates.`, data: rows, link: '/admin/reports' };
    },

    async attention() {
        const [overdueInv, staleLeads, waiting, blockedTasks, stalledOnb] = await Promise.all([
            pool.query(`SELECT COUNT(*)::int AS n FROM invoices WHERE status IN ('PENDING','OVERDUE') AND due_date < NOW()`),
            pool.query(`SELECT COUNT(*)::int AS n FROM leads WHERE stage IN ('LEAD','QUALIFIED','PROPOSAL','NEGOTIATION') AND updated_at < NOW() - INTERVAL '48 hours'`),
            pool.query(`SELECT COUNT(*)::int AS n FROM client_actions WHERE status = 'PENDING'`),
            pool.query(`SELECT COUNT(*)::int AS n FROM tasks WHERE blocked AND status NOT IN ('DONE','CANCELLED')`),
            pool.query(`SELECT COUNT(*)::int AS n FROM client_onboardings WHERE status = 'SUBMITTED'`),
        ]);
        const items = [
            [overdueInv.rows[0].n, 'overdue invoice(s) to chase'],
            [staleLeads.rows[0].n, 'lead(s) quiet for 48h+'],
            [waiting.rows[0].n, 'client action(s) pending'],
            [blockedTasks.rows[0].n, 'blocked task(s)'],
            [stalledOnb.rows[0].n, 'submitted onboarding(s) to review'],
        ].filter(([n]) => n > 0);
        if (items.length === 0) return { answer: 'All clear — nothing needs your attention. ✅' };
        return { answer: `Needs your attention:\n${items.map(([n, label]) => `• ${n} ${label}`).join('\n')}`, link: '/admin' };
    },
};

const INTENT_MATCHERS = [
    ['outstanding', /\b(owe[sd]?\b|outstanding|unpaid|who\s+owes|owed)/i],
    ['overdue', /overdue/i],
    ['tonight', /\btonight\b|\btoday'?s?\s+(queue|work|tasks)\b|\bqueue\b/i],
    ['waiting', /waiting\s+on|waiting\s+for|awaiting|client\s+action/i],
    ['revenue', /revenue|income|earned|collected|sales\b/i],
    ['renewals', /renewal|expir/i],
    ['blocked', /blocked|stuck/i],
    ['onboarding', /onboard/i],
    ['quotations', /quot(e|ation|es|ations)\b/i],
    ['expenses', /expense|spend|spent|costs?\b/i],
    ['profitability', /profitab|per\s+hour|hourly|gross\b/i],
    ['leads', /\bleads?\b|follow.?up|prospect/i],
    ['attention', /attention|what\s+should\s+i|priorit|focus|next\b/i],
];

export const ASSISTANT_CAPABILITIES = [
    'What needs my attention?',
    'Who owes me money?',
    'What invoices are overdue?',
    "What's on tonight's queue?",
    'What am I waiting on from clients?',
    'Which leads need follow-up?',
    "What's my revenue this month?",
    'What renewals are coming up?',
    'What work is blocked?',
    'How are onboardings going?',
    'Any active quotations?',
    'What did I spend this month?',
    'Which projects are most profitable?',
];

async function answerByIntent(intent) {
    const handler = HANDLERS[intent];
    if (!handler) return null;
    try {
        return await handler();
    } catch (err) {
        console.error('[Assistant] intent handler error:', intent, err.message);
        return { answer: `Something went wrong answering that (${intent}). Check the logs.` };
    }
}

/**
 * Main entry. Returns
 * { intent, source: 'rules'|'ai'|'help', answer, data?, link? }
 */
export async function askAssistant(question) {
    const q = String(question || '').trim();
    if (!q) return { intent: null, source: 'help', answer: helpText() };

    for (const [intent, re] of INTENT_MATCHERS) {
        if (re.test(q)) {
            const result = await answerByIntent(intent);
            return { intent, source: 'rules', ...result, answer: result?.answer || 'Nothing to report.' };
        }
    }

    // No deterministic match — AI narrates over a compact snapshot.
    if (isAiConfigured()) {
        try {
            const snapshot = await buildSnapshot();
            const answer = await chat([
                {
                    role: 'system',
                    content: 'You are the BuildWithLami admin assistant — a solo founder asks about their agency data. Answer ONLY from the JSON snapshot provided. Never invent numbers, names or dates. If the answer is not in the data, say so. Keep it under 120 words, plain text, concrete. Currency amounts appear pre-formatted — do not convert.',
                },
                { role: 'user', content: `Question: ${q}\n\nData snapshot:\n${JSON.stringify(snapshot)}` },
            ], { maxTokens: 300 });
            return { intent: 'ai_general', source: 'ai', answer };
        } catch (err) {
            console.log('[Assistant] AI unavailable:', err.reason || err.message);
        }
    }

    return { intent: null, source: 'help', answer: `${helpText()}` };
}

function helpText() {
    return `I can answer questions like:\n${ASSISTANT_CAPABILITIES.map((c) => `• ${c}`).join('\n')}`;
}

// Compact snapshot for the AI fallback — capped, cheap queries.
async function buildSnapshot() {
    const safe = async (fn, fallback) => { try { return (await fn()) ?? fallback; } catch { return fallback; } };
    const [attention, outstanding, tonight, leads] = await Promise.all([
        safe(() => answerByIntent('attention'), null),
        safe(() => answerByIntent('outstanding'), null),
        safe(() => answerByIntent('tonight'), null),
        safe(() => answerByIntent('leads'), null),
    ]);
    return {
        attention: attention?.answer ?? 'unavailable',
        outstanding: outstanding?.answer ?? 'unavailable',
        tonight: tonight?.answer ?? 'unavailable',
        leads: leads?.answer ?? 'unavailable',
    };
}
