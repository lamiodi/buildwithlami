// ── services/zohoSignService.js ──────────────────────────
// Phase 8 — Zoho Sign API v1 wrapper.
//
// The service runs in **stub mode** by default (no Zoho Sign
// account registered yet — see user note in project memory).
// In stub mode it returns a deterministic dummy response so the
// contracts flow can be developed end-to-end locally:
//
//   - createAgreement → returns `{ requests: { request_id: 'stub_<rand>', request_status: 'sent' } }`
//   - getStatus       → returns 'SIGNED' (auto-sign for testing)
//   - downloadPDF     → returns a tiny dummy PDF buffer
//
// To switch to **live mode**: set `ZOHO_SIGN_TOKEN` in `.env`
// AND install axios (`npm i axios` in /backend). The live code
// path uses a **dynamic** import so the dep is only required
// when actually going live — keeps the stub-mode boot footprint
// minimal.

const ZOHO_SIGN_API_BASE = process.env.ZOHO_SIGN_API_BASE || 'https://sign.zoho.com/api/v1';
const ZOHO_SIGN_TOKEN = process.env.ZOHO_SIGN_TOKEN || '';

// True when the env is configured for real Zoho Sign calls.
const isLive = () => Boolean(ZOHO_SIGN_TOKEN);

// Dynamic loader so axios is only required when the user
// actually wires up a real Zoho Sign account. Throws a clear
// error message if live mode is requested without the dep.
const getAxios = async () => {
    try {
        const mod = await import('axios');
        return mod.default || mod;
    } catch (err) {
        throw new Error(
            'Zoho Sign live mode requires axios. Run `npm i axios` in /backend, ' +
            'or unset ZOHO_SIGN_TOKEN to use stub mode.'
        );
    }
};

export const createAgreement = async (templateId, signer) => {
    if (!isLive()) {
        // Stub mode: print once per process so devs see what's happening.
        if (!createAgreement._warned) {
            console.log('[ZohoSign] STUB mode active (set ZOHO_SIGN_TOKEN to go live).');
            createAgreement._warned = true;
        }
        console.log(`[ZohoSign] (stub) createAgreement template=${templateId} signer=${signer.email}`);
        return {
            requests: {
                request_id: `stub_${Math.floor(Math.random() * 1e8)}`,
                request_status: 'sent',
            },
        };
    }

    const axios = await getAxios();
    try {
        const response = await axios.post(
            `${ZOHO_SIGN_API_BASE}/templates/${templateId}/createdocument`,
            {
                templates: {
                    actions: [
                        {
                            recipient_email: signer.email,
                            recipient_name: signer.name,
                            action_type: 'SIGN',
                        },
                    ],
                },
            },
            { headers: { Authorization: `Zoho-oauthtoken ${ZOHO_SIGN_TOKEN}` } }
        );
        return response.data;
    } catch (error) {
        console.error('[ZohoSign] createAgreement error:', error.message);
        throw error;
    }
};

export const getStatus = async (agreementId) => {
    if (!isLive()) {
        // Stub: pretend every agreement is signed so the workflow
        // can be tested without a real Zoho Sign account.
        return 'SIGNED';
    }

    const axios = await getAxios();
    try {
        const response = await axios.get(`${ZOHO_SIGN_API_BASE}/requests/${agreementId}`, {
            headers: { Authorization: `Zoho-oauthtoken ${ZOHO_SIGN_TOKEN}` },
        });
        return response.data.requests.request_status;
    } catch (error) {
        console.error('[ZohoSign] getStatus error:', error.message);
        throw error;
    }
};

export const downloadPDF = async (agreementId) => {
    if (!isLive()) {
        // Stub: return a 1-page placeholder PDF so the bytea column
        // gets populated end-to-end. Real flow replaces this with
        // the actual signed document from Zoho Sign.
        // Minimal valid PDF that opens in any viewer:
        const placeholder = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj
4 0 obj<</Length 80>>stream
BT /F1 24 Tf 72 720 Td (BuildWithLami stub contract ${agreementId}) Tj ET
endstream endobj
5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000095 00000 n
0000000200 00000 n
0000000330 00000 n
trailer<</Size 6/Root 1 0 R>>
startxref
396
%%EOF`;
        return Buffer.from(placeholder, 'utf8');
    }

    const axios = await getAxios();
    try {
        const response = await axios.get(`${ZOHO_SIGN_API_BASE}/requests/${agreementId}/pdf`, {
            headers: { Authorization: `Zoho-oauthtoken ${ZOHO_SIGN_TOKEN}` },
            responseType: 'arraybuffer',
        });
        return response.data;
    } catch (error) {
        console.error('[ZohoSign] downloadPDF error:', error.message);
        throw error;
    }
};
