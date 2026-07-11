// ─── src/controllers/adminInboxController.js ─────────────
// Unified inbox for the CEO. Joins `messages` (contact form),
// `project_feedback` (client questions per project stage), and
// `intake_submissions` (intake form responses) into a single
// timestamped feed so the CEO can reply in one place.
//
// Reply side-effect: writes the admin reply into the source row
// (`admin_reply` on `project_feedback`, or appends to a side
// `messages` row for outbound contact messages) and emails the
// client. No double-write for feedback — `admin_reply` is
// already there.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import nodemailer from 'nodemailer';
import pool from '../config/db.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

// ── Source of the three feeds ────────────────────────────
// `kind` is the discriminator the UI uses to pick an icon
// and a deep link.  `status` is normalised to the same
// vocabulary the inbox filter uses: 'New' | 'In Progress'
// | 'Waiting' | 'Resolved'.
const STATUS_NORMALISE = {
    OPEN:        'In Progress',
    RESOLVED:    'Resolved',
    NEW:         'New',
    WAITING:     'Waiting',
};

// ── GET /api/admin/inbox ─────────────────────────────────
// Joins three feeds into one timestamped list, newest first.
// Query params:
//   ?status=New|In Progress|Waiting|Resolved  (optional filter)
//   ?division=SOFTWARE|SURVEY|DRONE            (optional filter)
//   ?kind=message|feedback|intake              (optional filter)
//   ?limit=N                                    (default 50, max 200)
export async function getInbox(req, res) {
    try {
        const { status, division, kind, limit } = req.query;
        const lim = Math.min(parseInt(limit, 10) || 50, 200);

        // Three sub-queries, each normalised to a common shape.
        // Filtering by status / division / kind is applied as a
        // UNION ALL so the query stays indexable.
        const where = [];
        const params = [];
        if (division) { params.push(division.toUpperCase()); where.push(`division = $${params.length}`); }
        if (status)   { params.push(status);               where.push(`status = $${params.length}`);   }
        if (kind)     { params.push(kind);                 where.push(`kind = $${params.length}`);     }
        const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        params.push(lim);
        const limIdx = params.length;

        const sql = `
            SELECT * FROM (
                -- Contact form messages
                SELECT
                    'message'::text AS kind,
                    m.id            AS id,
                    m.full_name     AS author_name,
                    m.email         AS author_email,
                    m.message       AS body,
                    NULL::text      AS subject,
                    NULL::uuid      AS project_id,
                    NULL::text      AS project_name,
                    NULL::text      AS division,
                    CASE WHEN m.is_read THEN 'Resolved' ELSE 'New' END AS status,
                    m.created_at    AS created_at
                FROM messages m

                UNION ALL

                -- Project feedback (client reply on a stage)
                SELECT
                    'feedback'::text AS kind,
                    pf.id             AS id,
                    c.name            AS author_name,
                    c.primary_contact_email AS author_email,
                    pf.client_comment AS body,
                    ('Stage ' || (pf.stage_index + 1)::text) AS subject,
                    pf.project_id     AS project_id,
                    cp.project_name   AS project_name,
                    cp.division       AS division,
                    CASE pf.status
                        WHEN 'OPEN'     THEN 'In Progress'
                        WHEN 'RESOLVED' THEN 'Resolved'
                        ELSE pf.status
                    END              AS status,
                    pf.created_at     AS created_at
                FROM project_feedback pf
                JOIN client_projects cp ON cp.id = pf.project_id
                LEFT JOIN clients c     ON c.id  = cp.client_id

                UNION ALL

                -- Intake form submissions
                SELECT
                    'intake'::text   AS kind,
                    s.id             AS id,
                    cp.project_name  AS author_name,
                    NULL::text       AS author_email,
                    ('Submitted ' || s.responses::text) AS body,
                    'Intake form'    AS subject,
                    s.project_id     AS project_id,
                    cp.project_name  AS project_name,
                    cp.division      AS division,
                    'New'            AS status,
                    s.submitted_at   AS created_at
                FROM intake_submissions s
                JOIN client_projects cp ON cp.id = s.project_id
            ) AS feed
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${limIdx}
        `;

        const { rows } = await pool.query(sql, params);

        // Normalise status labels so the UI can show consistent pills
        // even though the three source tables use different vocab.
        const items = rows.map((r) => ({
            ...r,
            status: STATUS_NORMALISE[r.status] || r.status,
        }));

        return res.json({ items, count: items.length });
    } catch (err) {
        console.error('[Inbox] getInbox error:', err.message);
        return res.status(500).json({ error: 'Failed to load inbox.' });
    }
}

