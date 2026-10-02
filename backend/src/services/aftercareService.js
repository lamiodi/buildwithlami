// ─── src/services/aftercareService.js ─────────────────────
// Admin OS Phase 5 — Offboarding / Retention engine
// (blueprint §47 Renewals, §49 Monitoring, §51–§53 Handover
// + Post-Launch).
//
//   launchProject({ projectId })        — move a project to
//     LAUNCHED and fire onProjectLaunched.
//
//   onProjectLaunched({ projectId })    — the §58 "Project
//     Launched" automation: creates the 7-day check, 30-day
//     check, testimonial request, referral request,
//     maintenance follow-up and renewal review as ADMIN tasks
//     with deterministic dedup_keys (§89 — re-runs are no-ops).
//
//   checkRenewalAlerts()                — cron daily: alerts at
//     T-60/30/14/7 and on overdue renewals (deduped).
//
//   runMonitorChecks()                  — cron every 15 min:
//     HTTP check per enabled monitor, SSL expiry probe, events
//     recorded, DOWN/RECOVERY/SSL alerts (deduped). Deliberately
//     gentle — free-tier friendly (§49).
//     pruneMonitorEvents()               — trims >30 days of events.
//
// Handover helpers (§51) share this module because completion
// and launch both mutate the project lifecycle:
//   getHandoverState / startHandover / setChecklistItem /
//   completeHandover.
//
// All cron-facing functions NEVER THROW and are IDEMPOTENT —
// same contract as automationService (§89, §97.17).
// ──────────────────────────────────────────────────────────

import tls from 'node:tls';
import pool from '../config/db.js';
import { writeAuditLog } from '../utils/auditLog.js';
import { createNotification } from '../controllers/notificationController.js';
import { sendNotificationEmail } from './emailService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || null;

// ══════════════════════════════════════════════════════════
// Shared plumbing
// ══════════════════════════════════════════════════════════

