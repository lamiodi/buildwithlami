// ─── src/services/whatsappService.js ─────────────────────
// Mock WhatsApp Cloud API service layer.
// Swap the mock implementations with real HTTP calls when ready.
// ──────────────────────────────────────────────────────────

class WhatsAppService {
    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    }

    /**
     * Send a plain text message to a phone number.
     * @param {string} to   — Recipient phone in international format (e.g. "2348012345678")
     * @param {string} body — Message text
     */
    async sendTextMessage(to, body) {
        console.log(`[WhatsApp Mock] → Sending to ${to}:`);
        console.log(`  "${body}"`);

        // In production, replace with:
        // const res = await fetch(`${this.apiUrl}/${this.phoneNumberId}/messages`, {
        //   method: 'POST',
        //   headers: {
        //     Authorization: `Bearer ${this.accessToken}`,
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     messaging_product: 'whatsapp',
        //     to,
        //     type: 'text',
        //     text: { body },
        //   }),
        // });
        // return res.json();

        return { success: true, mock: true };
    }

    /**
     * Notify a client that their project status changed.
     */
    async notifyProjectStatusChange(phone, projectTitle, newStatus) {
        const body = `🚀 DevAgency OS Update\n\nHi! Your project "${projectTitle}" has been updated to: *${newStatus}*.\n\nLog in to your dashboard for details.`;
        return this.sendTextMessage(phone, body);
    }

    /**
     * Alert admin about an expiring domain.
     */
    async notifyDomainExpiry(phone, domainName, expiryDate) {
        const body = `⚠️ Domain Expiry Alert\n\nThe domain "${domainName}" expires on ${expiryDate}. Please renew it soon.`;
        return this.sendTextMessage(phone, body);
    }

    /**
     * Notify admin of a new lead submission.
     * @param {string} adminPhone
     * @param {object} lead — { full_name, email, phone, package_interest }
     */
    async notifyNewLead(adminPhone, lead) {
        const body =
            `🔥 New Lead!\n\n` +
            `Name:    ${lead.full_name}\n` +
            `Email:   ${lead.email}\n` +
            `Phone:   ${lead.phone || 'N/A'}\n` +
            `Package: ${lead.package_interest || 'Not specified'}\n\n` +
            `Log in to your dashboard to follow up.`;
        return this.sendTextMessage(adminPhone, body);
    }

    /**
     * Confirm to the lead that their submission was received.
     */
    async notifyLeadConfirmation(phone, name) {
        const body =
            `👋 Hi ${name}!\n\n` +
            `Thanks for reaching out to DevAgency OS. ` +
            `We've received your request and will get back to you within 24 hours.\n\n` +
            `Talk soon! 🚀`;
        return this.sendTextMessage(phone, body);
    }

    /**
     * Welcome a new client and send their portal magic link.
     */
    async notifyClientWelcome(phone, name, magicLink) {
        const body =
            `🎉 Welcome, ${name}!\n\n` +
            `Your client portal is ready. Click the link below to access your project dashboard:\n\n` +
            `${magicLink}\n\n` +
            `This link expires in 24 hours. If it expires, contact us for a new one.`;
        return this.sendTextMessage(phone, body);
    }
}

export default new WhatsAppService();
