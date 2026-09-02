// ── services/paymentEmailService.js ──────────────────────
// Payment workflow transactional emails with branded visual layout.
//
//   1. sendInvoiceEmail           → client (link to /pay/:token)
//   2. sendProofReceivedEmail     → client (proof received, reviewing)
//   3. sendAdminProofNotification → admin (queue review alert)
//   4. sendPaymentConfirmedEmail  → client (project activated)
// ──────────────────────────────────────────────────────────

import {
    escapeHtml,
    renderEmailShell,
    createTransporter,
    getLogoAttachments,
} from './emailLayout.js';

const fmtAmount = (amount, currency) => {
    try {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(amount || 0));
    } catch {
        return `${currency} ${Number(amount || 0).toLocaleString()}`;
    }
};

const sendOrLog = async (mailOptions) => {
    if (!process.env.SMTP_USER) {
        if (process.env.NODE_ENV === 'production') {
            console.error(`[PaymentEmail] ❌ PRODUCTION ERROR: SMTP_USER not configured. Refusing to drop email: "${mailOptions.subject}"`);
            throw new Error('SMTP credentials not configured on server');
        }
        console.log(`[PaymentEmail] 📧 (mock — no SMTP_USER) to=${mailOptions.to} subject="${mailOptions.subject}"`);
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
        console.error('[PaymentEmail] send failed:', err.message);
        return { success: false, error: err.message };
    }
};

const fromAddress = () =>
    process.env.EMAIL_FROM || '"BuildWith_Lami" <tygaodibenuah@gmail.com>';

const adminAddress = () =>
    process.env.ADMIN_EMAIL || process.env.EMAIL_TO || 'tygaodibenuah@gmail.com';

/**
 * 1. Invoice email — sent right after `createInvoice`.
 */
export const sendInvoiceEmail = async ({ clientEmail, clientName, invoiceId: _invoiceId, amount, currency, payToken, dueDate, projectName }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const safeProject = projectName ? escapeHtml(projectName) : 'your project';
    const formattedAmount = fmtAmount(amount, currency);
    const payUrl = `${(process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '')}/pay/${payToken}`;
    const subject = `Your Invoice for ${projectName || 'Project'} is Ready (${formattedAmount})`;

    const text = `Hi ${clientName || 'there'},\n\nYour invoice for ${projectName ? `"${projectName}"` : 'your project'} is ready.\n\nAmount: ${formattedAmount}\n${dueDate ? `Due: ${dueDate}\n` : ''}\nPay securely online: ${payUrl}\n\nBank transfer details (USD, EUR, GBP, NGN) are also available on that page.\n\nThanks,\nBuildWith_Lami`;

    const bodyHtml = `
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
        <p style="margin:0 0 20px 0; font-size:15px; color:#334155;">
            Your project invoice for <strong>${safeProject}</strong> has been generated and is ready for payment.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin:24px 0; text-align:center;">
            <div style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;">Total Amount Due</div>
            <div style="font-size:32px; font-weight:800; color:#0f172a; letter-spacing:-0.03em;">${formattedAmount}</div>
            ${dueDate ? `<div style="font-size:13px; color:#64748b; margin-top:8px;">Payment due by <strong>${escapeHtml(dueDate)}</strong></div>` : ''}
        </div>

        <p style="margin:0 0 12px 0; font-size:14px; color:#475569;">
            Click below to complete your payment securely online via Card or review international wire details (USD, EUR, GBP via Grey):
        </p>
    `;

    const html = renderEmailShell({
        title: 'Invoice Ready for Payment',
        preheader: `Invoice for ${safeProject} — Amount: ${formattedAmount}`,
        badgeText: 'Invoice',
        badgeType: 'accent',
        bodyHtml,
        ctaText: 'Pay Invoice Securely',
        ctaUrl: payUrl,
        footerNote: 'All payments are encrypted and processed through certified PCI-DSS compliant financial providers.',
    });

    return sendOrLog({ from: fromAddress(), to: clientEmail, subject, text, html });
};

/**
 * 2. Proof received — sent to the client when they submit transaction details.
 */
export const sendProofReceivedEmail = async ({ clientEmail, clientName, invoiceId: _invoiceId, amount, currency, transactionReference }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const formattedAmount = fmtAmount(amount, currency);
    const subject = `Payment Proof Received (${formattedAmount}) — Under Review`;

    const text = `Hi ${clientName || 'there'},\n\nWe have received your payment proof for ${formattedAmount} (reference: ${transactionReference}).\n\nOur operations desk is reviewing the transfer. We will confirm your activation within 1 business hour.\n\nThanks,\nBuildWith_Lami`;

    const bodyHtml = `
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
        <p style="margin:0 0 20px 0; font-size:15px; color:#334155;">
            We received your transfer submission for <strong>${formattedAmount}</strong>.
        </p>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; margin:20px 0;">
            <div style="font-size:13px; color:#166534; line-height:1.6;">
                <strong>Transaction Reference:</strong> <span style="font-family:monospace; font-weight:700;">${escapeHtml(transactionReference)}</span><br/>
                <strong>Amount:</strong> ${formattedAmount}<br/>
                <strong>Status:</strong> <span style="font-weight:700;">Verification in progress</span>
            </div>
        </div>

        <p style="margin:0; font-size:14px; color:#64748b; line-height:1.6;">
            Our finance desk will reconcile the deposit and activate your project milestone within <strong>1 business hour</strong>. You will receive an official activation confirmation once approved.
        </p>
    `;

    const html = renderEmailShell({
        title: 'Payment Proof Received',
        preheader: `We're reviewing your payment of ${formattedAmount}`,
        badgeText: 'Under Review',
        badgeType: 'info',
        bodyHtml,
        footerNote: 'If you have any questions regarding your transfer, please reply to this email.',
    });

    return sendOrLog({ from: fromAddress(), to: clientEmail, subject, text, html });
};

