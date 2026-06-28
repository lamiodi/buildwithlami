import nodemailer from 'nodemailer';

/**
 * Escape HTML special characters to prevent injection in email bodies.
 */
const escapeHtml = (str) =>
    String(str).replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

export const sendNotificationEmail = async ({ name, email, subject, message, toEmail }) => {
    try {
        // You can configure your actual SMTP credentials in .env later.
        // For development, we can use a mock/ethereal account or just log if env vars are missing.
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = subject ? escapeHtml(subject) : 'No Subject';
        const safeMessage = escapeHtml(message);

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Portfolio Contact" <no-reply@buildwithlami.dev>',
            to: toEmail || process.env.ADMIN_EMAIL || process.env.EMAIL_TO,
            subject: `New Inquiry from ${safeName}: ${safeSubject}`,
            text: `You have a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `<p>You have a new message from your portfolio website.</p>
                   <p><strong>Name:</strong> ${safeName}</p>
                   <p><strong>Email:</strong> ${safeEmail}</p>
                   <p><strong>Message:</strong><br/>${safeMessage.replace(/\n/g, '<br/>')}</p>`
        };

        if (!process.env.SMTP_USER) {
            console.log('[EmailService] 📧 SMTP credentials missing. Mocking email send:');
            console.log(mailOptions);
            return { success: true, mocked: true };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailService] 📧 Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('[EmailService] ❌ Failed to send email:', error.message);
        return { success: false, error: error.message };
    }
};