async function getOwnerUserId() {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE lower(role) = 'owner' ORDER BY created_at LIMIT 1`
    );
    return rows[0]?.id || null;
}

/**
 * Deduped admin notification (same shape as automationService /
 * cronService). `windowDays` controls how long the bucket stays
 * quiet after firing; a re-fire updates sent_at.
 */
async function notifyOwnerOnce(entityType, entityId, bucket, { type, title, body, link }, windowDays = 30) {
    try {
        const ownerId = await getOwnerUserId();
        if (!ownerId) return;

        const { rows: seen } = await pool.query(
            `SELECT 1 FROM notification_dedup
              WHERE entity_type = $1 AND entity_id = $2 AND bucket = $3
                AND sent_at > NOW() - ($4 || ' days')::interval
              LIMIT 1`,
            [entityType, String(entityId), bucket, String(windowDays)]
        );
        if (seen.length > 0) return;

        await pool.query(
            `INSERT INTO notification_dedup (entity_type, entity_id, bucket, sent_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT (entity_type, entity_id, bucket)
             DO UPDATE SET sent_at = EXCLUDED.sent_at`,
            [entityType, String(entityId), bucket]
        );
        await createNotification({ userId: ownerId, type, title, body, link });
    } catch (err) {
        console.error('[Aftercare] notifyOwnerOnce error:', err.message);
    }
}

/**
 * Best-effort admin email (used by cron alerts). Never throws —
 * SMTP may be unconfigured locally (see onboardingEmailService).
 */
async function emailAdmin(subject, message) {
    if (!ADMIN_EMAIL) return;
    try {
        await sendNotificationEmail({
            name: 'Buildwith_lami System',
            email: 'no-reply@buildwithlami.com',
            toEmail: ADMIN_EMAIL,
            subject,
            message,
        });
    } catch (err) {
        console.error('[Aftercare] admin email failed:', err.message);
    }
}

// ══════════════════════════════════════════════════════════
// Handover (§51) — checklist lives on client_projects
// (offboarding_checklist JSONB from v6, timestamps from v51)
// ══════════════════════════════════════════════════════════

/** §51 checklist. Required items must be done before completion. */
export const HANDOVER_TEMPLATE = [
    { key: 'final_approval',          label: 'Final client approval received',                        required: true },
    { key: 'final_invoice_paid',      label: 'Final invoice paid',                                    required: true },
    { key: 'domain_confirmed',        label: 'Production domain confirmed — DNS, SSL, www redirect',  required: true },
    { key: 'credentials_transferred', label: 'Credentials transferred or collaborator access confirmed', required: true },
    { key: 'client_admin_account',    label: 'Client admin account created',                          required: true },
    { key: 'analytics_configured',    label: 'Analytics configured',                                  required: false },
    { key: 'search_console',          label: 'Search Console configured',                             required: false },
    { key: 'gateway_ownership',       label: 'Payment gateway ownership confirmed',                   required: false },
    { key: 'business_email',          label: 'Business email confirmed',                              required: false },
    { key: 'client_training',         label: 'Client training completed',                             required: true },
    { key: 'documentation',           label: 'Documentation delivered',                               required: false },
    { key: 'maintenance_option',      label: 'Maintenance option selected',                           required: false },
    { key: 'backup_completed',        label: 'Final backup completed',                                required: true },
    { key: 'repo_access',             label: 'Repository ownership / access confirmed',               required: false },
];

const checklistFromTemplate = () =>
    HANDOVER_TEMPLATE.map((item) => ({ ...item, done: false, done_at: null, note: null }));

const PROJECT_FOR_HANDOVER_SQL = `
    SELECT cp.id, cp.project_name, cp.status, cp.payment_status,
           cp.offboarding_status, cp.offboarding_checklist,
           cp.offboarding_started_at, cp.offboarding_completed_at,
           cp.domain_name, cp.client_id, cp.next_action,
           c.name AS client_name, c.primary_contact_email
      FROM client_projects cp
      LEFT JOIN clients c ON c.id = cp.client_id
     WHERE cp.id = $1`;

const missingRequired = (checklist) =>
    (checklist || [])
        .filter((i) => i.required && !i.done)
        .map((i) => i.label);

export async function getHandoverState(projectId) {
    const { rows } = await pool.query(PROJECT_FOR_HANDOVER_SQL, [projectId]);
    const project = rows[0];
    if (!project) return null;

    let checklist = Array.isArray(project.offboarding_checklist) ? project.offboarding_checklist : [];
    if (checklist.length === 0) checklist = checklistFromTemplate();

    return {
        project: {
            id: project.id,
            project_name: project.project_name,
            status: project.status,
            payment_status: project.payment_status,
            client_id: project.client_id,
            client_name: project.client_name,
            client_email: project.primary_contact_email,
            domain_name: project.domain_name,
            offboarding_status: project.offboarding_status,
            offboarding_started_at: project.offboarding_started_at,
            offboarding_completed_at: project.offboarding_completed_at,
            next_action: project.next_action,
        },
        checklist,
        missing_required: missingRequired(checklist),
    };
}

export async function startHandover(projectId) {
    const state = await getHandoverState(projectId);
    if (!state) return null;

    // Don't clobber an in-flight checklist — idempotent start (§89).
    const { rows } = await pool.query(
        `UPDATE client_projects
            SET offboarding_status = CASE
                    WHEN offboarding_status = 'COMPLETED' THEN 'COMPLETED'
                    ELSE 'IN_PROGRESS' END,
                offboarding_checklist = CASE
                    WHEN COALESCE(jsonb_array_length(offboarding_checklist), 0) = 0
                        THEN $2::jsonb
                    ELSE offboarding_checklist END,
                offboarding_started_at = COALESCE(offboarding_started_at, NOW()),
                updated_at = NOW()
          WHERE id = $1
         RETURNING offboarding_checklist`,
        [projectId, JSON.stringify(checklistFromTemplate())]
    );
    return getHandoverState(projectId);
}

export async function setChecklistItem(projectId, key, done, note = null) {
    // Read-modify-write inside a transaction with a row lock so two
    // quick toggles can't lose updates (blueprint §97.11).
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `SELECT offboarding_checklist, offboarding_status
               FROM client_projects WHERE id = $1 FOR UPDATE`,
            [projectId]
        );
        if (rows.length === 0) {
            await client.query('ROLLBACK');
            return { notFound: true };
        }
        let checklist = Array.isArray(rows[0].offboarding_checklist)
            ? rows[0].offboarding_checklist
            : checklistFromTemplate();
        if (checklist.length === 0) checklist = checklistFromTemplate();

        const item = checklist.find((i) => i.key === key);
        if (!item) {
            await client.query('ROLLBACK');
            return { badKey: true };
        }
        item.done = !!done;
        item.done_at = done ? new Date().toISOString() : null;
        item.note = note === undefined ? item.note : note;

        const allRequiredDone = checklist.filter((i) => i.required).every((i) => i.done);
        await client.query(
            `UPDATE client_projects
                SET offboarding_checklist = $2::jsonb,
                    offboarding_status = CASE
                        WHEN offboarding_status = 'COMPLETED' THEN 'COMPLETED'
                        ELSE 'IN_PROGRESS' END,
                    offboarding_started_at = COALESCE(offboarding_started_at, NOW()),
                    updated_at = NOW()
              WHERE id = $1`,
            [projectId, JSON.stringify(checklist)]
        );
        await client.query('COMMIT');
        return { checklist, allRequiredDone, missing: missingRequired(checklist) };
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
    } finally {
        client.release();
    }
}

/**
 * §51/§96 — complete the handover. Every required checklist item
 * must be done; the project then moves to MAINTENANCE (plan in
 * place) or ARCHIVED (finished). This is the only place that may
 * move a project off the active queue as part of offboarding.
 */
export async function completeHandover(projectId, nextStatus, actor) {
    const state = await getHandoverState(projectId);
    if (!state) return { notFound: true };
    if (state.missing_required.length > 0) {
        return { blocked: true, missing: state.missing_required };
    }

    const nextAction = nextStatus === 'MAINTENANCE'
        ? 'Monthly maintenance check'
        : null;

    const { rows } = await pool.query(
        `UPDATE client_projects
            SET status = $2,
                offboarding_status = 'COMPLETED',
                offboarding_completed_at = NOW(),
                next_action = $3,
                next_action_due_at = CASE WHEN $3 IS NULL THEN NULL
                                          ELSE NOW() + INTERVAL '30 days' END,
                updated_at = NOW()
          WHERE id = $1
         RETURNING id, project_name, status`,
        [projectId, nextStatus, nextAction]
    );

    writeAuditLog({
        action: 'HANDOVER_COMPLETED',
        entityType: 'client_projects',
        entityId: projectId,
        details: { nextStatus, project: rows[0]?.project_name },
        user: actor,
    }).catch(() => {});

    await notifyOwnerOnce('project', projectId, 'handover_completed', {
        type: 'project',
        title: 'Handover completed',
        body: `${rows[0]?.project_name || 'Project'} handed over — status is now ${nextStatus}.${nextStatus === 'MAINTENANCE' ? ' Monthly maintenance check scheduled.' : ''}`,
        link: `/admin/projects/${projectId}`,
    });

    return { project: rows[0] };
}

// ══════════════════════════════════════════════════════════
// Launch + post-launch automation (§53, §58, §89)
// ══════════════════════════════════════════════════════════

const POST_LAUNCH_TASKS = [
    { slug: '7day-check',   title: '7-Day Post-Launch Check',   dueDays: 7,  priority: 'HIGH',   minutes: 30,
      description: 'Verify the live site: forms, checkout, emails, mobile, analytics receiving data. Fix anything that broke in week one.' },
    { slug: '30day-check',  title: '30-Day Post-Launch Check',  dueDays: 30, priority: 'MEDIUM', minutes: 30,
      description: 'Second look after a month: uptime, SEO indexing, client usage questions, small polish items.' },
    { slug: 'testimonial',  title: 'Request a testimonial',     dueDays: 14, priority: 'MEDIUM', minutes: 15,
      description: 'Ask the client for a short testimonial. Record consent in Aftercare → Testimonials before publishing.' },
    { slug: 'referral',     title: 'Request a referral',        dueDays: 21, priority: 'LOW',    minutes: 10,
      description: 'Send the client their referral link (Aftercare → Referrals) and ask for one introduction.' },
    { slug: 'maintenance',  title: 'Maintenance follow-up',     dueDays: 45, priority: 'MEDIUM', minutes: 15,
      description: 'Propose a maintenance plan if none is active yet, or check in on the existing plan.' },
    { slug: 'renewal',      title: 'Renewal review',            dueDays: 60, priority: 'MEDIUM', minutes: 15,
      description: 'Confirm domain / hosting / email renewal dates are recorded in Aftercare → Renewals with amounts.' },
];

export async function onProjectLaunched({ projectId, actor }) {
    const summary = { created: 0, skipped: false };
    try {
        if (!isUuid(projectId)) { summary.reason = 'bad-id'; return summary; }

        const { rows: proj } = await pool.query(
            `SELECT id, project_name, client_id FROM client_projects WHERE id = $1`,
            [projectId]
        );
        if (proj.length === 0) { summary.reason = 'not-found'; return summary; }
        const project = proj[0];

        for (const t of POST_LAUNCH_TASKS) {
            const { rowCount } = await pool.query(
                `INSERT INTO tasks
                    (client_id, project_id, title, description, owner_type,
                     status, priority, estimated_minutes, due_at, dedup_key)
                 VALUES ($1, $2, $3, $4, 'ADMIN', 'TODO', $5, $6,
                         NOW() + ($7 || ' days')::interval, $8)
                 ON CONFLICT (dedup_key) WHERE dedup_key IS NOT NULL DO NOTHING`,
                [project.client_id, project.id, t.title, t.description,
                 t.priority, t.minutes, String(t.dueDays), `postlaunch:${project.id}:${t.slug}`]
            );
            summary.created += rowCount || 0;
        }

        // Point the project at its next step (§30).
        await pool.query(
            `UPDATE client_projects
                SET next_action = COALESCE(next_action, '7-day post-launch check'),
                    next_action_due_at = COALESCE(next_action_due_at, NOW() + INTERVAL '7 days'),
                    updated_at = NOW()
              WHERE id = $1`,
            [projectId]
        );

        writeAuditLog({
            action: 'POST_LAUNCH_TASKS_CREATED',
            entityType: 'client_projects',
            entityId: projectId,
            details: { created: summary.created, automated: true, trigger: 'project.launched' },
            user: actor,
        }).catch(() => {});

        await notifyOwnerOnce('project', projectId, 'postlaunch', {
            type: 'project',
            title: 'Project launched 🚀',
            body: `${project.project_name} is live — ${summary.created} post-launch check(s) scheduled (7-day, 30-day, testimonial, referral, maintenance, renewal).`,
            link: `/admin/projects/${projectId}`,
        });

        return summary;
    } catch (err) {
        console.error('[Aftercare] onProjectLaunched error:', err.message);
        writeAuditLog({
            action: 'AUTOMATION_FAILED',
            entityType: 'client_projects',
            entityId: projectId,
            details: { trigger: 'project.launched', error: err.message },
        }).catch(() => {});
        summary.reason = 'error';
        return summary;
    }
}

/**
 * Move a project to LAUNCHED and fire the post-launch automation.
 * Called from POST /api/aftercare/projects/:id/launch — the
 * supported launch path (a bare PATCH of status would skip §53).
 */
export async function launchProject(projectId, actor) {
    const { rows } = await pool.query(
        `UPDATE client_projects
            SET status = 'LAUNCHED',
                updated_at = NOW()
          WHERE id = $1
            AND status NOT IN ('LAUNCHED', 'ARCHIVED')
         RETURNING id, project_name`,
        [projectId]
    );
    if (rows.length === 0) return { alreadyLaunched: true };

    writeAuditLog({
        action: 'PROJECT_LAUNCHED',
        entityType: 'client_projects',
        entityId: projectId,
        details: { project: rows[0].project_name },
        user: actor,
    }).catch(() => {});

    const automation = await onProjectLaunched({ projectId, actor });
    return { project: rows[0], automation };
}

// ══════════════════════════════════════════════════════════
// Renewal alerts (§47) — cron daily
// ══════════════════════════════════════════════════════════

const RENEWAL_BUCKETS = [60, 30, 14, 7];

export async function checkRenewalAlerts() {
    const summary = { alerted: 0, overdue: 0 };
    try {
        const { rows } = await pool.query(
            `SELECT r.id, r.label, r.service, r.renewal_date, r.amount, r.currency,
                    r.client_id, c.name AS client_name
               FROM renewals r
               LEFT JOIN clients c ON c.id = r.client_id
              WHERE r.status = 'ACTIVE'
                AND r.renewal_date <= CURRENT_DATE + INTERVAL '60 days'
              ORDER BY r.renewal_date ASC`
        );

        for (const r of rows) {
            const days = Math.round((new Date(r.renewal_date) - new Date()) / 86_400_000);
            const bucket = days < 0 ? 'OVERDUE' : `T-${days}`;
            if (days >= 0 && !RENEWAL_BUCKETS.includes(days)) continue;

            // T-buckets fire once per cycle; OVERDUE nags weekly.
            const windowDays = days < 0 ? 6 : 30;
            const ownerId = await getOwnerUserId();
            if (!ownerId) return summary;

            const { rows: seen } = await pool.query(
                `SELECT 1 FROM notification_dedup
                  WHERE entity_type = 'renewal' AND entity_id = $1 AND bucket = $2
                    AND sent_at > NOW() - ($3 || ' days')::interval
                  LIMIT 1`,
                [String(r.id), bucket, String(windowDays)]
            );
            if (seen.length > 0) continue;

            await pool.query(
                `INSERT INTO notification_dedup (entity_type, entity_id, bucket, sent_at)
                 VALUES ('renewal', $1, $2, NOW())
                 ON CONFLICT (entity_type, entity_id, bucket)
                 DO UPDATE SET sent_at = EXCLUDED.sent_at`,
                [String(r.id), bucket]
            );

            const when = days < 0 ? `overdue by ${Math.abs(days)} day(s)`
                : `due in ${days} day(s)`;
            const money = r.amount != null ? ` (${r.currency} ${Number(r.amount).toLocaleString()})` : '';
            await createNotification({
                userId: ownerId,
                type: 'renewal',
                title: days < 0 ? `Renewal OVERDUE: ${r.label}` : `Renewal due ${when}: ${r.label}`,
                body: `${r.client_name || 'Client'} — ${r.service.toLowerCase()} renewal ${when}${money}.`,
                link: '/admin/aftercare',
            });
            await emailAdmin(
                `⟳ Renewal ${days < 0 ? 'OVERDUE' : `due ${when}`}: ${r.label}`,
                `${r.label} (${r.service}) for ${r.client_name || 'a client'} is ${when}.${money}\nManage: /admin/aftercare`
            );

            summary.alerted++;
            if (days < 0) summary.overdue++;
        }
        return summary;
    } catch (err) {
        console.error('[Aftercare] checkRenewalAlerts error:', err.message);
        return { ...summary, reason: 'error' };
    }
}

// ══════════════════════════════════════════════════════════
// Site monitoring (§49) — cron every 15 minutes
// ══════════════════════════════════════════════════════════

const CHECK_TIMEOUT_MS = 10_000;

/** Probe certificate expiry for an https host. Resolves null on failure. */
function sslExpiryFor(urlObj) {
    if (urlObj.protocol !== 'https:') return Promise.resolve(null);
    return new Promise((resolve) => {
        const socket = tls.connect(
            { host: urlObj.hostname, port: 443, servername: urlObj.hostname, rejectUnauthorized: false },
            () => {
                try {
                    const cert = socket.getPeerCertificate();
                    resolve(cert?.valid_to ? new Date(cert.valid_to) : null);
                } catch {
                    resolve(null);
                } finally {
                    socket.destroy();
                }
            }
        );
        socket.setTimeout(8_000, () => { socket.destroy(); resolve(null); });
        socket.on('error', () => resolve(null));
    });
}

async function checkSingleMonitor(monitor) {
    const result = { status: 'DOWN', statusCode: null, responseMs: null, error: null, sslExpiry: null };
    const started = Date.now();
    let urlObj;
    try {
        urlObj = new URL(monitor.url);
    } catch {
        result.error = 'Invalid URL';
        return result;
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
        const res = await fetch(monitor.url, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: { 'User-Agent': 'BuildWithLami-Monitor/1.0' },
        });
        clearTimeout(timer);
        result.statusCode = res.status;
        result.responseMs = Date.now() - started;
        result.status = res.ok ? 'UP' : 'DOWN';
        if (!res.ok) result.error = `HTTP ${res.status}`;
    } catch (err) {
        result.responseMs = Date.now() - started;
        result.error = err.name === 'AbortError' ? `Timeout after ${CHECK_TIMEOUT_MS / 1000}s` : err.message;
    }

    result.sslExpiry = await sslExpiryFor(urlObj);
    return result;
}

export async function runMonitorChecks() {
    const summary = { checked: 0, down: 0, recovered: 0, alerted: 0 };
    try {
        const { rows: monitors } = await pool.query(
            `SELECT * FROM site_monitors WHERE enabled`
        );

        for (const monitor of monitors) {
            const check = await checkSingleMonitor(monitor);
            summary.checked++;

            const failures = check.status === 'UP' ? 0 : monitor.consecutive_failures + 1;
            const recovered = check.status === 'UP' && monitor.last_status === 'DOWN';

            await pool.query(
                `UPDATE site_monitors
                    SET last_checked_at = NOW(),
                        last_status = $2,
                        last_status_code = $3,
                        last_response_time_ms = $4,
                        last_error = $5,
                        ssl_expires_at = COALESCE($6, ssl_expires_at),
                        consecutive_failures = $7,
                        updated_at = NOW()
                  WHERE id = $1`,
                [monitor.id, check.status, check.statusCode, check.responseMs,
                 check.error, check.sslExpiry, failures]
            );
            await pool.query(
                `INSERT INTO site_monitor_events (monitor_id, status, status_code, response_time_ms, error)
                 VALUES ($1, $2, $3, $4, $5)`,
                [monitor.id, check.status, check.statusCode, check.responseMs, check.error]
            );

            if (check.status === 'DOWN') summary.down++;

            // Alert on the 2nd consecutive failure (one flaky request
            // shouldn't page the founder) and on recovery.
            const justWentDown = failures === 2;
            if (justWentDown || recovered) {
                await notifyOwnerOnce(
                    'site_monitor', monitor.id, recovered ? 'RECOVERY' : 'DOWN',
                    {
                        type: 'system',
                        title: recovered
                            ? `Back up: ${monitor.name}`
                            : `Site DOWN: ${monitor.name}`,
                        body: recovered
                            ? `${monitor.url} is responding again.`
                            : `${monitor.url} failed twice in a row — ${check.error || 'no response'}.`,
                        link: '/admin/aftercare?tab=monitors',
                    },
                    recovered ? 1 : 1
                );
                summary.alerted++;
                await emailAdmin(
                    recovered ? `✔ Recovered: ${monitor.name}` : `🚨 Site DOWN: ${monitor.name}`,
                    recovered
                        ? `${monitor.url} is responding again.`
                        : `${monitor.url} failed twice in a row — ${check.error || 'no response'}.\nManage: /admin/aftercare`
                );
                if (recovered) summary.recovered++;
            }

            // SSL expiring within 14 days — weekly nag.
            if (check.sslExpiry) {
                const sslDays = Math.round((check.sslExpiry - new Date()) / 86_400_000);
                if (sslDays <= 14) {
                    await notifyOwnerOnce(
                        'site_monitor', monitor.id, 'SSL14',
                        {
                            type: 'system',
                            title: `SSL expiring: ${monitor.name}`,
                            body: `Certificate for ${monitor.url} expires in ${sslDays} day(s).`,
                            link: '/admin/aftercare?tab=monitors',
                        },
                        7
                    );
                }
            }
        }

        return summary;
    } catch (err) {
        console.error('[Aftercare] runMonitorChecks error:', err.message);
        return { ...summary, reason: 'error' };
    }
}

export async function pruneMonitorEvents() {
    try {
        const { rowCount } = await pool.query(
            `DELETE FROM site_monitor_events WHERE checked_at < NOW() - INTERVAL '30 days'`
        );
        return { pruned: rowCount || 0 };
    } catch (err) {
        console.error('[Aftercare] pruneMonitorEvents error:', err.message);
        return { pruned: 0, reason: 'error' };
    }
}
