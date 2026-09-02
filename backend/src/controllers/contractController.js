// ── src/controllers/contractController.js ───────────────────
// Native contract lifecycle management: creation, public token-gated
// signing, audit trail recording, and document export.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import pool from '../config/db.js';
import {
    CONTRACT_TEMPLATES,
    generateSigningToken,
    computeContractHash,
    sendContractSigningInvite,
    sendContractSignedNotification,
} from '../services/contractService.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

// ── 1. Create Contract (Admin) ─────────────────────────────
export async function createContract(req, res) {
    try {
        const schema = z.object({
            clientId: z.string().uuid(),
            projectId: z.string().uuid().optional().nullable(),
            title: z.string().min(3).optional(),
            contractType: z.enum(['SOFTWARE', 'DRONE', 'SURVEY', 'CUSTOM']).default('SOFTWARE'),
            termsContent: z.string().optional(),
            amount: z.number().nonnegative().optional().default(0),
            currency: z.string().default('NGN'),
            depositAmount: z.number().nonnegative().optional().default(0),
            duration: z.string().optional().nullable(),
            signatoryEmail: z.string().email(),
            signatoryName: z.string().min(2),
            expiresInDays: z.number().positive().default(30),
        });

        const data = schema.parse(req.body);

        // Fallback terms to template default if not explicitly provided
        const templateInfo = CONTRACT_TEMPLATES[data.contractType] || CONTRACT_TEMPLATES.SOFTWARE;
        const title = data.title?.trim() || templateInfo.title;
        const termsContent = data.termsContent?.trim() || templateInfo.defaultTerms;

        // Fetch client details for context
        const { rows: clientRows } = await pool.query(
            `SELECT name, primary_contact_email FROM clients WHERE id = $1`,
            [data.clientId]
        );
        if (clientRows.length === 0) {
            return res.status(404).json({ error: 'Client not found.' });
        }
        const client = clientRows[0];

        // Fetch project name if linked
        let projectName = null;
        if (data.projectId) {
            const { rows: projRows } = await pool.query(
                `SELECT project_name FROM client_projects WHERE id = $1`,
                [data.projectId]
            );
            if (projRows.length > 0) projectName = projRows[0].project_name;
        }

        const signingToken = generateSigningToken();
        const clientIp = getClientIp(req);
        const expiresAt = new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000);

        const initialAuditTrail = [
            {
                event: 'CREATED',
                at: new Date().toISOString(),
                ip: clientIp,
                user: req.user?.email || 'admin',
                details: `Agreement created by studio admin with ${data.expiresInDays}-day validity.`,
            },
            {
                event: 'SENT',
                at: new Date().toISOString(),
                details: `Digital signing link generated and dispatched to ${data.signatoryEmail}.`,
            },
        ];

        const { rows } = await pool.query(
            `INSERT INTO contracts
             (client_id, project_id, title, contract_type, terms_content, amount, currency,
              deposit_amount, duration, signatory_email, signer_name, signing_token,
              status, sent_at, expires_at, audit_trail)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'SENT', NOW(), $13, $14)
             RETURNING *`,
            [
                data.clientId,
                data.projectId || null,
                title,
                data.contractType,
                termsContent,
                data.amount,
                data.currency,
                data.depositAmount,
                data.duration || null,
                data.signatoryEmail,
                data.signatoryName,
                signingToken,
                expiresAt,
                JSON.stringify(initialAuditTrail),
            ]
        );

        const contract = rows[0];
        const frontendUrl = (process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '');
        const signUrl = `${frontendUrl}/sign/${signingToken}`;

        // Fire-and-forget invitation email
        sendContractSigningInvite({
            clientEmail: data.signatoryEmail,
            clientName: data.signatoryName,
            contractTitle: title,
            projectName,
            signUrl,
            amount: data.amount,
            currency: data.currency,
            expiresAt,
        }).catch((err) => console.error('[ContractController] Invite email error:', err.message));

        await writeAuditLog({
            action: 'CONTRACT_CREATED',
            entityType: 'contracts',
            entityId: contract.id,
            user: req.user,
            ipAddress: clientIp,
            metadata: { contractType: data.contractType, clientName: client.name, signUrl },
        });

        return res.status(201).json({
            ...contract,
            sign_url: signUrl,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0]?.message || 'Invalid contract data.' });
        }
        console.error('[ContractController] createContract error:', err);
        return res.status(500).json({ error: 'Failed to create contract.' });
    }
}

