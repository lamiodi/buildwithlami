import pool from '../config/db.js';
import { createAgreement, getStatus, downloadPDF } from '../services/zohoSignService.js';
import { z } from 'zod';

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

        // Call Zoho Sign service (or stub)
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

        // Sync status with Zoho Sign if not fully signed
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

export async function zohoSignWebhook(req, res) {
    try {
        // Typical webhook logic for Zoho Sign
        // Verifying the webhook payload is essential in production
        // Assuming payload has agreement_id and request_status
        const data = req.body;
        const agreementId = data.requests?.request_id;
        const status = data.requests?.request_status;

        if (!agreementId || !status) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const normalized = String(status).toLowerCase();
        let mappedStatus = 'SENT';
        
        if (normalized.includes('signed') || normalized === 'completed') mappedStatus = 'SIGNED';
        else if (normalized.includes('declined') || normalized.includes('void')) mappedStatus = 'VOID';
        else if (normalized.includes('expired')) mappedStatus = 'EXPIRED';

        await pool.query(
            `UPDATE contracts SET status = $1, updated_at = NOW() ${mappedStatus === 'SIGNED' ? ', signed_at = NOW()' : ''} WHERE agreement_id = $2`,
            [mappedStatus, agreementId]
        );

        res.status(200).send('OK');
    } catch (err) {
        console.error('[ContractController] Webhook error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
