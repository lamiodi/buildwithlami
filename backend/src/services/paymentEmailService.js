// ── services/paymentEmailService.js ──────────────────────
// Phase 10 — The 4 payment-workflow emails.
//
//   1. sendInvoiceEmail           → client (link to /pay/:token)
//   2. sendProofReceivedEmail     → client (we got it, reviewing)
//   3. sendAdminProofNotification → admin (queue alert)
//   4. sendPaymentConfirmedEmail  → client (project activated)
//
// Each function builds a fresh Nodemailer transport per call
// (matches the existing pattern in services/emailService.js).
// When SMTP_USER is unset, the email is **logged to stdout**
// instead of sent — same dev-friendly behaviour as before.

import nodemailer from 'nodemailer';

const escapeHtml = (str) =>
    String(str ?? '').replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

const fmtAmount = (amount, currency) => {
    try {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(amount || 0));
    } catch {
        return `${currency} ${Number(amount || 0).toLocaleString()}`;
    }
};

const buildTransport = () =>
    nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

const sendOrLog = async (mailOptions) => {
    if (!process.env.SMTP_USER) {
        console.log(`[PaymentEmail] 📧 (mock — no SMTP_USER) to=${mailOptions.to} subject="${mailOptions.subject}"`);
        return { success: true, mocked: true };
    }
    try {
        const info = await buildTransport().sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[PaymentEmail] send failed:', err.message);
        return { success: false, error: err.message };
    }
};

const fromAddress = () => process.env.EMAIL_FROM || '"BuildWithLami" <no-reply@buildwithlami.com>';
const adminAddress = () => process.env.ADMIN_EMAIL || process.env.EMAIL_TO;

/**
 * 1. Invoice email — sent right after `createInvoice`.
 * Includes the secure /pay/:token link.
 */
export const sendInvoiceEmail = async ({ clientEmail, clientName, invoiceId, amount, currency, payToken, dueDate, projectName }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const payUrl = `${process.env.FRONTEND_URL || 'https://buildwithlami.vercel.app'}/pay/${payToken}`;
    const subject = `Your BuildWithLami invoice — ${fmtAmount(amount, currency)}`;
    const text = `Hi ${clientName || 'there'},

Your invoice for ${projectName ? `the project "${projectName}"` : 'your project'} is ready.

Amount: ${fmtAmount(amount, currency)}
${dueDate ? `Due: ${dueDate}\n` : ''}
Pay securely online: ${payUrl}

If you'd prefer to pay by bank transfer, that page also shows our USD/GBP account details via Grey.

Thanks,
BuildWithLami`;

    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa;">
  <div style="background:white;padding:32px;border-radius:8px;border:1px solid #eee;">
    <h2 style="margin:0 0 8px 0;color:#0a0a0a;font-size:22px;">Your invoice is ready</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px 0;">Hi ${safeName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px 0;">Your invoice${projectName ? ` for <strong>${escapeHtml(projectName)}</strong>` : ''} is ready.</p>
    <div style="background:#f5f5f5;padding:20px;border-radius:6px;margin:0 0 24px 0;">
      <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Amount due</div>
      <div style="font-size:28px;font-weight:700;color:#0a0a0a;">${fmtAmount(amount, currency)}</div>
      ${dueDate ? `<div style="font-size:13px;color:#555;margin-top:6px;">Due by ${escapeHtml(dueDate)}</div>` : ''}
    </div>
    <a href="${payUrl}" style="display:inline-block;background:#E94E1B;color:white;padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.02em;">Pay Securely Online</a>
    <p style="color:#888;font-size:12px;line-height:1.6;margin:24px 0 0 0;">The payment page also shows our US Dollar and British Pound bank transfer details if you prefer to pay via Grey.</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
    <p style="color:#888;font-size:12px;margin:0;">BuildWithLami · Lagos, Nigeria</p>
  </div>
</div>`;

    return sendOrLog({ from: fromAddress(), to: clientEmail, subject, text, html });
};

/**
 * 2. Proof received — sent to the client the moment they
 * submit transaction details on the payment page.
 */
export const sendProofReceivedEmail = async ({ clientEmail, clientName, invoiceId, amount, currency, transactionReference }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const subject = `We received your payment proof — reviewing now`;
    const text = `Hi ${clientName || 'there'},

We received your payment proof for ${fmtAmount(amount, currency)} (reference: ${transactionReference}).

Our team will review and confirm within 1 business hour. You'll get a separate email when it's confirmed.

Thanks,
BuildWithLami`;
    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa;">
  <div style="background:white;padding:32px;border-radius:8px;border:1px solid #eee;">
    <h2 style="margin:0 0 8px 0;color:#0a0a0a;font-size:22px;">Proof received ✓</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px 0;">Hi ${safeName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px 0;">We received your payment proof for <strong>${fmtAmount(amount, currency)}</strong>.</p>
    <div style="background:#fff7ed;padding:12px 16px;border-left:3px solid #E94E1B;border-radius:4px;font-size:13px;color:#555;margin:0 0 16px 0;">
      <strong>Reference:</strong> ${escapeHtml(transactionReference)}
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 0 0;">Our team will review and confirm within <strong>1 business hour</strong>. You'll get a separate email when it's confirmed and your project is activated.</p>
  </div>
</div>`;
    return sendOrLog({ from: fromAddress(), to: clientEmail, subject, text, html });
};

