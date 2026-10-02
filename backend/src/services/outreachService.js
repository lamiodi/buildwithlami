// ─── src/services/outreachService.js ──────────────────────
// Admin OS Phase 4 — Outreach engine (blueprint §18–§22, §19).
//
// Owns everything that must NEVER be bypassed by a caller:
//   • suppression / do-not-contact checks before every send
//   • global pause + daily send limit + sending window guards
//   • unsubscribe link injection into every outbound email
//   • sequence progression (next step + next_follow_up_at)
//   • stop-on-reply (cancels queued sequence steps)
//   • bounce detection → auto-suppression
//
// sendProspectEmail is the single funnel — the controller's
// manual send and the cron's automated follow-ups both call it,
// so a guard added here protects both paths.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import {
    escapeHtml,
    renderEmailShell,
    createTransporter,
    getLogoAttachments,
} from './emailLayout.js';
import { writeAuditLog } from '../utils/auditLog.js';
import { createNotification } from '../controllers/notificationController.js';
import { isAiConfigured, chatJson } from './aiService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// Statuses that must never receive another email.
export const TERMINAL_STATUSES = new Set(['UNSUBSCRIBED', 'BOUNCED', 'CONVERTED']);
export const ACTIVE_OUTREACH_STATUSES = ['SENT', 'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3'];

// ── Settings ─────────────────────────────────────────────
export async function getOutreachSettings() {
    const { rows } = await pool.query(`SELECT * FROM outreach_settings WHERE id = 1`);
    return rows[0] || {
        id: 1, daily_send_limit: 20,
        send_window_start: '09:00', send_window_end: '17:00',
        paused: false, from_name: 'Lami — BuildWithLami', reply_to: null,
    };
}

async function getOwnerUserId() {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE lower(role) = 'owner' ORDER BY created_at LIMIT 1`
    );
    return rows[0]?.id || null;
}

// ── Template rendering (§20 variables) ───────────────────
export function renderTemplate(text, vars) {
    return String(text ?? '').replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key) =>
        vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ''
    );
}

export function buildUnsubscribeUrl(token) {
    const base = (process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '');
    return `${base}/unsubscribe/${token}`;
}

/**
 * The §20 variable map for a prospect. `observed_issue` comes
 * from the latest audit (falls back to the prospect's own
 * website_issues notes) and `service` from service_opportunity.
 */
export function buildTemplateVars(prospect, audit = null) {
    const base = (process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '');
    const observed = (audit && (audit.opportunities || audit.mobile_notes || audit.performance_notes))
        || prospect.website_issues
        || 'a few quick wins on speed and mobile layout';
    return {
        first_name: (prospect.contact_name || 'there').split(/\s+/)[0],
        business_name: prospect.company_name,
        website: prospect.website || 'your website',
        industry: prospect.industry || 'your industry',
        observed_issue: observed,
        service: prospect.service_opportunity || 'a modern, conversion-focused rebuild',
        portfolio_url: `${base}/projects`,
        unsubscribe_url: buildUnsubscribeUrl(prospect.unsubscribe_token),
    };
}

// ── Suppression ──────────────────────────────────────────
export async function isSuppressed(email) {
    if (!email) return true;
    const { rows } = await pool.query(
        `SELECT 1 FROM outreach_suppressions WHERE lower(email) = lower($1) LIMIT 1`,
        [email.trim()]
    );
    return rows.length > 0;
}

export async function suppressEmail(email, reason, note = null) {
    if (!email) return;
    await pool.query(
        `INSERT INTO outreach_suppressions (email, reason, note)
         VALUES (lower($1), $2, $3)
         ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason`,
        [email.trim(), reason, note]
    );
}

// ── Daily send accounting ────────────────────────────────
async function sendsToday() {
    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS n FROM outreach_messages
          WHERE direction = 'OUTBOUND' AND status = 'SENT'
            AND sent_at >= CURRENT_DATE`
    );
    return rows[0].n;
}

