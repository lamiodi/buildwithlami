import dotenv from 'dotenv';
dotenv.config();

const ZOHO_SIGN_TOKEN = process.env.ZOHO_SIGN_TOKEN || '';
const ZOHO_SIGN_API_BASE = process.env.ZOHO_SIGN_API_BASE || 'https://sign.zoho.com/api/v1';

/**
 * Creates an agreement from a template and sends it to the signer.
 * @param {string} templateId - Zoho Sign template ID
 * @param {object} signer - { email: string, name: string }
 * @param {object} customFields - Key-value pairs for template placeholders
 * @returns {object} - { agreementId: string, status: string }
 */
export async function createAgreement(templateId, signer, customFields = {}) {
    if (!ZOHO_SIGN_TOKEN) {
        // Stub mode
        console.log('[ZohoSignService] STUB MODE: createAgreement called with:', { templateId, signer, customFields });
        return {
            agreementId: 'stub-agreement-' + Date.now(),
            status: 'SENT'
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
 * Gets the current status of an agreement
 * @param {string} agreementId 
 * @returns {string} - Status (e.g., SIGNED, SENT, DECLINED)
 */
export async function getStatus(agreementId) {
    if (!ZOHO_SIGN_TOKEN) {
        // Stub mode - simulate that it's signed after 10 seconds? No, just return SENT to avoid complex stub logic
        console.log('[ZohoSignService] STUB MODE: getStatus called for:', agreementId);
        return 'SIGNED'; // Always return SIGNED in stub mode to test full flow
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
    if (!ZOHO_SIGN_TOKEN) {
        // Stub mode
        console.log('[ZohoSignService] STUB MODE: downloadPDF called for:', agreementId);
        // Return a dummy buffer
        return Buffer.from('%PDF-1.4 Dummy PDF Content', 'utf-8');
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