/**
 * 3. Admin notification — someone just submitted a proof.
 */
export const sendAdminProofNotification = async ({ clientName, invoiceId, amount, currency, transactionReference }) => {
    const to = adminAddress();
    if (!to) return { success: false, error: 'No admin email configured' };
    const subject = `💰 New payment proof to review — ${fmtAmount(amount, currency)}`;
    const text = `${clientName || 'A client'} submitted a payment proof.\n\nAmount: ${fmtAmount(amount, currency)}\nReference: ${transactionReference}\nInvoice: ${invoiceId}\n\nReview at: ${process.env.FRONTEND_URL || 'https://buildwithlami.vercel.app'}/admin/payments`;
    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa;">
  <div style="background:white;padding:24px;border-radius:8px;border:1px solid #eee;">
    <h2 style="margin:0 0 8px 0;font-size:18px;">💰 New payment proof to review</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 12px 0;"><strong>${escapeHtml(clientName || 'A client')}</strong> submitted a payment proof.</p>
    <table style="font-size:13px;color:#555;margin:0 0 16px 0;">
      <tr><td style="padding:4px 12px 4px 0;color:#888;">Amount</td><td><strong>${fmtAmount(amount, currency)}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#888;">Reference</td><td>${escapeHtml(transactionReference)}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#888;">Invoice</td><td>${escapeHtml(invoiceId)}</td></tr>
    </table>
    <a href="${process.env.FRONTEND_URL || 'https://buildwithlami.vercel.app'}/admin/payments" style="display:inline-block;background:#0a0a0a;color:white;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;font-size:13px;">Review in Admin →</a>
  </div>
</div>`;
    return sendOrLog({ from: fromAddress(), to, subject, text, html });
};

/**
 * 4. Payment confirmed — sent after the admin confirms the
 * proof. The big one: this is the "your project is starting"
 * moment.
 */
export const sendPaymentConfirmedEmail = async ({ clientEmail, clientName, invoiceId, projectName, amount, currency }) => {
    if (!clientEmail) return { success: false, error: 'No client email' };
    const safeName = escapeHtml(clientName || 'there');
    const subject = `Payment confirmed — your project is activated`;
    const text = `Hi ${clientName || 'there'},

Payment confirmed: ${fmtAmount(amount, currency)} for ${projectName || 'your project'}.

Your project is now active. We'll be in touch within 1 business day with next steps and the kickoff schedule.

Thanks for trusting BuildWithLami.`;
    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafafa;">
  <div style="background:white;padding:32px;border-radius:8px;border:1px solid #eee;">
    <h2 style="margin:0 0 8px 0;color:#0a0a0a;font-size:22px;">Payment confirmed ✓</h2>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 16px 0;">Hi ${safeName},</p>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 24px 0;">We've received and confirmed your payment of <strong>${fmtAmount(amount, currency)}</strong>${projectName ? ` for <strong>${escapeHtml(projectName)}</strong>` : ''}.</p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px 20px;border-radius:6px;margin:0 0 24px 0;">
      <div style="font-size:13px;color:#166534;line-height:1.6;">
        ✅ <strong>Payment received</strong><br/>
        ✅ <strong>Project activated</strong><br/>
        📅 We'll be in touch within <strong>1 business day</strong> with next steps.
      </div>
    </div>
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 0 0;">Thanks for trusting BuildWithLami.</p>
  </div>
</div>`;
    return sendOrLog({ from: fromAddress(), to: clientEmail, subject, text, html });
};
