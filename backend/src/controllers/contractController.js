// ── controllers/contractController.js ────────────────────
// Phase 8 — Zoho Sign contract flow.
//
// Per the user's design decision, signed PDFs are stored in the
// PostgreSQL database as `bytea` (see v17 migration) rather than
// pushed to Supabase Storage. This keeps the backend self-contained
// and works correctly on Vercel's serverless runtime (where local
// filesystem storage wouldn't survive a cold start).
//
// The Zoho Sign service is currently in **stub mode** (returns
// dummy data) because the user hasn't registered a Zoho Sign
// account yet. When `ZOHO_SIGN_TOKEN` is set in the environment,
// `services/zohoSignService.js` switches to live API calls; the
// controller code does not need to change.

import pool from '../config/db.js';
import { createAgreement, getStatus, downloadPDF } from '../services/zohoSignService.js';

export const createContract = async (req, res) => {
    const { client_id, project_id, template_id, signatory_email, signatory_name } = req.body;

    if (!client_id || !template_id || !signatory_email) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const zohoResponse = await createAgreement(template_id, { email: signatory_email, name: signatory_name });
        const agreement_id = zohoResponse.requests.request_id;

        const result = await pool.query(
            `INSERT INTO contracts (client_id, project_id, template_id, agreement_id, signatory_email, status, sent_at)
             VALUES ($1, $2, $3, $4, $5, 'SENT', NOW()) RETURNING *`,
            [client_id, project_id || null, template_id, agreement_id, signatory_email]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('[Contracts] createContract error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getContracts = async (req, res) => {
    try {
        // Don't ship the binary PDF in list responses — only metadata.
        // (signed_pdf is excluded by name to keep payloads small.)
        const result = await pool.query(
            `SELECT c.id, c.client_id, c.project_id, c.template_id, c.agreement_id,
                    c.signatory_email, c.status, c.signed_pdf_url, c.signed_pdf_filename,
                    c.signed_pdf_size_bytes, c.sent_at, c.signed_at, c.created_at, c.updated_at,
                    cl.name AS client_name, p.project_name
             FROM contracts c
             LEFT JOIN clients cl ON c.client_id = cl.id
             LEFT JOIN client_projects p ON c.project_id = p.id
             ORDER BY c.created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('[Contracts] getContracts error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getContractStatus = async (req, res) => {
    const { id } = req.params;

    try {
        const contractRes = await pool.query('SELECT * FROM contracts WHERE id = $1', [id]);
        if (contractRes.rows.length === 0) return res.status(404).json({ message: 'Contract not found' });

        const contract = contractRes.rows[0];
        if (contract.status === 'SIGNED' || contract.status === 'VOID') {
            return res.status(200).json({ status: contract.status });
        }

        const zohoStatus = await getStatus(contract.agreement_id);

        // Normalize Zoho status
        let newStatus = contract.status;
        if (zohoStatus === 'signed' || zohoStatus === 'SIGNED') newStatus = 'SIGNED';
        else if (zohoStatus === 'declined' || zohoStatus === 'voided') newStatus = 'VOID';

        if (newStatus !== contract.status) {
            await pool.query('UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, id]);
        }

        res.status(200).json({ status: newStatus });
    } catch (error) {
        console.error('[Contracts] getContractStatus error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Streams the signed PDF (stored as bytea) back to the admin.
export const downloadContractPDF = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT signed_pdf, signed_pdf_filename FROM contracts WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0 || !result.rows[0].signed_pdf) {
            return res.status(404).json({ message: 'Signed PDF not found for this contract.' });
        }

        const { signed_pdf, signed_pdf_filename } = result.rows[0];
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition',
            `attachment; filename="${signed_pdf_filename || `contract_${id}.pdf`}"`);
        res.send(signed_pdf);
    } catch (error) {
        console.error('[Contracts] downloadContractPDF error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const handleWebhook = async (req, res) => {
    // Zoho Sign webhook payload typically contains the agreement ID and its new status.
    const { requests } = req.body;

    if (!requests || !requests.request_id || !requests.request_status) {
        return res.status(400).json({ message: 'Invalid payload' });
    }

    try {
        const agreement_id = requests.request_id;
        let status = 'SENT';
        if (requests.request_status === 'signed') status = 'SIGNED';
        if (requests.request_status === 'declined' || requests.request_status === 'recalled') status = 'VOID';

        // Update status in db
        await pool.query(
            'UPDATE contracts SET status = $1, updated_at = NOW() WHERE agreement_id = $2',
            [status, agreement_id]
        );

        // If signed, download the PDF from Zoho and store it as bytea
        // in the same row. No external storage dependency.
        if (status === 'SIGNED') {
            const pdfBuffer = await downloadPDF(agreement_id);
            const filename = `contract_${agreement_id}.pdf`;

            await pool.query(
                `UPDATE contracts
                 SET signed_pdf = $1,
                     signed_pdf_filename = $2,
                     signed_pdf_size_bytes = $3,
                     signed_at = NOW()
                 WHERE agreement_id = $4`,
                [pdfBuffer, filename, pdfBuffer.length, agreement_id]
            );
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('[Contracts] handleWebhook error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};
