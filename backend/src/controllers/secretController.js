import { z } from 'zod';
import pool from '../config/db.js';
import { encrypt, decrypt } from '../utils/crypto.js';

const secretSchema = z.object({
    clientId: z.string().uuid(),
    keyName: z.string().min(1),
    value: z.string().min(1)
});

export async function createSecret(req, res) {
    try {
        const { clientId, keyName, value } = secretSchema.parse(req.body);

        const { iv, encryptedData, authTag } = encrypt(value);

        const { rows } = await pool.query(
            `INSERT INTO project_secrets (client_id, key_name, encrypted_value, iv, auth_tag)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, client_id, key_name, created_at`,
            [clientId, keyName, encryptedData, iv, authTag]
        );

        return res.status(201).json(rows[0]);
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Secrets] createSecret error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function getSecretsByClient(req, res) {
    try {
        const { clientId } = req.params;

        const { rows } = await pool.query(
            `SELECT * FROM project_secrets WHERE client_id = $1 ORDER BY created_at DESC`,
            [clientId]
        );

        const decryptedSecrets = rows.map(row => {
            try {
                return {
                    id: row.id,
                    client_id: row.client_id,
                    project_id: row.project_id,
                    key_name: row.key_name,
                    value: decrypt(row.encrypted_value, row.iv, row.auth_tag),
                    created_at: row.created_at,
                    updated_at: row.updated_at
                };
            } catch (decryptErr) {
                // Don't leak decryption internals to the client; surface as null.
                console.error(`[Secrets] Failed to decrypt secret ${row.id}:`, decryptErr.message);
                return {
                    id: row.id,
                    client_id: row.client_id,
                    project_id: row.project_id,
                    key_name: row.key_name,
                    value: null,
                    decrypt_error: true,
                    created_at: row.created_at,
                    updated_at: row.updated_at
                };
            }
        });

        return res.json(decryptedSecrets);
    } catch (err) {
        console.error('[Secrets] getSecretsByClient error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function submitSecretByTrackingId(req, res) {
    try {
        const { trackingId } = req.params;
        const { keyName, value } = req.body;

        if (!keyName || !value) {
            return res.status(400).json({ error: 'Service name and secret value are required.' });
        }

        // Find project by trackingId to get client_id
        const projectResult = await pool.query(
            'SELECT id, client_id FROM client_projects WHERE tracking_id = $1',
            [trackingId]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const projectId = projectResult.rows[0].id;
        const clientId = projectResult.rows[0].client_id;
        const { iv, encryptedData, authTag } = encrypt(value);

        const { rows } = await pool.query(
            `INSERT INTO project_secrets (project_id, client_id, key_name, encrypted_value, iv, auth_tag)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, key_name, created_at`,
            [projectId, clientId, keyName, encryptedData, iv, authTag]
        );

        return res.status(201).json({ message: 'Secret securely stored in vault.', id: rows[0].id });
    } catch (err) {
        console.error('[Secrets] submitSecretByTrackingId error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