function withinSendWindow(settings, now = new Date()) {
    const toMinutes = (hhmm) => {
        const [h, m] = String(hhmm || '0:0').split(':').map((x) => parseInt(x, 10) || 0);
        return h * 60 + m;
    };
    const cur = now.getHours() * 60 + now.getMinutes();
    const start = toMinutes(settings.send_window_start);
    const end = toMinutes(settings.send_window_end);
    if (start <= end) return cur >= start && cur < end;
    // Window crossing midnight (e.g. 20:00–02:00).
    return cur >= start || cur < end;
}

// ── The single send funnel ───────────────────────────────
/**
 * Sends one outbound outreach email for a prospect.
 *
 * @param {object} args
 * @param {string} args.prospectId
 * @param {object|null} [args.message]   — existing outreach_messages row
 *     (DRAFT/QUEUED) to send. When omitted a fresh row is inserted.
 * @param {object|null} [args.step]      — outreach_sequence_steps row this
 *     send belongs to (drives status + follow-up scheduling).
 * @param {object|null} [args.sequence]  — the parent sequence row.
 * @param {string} [args.subject]        — overrides message.subject
 * @param {string} [args.body]           — overrides message.body
 * @param {boolean} [args.automated]     — cron send: also honours the
 *     sending window; manual admin sends bypass the window only.
 * @returns {Promise<{ok:boolean, reason?:string, message?:object, guards?:object}>}
 */
