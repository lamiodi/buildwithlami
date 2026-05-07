import nodemailer from 'nodemailer';

export const sendNotificationEmail = async ({ name, email, subject, message }) => {
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

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Portfolio Contact" <no-reply@buildwithlami.dev>',
            to: process.env.EMAIL_TO || 'hello@buildwithlami.dev', // Your actual email
            subject: `New Inquiry from ${name}: ${subject || 'No Subject'}`,
            text: `You have a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `<p>You have a new message from your portfolio website.</p>
                   <p><strong>Name:</strong> ${name}</p>
                   <p><strong>Email:</strong> ${email}</p>
                   <p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`
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
