// ─── src/services/intelligenceService.js ──────────────────
// Admin OS Phase 6 (Intelligence) — deterministic scoring and
// planning (blueprint §31, §33, §74, §78), plus AI-enriched
// client summaries.
//
// Everything in here is rules-based and explainable on purpose:
// the blueprint (§74) forbids silently reordering contractual
// obligations with opaque AI — every ranked item carries the
// reasons that put it there. AI only ever writes prose
// (client summaries), never re-scores work.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { getAllRates, BASE_CURRENCY } from '../utils/fx.js';
import { isAiConfigured, chatJson } from './aiService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// ── Tonight Queue scoring (§74) ───────────────────────────
// Weights are additive so ties resolve deterministically and
// the top reason always explains the rank.
const SCORE_WEIGHTS = {
    OVERDUE: 40,
    DUE_TODAY: 30,
    URGENT: 25,
    BLOCKS_PAYMENT: 18,
    BLOCKS_LAUNCH: 18,
    HIGH: 15,
    DUE_TOMORROW: 12,
    CLIENT_WAITING: 8,
    IN_PROGRESS: 5,
    QUICK_WIN: 5,
    DUE_SOON: 6,
};

const REASON_LABELS = {
    OVERDUE: 'Overdue',
    DUE_TODAY: 'Due today',
    URGENT: 'Urgent priority',
    BLOCKS_PAYMENT: 'Blocks payment',
    BLOCKS_LAUNCH: 'Blocks launch',
    HIGH: 'High priority',
    DUE_TOMORROW: 'Due tomorrow',
    CLIENT_WAITING: 'Client waiting on this project',
    IN_PROGRESS: 'Already in progress',
    QUICK_WIN: 'Quick win (≤30 min)',
    DUE_SOON: 'Due within 3 days',
};

const MONEY_RE = /invoice|payment|checkout|deposit|receipt|pay\b/i;
const LAUNCH_RE = /launch|deploy|go.?live|dns|ssl|domain/i;

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const daysFromToday = (dueAt) => {
    if (!dueAt) return null;
    return Math.round((startOfDay(dueAt) - startOfDay(new Date())) / 86400000);
};

/**
 * Pure scoring — exported for tests.
 *
 * @param {Array<object>} tasks   open tasks with due_at, priority,
 *     estimated_minutes, blocked, blocked_reason, project_id …
 * @param {object} context
 * @param {Set<string>} context.overdueInvoiceProjectIds
 * @param {Set<string>} context.launchImminentProjectIds
 * @param {Set<string>} context.clientWaitingProjectIds
 * @returns {Array<object>} tasks + { score, reasons, reason }
 *     (blocked tasks sink to the bottom with score -1)
 */
export function scoreTonightQueue(tasks, context = {}) {
    const {
        overdueInvoiceProjectIds = new Set(),
        launchImminentProjectIds = new Set(),
        clientWaitingProjectIds = new Set(),
    } = context;

    const scored = tasks.map((t) => {
        const reasons = [];
        const bump = (key) => {
            reasons.push(REASON_LABELS[key]);
            return SCORE_WEIGHTS[key];
        };
        let score = 0;

        const day = daysFromToday(t.due_at);
        if (t.overdue || (day !== null && day < 0)) score += bump('OVERDUE');
        else if (day === 0) score += bump('DUE_TODAY');
        else if (day === 1) score += bump('DUE_TOMORROW');
        else if (day !== null && day <= 3) score += bump('DUE_SOON');

        if (t.priority === 'URGENT') score += bump('URGENT');
        else if (t.priority === 'HIGH') score += bump('HIGH');

        if (t.project_id) {
            if (overdueInvoiceProjectIds.has(t.project_id) && MONEY_RE.test(`${t.title} ${t.description || ''}`)) {
                score += bump('BLOCKS_PAYMENT');
            }
            if (launchImminentProjectIds.has(t.project_id)) score += bump('BLOCKS_LAUNCH');
            if (clientWaitingProjectIds.has(t.project_id)) score += bump('CLIENT_WAITING');
        }

        if (t.status === 'IN_PROGRESS') score += bump('IN_PROGRESS');
        if (t.estimated_minutes && t.estimated_minutes <= 30) score += bump('QUICK_WIN');

        // Blocked work cannot be done tonight — keep it visible
        // but pinned to the bottom (§5 "blocked/unblocked state").
        if (t.blocked) return { ...t, score: -1, reasons: [`Blocked — ${t.blocked_reason || 'no reason given'}`], reason: 'Blocked' };

        // Primary reason = the highest-weight one present.
        const order = ['Overdue', 'Due today', 'Urgent priority', 'Blocks payment', 'Blocks launch', 'High priority', 'Due tomorrow', 'Client waiting on this project', 'Due within 3 days', 'Already in progress', 'Quick win (≤30 min)'];
        const reason = order.find((label) => reasons.includes(label)) || 'Scheduled';

        return { ...t, score, reasons, reason };
    });

    return scored.sort((a, b) => b.score - a.score
        || new Date(a.due_at || '2999-01-01') - new Date(b.due_at || '2999-01-01')
        || a.title.localeCompare(b.title));
}