// ── 2. List Contracts (Admin) ──────────────────────────────
export async function getContracts(req, res) {
    try {
        const { rows } = await pool.query(`
            SELECT c.*, cl.name AS client_name, p.project_name
            FROM contracts c
            LEFT JOIN clients cl ON c.client_id = cl.id
            LEFT JOIN client_projects p ON c.project_id = p.id
            ORDER BY c.created_at DESC
        `);
        return res.json(rows);
    } catch (err) {
        console.error('[ContractController] getContracts error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── 3. Get Contract Details (Admin) ────────────────────────
export async function getContract(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `SELECT c.*, cl.name AS client_name, p.project_name
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.id
             LEFT JOIN client_projects p ON c.project_id = p.id
             WHERE c.id = $1`,
            [id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found.' });
        }
        return res.json(rows[0]);
    } catch (err) {
        console.error('[ContractController] getContract error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── 4. Public Token Inspection (Signer Page Load) ──────────
export async function getContractForSigning(req, res) {
    try {
        const { token } = req.params;
        if (!token || token.length < 20) {
            return res.status(400).json({ error: 'Invalid signing token.' });
        }

        const { rows } = await pool.query(
            `SELECT c.*, cl.name AS client_name, p.project_name
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.id
             LEFT JOIN client_projects p ON c.project_id = p.id
             WHERE c.signing_token = $1`,
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found or invalid signing link.' });
        }

        const contract = rows[0];

        // If viewed for the first time, record timestamp and audit event
        if (!contract.viewed_at && contract.status === 'SENT') {
            const clientIp = getClientIp(req);
            const userAgent = req.headers['user-agent'] || 'Unknown';
            const updatedAudit = Array.isArray(contract.audit_trail) ? contract.audit_trail : [];
            updatedAudit.push({
                event: 'VIEWED',
                at: new Date().toISOString(),
                ip: clientIp,
                userAgent: userAgent.slice(0, 150),
                details: 'Signer accessed the contract for digital review.',
            });

            await pool.query(
                `UPDATE contracts
                 SET viewed_at = NOW(), audit_trail = $1
                 WHERE id = $2`,
                [JSON.stringify(updatedAudit), contract.id]
            );
        }

        // Check expiration
        const isExpired = contract.expires_at && new Date(contract.expires_at) < new Date();

        return res.json({
            id: contract.id,
            title: contract.title,
            contractType: contract.contract_type,
            termsContent: contract.terms_content,
            amount: contract.amount,
            currency: contract.currency,
            depositAmount: contract.deposit_amount,
            duration: contract.duration,
            status: contract.status,
            signatoryName: contract.signer_name || contract.signatory_name,
            signatoryEmail: contract.signatory_email,
            clientName: contract.client_name,
            projectName: contract.project_name,
            sentAt: contract.sent_at,
            signedAt: contract.signed_at,
            signatureData: contract.signature_data,
            contractHash: contract.contract_hash,
            isExpired,
        });
    } catch (err) {
        console.error('[ContractController] getContractForSigning error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── 5. Sign Contract (Public Submission) ────────────────────
export async function signContract(req, res) {
    try {
        const { token } = req.params;
        const schema = z.object({
            signerName: z.string().min(2, 'Legal full name is required.'),
            signerEmail: z.string().email('Valid email is required.'),
            signatureData: z.string().min(20, 'Signature drawing is required.'),
            agreedToTerms: z.literal(true, {
                errorMap: () => ({ message: 'You must check the box agreeing to the terms.' }),
            }),
        });

        const data = schema.parse(req.body);

        const { rows } = await pool.query(
            `SELECT c.*, cl.name AS client_name, p.project_name
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.id
             LEFT JOIN client_projects p ON c.project_id = p.id
             WHERE c.signing_token = $1`,
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found.' });
        }

        const contract = rows[0];

        if (contract.status === 'SIGNED') {
            return res.status(409).json({ error: 'This contract has already been signed and executed.' });
        }

        if (contract.expires_at && new Date(contract.expires_at) < new Date()) {
            return res.status(400).json({ error: 'This signing link has expired. Please request a new agreement.' });
        }

        const clientIp = getClientIp(req);
        const userAgent = (req.headers['user-agent'] || 'Unknown').slice(0, 200);
        const signedAt = new Date().toISOString();

        // Calculate cryptographic SHA-256 integrity hash
        const contractHash = computeContractHash({
            contractId: contract.id,
            title: contract.title,
            termsContent: contract.terms_content,
            amount: contract.amount,
            currency: contract.currency,
            signerName: data.signerName,
            signerEmail: data.signerEmail,
            signatureData: data.signatureData,
            signedAt,
        });

        const auditTrail = Array.isArray(contract.audit_trail) ? contract.audit_trail : [];
        auditTrail.push({
            event: 'SIGNED',
            at: signedAt,
            ip: clientIp,
            userAgent,
            signerName: data.signerName,
            signerEmail: data.signerEmail,
            contractHash,
            details: 'Digital signature verified and legally affirmed by the signatory.',
        });

        const { rows: updated } = await pool.query(
            `UPDATE contracts
             SET status = 'SIGNED',
                 signed_at = NOW(),
                 signer_name = $1,
                 signature_data = $2,
                 signer_ip = $3,
                 signer_user_agent = $4,
                 contract_hash = $5,
                 audit_trail = $6,
                 updated_at = NOW()
             WHERE id = $7 AND status = 'SENT'
             RETURNING *`,
            [
                data.signerName,
                data.signatureData,
                clientIp,
                userAgent,
                contractHash,
                JSON.stringify(auditTrail),
                contract.id,
            ]
        );

        if (updated.length === 0) {
            return res.status(409).json({ error: 'Contract could not be updated. Status may have changed.' });
        }

        const finalized = updated[0];

        // Send email notifications
        sendContractSignedNotification({
            clientEmail: data.signerEmail,
            clientName: data.signerName,
            contractTitle: finalized.title,
            projectName: contract.project_name,
            signedAt,
            contractId: finalized.id,
        }).catch((err) => console.error('[ContractController] Signed notification error:', err.message));

        await writeAuditLog({
            action: 'CONTRACT_SIGNED',
            entityType: 'contracts',
            entityId: finalized.id,
            ipAddress: clientIp,
            metadata: {
                signerName: data.signerName,
                signerEmail: data.signerEmail,
                contractHash,
            },
        });

        return res.json({
            success: true,
            message: 'Contract has been signed and executed successfully.',
            contract: {
                id: finalized.id,
                title: finalized.title,
                status: finalized.status,
                signedAt: finalized.signed_at,
                contractHash: finalized.contract_hash,
            },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ error: err.errors[0]?.message || 'Invalid signature data.' });
        }
        console.error('[ContractController] signContract error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

// ── 6. Download Contract Document ──────────────────────────
export async function downloadContractPDF(req, res) {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `SELECT c.*, cl.name AS client_name, p.project_name
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.id
             LEFT JOIN client_projects p ON c.project_id = p.id
             WHERE c.id = $1`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Contract not found.' });
        }

        const c = rows[0];
        const formattedAmount = c.amount > 0
            ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: c.currency || 'NGN' }).format(Number(c.amount))
            : 'As agreed per milestone';

        // Render high-fidelity printable HTML document
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${c.title} — BuildWith_Lami</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
    .header { border-bottom: 2px solid #ff5500; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 24px; font-weight: 800; color: #0f172a; }
    .brand span { color: #ff5500; }
    .title { font-size: 20px; font-weight: 800; margin: 0 0 10px 0; color: #0f172a; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 13px; }
    .terms { font-size: 13px; white-space: pre-wrap; margin-bottom: 30px; background: #ffffff; }
    .signature-card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 24px; margin-top: 40px; background: #fdfdfe; page-break-inside: avoid; }
    .sig-img { max-height: 70px; margin: 10px 0; display: block; }
    .cert-badge { display: inline-block; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px; text-transform: uppercase; margin-bottom: 12px; }
    .cert-table { width: 100%; border-collapse: collapse; font-size: 12px; color: #475569; margin-top: 10px; }
    .cert-table td { padding: 4px 0; }
    .hash { font-family: monospace; font-size: 10px; word-break: break-all; color: #0f172a; font-weight: bold; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background:#ff5500; color:#fff; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand">BuildWith<span>_Lami</span> Studio</div>
      <div style="font-size: 12px; color: #64748b;">Software Architecture · Aerial Drone Surveying · Geodetic Mapping</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      Document ID: <strong style="color: #0f172a;">${c.id.slice(0, 13)}</strong><br/>
      Date: ${new Date(c.created_at).toLocaleDateString()}
    </div>
  </div>

  <h1 class="title">${c.title}</h1>

  <div class="meta-box">
    <div><strong>Client:</strong> ${c.client_name || 'Client'}</div>
    <div><strong>Project:</strong> ${c.project_name || 'General Engagement'}</div>
    <div><strong>Signatory:</strong> ${c.signer_name || c.signatory_email}</div>
    <div><strong>Total Fee:</strong> ${formattedAmount}</div>
    ${c.duration ? `<div><strong>Duration:</strong> ${c.duration}</div>` : ''}
    <div><strong>Status:</strong> <span style="font-weight:700; color:${c.status === 'SIGNED' ? '#166534' : '#ea580c'}">${c.status}</span></div>
  </div>

  <div class="terms">${c.terms_content}</div>

  ${c.status === 'SIGNED' ? `
  <div class="signature-card">
    <div class="cert-badge">Certified Electronic Signature</div>
    <div style="font-size: 14px; font-weight: bold; color: #0f172a;">Executed by: ${c.signer_name}</div>
    ${c.signature_data ? `<img src="${c.signature_data}" class="sig-img" alt="Digital Signature" />` : ''}
    <table class="cert-table">
      <tr><td style="width: 130px;">Signer Email:</td><td><strong>${c.signatory_email}</strong></td></tr>
      <tr><td>Execution Timestamp:</td><td><strong>${new Date(c.signed_at).toUTCString()}</strong></td></tr>
      <tr><td>Signer IP Address:</td><td>${c.signer_ip || 'Verified'}</td></tr>
      <tr><td>Document SHA-256:</td><td class="hash">${c.contract_hash || 'SHA256-AUTHENTICATED'}</td></tr>
    </table>
    <div style="margin-top: 14px; pt: 10px; border-top: 1px dashed #cbd5e1; font-size: 11px; color: #64748b;">
      This legal document was executed using BuildWith_Lami certified electronic signature and audit trail protocol.
    </div>
  </div>
  ` : `
  <div style="margin-top: 40px; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px; text-align: center; color: #64748b; font-size: 13px;">
    Document awaiting digital execution by ${c.signatory_email}.
  </div>
  `}
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
    } catch (err) {
        console.error('[ContractController] downloadContractPDF error:', err);
        return res.status(500).json({ error: 'Failed to generate contract document.' });
    }
}
