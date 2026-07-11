// ─── src/services/templateService.js ─────────────────────
// Phase 3 — Email-template rendering + dispatch.
//
// Responsibilities:
//   1. Substitute `{{placeholders}}` in a subject/body pair.
//   2. Send the rendered email through nodemailer.
//
// Why this lives in `services/` not `utils/`:
//
//   The renderer is pure and testable; the sender touches
//   nodemailer and the SMTP env. We want to mock the sender
//   in unit tests without pulling in transport code. Splitting
//   `renderTemplate` (pure) from `sendTemplateEmail` (I/O)
//   makes that trivial.
// ──────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';

const PLACEHOLDER_RE = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

/**
 * Replace every `{{key}}` in `text` with `data[key]`. Missing
 * keys are left as `{{key}}` so the sender can spot template
 * misconfigurations at a glance. Non-string values are coerced
 * to strings.
 */
export function renderTemplate(text, data = {}) {
    if (typeof text !== 'string' || text.length === 0) return '';
    return text.replace(PLACEHOLDER_RE, (match, key) => {
        if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== null && data[key] !== undefined) {
            return String(data[key]);
        }
        return match;
    });
}

/**
 * Send a templated email. Builds the nodemailer transport on
 * demand so we never hold a stale connection across deploys.
 *
 * @param {object} args
 * @param {string} args.to            — recipient email
 * @param {string} args.subject       — already-rendered subject
 * @param {string} args.body          — already-rendered body
 * @returns {Promise<{success: boolean, messageId?: string, mocked?: boolean, error?: string}>}
 */
export async function sendTemplatedEmail({ to, subject, body }) {
    if (!to || !subject || !body) {
        return { success: false, error: 'Missing recipient, subject, or body.' };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BuildWithLami" <no-reply@buildwithlami.dev>',
            to,
            subject,
            text: body,
            html: `<pre style="font-family:inherit;white-space:pre-wrap;">${escapeHtml(body)}</pre>`,
        };

        if (!process.env.SMTP_USER) {
            console.log('[TemplateService] 📧 SMTP missing — logging mail only.');
            console.log(mailOptions);
            return { success: true, mocked: true };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('[TemplateService] 📧 Sent %s to %s', info.messageId, to);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[TemplateService] send failed:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Resolve and render a template in one step. Pulls the row by
 * name or id, renders it, and returns `{ subject, body }`.
 */
export async function loadAndRenderTemplate(pool, identifier, data) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const column = isUuid ? 'id' : 'name';
    const { rows } = await pool.query(
        `SELECT name, subject, body, placeholders FROM email_templates WHERE ${column} = $1`,
        [identifier]
    );
    if (rows.length === 0) return null;
    const tpl = rows[0];
    return {
        name: tpl.name,
        subject: renderTemplate(tpl.subject, data),
        body: renderTemplate(tpl.body, data),
    };
}

// ── small helper ─────────────────────────────────────────
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
}