/**
 * Scored Tonight Queue + capacity context (§31, §74).
 * Candidate set is wider than Phase 1's: everything due within
 * 3 days, any URGENT/HIGH priority, overdue, or blocked work.
 */
export async function getTonightQueueData() {
    const [tasksRes, overdueInvRes, launchRes, clientWaitingRes, settingsRes] = await Promise.all([
        pool.query(`
            SELECT t.id, t.title, t.description, t.priority, t.status, t.due_at,
                   t.estimated_minutes, t.blocked, t.blocked_reason,
                   t.project_id, t.client_id,
                   c.name AS client_name, p.project_name,
                   (t.due_at < NOW()) AS overdue
              FROM tasks t
              LEFT JOIN clients c         ON c.id = t.client_id
              LEFT JOIN client_projects p ON p.id = t.project_id
             WHERE t.status NOT IN ('DONE', 'CANCELLED')
               AND t.owner_type = 'ADMIN'
               AND (
                    t.due_at < NOW() + INTERVAL '3 days'
                 OR t.priority IN ('URGENT', 'HIGH')
                 OR t.blocked
               )
             ORDER BY t.due_at ASC NULLS LAST
             LIMIT 40
        `),
        // Projects whose client owes overdue money — money-blocking
        // signal keyed by project_id for the scorer.
        pool.query(`
            SELECT DISTINCT i.project_id
              FROM invoices i
             WHERE i.status IN ('PENDING', 'OVERDUE')
               AND i.due_date < NOW()
               AND i.project_id IS NOT NULL
        `),
        // Launch-imminent: in client review or ≥80% built.
        pool.query(`
            SELECT id FROM client_projects
             WHERE status NOT IN ('LAUNCHED', 'MAINTENANCE', 'ARCHIVED')
               AND (status = 'REVIEW' OR progress >= 80)
        `),
        pool.query(`
            SELECT DISTINCT project_id FROM client_actions
             WHERE status = 'PENDING' AND project_id IS NOT NULL
        `),
        pool.query(`SELECT * FROM workload_settings WHERE id = 1`),
    ]);

    const overdueInvoiceProjectIds = new Set(overdueInvRes.rows.map((r) => r.project_id));
    const launchImminentProjectIds = new Set(launchRes.rows.map((r) => r.id));
    const clientWaitingProjectIds = new Set(clientWaitingRes.rows.map((r) => r.project_id));

    const queue = scoreTonightQueue(tasksRes.rows, {
        overdueInvoiceProjectIds,
        launchImminentProjectIds,
        clientWaitingProjectIds,
    }).slice(0, 12);

    const settings = settingsRes.rows[0];
    const capacityMinutes = settings
        ? Math.round(Number(settings.evening_capacity_hours) * 60)
        : 180;
    const committedMinutes = queue
        .filter((t) => !t.blocked)
        .reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);

    return {
        tonightQueue: queue,
        capacity: {
            capacityMinutes,
            committedMinutes,
            overCommitted: committedMinutes > capacityMinutes,
        },
    };
}

// ── Workload / capacity guardrail (§31) ───────────────────
export async function getWorkloadSettings() {
    const { rows } = await pool.query(`SELECT * FROM workload_settings WHERE id = 1`);
    return rows[0] || {
        id: 1, weekly_hours: 15, max_concurrent_builds: 3,
        evening_capacity_hours: 3, work_days: 'Mon–Sat', work_hours: '7:00 PM – 10:00 PM',
    };
}

