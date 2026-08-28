import dotenv from 'dotenv';
dotenv.config();

const ZOHO_SIGN_TOKEN = process.env.ZOHO_SIGN_TOKEN || '';
const ZOHO_SIGN_API_BASE = process.env.ZOHO_SIGN_API_BASE || 'https://sign.zoho.com/api/v1';

// `stub` mode is the default — the project ships without a
// real Zoho account configured. It must NEVER simulate a
// signature on its own. If you want to advance a contract to
// `SIGNED` in dev, do it explicitly through the manual
// `forceSign` controller (which is itself 2FA-gated).
export function isZohoStubMode() {
    return !ZOHO_SIGN_TOKEN;
}

/**
 * Creates an agreement from a template and sends it to the signer.
 * @param {string} templateId - Zoho Sign template ID
 * @param {object} signer - { email: string, name: string }
 * @param {object} customFields - Key-value pairs for template placeholders
 * @returns {object} - { agreementId: string, status: 'SENT' }
 */
export async function createAgreement(templateId, signer, customFields = {}) {
    if (isZohoStubMode()) {
        // Stub mode: create a unique envelope ID, status starts as
        // SENT. We deliberately do NOT mark it signed here — the
        // /webhook endpoint stays the only entry point that can
        // advance a contract to SIGNED, and it requires a valid
        // HMAC signature.
        console.log('[ZohoSignService] STUB MODE: createAgreement called with:', { templateId, signer, customFields });
        return {
            agreementId: 'stub-agreement-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
            status: 'SENT',
        };
    }

    // Actual Zoho API integration (simplified for v1 standard)
    try {
        const payload = {
            templates: {
                field_data: {
                    field_text_data: customFields
                },
                actions: [
                    {
                        action_type: 'SIGN',
                        recipient_email: signer.email,
                        recipient_name: signer.name,
                        action_id: '1' // Usually requires mapping to template action IDs
                    }
                ]
            }
        };

        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        formData.append('is_quick_send', 'true');

        const response = await fetch(`${ZOHO_SIGN_API_BASE}/templates/${templateId}/createdocument`, {
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${ZOHO_SIGN_TOKEN}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Zoho API Error: ${error}`);
        }

        const data = await response.json();
        return {
            agreementId: data.requests.request_id,
            status: 'SENT'
        };
    } catch (err) {
        console.error('[ZohoSignService] createAgreement failed:', err);
        throw err;
    }
}

/**
 * Gets the current status of an agreement. Stub mode always
 * reports SENT — the previous behaviour of returning SIGNED
 * caused the dev server to auto-complete contracts the moment
 * they were fetched, which silently disabled the post-sign
 * workflow tests. Use the explicit `forceSign` endpoint to
 * advance a contract in dev.
 *
 * @param {string} agreementId
 * @returns {string} - Status (e.g., SENT, SIGNED, DECLINED)
 */
export async function getStatus(agreementId) {
    if (isZohoStubMode()) {
        console.log('[ZohoSignService] STUB MODE: getStatus called for:', agreementId);
        return 'SENT';
    }

    try {
        const response = await fetch(`${ZOHO_SIGN_API_BASE}/requests/${agreementId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Zoho-oauthtoken ${ZOHO_SIGN_TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch status from Zoho');

        const data = await response.json();
        return data.requests.request_status; // e.g. "signed", "in-progress"
    } catch (err) {
        console.error('[ZohoSignService] getStatus failed:', err);
        throw err;
    }
}

/**
 * Downloads the completed PDF
 * @param {string} agreementId
 * @returns {Buffer} - PDF file buffer
 */
export async function downloadPDF(agreementId) {
    if (isZohoStubMode()) {
        console.log('[ZohoSignService] STUB MODE: downloadPDF called for:', agreementId);
        // Return a small placeholder so downstream code paths
        // (e.g. file upload to Cloudinary) have something to
        // attach without crashing. The bytes are NOT a real
        // contract PDF.
        return Buffer.from('%PDF-1.4\n% Buildwith_lami STUB MODE\n% This is a placeholder. Force-sign via the admin dev tool to generate a real PDF.\n', 'utf-8');
    }

    try {
        const response = await fetch(`${ZOHO_SIGN_API_BASE}/requests/${agreementId}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Zoho-oauthtoken ${ZOHO_SIGN_TOKEN}`
            }
        });

        if (!response.ok) throw new Error('Failed to download PDF from Zoho');

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        console.error('[ZohoSignService] downloadPDF failed:', err);
        throw err;
    }
}