export async function sendProspectEmail({ prospectId, message = null, step = null, sequence = null, subject, body, automated = false, user = null, ipAddress = null }) {
    // ── Load + hard guards ──
    const { rows: pRows } = await pool.query(`SELECT * FROM prospects WHERE id = $1`, [prospectId]);
    if (pRows.length === 0) return { ok: false, reason: 'prospect_not_found' };
    const prospect = pRows[0];

    if (TERMINAL_STATUSES.has(prospect.status)) {
        return { ok: false, reason: `prospect_${prospect.status.toLowerCase()}` };
    }
    if (prospect.do_not_contact) return { ok: false, reason: 'do_not_contact' };
    if (await isSuppressed(prospect.email)) return { ok: false, reason: 'suppressed' };

    const settings = await getOutreachSettings();
    if (settings.paused) return { ok: false, reason: 'paused' };

    const todayCount = await sendsToday();
    if (todayCount >= settings.daily_send_limit) {
        return { ok: false, reason: 'daily_limit_reached', guards: { todayCount, limit: settings.daily_send_limit } };
    }
    if (automated && !withinSendWindow(settings)) {
        return { ok: false, reason: 'outside_send_window' };
    }

    // ── Resolve subject/body ──
    const rawSubject = subject ?? message?.subject ?? step?.subject;
    const rawBody = body ?? message?.body ?? step?.body;
    if (!rawSubject || !rawBody) return { ok: false, reason: 'missing_subject_or_body' };

    const { rows: auditRows } = await pool.query(
        `SELECT * FROM website_audits WHERE prospect_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [prospectId]
    );
    const vars = buildTemplateVars(prospect, auditRows[0] || null);
    const finalSubject = renderTemplate(rawSubject, vars);
    const finalBody = renderTemplate(rawBody, vars);

    // ── Persist the message row (idempotent for sequence steps) ──
    let msgRow = message;
    if (!msgRow && step) {
        const { rows } = await pool.query(
            `INSERT INTO outreach_messages (prospect_id, sequence_id, step_id, direction, subject, body, status)
             VALUES ($1, $2, $3, 'OUTBOUND', $4, $5, 'QUEUED')
             ON CONFLICT DO NOTHING
             RETURNING *`,
            [prospectId, sequence?.id || prospect.sequence_id || null, step.id, finalSubject, finalBody]
        ).catch((err) => {
            // 23505 from uq_outreach_step_send → already sent this step.
            if (err.code === '23505') return { rows: [] };
            throw err;
        });
        if (rows.length === 0) return { ok: false, reason: 'step_already_sent' };
        msgRow = rows[0];
    } else if (!msgRow) {
        const { rows } = await pool.query(
            `INSERT INTO outreach_messages (prospect_id, direction, subject, body, status)
             VALUES ($1, 'OUTBOUND', $2, $3, 'QUEUED') RETURNING *`,
            [prospectId, finalSubject, finalBody]
        );
        msgRow = rows[0];
    }

    // ── Build + send the email (unsubscribe footer is mandatory) ──
    const unsubUrl = vars.unsubscribe_url;
    const emailHtml = renderEmailShell({
        title: finalSubject,
        preheader: finalBody.replace(/\s+/g, ' ').slice(0, 90),
        badgeText: 'BuildWithLami',
        badgeType: 'info',
        bodyHtml: `
            <div style="font-size:15px; color:#334155; line-height:1.7;">
                ${escapeHtml(finalBody).replace(/\n/g, '<br/>')}
            </div>`,
        footerNote: `You received this email because BuildWithLami reached out about your website.<br/>
            <a href="${unsubUrl}" style="color:#ff5500;">Unsubscribe</a> from future emails.`,
    });
    const emailText = `${finalBody}\n\n—\nDon't want these emails? Unsubscribe: ${unsubUrl}`;

    // "Lami - BuildWithLami <addr>" built from the settings display
    // name + the SMTP envelope address from EMAIL_FROM. The display
    // name is forced to ASCII — some relays (Brevo included) reject
    // the MAIL FROM envelope with a 501 when non-ASCII (em-dash etc.)
    // rides along in the From header.
    const rawFrom = process.env.EMAIL_FROM || 'buildwithlami@gmail.com';
    const envelopeAddress = rawFrom.match(/<([^>]+)>/)?.[1] || rawFrom;
    const fromName = (settings.from_name || 'BuildWithLami')
        .normalize('NFKD')
        .replace(/[\u2012-\u2015]/g, '-')   // en/em dashes → hyphen
        .replace(/[^\x20-\x7E]/g, '')       // strip remaining non-ASCII
        .replace(/["\\]/g, '')
        .trim() || 'BuildWithLami';
    const mailOptions = {
        from: `"${fromName}" <${envelopeAddress}>`,
        to: prospect.email,
        ...(settings.reply_to ? { replyTo: settings.reply_to } : {}),
        subject: finalSubject,
        text: emailText,
        html: emailHtml,
        attachments: getLogoAttachments(),
    };

    try {
        if (!process.env.SMTP_USER) {
            if (process.env.NODE_ENV === 'production') throw new Error('SMTP credentials not configured');
            console.log('[Outreach] 📧 SMTP missing — mocking send to', prospect.email, ':', finalSubject);
        } else {
            const transporter = createTransporter();
            const info = await transporter.sendMail(mailOptions);
            await pool.query(
                `UPDATE outreach_messages
                    SET provider_message_id = $1 WHERE id = $2`,
                [info.messageId || null, msgRow.id]
            );
        }

        // ── Post-send state: message SENT ──
        // Store the RENDERED subject/body — the row is the record of
        // what actually went out (unsubscribe footer included); the
        // sequence step keeps the raw template for future sends.
        const { rows: sentRows } = await pool.query(
            `UPDATE outreach_messages
                SET status = 'SENT', sent_at = NOW(), error = NULL,
                    subject = $2, body = $3, updated_at = NOW()
              WHERE id = $1 RETURNING *`,
            [msgRow.id, finalSubject, finalBody]
        );

        // ── Post-send state: prospect status + sequence progression ──
        const stepOrder = step?.step_order ?? null;
        let nextFollowUp = null;
        if (step && sequence) {
            const { rows: nextRows } = await pool.query(
                `SELECT * FROM outreach_sequence_steps
                  WHERE sequence_id = $1 AND step_order > $2 AND is_active = TRUE
                  ORDER BY step_order LIMIT 1`,
                [sequence.id, stepOrder]
            );
            const next = nextRows[0] || null;
            nextFollowUp = next ? `NOW() + (${next.delay_days} || ' days')::interval` : null;
        }

        const newStatus = stepOrder === null
            // One-off send of a generated draft graduates the
            // prospect out of EMAIL_DRAFTED; other statuses keep
            // their meaningful value (REPLIED, INTERESTED, …).
            ? (prospect.status === 'EMAIL_DRAFTED' ? 'SENT' : prospect.status)
            : (stepOrder <= 1 ? 'SENT' : `FOLLOW_UP_${Math.min(stepOrder - 1, 3)}`);

        const { rows: updatedProspect } = await pool.query(
            `UPDATE prospects
                SET status = $1,
                    last_contacted_at = NOW(),
                    next_follow_up_at = ${nextFollowUp || 'NULL'},
                    updated_at = NOW()
              WHERE id = $2 RETURNING *`,
            [newStatus, prospectId]
        );

        writeAuditLog({
            action: 'OUTREACH_EMAIL_SENT',
            entityType: 'prospects',
            entityId: prospectId,
            details: {
                messageId: msgRow.id,
                stepOrder,
                sequenceId: sequence?.id || null,
                to: prospect.email,
                subject: finalSubject,
                automated,
            },
            user,
            ipAddress,
        }).catch(() => {});

        return {
            ok: true,
            message: sentRows[0],
            prospect: updatedProspect[0],
            guards: { todayCount: todayCount + 1, limit: settings.daily_send_limit },
        };
    } catch (err) {
        // Persist the failure on the message row.
        await pool.query(
            `UPDATE outreach_messages
                SET status = 'FAILED', error = $1, updated_at = NOW()
              WHERE id = $2`,
            [err.message?.slice(0, 500) || 'send failed', msgRow.id]
        ).catch(() => {});

        // Bounce-shaped SMTP failures → mark + suppress so we never
        // hammer a dead address again (blueprint §19).
        if (/\b(550|551|553|bounce|no such user|recipient rejected|invalid recipient)\b/i.test(err.message || '')) {
            await pool.query(
                `UPDATE prospects
                    SET status = 'BOUNCED', bounce_reason = $1, do_not_contact = TRUE,
                        next_follow_up_at = NULL, updated_at = NOW()
                  WHERE id = $2`,
                [err.message?.slice(0, 300), prospectId]
            );
            await suppressEmail(prospect.email, 'BOUNCED', err.message?.slice(0, 200));
        }

        writeAuditLog({
            action: 'OUTREACH_EMAIL_FAILED',
            entityType: 'prospects',
            entityId: prospectId,
            details: { messageId: msgRow.id, error: err.message?.slice(0, 300), automated },
            user,
            ipAddress,
        }).catch(() => {});

        return { ok: false, reason: 'send_failed', error: err.message };
    }
}

// ── Stop-on-reply (§19) ──────────────────────────────────
/**
 * Records an inbound reply and immediately halts the sequence:
 * status → REPLIED, queued/draft sequence messages cancelled,
 * next_follow_up_at cleared. Notifies the owner.
 */
export async function recordProspectReply({ prospectId, subject = null, body = null, user = null, ipAddress = null }) {
    const { rows: pRows } = await pool.query(`SELECT * FROM prospects WHERE id = $1`, [prospectId]);
    if (pRows.length === 0) return { ok: false, reason: 'prospect_not_found' };
    const prospect = pRows[0];

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { rows: msgRows } = await client.query(
            `INSERT INTO outreach_messages (prospect_id, sequence_id, direction, subject, body, status, sent_at)
             VALUES ($1, $2, 'INBOUND', $3, $4, 'RECEIVED', NOW()) RETURNING *`,
            [prospectId, prospect.sequence_id, subject || '(reply)', body || '']
        );

        let cancelled = 0;
        // Stop-on-reply: kill any queued/draft sequence follow-ups.
        if (prospect.sequence_id) {
            const seqRes = await client.query(
                `SELECT stop_on_reply FROM outreach_sequences WHERE id = $1`,
                [prospect.sequence_id]
            );
            if (seqRes.rows[0]?.stop_on_reply !== false) {
                const cancelledRes = await client.query(
                    `UPDATE outreach_messages
                        SET status = 'CANCELLED', error = 'Cancelled — reply received', updated_at = NOW()
                      WHERE prospect_id = $1
                        AND direction = 'OUTBOUND'
                        AND status IN ('DRAFT', 'QUEUED')
                     RETURNING id`,
                    [prospectId]
                );
                cancelled = cancelledRes.rowCount;
            }
        }

        const { rows: updated } = await client.query(
            `UPDATE prospects
                SET status = 'REPLIED', next_follow_up_at = NULL, updated_at = NOW()
              WHERE id = $1 RETURNING *`,
            [prospectId]
        );
        await client.query('COMMIT');

        writeAuditLog({
            action: 'OUTREACH_REPLY_RECEIVED',
            entityType: 'prospects',
            entityId: prospectId,
            details: { cancelledMessages: cancelled, subject: subject || '(reply)' },
            user,
            ipAddress,
        }).catch(() => {});

        const ownerId = await getOwnerUserId();
        if (ownerId) {
            await createNotification({
                userId: ownerId,
                type: 'outreach',
                title: 'Outreach reply received',
                body: `${prospect.company_name} (${prospect.email}) replied to your outreach.${cancelled ? ` ${cancelled} queued follow-up(s) cancelled.` : ''}`,
                link: '/admin/outreach',
            }).catch(() => {});
        }

        return { ok: true, prospect: updated[0], message: msgRows[0], cancelledMessages: cancelled };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// ── Cron: send_due_followups (§88) ───────────────────────
/**
 * Processes every prospect whose next_follow_up_at is due:
 *   • respects global pause, sending window and the daily limit
 *   • re-checks suppression + terminal statuses per prospect
 *   • idempotent per step (uq_outreach_step_send)
 *
 * Designed to run hourly — the window + limit guards make extra
 * runs harmless.
 */
export async function processDueFollowUps() {
    const summary = { checked: 0, sent: 0, skipped: 0, failed: 0, reasons: {} };
    const bump = (reason) => { summary.reasons[reason] = (summary.reasons[reason] || 0) + 1; };

    try {
        const settings = await getOutreachSettings();
        if (settings.paused) return { ...summary, paused: true };
        if (!withinSendWindow(settings)) return { ...summary, outsideWindow: true };

        const remainingToday = settings.daily_send_limit - await sendsToday();
        if (remainingToday <= 0) return { ...summary, dailyLimitReached: true };

        const { rows: due } = await pool.query(
            `SELECT p.id FROM prospects p
              WHERE p.next_follow_up_at IS NOT NULL
                AND p.next_follow_up_at <= NOW()
                AND p.status = ANY($1)
                AND p.sequence_id IS NOT NULL
                AND p.do_not_contact = FALSE
                AND NOT EXISTS (
                    SELECT 1 FROM outreach_suppressions s
                     WHERE lower(s.email) = lower(p.email)
                )
              ORDER BY p.next_follow_up_at ASC
              LIMIT $2`,
            [ACTIVE_OUTREACH_STATUSES, remainingToday]
        );
        summary.checked = due.length;

        for (const { id } of due) {
            const result = await sendNextSequenceStep(id, { automated: true });
            if (result.ok) {
                summary.sent++;
                if (summary.sent >= remainingToday) break;
            } else if (result.reason === 'send_failed' || result.reason === 'failed') {
                summary.failed++;
            } else {
                summary.skipped++;
                bump(result.reason);
            }
        }
        return summary;
    } catch (err) {
        console.error('[Outreach] processDueFollowUps error:', err.message);
        summary.error = err.message;
        return summary;
    }
}

/**
 * Sends the next unsent active step of the prospect's attached
 * sequence. Returns {ok, reason?} — used by both the cron
 * (automated=true) and the admin's manual "send next step".
 */
export async function sendNextSequenceStep(prospectId, { automated = false, user = null, ipAddress = null } = {}) {
    const client = await pool.connect();
    let sequence, nextStep;
    try {
        await client.query('BEGIN');
        const pRes = await client.query(`SELECT * FROM prospects WHERE id = $1 FOR UPDATE`, [prospectId]);
        if (pRes.rows.length === 0) { await client.query('ROLLBACK'); return { ok: false, reason: 'prospect_not_found' }; }
        const prospect = pRes.rows[0];

        if (!prospect.sequence_id) {
            await client.query(`UPDATE prospects SET next_follow_up_at = NULL WHERE id = $1`, [prospectId]);
            await client.query('COMMIT');
            return { ok: false, reason: 'no_active_sequence' };
        }
        if (TERMINAL_STATUSES.has(prospect.status)) {
            await client.query(`UPDATE prospects SET next_follow_up_at = NULL WHERE id = $1`, [prospectId]);
            await client.query('COMMIT');
            return { ok: false, reason: `prospect_${prospect.status.toLowerCase()}` };
        }
        if (prospect.do_not_contact) {
            await client.query(`UPDATE prospects SET next_follow_up_at = NULL WHERE id = $1`, [prospectId]);
            await client.query('COMMIT');
            return { ok: false, reason: 'do_not_contact' };
        }

        const seqRes = await client.query(`SELECT * FROM outreach_sequences WHERE id = $1`, [prospect.sequence_id]);
        sequence = seqRes.rows[0];
        if (!sequence || !sequence.is_active) {
            await client.query(`UPDATE prospects SET next_follow_up_at = NULL WHERE id = $1`, [prospectId]);
            await client.query('COMMIT');
            return { ok: false, reason: 'sequence_inactive' };
        }

        // Last step we already sent → the next one is due now.
        const lastRes = await client.query(
            `SELECT COALESCE(MAX(st.step_order), 0) AS last_order
               FROM outreach_messages m
               JOIN outreach_sequence_steps st ON st.id = m.step_id
              WHERE m.prospect_id = $1 AND m.direction = 'OUTBOUND'
                AND m.status IN ('SENT', 'QUEUED')`,
            [prospectId]
        );
        const nextRes = await client.query(
            `SELECT * FROM outreach_sequence_steps
              WHERE sequence_id = $1 AND step_order > $2 AND is_active = TRUE
              ORDER BY step_order LIMIT 1`,
            [sequence.id, lastRes.rows[0].last_order]
        );
        if (nextRes.rows.length === 0) {
            // Sequence exhausted — stop following up.
            await client.query(`UPDATE prospects SET next_follow_up_at = NULL WHERE id = $1`, [prospectId]);
            await client.query('COMMIT');
            return { ok: false, reason: 'sequence_complete' };
        }
        nextStep = nextRes.rows[0];
        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        client.release();
        console.error('[Outreach] sendNextSequenceStep error:', err.message);
        return { ok: false, reason: 'failed' };
    }
    client.release();

    const result = await sendProspectEmail({
        prospectId,
        step: nextStep,
        sequence,
        automated,
        user,
        ipAddress,
    });
    if (result.ok || result.reason === 'send_failed') return result;

    // Soft-skip reasons: push the follow-up a day so a transient
    // guard (e.g. daily limit reached mid-loop) doesn't strand
    // the prospect, except for permanent ones handled above.
    if (['daily_limit_reached', 'outside_send_window', 'paused'].includes(result.reason)) {
        await pool.query(
            `UPDATE prospects SET next_follow_up_at = NOW() + INTERVAL '1 day' WHERE id = $1`,
            [prospectId]
        ).catch(() => {});
    }
    return result;
}

// ── Draft generation (§21 "Generate Outreach Draft") ─────
export const INITIAL_DRAFT_SUBJECT = 'Quick question about {{business_name}}’s website';
export const INITIAL_DRAFT_BODY = `Hi {{first_name}},

I came across {{website}} while looking at {{industry}} businesses, and a couple of things stood out — {{observed_issue}}.

I build websites that fix exactly that: faster loads, a clearer path for visitors to become customers, and a look that matches the quality of your work. A couple of recent examples: {{portfolio_url}}

Would it be useful if I sent over 2–3 specific, no-obligation suggestions for your site?

Best,
Lami
BuildWithLami`;

export async function generateInitialDraft(prospectId) {
    const { rows: pRows } = await pool.query(`SELECT * FROM prospects WHERE id = $1`, [prospectId]);
    if (pRows.length === 0) return { ok: false, reason: 'prospect_not_found' };
    const prospect = pRows[0];

    const { rows: auditRows } = await pool.query(
        `SELECT * FROM website_audits WHERE prospect_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [prospectId]
    );
    const audit = auditRows[0] || null;
    const vars = buildTemplateVars(prospect, audit);

    // Reuse an existing unsent draft instead of stacking new ones.
    const { rows: existing } = await pool.query(
        `SELECT * FROM outreach_messages
          WHERE prospect_id = $1 AND direction = 'OUTBOUND'
            AND status IN ('DRAFT', 'QUEUED') AND step_id IS NULL
          ORDER BY created_at DESC LIMIT 1`,
        [prospectId]
    );
    if (existing.length > 0) {
        return { ok: true, message: existing[0], reused: true };
    }

    // ── AI-personalised draft (Phase 6) — falls back to the
    // studio template on any AI failure or unconvincing output.
    if (isAiConfigured()) {
        try {
            const out = await chatJson([
                {
                    role: 'system',
                    content: 'You write short cold outreach emails for BuildWithLami, a web agency run by Lami. Rules: factual only — use the JSON data provided, never invent findings; warm, direct, no hype; 90–140 words; plain text (no markdown); end with a low-pressure question. Return JSON: {"subject": string (max 70 chars, no emojis), "body": string}.',
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        prospect: {
                            company: prospect.company_name,
                            contact: prospect.contact_name,
                            industry: prospect.industry,
                            website: prospect.website,
                            research_notes: prospect.research_notes,
                            website_issues: prospect.website_issues,
                            service_opportunity: prospect.service_opportunity,
                        },
                        audit: audit
                            ? {
                                mobile_notes: audit.mobile_notes, design_notes: audit.design_notes,
                                performance_notes: audit.performance_notes, seo_notes: audit.seo_notes,
                                opportunities: audit.opportunities,
                            }
                            : null,
                        sender: { name: 'Lami', agency: 'BuildWithLami', portfolio: vars.portfolio_url },
                    }),
                },
            ], { maxTokens: 500 });
            const subject = typeof out?.subject === 'string' ? out.subject.trim().slice(0, 150) : '';
            const body = typeof out?.body === 'string' ? out.body.trim() : '';
            if (subject && body.length >= 80 && body.length <= 2000) {
                const { rows } = await pool.query(
                    `INSERT INTO outreach_messages (prospect_id, sequence_id, direction, subject, body, status)
                     VALUES ($1, $2, 'OUTBOUND', $3, $4, 'DRAFT') RETURNING *`,
                    [prospectId, prospect.sequence_id, subject, body]
                );
                return { ok: true, message: rows[0], source: 'ai' };
            }
            console.log('[Outreach] AI draft rejected (shape/length) — using template');
        } catch (err) {
            console.log('[Outreach] AI draft unavailable:', err.reason || err.message);
        }
    }

    const { rows } = await pool.query(
        `INSERT INTO outreach_messages (prospect_id, sequence_id, direction, subject, body, status)
         VALUES ($1, $2, 'OUTBOUND', $3, $4, 'DRAFT') RETURNING *`,
        [prospectId, prospect.sequence_id, INITIAL_DRAFT_SUBJECT, INITIAL_DRAFT_BODY]
    );
    return { ok: true, message: rows[0], source: 'rules' };
}