export async function updateWorkloadSettings(patch) {
    const clean = {};
    if (patch.weekly_hours !== undefined) clean.weekly_hours = patch.weekly_hours;
    if (patch.max_concurrent_builds !== undefined) clean.max_concurrent_builds = patch.max_concurrent_builds;
    if (patch.evening_capacity_hours !== undefined) clean.evening_capacity_hours = patch.evening_capacity_hours;
    if (patch.work_days !== undefined) clean.work_days = patch.work_days;
    if (patch.work_hours !== undefined) clean.work_hours = patch.work_hours;

    const keys = Object.keys(clean);
    if (keys.length === 0) return getWorkloadSettings();

    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
        `UPDATE workload_settings SET ${sets}, updated_at = NOW() WHERE id = 1 RETURNING *`,
        keys.map((k) => clean[k])
    );
    return rows[0];
}

/**
 * Weekly plan: available vs committed hours (open admin tasks
 * due in the next 7 days) and concurrent-build headroom.
 */
export async function getWorkloadPlan() {
    const settings = await getWorkloadSettings();
    const [committedRes, buildsRes] = await Promise.all([
        pool.query(`
            SELECT COALESCE(SUM(estimated_minutes), 0)::int AS minutes
              FROM tasks
             WHERE status NOT IN ('DONE', 'CANCELLED')
               AND owner_type = 'ADMIN'
               AND due_at IS NOT NULL
               AND due_at < NOW() + INTERVAL '7 days'
        `),
        pool.query(`
            SELECT COUNT(*)::int AS count
              FROM client_projects
             WHERE status IN ('PLANNING', 'IN_PROGRESS', 'REVIEW')
        `),
    ]);

    const weeklyAvailableHours = Number(settings.weekly_hours);
    const committedHours = Number((committedRes.rows[0].minutes / 60).toFixed(1));
    return {
        settings,
        weeklyAvailableHours,
        committedHours,
        remainingHours: Number(Math.max(weeklyAvailableHours - committedHours, 0).toFixed(1)),
        overCommitted: committedHours > weeklyAvailableHours,
        activeBuilds: buildsRes.rows[0].count,
        maxConcurrentBuilds: settings.max_concurrent_builds,
        atBuildCapacity: buildsRes.rows[0].count >= settings.max_concurrent_builds,
    };
}

