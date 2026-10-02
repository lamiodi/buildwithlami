// ── services/deliveryEmailService.js ──────────────────────
// Delivery-control transactional emails (blueprint §35/§37),
// same branded-shell pattern as onboardingEmailService:
//
//   1. sendApprovalRequestEmail → client (portal approval link)
//   2. sendChangeRequestEmail   → client (portal CR decision link)
// ──────────────────────────────────────────────────────────

import {
    escapeHtml,
    renderEmailShell,
    createTransporter,
    getLogoAttachments,
} from './emailLayout.js';

const sendOrLog = async (mailOptions) => {
    if (!process.env.SMTP_USER) {
        if (process.env.NODE_ENV === 'production') {
            console.error(`[DeliveryEmail] ❌ PRODUCTION ERROR: SMTP_USER not configured. Refusing to drop email: "${mailOptions.subject}"`);
            throw new Error('SMTP credentials not configured on server');
        }
        console.log(`[DeliveryEmail] 📧 (mock — no SMTP_USER) to=${mailOptions.to} subject="${mailOptions.subject}"`);
        return { success: true, mocked: true };
    }
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            ...mailOptions,
            attachments: getLogoAttachments(),
        });
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[DeliveryEmail] send failed:', err.message);
        return { success: false, error: err.message };
    }
};

const fromAddress = () =>
    process.env.EMAIL_FROM || '"BuildWith_Lami" <buildwithlami@gmail.com>';

const portalUrl = (path) =>
    `${(process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '')}${path}`;

const fmtMoney = (amount, currency) =>
    currency === 'NGN'
        ? `₦${Number(amount || 0).toLocaleString()}`
        : `${currency} ${Number(amount || 0).toLocaleString()}`;

/**
 * 1. Approval requested — the client reviews and decides in the
 * portal so the sign-off is a record, not a WhatsApp message.
 */
export const sendApprovalRequestEmail = async ({ clientEmail, clientName, title, description, projectName, versionLabel }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const safeTitle = escapeHtml(title);
    const safeProject = projectName ? escapeHtml(projectName) : 'your project';
    const safeDesc = description ? escapeHtml(description) : '';
    const safeVersion = versionLabel ? escapeHtml(versionLabel) : '';

    const html = renderEmailShell({
        title: 'Your review is needed',
        preheader: `Approve or request changes on ${safeTitle}`,
        badgeText: 'Approval Required',
        badgeType: 'accent',
        bodyHtml: `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                A new piece of work on <strong>${safeProject}</strong> is ready for your review:
            </p>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin:20px 0;">
                <p style="margin:0; font-size:15px; font-weight:700; color:#0f172a;">${safeTitle}${safeVersion ? ` <span style="font-weight:400; color:#64748b;">(${safeVersion})</span>` : ''}</p>
                ${safeDesc ? `<p style="margin:8px 0 0 0; font-size:14px; color:#475569; line-height:1.6;">${safeDesc}</p>` : ''}
            </div>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                Open your client portal to <strong>Approve</strong> it or <strong>Request Changes</strong> — your
                decision is recorded with a timestamp so we both have the paper trail.
            </p>
        `,
        ctaText: 'Review in Portal',
        ctaUrl: portalUrl('/portal/approvals'),
        footerNote: 'You\u2019ll sign in to your BuildWithLami client portal first if you haven\u2019t already.',
    });

    return sendOrLog({
        from: fromAddress(),
        to: clientEmail,
        subject: `Review needed: ${title}`,
        html,
    });
};

/**
 * 2. Change request sent — the client approves or rejects the
 * revised scope/cost/timeline in the portal.
 */
export const sendChangeRequestEmail = async ({ clientEmail, clientName, title, description, additionalCost, currency, additionalDays, launchImpact, projectName }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const safeTitle = escapeHtml(title);
    const safeProject = projectName ? escapeHtml(projectName) : 'your project';

    const impactRows = [
        additionalCost > 0 ? `<tr><td style="padding:6px 12px; color:#64748b; font-size:14px;">Additional cost</td><td style="padding:6px 12px; font-size:14px; font-weight:700; color:#0f172a;">${fmtMoney(additionalCost, currency)}</td></tr>` : '',
        additionalDays > 0 ? `<tr><td style="padding:6px 12px; color:#64748b; font-size:14px;">Timeline impact</td><td style="padding:6px 12px; font-size:14px; font-weight:700; color:#0f172a;">+${additionalDays} day${additionalDays === 1 ? '' : 's'}</td></tr>` : '',
        launchImpact ? `<tr><td style="padding:6px 12px; color:#64748b; font-size:14px;">Launch date</td><td style="padding:6px 12px; font-size:14px; font-weight:700; color:#0f172a;">${escapeHtml(launchImpact)}</td></tr>` : '',
    ].filter(Boolean).join('');

    const html = renderEmailShell({
        title: 'Proposed change of scope',
        preheader: `Review the proposed change: ${safeTitle}`,
        badgeText: 'Change Request',
        badgeType: 'warning',
        bodyHtml: `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                A change has been proposed on <strong>${safeProject}</strong>:
            </p>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin:20px 0;">
                <p style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#0f172a;">${safeTitle}</p>
                ${description ? `<p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">${escapeHtml(description)}</p>` : ''}
            </div>
            ${impactRows ? `
            <table role="presentation" style="border-collapse:collapse; width:100%; max-width:420px; margin:0 0 16px 0; background:#fff; border:1px solid #e2e8f0; border-radius:12px;">${impactRows}</table>
            ` : ''}
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                Open your portal to <strong>Approve</strong> or <strong>Reject</strong> the change. The original scope
                stays on record either way.
            </p>
        `,
        ctaText: 'Review Change Request',
        ctaUrl: portalUrl('/portal/approvals'),
        footerNote: 'Approving updates the project value and timeline automatically.',
    });

    return sendOrLog({
        from: fromAddress(),
        to: clientEmail,
        subject: `Change request: ${title}`,
        html,
    });
};
