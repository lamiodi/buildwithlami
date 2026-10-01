// ─── src/services/automationService.js ────────────────────
// Admin OS Phase 2 — the quote → deposit → onboarding chain
// (blueprint §25 "Quote Acceptance Workflow" + §58 automations).
//
//   onQuotationAccepted({ quotationId })         — fires when a
//     quotation moves to ACCEPTED:
//       1. create/attach the client (from the lead when needed)
//       2. mark the lead WON
//       3. ensure a pending project exists
//       4. generate the deposit invoice (quotation.deposit_percent)
//          with Paystack link (NGN) + invoice email
//       5. notify the admin (deduped)
//
//   onInvoicePaid({ invoiceId, via })            — fires from every
//     server-verified PAID path (Paystack webhook, manual confirm,
//     proof review) but only acts on DEPOSIT invoices
//     (invoices.quotation_id IS NOT NULL):
//       1. activate the client
//       2. create the onboarding + send the invite email
//       3. create starter client actions
//       4. set the project's next action
//       5. notify the admin (deduped)
//
// Both functions are IDEMPOTENT (blueprint §89) — re-running them
// on the same quotation/invoice is a no-op — and NEVER THROW: an
// automation failure must not roll back a real payment/acceptance.
// Failures are logged + audited as AUTOMATION_FAILED.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { writeAuditLog } from '../utils/auditLog.js';
import { createNotification } from '../controllers/notificationController.js';
import { ensureOnboardingProject } from '../controllers/crmController.js';
import { ensureOnboardingForClient } from '../controllers/onboardingController.js';
import { sendInvoiceEmail } from './paymentEmailService.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && UUID_REGEX.test(s);

async function getOwnerUserId() {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE lower(role) = 'owner' ORDER BY created_at LIMIT 1`
    );
    return rows[0]?.id || null;
}

/**
 * Admin notification guarded by the notification_dedup table
 * (same pattern as cronService): the first call inserts + notifies,
 * repeats within the window are silent.
 */
async function notifyOwnerOnce(entityType, entityId, bucket, { type, title, body, link }) {
    const ownerId = await getOwnerUserId();
    if (!ownerId) return;

    const { rows: seen } = await pool.query(
        `SELECT 1 FROM notification_dedup
          WHERE entity_type = $1 AND entity_id = $2 AND bucket = $3
            AND sent_at > NOW() - INTERVAL '30 days'
          LIMIT 1`,
        [entityType, String(entityId), bucket]
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
}

/**
 * Guess the onboarding project type from the quotation's title and
 * line items. Deliberately conservative — the admin can reopen and
 * adjust the onboarding type later from the client detail page.
 */
function inferProjectType(quotation) {
    const text = `${quotation.title || ''} ${JSON.stringify(quotation.line_items || [])}`.toLowerCase();
    if (/(e-?com|shop|store|checkout|product upload|marketplace)/.test(text)) return 'ECOMMERCE';
    if (/(book|appointment|schedul|calendar)/.test(text)) return 'BOOKING';
    return 'BUSINESS';
}

/**
 * Same INV-YYYY-NNN generation as invoiceController.createInvoice —
 * MAX-sequence + retry on unique collisions.
 */
async function insertInvoiceWithNumber({ clientId, projectId, amount, currency, quotationId, dueDate, notes, lineItems }) {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `INV-${currentYear}-`;

    let invoice = null;
    let attempts = 0;
    const maxAttempts = 5;

    while (!invoice && attempts < maxAttempts) {
        attempts++;
        const { rows: seqRows } = await pool.query(
            `SELECT COALESCE(MAX(NULLIF(regexp_replace(invoice_number, '^INV-[0-9]+-', ''), '')::int), 0) AS max_seq
             FROM invoices
             WHERE invoice_number LIKE $1`,
            [yearPrefix + '%']
        );
        const nextSeq = String((seqRows[0]?.max_seq || 0) + attempts).padStart(3, '0');
        try {
            const { rows } = await pool.query(
                `INSERT INTO invoices
                    (client_id, project_id, amount, currency, due_date, status,
                     invoice_number, notes, line_items, quotation_id)
                 VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, $8::jsonb, $9)
                 RETURNING *`,
                [clientId, projectId, amount, currency, dueDate || null,
                 yearPrefix + nextSeq, notes || null,
                 JSON.stringify(lineItems || []), quotationId]
            );
            invoice = rows[0];
        } catch (insertErr) {
            if (insertErr.code === '23505' && insertErr.constraint?.includes('invoice_number')) {
                continue; // sequence collision — retry
            }
            throw insertErr; // includes the per-quotation unique index
        }
    }
    return invoice;
}

/**
 * Paystack initialization for NGN invoices — mirrors
 * invoiceController.createInvoice. Non-NGN currencies and missing
 * keys are skipped; the invoice stays PENDING with bank details on
 * the payment page.
 */
async function attachPaystackLink(invoice, clientEmail) {
    if (invoice.currency !== 'NGN' || !process.env.PAYSTACK_SECRET_KEY) return invoice;
    try {
        const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: clientEmail,
                amount: Math.round(Number(invoice.amount) * 100),
                reference: invoice.id,
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/track/payment-success`,
            }),
        });
        const paystackData = await paystackRes.json();
        if (paystackData.status && paystackData.data?.authorization_url) {
            const { rows } = await pool.query(
                `UPDATE invoices SET payment_url = $1, paystack_reference = $2 WHERE id = $3 RETURNING *`,
                [paystackData.data.authorization_url, paystackData.data.reference, invoice.id]
            );
            return rows[0] || invoice;
        }
        console.error('[Automation] Paystack init failed:', paystackData.message || 'unknown');
    } catch (err) {
        console.error('[Automation] Paystack init error:', err.message);
    }
    return invoice;
}