// ── Project profitability (§33) ───────────────────────────
// Revenue converts each PAID invoice to the reporting base
// (NGN) exactly like the existing dashboard queries; expenses
// are project-linked rows (v51). Hours use actual minutes where
// logged, estimated minutes of completed tasks as the fallback
// proxy — `hours_estimated` tells the UI when to label it.
export async function getProjectProfitability(projectId = null, { limit = 50 } = {}) {
    const rates = await getAllRates();
    const rate = (cur) => (cur === BASE_CURRENCY ? 1 : Number(rates?.[cur]?.rate || 0));

    const projectFilter = projectId ? 'AND p.id = $1' : '';
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 200));

    const { rows: projects } = await pool.query(`
        SELECT p.id, p.project_name, p.client_id, p.status, p.amount_due, c.name AS client_name
          FROM client_projects p
          LEFT JOIN clients c ON c.id = p.client_id
         WHERE p.status <> 'ARCHIVED' ${projectFilter}
         ORDER BY p.amount_due DESC
         LIMIT ${safeLimit}
    `, projectId ? [projectId] : []);

    if (projects.length === 0) return { projects: [], totals: emptyProfitTotals() };
    const ids = projects.map((p) => p.id);

    const [revenueRes, expenseRes, hoursRes] = await Promise.all([
        pool.query(`
            SELECT project_id, currency, COALESCE(SUM(amount), 0) AS amount
              FROM invoices
             WHERE status = 'PAID' AND project_id = ANY($1::uuid[])
             GROUP BY project_id, currency
        `, [ids]),
        pool.query(`
            SELECT project_id, COALESCE(SUM(amount), 0) AS amount
              FROM expenses
             WHERE project_id = ANY($1::uuid[])
             GROUP BY project_id
        `, [ids]),
        pool.query(`
            SELECT project_id,
                   COALESCE(SUM(COALESCE(actual_minutes, estimated_minutes)), 0)::int AS minutes,
                   COUNT(*) FILTER (WHERE actual_minutes IS NOT NULL) AS actual_count
              FROM tasks
             WHERE status = 'DONE' AND project_id = ANY($1::uuid[])
             GROUP BY project_id
        `, [ids]),
    ]);

    const revenueByProject = new Map();
    for (const r of revenueRes.rows) {
        revenueByProject.set(r.project_id, (revenueByProject.get(r.project_id) || 0) + Number(r.amount) * rate(r.currency));
    }
    const expensesByProject = new Map(expenseRes.rows.map((r) => [r.project_id, Number(r.amount)]));
    const hoursByProject = new Map(hoursRes.rows.map((r) => [r.project_id, r]));

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalMinutes = 0;

    const result = projects.map((p) => {
        const revenue = Math.round(revenueByProject.get(p.id) || 0);
        const expenses = Math.round(expensesByProject.get(p.id) || 0);
        const hoursRow = hoursByProject.get(p.id);
        const minutes = hoursRow?.minutes || 0;
        const hours = Number((minutes / 60).toFixed(1));
        const hoursEstimated = !hoursRow || hoursRow.actual_count === 0;

        totalRevenue += revenue;
        totalExpenses += expenses;
        totalMinutes += minutes;

        return {
            id: p.id,
            project_name: p.project_name,
            client_name: p.client_name,
            status: p.status,
            contract_value: Number(p.amount_due || 0),
            revenue,
            expenses,
            gross_contribution: revenue - expenses,
            hours,
            hours_estimated: hoursEstimated,
            revenue_per_hour: minutes > 0 ? Math.round(revenue / (minutes / 60)) : null,
        };
    }).sort((a, b) => b.gross_contribution - a.gross_contribution);

    return {
        baseCurrency: BASE_CURRENCY,
        projects: result,
        totals: {
            revenue: totalRevenue,
            expenses: totalExpenses,
            gross_contribution: totalRevenue - totalExpenses,
            hours: Number((totalMinutes / 60).toFixed(1)),
            revenue_per_hour: totalMinutes > 0 ? Math.round(totalRevenue / (totalMinutes / 60)) : null,
        },
    };
}

const emptyProfitTotals = () => ({
    revenue: 0, expenses: 0, gross_contribution: 0, hours: 0, revenue_per_hour: null,
});

// ── Client summary (§78) — rules core + AI polish ─────────
/**
 * Builds the §78 summary object from onboarding responses
 * (same shape as onboardingController.buildClientSummary, kept
 * local to avoid a controller→controller import), then asks the
 * LLM to write the readable summary when configured. Returns
 * { text, source } — 'ai' | 'rules'.
 */
export function buildRulesSummaryText(clientName, structured, project) {
    const lines = [`${clientName}`];
    lines.push(`Type: ${structured.type || project?.type || '—'}`);
    lines.push(`Markets: ${structured.markets?.length ? structured.markets.join(', ') : '—'}`);
    lines.push(`Currencies: ${structured.currencies?.length ? structured.currencies.join(', ') : '—'}`);
    lines.push(`Payments: ${structured.paymentMethods?.length ? structured.paymentMethods.join(', ') : '—'}`);
    lines.push(`Shipping: ${structured.shipping || '—'}`);
    const socials = Object.entries(structured.social || {}).filter(([, v]) => v);
    lines.push(`Social: ${socials.length ? socials.map(([k, v]) => `${k} ${v}`).join(', ') : '—'}`);
    lines.push(`Main Goal: ${structured.mainGoal || '—'}`);
    lines.push(`Assets Outstanding: ${structured.assetsOutstanding?.length ? structured.assetsOutstanding.join(', ') : 'None'}`);
    return lines.join('\n');
}

