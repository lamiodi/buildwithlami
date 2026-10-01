// ── services/onboardingEmailService.js ───────────────────
// Onboarding workflow transactional emails with the branded
// layout (mirrors paymentEmailService.js):
//
//   1. sendOnboardingInviteEmail  → client (portal onboarding link)
//   2. sendOnboardingChangesEmail → client (admin requested changes)
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
            console.error(`[OnboardingEmail] ❌ PRODUCTION ERROR: SMTP_USER not configured. Refusing to drop email: "${mailOptions.subject}"`);
            throw new Error('SMTP credentials not configured on server');
        }
        console.log(`[OnboardingEmail] 📧 (mock — no SMTP_USER) to=${mailOptions.to} subject="${mailOptions.subject}"`);
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
        console.error('[OnboardingEmail] send failed:', err.message);
        return { success: false, error: err.message };
    }
};

const fromAddress = () =>
    process.env.EMAIL_FROM || '"BuildWith_Lami" <buildwithlami@gmail.com>';

/**
 * 1. Invite email — sent when admin creates an onboarding for a
 * client (or re-sends the link). `portalUrl` points at
 * /portal/onboarding inside the authenticated client portal.
 */
export const sendOnboardingInviteEmail = async ({ clientEmail, clientName, portalUrl, projectName }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const safeProject = projectName ? escapeHtml(projectName) : 'your new website';

    const html = renderEmailShell({
        title: 'Let\u2019s get your project started',
        preheader: 'Your onboarding form is ready — it only takes a few minutes.',
        badgeText: 'Client Onboarding',
        badgeType: 'success',
        bodyHtml: `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                Great news — we\u2019re kicking off <strong>${safeProject}</strong>! Before development begins, I need a few
                details from you: contact information, brand assets, content, and your goals for the site.
            </p>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                The onboarding form saves your progress as you go, so you can complete it in more than one
                sitting. Most clients finish it in 10\u201315 minutes.
            </p>
            <ul style="margin:0 0 16px 0; padding-left:20px; font-size:14px; color:#475569; line-height:1.9;">
                <li>Business &amp; social media details</li>
                <li>Domain / hosting information (never passwords — those come later via a secure vault)</li>
                <li>Brand colours, fonts and inspiration</li>
                <li>Content and product information</li>
            </ul>
        `,
        ctaText: 'Open Onboarding Form',
        ctaUrl: portalUrl,
        footerNote: 'You\u2019ll sign in to your BuildWithLami client portal first if you haven\u2019t already.',
    });

    return sendOrLog({
        from: fromAddress(),
        to: clientEmail,
        subject: 'Your BuildWithLami onboarding form is ready',
        html,
    });
};

/**
 * 2. Changes-requested email — sent when admin moves an
 * onboarding to NEEDS_CHANGES so the client knows to revise.
 */
export const sendOnboardingChangesEmail = async ({ clientEmail, clientName, portalUrl, requestedChanges }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const safeChanges = escapeHtml(requestedChanges || 'Please review your onboarding form and update the highlighted sections.');

    const html = renderEmailShell({
        title: 'A few changes to your onboarding',
        preheader: 'Your onboarding form needs a small update before we continue.',
        badgeText: 'Action Needed',
        badgeType: 'warning',
        bodyHtml: `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                Thanks for completing your onboarding form! I reviewed everything and just need a few
                updates before we lock things in:
            </p>
            <div style="background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:16px 20px; margin:20px 0; font-size:14px; color:#7c2d12; line-height:1.7;">
                ${safeChanges}
            </div>
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.7;">
                Your progress is saved — just open the form, update the sections above, and resubmit.
            </p>
        `,
        ctaText: 'Update Onboarding Form',
        ctaUrl: portalUrl,
        footerNote: 'Questions? Just reply to this email.',
    });

    return sendOrLog({
        from: fromAddress(),
        to: clientEmail,
        subject: 'Small update needed on your onboarding form',
        html,
    });
};