// ── Trigger 1: quotation.accepted ────────────────────────
export async function onQuotationAccepted({ quotationId, user = null, ipAddress = null }) {
    const summary = {
        ok: false, reason: null,
        clientId: null, projectId: null, invoiceId: null, invoiceNumber: null,
        invoiceAmount: null, currency: null, emailStatus: null, alreadyRan: false,
    };

    try {
        if (!isUuid(quotationId)) {
            summary.reason = 'invalid_id';
            return summary;
        }

        const { rows: qRows } = await pool.query(
            `SELECT q.*, l.full_name AS lead_name, l.email AS lead_email,
                    l.phone AS lead_phone, l.notes AS lead_notes, l.division AS lead_division,
                    l.converted_client_id AS lead_client_id, l.stage AS lead_stage
               FROM quotations q
               LEFT JOIN leads l ON l.id = q.lead_id
              WHERE q.id = $1`,
            [quotationId]
        );
        if (qRows.length === 0) {
            summary.reason = 'quotation_not_found';
            return summary;
        }
        const quotation = qRows[0];

        if (quotation.status !== 'ACCEPTED' && quotation.status !== 'CONVERTED') {
            summary.reason = 'not_accepted';
            return summary;
        }

        // Idempotency gate 1: a deposit invoice already exists.
        const existingInvoice = await pool.query(
            `SELECT * FROM invoices WHERE quotation_id = $1 LIMIT 1`,
            [quotationId]
        );
        if (existingInvoice.rows.length > 0) {
            const inv = existingInvoice.rows[0];
            Object.assign(summary, {
                ok: true, alreadyRan: true, reason: 'invoice_exists',
                clientId: inv.client_id, invoiceId: inv.id, invoiceNumber: inv.invoice_number,
                invoiceAmount: Number(inv.amount), currency: inv.currency,
            });
            return summary;
        }

        // ── 1. Resolve or create the client ──
        let clientId = isUuid(quotation.client_id || '') ? quotation.client_id : null;
        const lead = quotation.lead_id ? {
            id: quotation.lead_id,
            name: quotation.lead_name,
            email: quotation.lead_email,
            phone: quotation.lead_phone,
            notes: quotation.lead_notes,
            division: quotation.lead_division || 'SOFTWARE',
            convertedClientId: isUuid(quotation.lead_client_id || '') ? quotation.lead_client_id : null,
        } : null;

        if (!clientId && lead?.convertedClientId) clientId = lead.convertedClientId;

        if (!clientId && lead) {
            const { rows: cRows } = await pool.query(
                `INSERT INTO clients (name, primary_contact_email, billing_email, phone, notes, division, status, source)
                 VALUES ($1, $2, $2, $3, $4, $5, 'ACTIVE', 'quotation')
                 RETURNING id`,
                [lead.name, lead.email, lead.phone || null, lead.notes || null, lead.division]
            );
            clientId = cRows[0].id;
        }

        if (!clientId) {
            summary.reason = 'no_client';
            return summary;
        }
        summary.clientId = clientId;

        // ── 2. Mark the lead WON + linked ──
        if (lead && lead.stage !== 'WON') {
            await pool.query(
                `UPDATE leads SET stage = 'WON', converted_client_id = COALESCE(converted_client_id, $1), updated_at = NOW()
                  WHERE id = $2`,
                [clientId, lead.id]
            );
        } else if (lead && !lead.convertedClientId) {
            await pool.query(
                `UPDATE leads SET converted_client_id = $1, updated_at = NOW() WHERE id = $2`,
                [clientId, lead.id]
            );
        }

        // ── 3. Link the quotation to the client + stamp acceptance ──
        await pool.query(
            `UPDATE quotations
                SET client_id = COALESCE(client_id, $1),
                    accepted_at = COALESCE(accepted_at, NOW()),
                    updated_at = NOW()
              WHERE id = $2`,
            [clientId, quotationId]
        );

        // ── 4. Ensure a pending project for the deposit invoice ──
        const clientRow = await pool.query(`SELECT * FROM clients WHERE id = $1`, [clientId]);
        const division = lead?.division || clientRow.rows[0]?.division || 'SOFTWARE';
        const onboardingProject = await ensureOnboardingProject(clientRow.rows[0], division);
        summary.projectId = onboardingProject.project?.id || null;

        // ── 5. Deposit invoice ──
        const currency = (quotation.currency || 'NGN').toUpperCase();
        const percent = Number(quotation.deposit_percent ?? 50);
        summary.currency = currency;

        if (percent <= 0) {
            summary.ok = true;
            summary.reason = 'no_deposit_required';
            await notifyOwnerOnce('quotation', quotationId, 'accepted', {
                type: 'quotation',
                title: 'Quotation accepted',
                body: `"${quotation.title || 'Quotation'}" was accepted. No deposit invoice (0% deposit) — client: ${clientRow.rows[0]?.name || clientId}.`,
                link: '/admin/quotations',
            });
            return summary;
        }

        const depositAmount = Math.round(Number(quotation.amount) * percent) / 100;
        const clientEmail = clientRow.rows[0]?.primary_contact_email;

        let invoice = await insertInvoiceWithNumber({
            clientId,
            projectId: summary.projectId,
            amount: depositAmount,
            currency,
            quotationId,
            dueDate: null,
            notes: `${percent}% deposit for quotation "${quotation.title || quotationId}". Balance due on final delivery.`,
            lineItems: [{ description: `Deposit (${percent}%) — ${quotation.title || 'Quotation'}`, amount: depositAmount }],
        });
        if (!invoice) {
            summary.reason = 'invoice_number_failed';
            return summary;
        }

        invoice = await attachPaystackLink(invoice, clientEmail);
        summary.invoiceId = invoice.id;
        summary.invoiceNumber = invoice.invoice_number;
        summary.invoiceAmount = Number(invoice.amount);
        summary.ok = true;

        // ── 6. Payment instruction email (fire-and-forget) ──
        if (clientEmail) {
            sendInvoiceEmail({
                clientEmail,
                clientName: clientRow.rows[0]?.name,
                invoiceId: invoice.id,
                amount: invoice.amount,
                currency: invoice.currency,
                payToken: invoice.pay_token,
                dueDate: invoice.due_date,
                projectName: onboardingProject.project?.project_name || null,
            }).then((r) => { summary.emailStatus = r?.success ? 'sent' : 'failed'; })
              .catch(() => { summary.emailStatus = 'failed'; });
        }

        // ── 7. Audit + admin notification ──
        writeAuditLog({
            action: 'QUOTATION_ACCEPTED',
            entityType: 'quotations',
            entityId: quotationId,
            details: { clientId, projectId: summary.projectId, invoiceId: invoice.id, depositAmount, currency, percent },
            user,
            ipAddress,
        }).catch(() => {});

        await notifyOwnerOnce('quotation', quotationId, 'accepted', {
            type: 'quotation',
            title: 'Quotation accepted — deposit invoice created',
            body: `"${quotation.title || 'Quotation'}" accepted. Deposit invoice ${invoice.invoice_number} (${currency} ${Number(invoice.amount).toLocaleString()}) sent to ${clientEmail || 'client'}.`,
            link: '/admin/invoices',
        });

        return summary;
    } catch (err) {
        console.error('[Automation] onQuotationAccepted error:', err.message);
        writeAuditLog({
            action: 'AUTOMATION_FAILED',
            entityType: 'quotations',
            entityId: quotationId,
            details: { trigger: 'quotation.accepted', error: err.message },
            user,
            ipAddress,
        }).catch(() => {});
        summary.reason = 'error';
        return summary;
    }
}