/**
 * 3. Admin notification — someone just submitted a payment proof.
 */
export const sendAdminProofNotification = async ({ clientName, invoiceId, amount, currency, transactionReference }) => {
    const to = adminAddress();
    if (!to) return { success: false, error: 'No admin email configured' };
    const formattedAmount = fmtAmount(amount, currency);
    const subject = `New Payment Proof Submitted: ${formattedAmount} (${clientName || 'Client'})`;
    const adminUrl = `${(process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '')}/admin/payments`;

    const text = `New payment proof submitted.\n\nClient: ${clientName || 'A client'}\nAmount: ${formattedAmount}\nReference: ${transactionReference}\nInvoice: ${invoiceId}\n\nReview at: ${adminUrl}`;

    const bodyHtml = `
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
            A client has uploaded payment proof for an outstanding invoice.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:14px;">
                <tr><td style="padding:6px 0; color:#64748b; width:120px;">Client:</td><td style="padding:6px 0; font-weight:700; color:#0f172a;">${escapeHtml(clientName || 'A client')}</td></tr>
                <tr><td style="padding:6px 0; color:#64748b;">Amount:</td><td style="padding:6px 0; font-weight:700; color:#ff5500;">${formattedAmount}</td></tr>
                <tr><td style="padding:6px 0; color:#64748b;">Reference:</td><td style="padding:6px 0; font-family:monospace; color:#0f172a;">${escapeHtml(transactionReference)}</td></tr>
                <tr><td style="padding:6px 0; color:#64748b;">Invoice ID:</td><td style="padding:6px 0; color:#0f172a;">${escapeHtml(invoiceId)}</td></tr>
            </table>
        </div>
    `;

    const html = renderEmailShell({
        title: 'Action Required: Verify Payment Proof',
        preheader: `Payment proof uploaded by ${clientName || 'Client'} (${formattedAmount})`,
        badgeText: 'Review Queue',
        badgeType: 'accent',
        bodyHtml,
        ctaText: 'Review in Admin Queue',
        ctaUrl: adminUrl,
    });

    return sendOrLog({ from: fromAddress(), to, subject, text, html });
};

/**
 * 4. Payment confirmed — project milestone officially activated.
 */
export const sendPaymentConfirmedEmail = async ({ clientEmail, clientName, invoiceId: _invoiceId, projectName, amount, currency }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const safeProject = projectName ? escapeHtml(projectName) : 'your project';
    const formattedAmount = fmtAmount(amount, currency);
    const subject = `Payment Confirmed — ${safeProject} is Activated!`;
    const portalUrl = `${(process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '')}/portal/projects`;

    const text = `Hi ${clientName || 'there'},\n\nPayment of ${formattedAmount} for "${safeProject}" has been confirmed.\n\nYour project is now officially active. We will reach out within 1 business day with next steps.\n\nTrack progress: ${portalUrl}\n\nThanks for trusting BuildWith_Lami!`;

    const bodyHtml = `
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
        <p style="margin:0 0 20px 0; font-size:15px; color:#334155;">
            We have confirmed receipt of your payment for <strong>${formattedAmount}</strong>.
        </p>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; margin:20px 0;">
            <div style="font-size:14px; color:#166534; line-height:1.7;">
                <div style="font-weight:700; font-size:16px; margin-bottom:8px;">Project Phase Activated</div>
                <div>Payment Received: <strong>${formattedAmount}</strong></div>
                <div>Project: <strong>${safeProject}</strong></div>
                <div style="margin-top:6px; color:#15803d; font-size:13px;">Our engineering and field operations teams have commenced scheduled execution.</div>
            </div>
        </div>

        <p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">
            You can monitor real-time delivery milestones, view documents, and download receipts in your client portal:
        </p>
    `;

    const html = renderEmailShell({
        title: 'Payment Confirmed & Project Activated',
        preheader: `Payment confirmed for ${safeProject} (${formattedAmount})`,
        badgeText: 'Payment Confirmed',
        badgeType: 'success',
        bodyHtml,
        ctaText: 'Access Client Portal',
        ctaUrl: portalUrl,
        footerNote: 'Thank you for partnering with BuildWith_Lami.',
    });

    return sendOrLog({ from: fromAddress(), to: clientEmail, subject, text, html });
};
