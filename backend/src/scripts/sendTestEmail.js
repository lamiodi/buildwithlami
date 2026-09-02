import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { createTransporter, renderEmailShell, getLogoAttachments } from '../services/emailLayout.js';

async function main() {
    const targetEmail = process.argv[2] || 'tygaodibenuah@gmail.com';
    console.log(`🚀 Preparing test email via Brevo SMTP to: ${targetEmail}`);
    console.log(`   SMTP Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.EMAIL_FROM}`);

    const transporter = createTransporter();

    // Verify SMTP connection
    console.log('⏳ Verifying SMTP server connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully.');

    const bodyHtml = `
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hello Lami,</p>
        <p style="margin:0 0 16px 0; font-size:15px; color:#334155; line-height:1.6;">
            This is a verified live test of the <strong>BuildWith_Lami</strong> transactional email system powered by Brevo SMTP.
        </p>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:24px 0;">
            <div style="font-size:13px; color:#475569; line-height:1.7;">
                <div style="font-weight:700; font-size:14px; color:#0f172a; margin-bottom:10px;">📋 System Verification Report</div>
                <div>• <strong>SMTP Service:</strong> Brevo Relay (smtp-relay.brevo.com:587)</div>
                <div>• <strong>Branding:</strong> Embedded High-Resolution Logo (MIME CID Inline)</div>
                <div>• <strong>Email Shell:</strong> Responsive HTML with Apple/Stripe Typography</div>
                <div>• <strong>Security:</strong> TLS Encrypted Dispatch & Anti-Spoof Headers</div>
                <div>• <strong>Contract System:</strong> 100% In-House Native E-Signature Active</div>
            </div>
        </div>

        <p style="margin:0 0 20px 0; font-size:14px; color:#475569; line-height:1.6;">
            All client invoices, intake forms, project milestones, and contract signing invitations will be delivered with this premium layout.
        </p>
    `;

    const html = renderEmailShell({
        title: 'BuildWith_Lami Email System Verification',
        preheader: 'Live SMTP delivery test for BuildWith_Lami Studio',
        badgeText: 'SMTP Verified',
        badgeType: 'success',
        bodyHtml,
        ctaText: 'Visit Client Portal',
        ctaUrl: 'https://buildwithlami.com/portal',
        footerNote: 'This is an automated system verification sent directly from your BuildWith_Lami backend server.',
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"BuildWith_Lami" <tygaodibenuah@gmail.com>',
        to: targetEmail,
        subject: '🚀 BuildWith_Lami — System Verification & Test Email',
        text: `Hello Lami,\n\nThis is a verified live test of the BuildWith_Lami transactional email system powered by Brevo SMTP.\n\nAll transactional emails are active and verified.\n\nThanks,\nBuildWith_Lami Studio`,
        html,
        attachments: getLogoAttachments(),
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('🎉 Email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
}

main().catch((err) => {
    console.error('❌ Error sending test email:', err);
    process.exit(1);
});