// ── Trigger 2: payment.paid (deposit) ────────────────────
export async function onInvoicePaid({ invoiceId, via = 'UNKNOWN', user = null, ipAddress = null }) {
    const summary = { ok: false, reason: null, deposit: false, onboardingCreated: false, actionsCreated: 0 };

    try {
        if (!isUuid(invoiceId)) {
            summary.reason = 'invalid_id';
            return summary;
        }

        const { rows } = await pool.query(
            `SELECT i.*, q.title AS quotation_title, q.line_items AS quotation_items,
                    c.name AS client_name, c.status AS client_status
               FROM invoices i
               LEFT JOIN quotations q ON q.id = i.quotation_id
               LEFT JOIN clients c ON c.id = i.client_id
              WHERE i.id = $1`,
            [invoiceId]
        );
        if (rows.length === 0) {
            summary.reason = 'invoice_not_found';
            return summary;
        }
        const invoice = rows[0];

        if (invoice.status !== 'PAID') {
            summary.reason = 'not_paid';
            return summary;
        }

        // Only deposit invoices (linked to a quotation) trigger the
        // onboarding chain — milestone/final invoices just pay down
        // the project (handled by the existing aggregate logic).
        if (!invoice.quotation_id) {
            summary.ok = true;
            summary.reason = 'not_deposit_invoice';
            return summary;
        }
        summary.deposit = true;

        if (!invoice.client_id) {
            summary.reason = 'no_client';
            return summary;
        }

        // ── 1. Activate the client account ──
        if (invoice.client_status === 'INACTIVE') {
            await pool.query(`UPDATE clients SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1`, [invoice.client_id]);
        }

        // ── 2. Create the onboarding (+ invite email on first create) ──
        const onboarding = await ensureOnboardingForClient({
            clientId: invoice.client_id,
            projectId: invoice.project_id,
            projectType: inferProjectType(invoice),
            sendInvite: true,
            user: null, // automated
            ipAddress,
        });
        summary.onboardingCreated = onboarding.created;
        summary.ok = onboarding.ok;

        // ── 3. Starter client actions (only on first onboarding create
        //       — that's the idempotency gate for these rows too) ──
        if (onboarding.created) {
            const starterActions = [
                {
                    title: 'Complete your onboarding form',
                    description: 'The form saves as you go — it takes about 10–15 minutes.',
                    type: 'INFO', priority: 'HIGH', dueDays: 3,
                },
                {
                    title: 'Prepare domain & brand assets',
                    description: 'Domain registrar name, logo files and any brand colours/fonts you already have.',
                    type: 'UPLOAD', priority: 'MEDIUM', dueDays: 5,
                },
            ];
            for (const a of starterActions) {
                const { rows: actionRows } = await pool.query(
                    `INSERT INTO client_actions (client_id, project_id, title, description, type, priority, due_at)
                     VALUES ($1, $2, $3, $4, $5, $6, NOW() + ($7 || ' days')::interval)
                     RETURNING id`,
                    [invoice.client_id, invoice.project_id, a.title, a.description, a.type, a.priority, String(a.dueDays)]
                );
                summary.actionsCreated += actionRows.length;
                writeAuditLog({
                    action: 'CLIENT_ACTION_CREATED',
                    entityType: 'client_actions',
                    entityId: actionRows[0].id,
                    details: { title: a.title, clientId: invoice.client_id, automated: true, trigger: 'deposit_paid' },
                }).catch(() => {});
            }
        }

        // ── 4. Point the project at its next step ──
        if (invoice.project_id) {
            await pool.query(
                `UPDATE client_projects
                    SET next_action = 'Review onboarding responses',
                        next_action_due_at = NOW() + INTERVAL '7 days',
                        updated_at = NOW()
                  WHERE id = $1 AND status NOT IN ('ARCHIVED')`,
                [invoice.project_id]
            );
        }

        // ── 5. Audit + deduped admin notification ──
        writeAuditLog({
            action: 'DEPOSIT_PAID_CHAIN',
            entityType: 'invoices',
            entityId: invoiceId,
            details: {
                via, clientId: invoice.client_id,
                onboardingId: onboarding.onboarding?.id || null,
                onboardingCreated: onboarding.created,
                actionsCreated: summary.actionsCreated,
            },
            user,
            ipAddress,
        }).catch(() => {});

        await notifyOwnerOnce('invoice', invoiceId, 'deposit_paid', {
            type: 'payment',
            title: 'Deposit received — onboarding started',
            body: `${invoice.client_name || 'A client'} paid deposit invoice ${invoice.invoice_number} (${invoice.currency} ${Number(invoice.amount).toLocaleString()}, via ${via}).${onboarding.created ? ' Onboarding created and invite emailed.' : ''}`,
            link: invoice.client_id ? `/admin/clients/${invoice.client_id}` : '/admin/invoices',
        });

        return summary;
    } catch (err) {
        console.error('[Automation] onInvoicePaid error:', err.message);
        writeAuditLog({
            action: 'AUTOMATION_FAILED',
            entityType: 'invoices',
            entityId: invoiceId,
            details: { trigger: 'payment.paid', error: err.message },
            user,
            ipAddress,
        }).catch(() => {});
        summary.reason = 'error';
        return summary;
    }
}