export async function generateClientSummary(clientId) {
    const { rows: clientRows } = await pool.query(
        `SELECT id, name, country, city, whatsapp_number, instagram, status, source FROM clients WHERE id = $1`,
        [clientId]
    );
    if (clientRows.length === 0) return { ok: false, reason: 'client_not_found' };
    const client = clientRows[0];

    const [onbRes, projectRes, invoiceRes] = await Promise.all([
        pool.query(`
            SELECT responses, project_type FROM client_onboardings
             WHERE client_id = $1 ORDER BY created_at DESC LIMIT 1
        `, [clientId]),
        pool.query(`
            SELECT project_name, status, progress FROM client_projects
             WHERE client_id = $1 AND status <> 'ARCHIVED'
             ORDER BY created_at DESC LIMIT 3
        `, [clientId]),
        pool.query(`
            SELECT currency, status, amount FROM invoices
             WHERE client_id = $1 ORDER BY created_at DESC LIMIT 10
        `, [clientId]),
    ]);

    const onboarding = onbRes.rows[0] || null;
    const structured = extractStructuredSummary(onboarding?.responses, onboarding?.project_type);
    const rulesText = buildRulesSummaryText(client.name, structured, { type: onboarding?.project_type });

    let text = rulesText;
    let source = 'rules';

    if (isAiConfigured()) {
        try {
            const snapshot = {
                client: {
                    name: client.name,
                    country: client.country,
                    city: client.city,
                    whatsapp: client.whatsapp_number,
                    instagram: client.instagram,
                },
                onboarding: {
                    project_type: onboarding?.project_type || null,
                    responses: onboarding?.responses || {},
                },
                projects: projectRes.rows,
                invoices: invoiceRes.rows.map((i) => ({ currency: i.currency, status: i.status, amount: Number(i.amount) })),
                structured_summary: structured,
            };
            const out = await chatJson([
                {
                    role: 'system',
                    content: 'You write terse internal client summaries for a solo web-agency owner. Use ONLY the JSON data provided — never invent facts. Output JSON: {"summary": string}. The summary is a short block (max ~120 words) following this shape: client name line, then "Type:", "Markets:", "Currencies:", "Payments:", "Shipping:", "Social:", "Main Goal:", "Assets Outstanding:" lines. Omit a line when its data is absent. Plain text inside the JSON string (\\n line breaks).',
                },
                { role: 'user', content: JSON.stringify(snapshot) },
            ], { maxTokens: 400 });
            if (typeof out?.summary === 'string' && out.summary.trim().length > 20) {
                text = out.summary.trim();
                source = 'ai';
            }
        } catch (err) {
            // Deterministic fallback — AI is a polish layer, never
            // a dependency (blueprint §97.15/16).
            console.log('[Intelligence] client summary AI unavailable:', err.reason || err.message);
        }
    }

    await pool.query(
        `UPDATE clients SET summary = $1, summary_source = $2, summary_generated_at = NOW(), updated_at = NOW()
          WHERE id = $3`,
        [text, source, clientId]
    );

    return { ok: true, summary: text, source, structured };
}

function extractStructuredSummary(responses, projectType) {
    const r = responses || {};
    const pick = (section, key) => r[section]?.[key];
    const list = (section, key) => {
        const v = pick(section, key);
        return Array.isArray(v) ? v.filter(Boolean) : v ? [v] : [];
    };

    const assetsOutstanding = [];
    if (pick('content', 'has_copy') === 'no') assetsOutstanding.push('Website copy / copywriting');
    if (pick('brand', 'has_logo') === 'no') assetsOutstanding.push('Logo files');
    if (pick('content', 'price_list') === false) assetsOutstanding.push('Price list');
    if (pick('policies', 'has_policies') === 'no') assetsOutstanding.push('Policy documents');
    if (pick('website', 'owns_domain') === 'no') assetsOutstanding.push('Domain purchase');

    return {
        type: projectType || null,
        markets: list('goals', 'countries_served'),
        currencies: list('ecommerce', 'currency'),
        paymentMethods: list('ecommerce', 'payment_providers'),
        shipping: pick('ecommerce', 'shipping_countries') || null,
        social: {
            instagram: pick('social', 'instagram') || null,
            tiktok: pick('social', 'tiktok') || null,
            facebook: pick('social', 'facebook') || null,
        },
        mainGoal: pick('goals', 'primary_purpose') || null,
        assetsOutstanding,
    };
}

export async function saveManualSummary(clientId, text) {
    const { rows } = await pool.query(
        `UPDATE clients SET summary = $1, summary_source = 'manual', summary_generated_at = NOW(), updated_at = NOW()
          WHERE id = $2 RETURNING summary, summary_source`,
        [text, clientId]
    );
    return rows[0] || null;
}