// ── GET /api/admin/inbox/thread/:email ───────────────────
// All historical touch-points with a single client/contact,
// grouped by email. Used by the conversation-thread view.
export async function getThread(req, res) {
    try {
        const { email } = req.params;
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email required.' });
        }

        const { rows: messages } = await pool.query(
            `SELECT id, 'message'::text AS kind, full_name AS author_name, email AS author_email,
                    message AS body, created_at
               FROM messages WHERE email = $1`,
            [email]
        );
        const { rows: feedback } = await pool.query(
            `SELECT pf.id, 'feedback'::text AS kind, c.name AS author_name, c.primary_contact_email AS author_email,
                    pf.client_comment AS body, pf.admin_reply, pf.created_at
               FROM project_feedback pf
               JOIN client_projects cp ON cp.id = pf.project_id
               LEFT JOIN clients c     ON c.id  = cp.client_id
              WHERE c.primary_contact_email = $1
              ORDER BY pf.created_at ASC`,
            [email]
        );
        const combined = [...messages, ...feedback]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return res.json({ email, count: combined.length, items: combined });
    } catch (err) {
        console.error('[Inbox] getThread error:', err.message);
        return res.status(500).json({ error: 'Failed to load thread.' });
    }
}

// ── POST /api/admin/inbox/:kind/:id/reply ─────────────────
// Two-step: write the reply into the source row (so the
// dashboard's feedback card updates), then email the client.
// :kind is `feedback` for now (project_feedback has admin_reply).
const replySchema = z.object({
    reply: z.string().min(1, 'Reply cannot be empty'),
    status: z.enum(['OPEN', 'RESOLVED']).optional(),
});

export async function replyToInboxItem(req, res) {
    const { kind, id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid ID format.' });
    if (kind !== 'feedback') {
        return res.status(400).json({ error: 'Reply is only supported for feedback items.' });
    }

    try {
        const data = replySchema.parse(req.body);
        const cleanReply = DOMPurify.sanitize(data.reply);

        // 1. Update the source row.
        const newStatus = data.status || 'RESOLVED';
        const { rows } = await pool.query(
            `UPDATE project_feedback
                SET admin_reply = $1,
                    status      = $2
              WHERE id = $3
            RETURNING *,
                (SELECT c.primary_contact_email FROM client_projects cp
                   JOIN clients c ON c.id = cp.client_id
                  WHERE cp.id = project_feedback.project_id) AS client_email,
                (SELECT c.name FROM client_projects cp
                   JOIN clients c ON c.id = cp.client_id
                  WHERE cp.id = project_feedback.project_id) AS client_name,
                (SELECT cp.project_name FROM client_projects cp
                  WHERE cp.id = project_feedback.project_id) AS project_name`,
            [cleanReply, newStatus, id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Feedback not found.' });
        const updated = rows[0];

        // 2. Email the client. Fire-and-forget so the UI isn't blocked.
        if (updated.client_email) {
            sendReplyEmail({
                to: updated.client_email,
                toName: updated.client_name || 'Client',
                projectName: updated.project_name || 'your project',
                clientComment: updated.client_comment,
                adminReply: cleanReply,
            }).catch((err) => console.error('[Inbox] reply email error:', err.message));
        }

        await writeAuditLog({
            action: 'INBOX_REPLY',
            entityType: 'project_feedback',
            entityId: id,
            details: { projectName: updated.project_name, status: newStatus },
            user: req.user,
            ipAddress: getClientIp(req),
        });

        return res.json({ success: true, feedback: updated });
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Inbox] replyToInboxItem error:', err.message);
        return res.status(500).json({ error: 'Failed to send reply.' });
    }
}

// ── Email helper (sends FROM admin → client) ─────────────
async function sendReplyEmail({ to, toName, projectName, clientComment, adminReply }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const safeReply = String(adminReply).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
    const safeClientComment = String(clientComment).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

    const mail = {
        from: process.env.EMAIL_FROM || '"Lami Odi" <no-reply@buildwithlami.com>',
        to,
        subject: `Update on ${projectName}`,
        text: `Hi ${toName},\n\nHere's the update you asked about on ${projectName}:\n\n${adminReply}\n\n— Lami Odi`,
        html: `<p>Hi ${toName},</p>
               <p>Here's the update on <strong>${projectName}</strong>:</p>
               <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${safeReply.replace(/\n/g, '<br/>')}</blockquote>
               <p style="color:#888;font-size:12px">Your original message: ${safeClientComment.replace(/\n/g, '<br/>')}</p>
               <p>— Lami Odi</p>`,
    };

    if (!process.env.SMTP_USER) {
        console.log('[Inbox] SMTP credentials missing — reply not sent.', { to, subject: mail.subject });
        return { success: true, mocked: true };
    }
    const info = await transporter.sendMail(mail);
    return { success: true, messageId: info.messageId };
}
