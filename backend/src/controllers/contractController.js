import pool from '../config/db.js';
import {
    createAgreement,
    getStatus,
    downloadPDF,
    isZohoStubMode,
} from '../services/zohoSignService.js';
import { verifyWebhookSignature } from '../utils/webhookVerify.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';
import { z } from 'zod';

// Zoho Sign webhook authentication. In production we expect
// ZOHO_SIGN_WEBHOOK_SECRET; in stub mode the same property
// is sourced from STUB_WEBHOOK_SECRET so an unauthenticated
// POST can never silently sign a contract.
const zohoWebhookSecret = process.env.ZOHO_SIGN_WEBHOOK_SECRET
    || (isZohoStubMode() ? process.env.STUB_WEBHOOK_SECRET : '');

export const zohoSignWebhookAuth = verifyWebhookSignature({
    secret: zohoWebhookSecret,
    headerName: 'x-zoho-signature',
    timestampHeader: 'x-zoho-timestamp',
    encoding: 'base64',
});

export async function createContract(req, res) {
    try {
        const schema = z.object({
            clientId: z.string().uuid(),
            projectId: z.string().uuid().optional(),
            templateId: z.string(),
            signatoryEmail: z.string().email(),
            signatoryName: z.string(),
            customFields: z.record(z.any()).optional()
        });

        const data = schema.parse(req.body);

        // Call Zoho Sign service (or stub). The stub now
        // explicitly returns status='SENT' and never auto-signs.
        const zohoResult = await createAgreement(data.templateId, {
            email: data.signatoryEmail,
            name: data.signatoryName
        }, data.customFields);

        const { rows } = await pool.query(
            `INSERT INTO contracts
             (client_id, project_id, template_id, agreement_id, signatory_email, status, sent_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             RETURNING *`,
            [data.clientId, data.projectId || null, data.templateId, zohoResult.agreementId, data.signatoryEmail, 'SENT']
        );

        await writeAuditLog({
            action: 'CONTRACT_SENT',
            entityType: 'contracts',
            entityId: rows[0].id,
            user: req.user,
            ipAddress: getClientIp(req),
            metadata: { stub: isZohoStubMode(), templateId: data.templateId },
        });

        res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[ContractController] createContract error:', err);
        res.status(500).json({ error: 'Failed to create contract' });
    }
}

