// ── src/services/emailService.js ────────────────────────────
// Operational and transactional email dispatcher for inquiries,
// bookings, and password resets with branded logo presentation.
// ──────────────────────────────────────────────────────────

import {
    escapeHtml,
    renderEmailShell,
    createTransporter,
    getLogoAttachments,
} from './emailLayout.js';

const getFromAddress = () =>
    process.env.EMAIL_FROM || '"BuildWith_Lami" <tygaodibenuah@gmail.com>';

/**
 * Sends a contact inquiry or operational alert notification to admin,
 * plus an optional courtesy confirmation back to the inquirer.
 */
export const sendNotificationEmail = async ({ name, email, subject, message, toEmail }) => {
    try {
        const safeName = escapeHtml(name || 'Anonymous');
        const safeEmail = escapeHtml(email || 'Not provided');
        const safeSubject = subject ? escapeHtml(subject) : 'New Portfolio Inquiry';
        const safeMessage = escapeHtml(message || '');
        const targetRecipient = toEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_TO || 'tygaodibenuah@gmail.com';

        const bodyHtml = `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
                You have received a new inquiry from your website portfolio contact desk.
            </p>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:14px;">
                    <tr>
                        <td style="padding:6px 0; color:#64748b; width:90px; font-weight:600;">Sender:</td>
                        <td style="padding:6px 0; color:#0f172a; font-weight:700;">${safeName}</td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0; color:#64748b; font-weight:600;">Email:</td>
                        <td style="padding:6px 0; color:#0f172a;"><a href="mailto:${safeEmail}" style="color:#ff5500; text-decoration:none;">${safeEmail}</a></td>
                    </tr>
                    <tr>
                        <td style="padding:6px 0; color:#64748b; font-weight:600;">Subject:</td>
                        <td style="padding:6px 0; color:#0f172a;">${safeSubject}</td>
                    </tr>
                </table>
            </div>
            <div style="margin-top:20px;">
                <div style="font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:#64748b; margin-bottom:8px;">Message Content:</div>
                <div style="background:#ffffff; border-left:4px solid #ff5500; border-radius:4px; padding:16px; color:#1e293b; font-size:14px; line-height:1.6; background-color:#fafafa;">
                    ${safeMessage.replace(/\n/g, '<br/>')}
                </div>
            </div>
        `;

        const html = renderEmailShell({
            title: `New Inquiry: ${safeSubject}`,
            preheader: `New message from ${safeName} (${safeEmail})`,
            badgeText: 'New Inquiry',
            badgeType: 'accent',
            bodyHtml,
            ctaText: 'Reply Directly',
            ctaUrl: `mailto:${safeEmail}?subject=Re: ${encodeURIComponent(subject || 'Inquiry regarding BuildWith_Lami')}`,
            footerNote: 'You can respond directly to this email to get in touch with the sender.',
        });

        const mailOptions = {
            from: getFromAddress(),
            to: targetRecipient,
            replyTo: email ? `${name} <${email}>` : undefined,
            subject: `Inquiry from ${safeName}: ${safeSubject}`,
            text: `New message received from portfolio:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
            html,
            attachments: getLogoAttachments(),
        };

        if (!process.env.SMTP_USER) {
            if (process.env.NODE_ENV === 'production') {
                console.error('[EmailService] ❌ PRODUCTION ERROR: SMTP_USER not configured. Refusing to drop email:', mailOptions.subject);
                throw new Error('SMTP credentials not configured on server');
            }
            console.log('[EmailService] 📧 SMTP credentials missing. Mocking email send:');
            console.log(mailOptions);
            return { success: true, mocked: true };
        }

        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] 📧 Email sent successfully: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] ❌ Failed to send email:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Sends a secure password reset link to an admin or client user.
 */
export const sendPasswordResetEmail = async ({ toEmail, resetUrl }) => {
    try {
        const bodyHtml = `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">
                We received a request to reset the password associated with your <strong>BuildWith_Lami</strong> account.
            </p>
            <p style="margin:0 0 20px 0; font-size:14px; color:#64748b;">
                Click the button below to choose a new password. For security reasons, this link is valid for <strong>1 hour</strong>.
            </p>
            <div style="background:#fff7ed; border-left:4px solid #ff5500; padding:12px 16px; border-radius:4px; font-size:13px; color:#9a3412; margin:20px 0;">
                🔒 If you did not request this change, please ignore this email. Your current password remains safe and unchanged.
            </div>
        `;

        const html = renderEmailShell({
            title: 'Reset Your Account Password',
            preheader: 'Choose a new password for your BuildWith_Lami account',
            badgeText: 'Security Notice',
            badgeType: 'warning',
            bodyHtml,
            ctaText: 'Reset Password',
            ctaUrl: resetUrl,
            footerNote: `If the button doesn't work, copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color:#ff5500; word-break:break-all; font-size:11px;">${resetUrl}</a>`,
        });

        const mailOptions = {
            from: getFromAddress(),
            to: toEmail,
            subject: 'Reset your password — BuildWith_Lami',
            text: `You requested a password reset for your BuildWith_Lami account.\n\nClick the link below to set a new password (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
            html,
            attachments: getLogoAttachments(),
        };

        if (!process.env.SMTP_USER) {
            console.log('[EmailService] 📧 Password reset link generated: %s', resetUrl);
            return { success: true, mocked: true, resetUrl };
        }

        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] 📧 Password reset email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[EmailService] ❌ Failed to send password reset email:', error.message);
        return { success: false, error: error.message };
    }
};