export async function getContract(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(`SELECT * FROM contracts WHERE id = $1`, [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });

        const contract = rows[0];

        // Sync status with Zoho Sign if not fully signed.
        // getStatus() now only reports SENT/SIGNED/VOID/EXPIRED —
        // it never auto-signs in stub mode.
        if (contract.status === 'SENT') {
            const currentStatus = await getStatus(contract.agreement_id);
            // Map Zoho status to our enum
            let mappedStatus = contract.status;
            const normalized = String(currentStatus).toLowerCase();

            if (normalized.includes('signed') || normalized === 'completed') mappedStatus = 'SIGNED';
            else if (normalized.includes('declined') || normalized.includes('void')) mappedStatus = 'VOID';
            else if (normalized.includes('expired')) mappedStatus = 'EXPIRED';

            if (mappedStatus !== contract.status) {
                const { rows: updated } = await pool.query(
                    `UPDATE contracts SET status = $1, updated_at = NOW() ${mappedStatus === 'SIGNED' ? ', signed_at = NOW()' : ''} WHERE id = $2 RETURNING *`,
                    [mappedStatus, id]
                );
                return res.json(updated[0]);
            }
        }

        res.json(contract);
    } catch (err) {
        console.error('[ContractController] getContract error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getContracts(req, res) {
    try {
        const { rows } = await pool.query(`
            SELECT c.*, cl.name as client_name, p.project_name
            FROM contracts c
            LEFT JOIN clients cl ON c.client_id = cl.id
            LEFT JOIN client_projects p ON c.project_id = p.id
            ORDER BY c.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('[ContractController] getContracts error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export async function downloadContractPDF(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(`SELECT agreement_id FROM contracts WHERE id = $1`, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Contract not found' });

        const pdfBuffer = await downloadPDF(rows[0].agreement_id);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="contract_${id}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('[ContractController] downloadContractPDF error:', err);
        res.status(500).json({ error: 'Failed to download PDF' });
    }
}

/**
 * Inbound Zoho Sign webhook. Every request MUST carry a
 * valid HMAC-SHA256 signature in the `X-Zoho-Signature`
 * header. The middleware is wired in contractRoutes.js and
 * rejects anything that doesn't verify.
 *
 * State transitions allowed here:
 *   SENT   -> SIGNED
 *   SENT   -> VOID
 *   SENT   -> EXPIRED
 *
 * The post-sign workflow (invoice + project + notifications)
 * is fired exactly once by the SIGNED transition guarded by
 * an idempotency flag in the update statement.
 */
export async function zohoSignWebhook(req, res) {
    try {
        const data = req.body || {};
        const agreementId = data.requests?.request_id
            || data.agreement_id
            || data.request_id;
        const status = data.requests?.request_status
            || data.request_status
            || data.status;

        if (!agreementId || !status) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const normalized = String(status).toLowerCase();
        let mappedStatus = 'SENT';

        if (normalized.includes('signed') || normalized === 'completed') mappedStatus = 'SIGNED';
        else if (normalized.includes('declined') || normalized.includes('void')) mappedStatus = 'VOID';
        else if (normalized.includes('expired')) mappedStatus = 'EXPIRED';

        // Idempotent: only transition if the contract is
        // currently SENT, so a replayed webhook (or a manual
        // /forceSign) cannot fire the post-sign workflow twice.
        const { rows } = await pool.query(
            `UPDATE contracts
                SET status = $1,
                    updated_at = NOW(),
                    signed_at = CASE WHEN $1 = 'SIGNED' AND signed_at IS NULL THEN NOW() ELSE signed_at END
              WHERE agreement_id = $2 AND status = 'SENT'
              RETURNING *`,
            [mappedStatus, agreementId]
        );

        // 200 OK even when we ignored the update — the sender
        // does not need to know whether the row was already in
        // a terminal state.
        if (rows.length > 0) {
            await writeAuditLog({
                action: mappedStatus === 'SIGNED' ? 'CONTRACT_SIGNED_VIA_WEBHOOK' : `CONTRACT_${mappedStatus}_VIA_WEBHOOK`,
                entityType: 'contracts',
                entityId: rows[0].id,
                ipAddress: getClientIp(req),
                metadata: { agreementId, mappedStatus, stub: isZohoStubMode() },
            });
        }

        res.status(200).send('OK');
    } catch (err) {
        console.error('[ContractController] Webhook error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Manual dev/stub signing action. Restricted to Owner, 2FA
 * step-up, and a clear audit log entry. NOT exposed in
 * production builds unless the Owner explicitly enables it
 * — see the ZOHO_ALLOW_FORCE_SIGN env gate.
 *
 * The contract is transitioned SENT -> SIGNED with the same
 * idempotency rule as the webhook path so the post-sign
 * workflow can never run twice.
 */
export async function forceSignContract(req, res) {
    const allow = process.env.ZOHO_ALLOW_FORCE_SIGN === 'true' || isZohoStubMode();
    if (!allow) {
        return res.status(403).json({ error: 'forceSign is disabled in this environment.' });
    }
    const totp = typeof req.body?.twoFactorCode === 'string' ? req.body.twoFactorCode.trim() : '';
    if (!/^\d{6}$/.test(totp)) {
        return res.status(400).json({ error: 'A valid 6-digit 2FA code is required for forceSign.' });
    }

    const { consumeTwoFactorCredential } = await import('../services/twoFactorService.js');
    const verified = await consumeTwoFactorCredential(req.user.id, totp);
    if (!verified.ok) {
        return res.status(401).json({ error: '2FA code did not verify.' });
    }

    const { id } = req.params;
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
        return res.status(400).json({ error: 'Invalid contract id.' });
    }

    const { rows } = await pool.query(
        `UPDATE contracts
            SET status = 'SIGNED',
                updated_at = NOW(),
                signed_at = COALESCE(signed_at, NOW())
          WHERE id = $1 AND status = 'SENT'
          RETURNING *`,
        [id]
    );
    if (rows.length === 0) {
        return res.status(409).json({ error: 'Contract is not in SENT state.' });
    }

    await writeAuditLog({
        action: 'CONTRACT_FORCE_SIGNED',
        entityType: 'contracts',
        entityId: rows[0].id,
        user: req.user,
        ipAddress: getClientIp(req),
        metadata: { stub: isZohoStubMode(), twoFactorMethod: verified.kind },
    });

    return res.json(rows[0]);
}
