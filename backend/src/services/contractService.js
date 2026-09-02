// ── src/services/contractService.js ─────────────────────────
// Native contract templates, cryptographic signing token management,
// audit trail logging, and Brevo email notifications.
// ──────────────────────────────────────────────────────────

import crypto from 'crypto';
import { renderEmailShell, createTransporter, getLogoAttachments, escapeHtml } from './emailLayout.js';

export const CONTRACT_TEMPLATES = {
    SOFTWARE: {
        title: 'Master Software Development & Engineering Agreement',
        type: 'SOFTWARE',
        defaultTerms: `1. ENGAGEMENT & SCOPE
BuildWith_Lami ("Developer / Studio") agrees to provide custom software engineering, frontend and backend architecture, database modeling, and deployment services as outlined in the agreed Project Specifications.

2. TIMELINE & MILESTONES
Execution shall commence upon receipt of the initial commitment deposit. Milestones, sprints, and delivery schedules shall proceed according to the agreed project duration.

3. PAYMENT TERMS & DEPOSIT
The Client agrees to pay the total contract fee according to the specified breakdown. The initial deposit is non-refundable once engineering architecture commences. Final project handoff and production deployment credentials shall be released upon complete settlement of the outstanding balance.

4. INTELLECTUAL PROPERTY & CODE OWNERSHIP
Upon full and final payment of all fees due hereunder, the Client shall own all proprietary software, bespoke source code, and design assets developed specifically for this project. Developer retains ownership of pre-existing frameworks, libraries, and modular utilities utilized in the build.

5. CONFIDENTIALITY & NON-DISCLOSURE
Developer and Client agree to protect and preserve the confidentiality of all proprietary business data, secrets, customer lists, and codebases disclosed during the course of the engagement.

6. ACCEPTANCE & REVISION WINDOW
Client shall have fourteen (14) calendar days from milestone delivery to review and test the deliverables. In the absence of written notices of defect within this window, deliverables shall be deemed accepted.

7. LIMITATION OF LIABILITY & GOVERNING LAW
Neither party shall be liable for indirect or consequential damages. This Agreement shall be construed and governed in accordance with the laws of the Federal Republic of Nigeria.`,
    },
    DRONE: {
        title: 'Aerial Drone Surveying, Photogrammetry & Mapping Agreement',
        type: 'DRONE',
        defaultTerms: `1. FLIGHT MISSION SCOPE
BuildWith_Lami Drone Division agrees to conduct high-precision aerial drone photogrammetry, orthomosaic mapping, volumetric calculations, and 3D topographic modeling of the designated site.

2. AIRSPACE, REGULATORY & WEATHER CLEARANCES
Flight operations are contingent upon meteorological safety and airspace compliance with civil aviation guidelines. In the event of adverse weather (precipitation, high wind speed), flight dates will be rescheduled without additional penalty.

3. ACCURACY & DELIVERABLES
Deliverables include high-resolution GeoTIFF orthomosaic maps, digital surface models (DSM), point cloud datasets, and volumetric inspection reports referenced to ground control points (GCPs) where applicable.

4. SITE ACCESS & SAFETY PROTOCOLS
The Client warrants lawful authority to permit aerial data capture over the target property and agrees to secure ground clearance for the flight operations team.

5. PAYMENT TERMS
A fifty percent (50%) deposit is required prior to mobilization of flight crews and aerial equipment. Final orthomosaic files and analytical datasets will be transferred upon full payment.

6. GOVERNING LAW
This agreement is governed by the laws of the Federal Republic of Nigeria.`,
    },
    SURVEY: {
        title: 'Geodetic Land Surveying & Boundary Demarcation Agreement',
        type: 'SURVEY',
        defaultTerms: `1. PROFESSIONAL SURVEYING SERVICES
BuildWith_Lami Survey Division agrees to execute cadastral land surveying, beacon boundary demarcation, topographic mapping, and documentation in strict compliance with the Surveyors Council of Nigeria (SURCON) standards.

2. FIELD OBSERVATIONS & BEACONING
Surveyors will establish permanent boundary beacons on the subject parcel and execute precise dual-frequency GNSS/RTK coordinate observations tied to national geodetic origin.

3. DELIVERABLES & PLAN RECORDING
Deliverables include certified survey plans signed by a Registered Surveyor, boundary beacon descriptions, and perimeter coordinates suitable for title registration and Governor's Consent lodgement.

4. SITE ACCESS & CLIENT REPRESENTATION
Client or an authorized representative shall accompany the field team to indicate boundaries and confirm adjoining land titles during site reconnaissance.

5. PAYMENT SCHEDULE
Mobilization fee is due prior to field beacon planting. Final certified survey plans will be sealed and handed over upon full balance settlement.

6. DISPUTE RESOLUTION
Any questions regarding boundary interpretation shall be resolved according to the Survey Laws of the respective State jurisdiction.`,
    },
    CUSTOM: {
        title: 'Professional Services & Consulting Agreement',
        type: 'CUSTOM',
        defaultTerms: `1. SCOPE OF SERVICES
BuildWith_Lami agrees to deliver specialized technical, architectural, or advisory services as specified in the agreed project scope.

2. TERM & TERMINATION
This Agreement remains in effect until deliverables are achieved or terminated by either party with fourteen (14) days written notice.

3. FEES & INVOICING
Services will be invoiced according to agreed project milestones. Invoices are payable within seven (7) days of issuance.

4. CONFIDENTIALITY & WORK PRODUCT
All client confidential data remains protected. Work product transfers to Client upon complete payment.

5. GOVERNING LAW
Governed by the laws of the Federal Republic of Nigeria.`,
    },
};

/**
 * Generates a secure random 64-character signing token.
 */
export const generateSigningToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculates SHA-256 integrity hash of a contract.
 */
export const computeContractHash = ({
    contractId,
    title,
    termsContent,
    amount,
    currency,
    signerName,
    signerEmail,
    signatureData,
    signedAt,
}) => {
    const raw = `${contractId}|${title}|${termsContent}|${amount}|${currency}|${signerName}|${signerEmail}|${signatureData?.slice(0, 50)}|${signedAt}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
};

/**
 * Dispatches an email invitation to the client to review and sign the contract.
 */
export const sendContractSigningInvite = async ({
    clientEmail,
    clientName,
    contractTitle,
    _projectName,
    signUrl,
    amount,
    currency,
    expiresAt,
}) => {
    try {
        const safeName = escapeHtml(clientName || 'there');
        const safeTitle = escapeHtml(contractTitle || 'Service Agreement');
        const safeProject = _projectName ? escapeHtml(_projectName) : null;
        const formattedAmount = amount > 0
            ? new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency || 'NGN' }).format(Number(amount))
            : null;

        const bodyHtml = `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
            <p style="margin:0 0 20px 0; font-size:15px; color:#334155;">
                Your official <strong>${safeTitle}</strong>${safeProject ? ` for project <strong>${safeProject}</strong>` : ''} has been prepared and is ready for your review and digital signature.
            </p>

            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin:20px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:14px;">
                    <tr><td style="padding:6px 0; color:#64748b; width:120px; font-weight:600;">Agreement:</td><td style="padding:6px 0; font-weight:700; color:#0f172a;">${safeTitle}</td></tr>
                    ${safeProject ? `<tr><td style="padding:6px 0; color:#64748b; font-weight:600;">Project:</td><td style="padding:6px 0; color:#0f172a;">${safeProject}</td></tr>` : ''}
                    ${formattedAmount ? `<tr><td style="padding:6px 0; color:#64748b; font-weight:600;">Contract Value:</td><td style="padding:6px 0; font-weight:700; color:#ff5500;">${formattedAmount}</td></tr>` : ''}
                    ${expiresAt ? `<tr><td style="padding:6px 0; color:#64748b; font-weight:600;">Valid Until:</td><td style="padding:6px 0; color:#0f172a;">${new Date(expiresAt).toLocaleDateString()}</td></tr>` : ''}
                </table>
            </div>

            <p style="margin:0 0 12px 0; font-size:14px; color:#475569;">
                Please click the button below to inspect the clauses, confirm terms, and execute your signature online:
            </p>
        `;

        const html = renderEmailShell({
            title: 'Agreement Ready for Signature',
            preheader: `${safeTitle} is ready for digital signature`,
            badgeText: 'Action Required',
            badgeType: 'accent',
            bodyHtml,
            ctaText: 'Review & Sign Contract',
            ctaUrl: signUrl,
            footerNote: 'You do not need to install any software or print this document. Signing is completed securely in your web browser.',
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BuildWith_Lami" <tygaodibenuah@gmail.com>',
            to: clientEmail,
            subject: `Action Required: Review & Sign — ${safeTitle}`,
            text: `Hi ${clientName},\n\nYour contract "${contractTitle}" is ready for signature.\n\nReview & Sign online:\n${signUrl}\n\nThanks,\nBuildWith_Lami`,
            html,
            attachments: getLogoAttachments(),
        };

        if (!process.env.SMTP_USER) {
            console.log('[ContractService] 📧 (mock) Contract signing link:', signUrl);
            return { success: true, mocked: true, signUrl };
        }

        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('[ContractService] 📧 Contract invitation sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[ContractService] Failed to send contract invitation:', err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Dispatches a confirmation email to both client and admin once contract is executed.
 */
export const sendContractSignedNotification = async ({
    clientEmail,
    clientName,
    contractTitle,
    projectName,
    signedAt,
    contractId,
}) => {
    try {
        const safeName = escapeHtml(clientName || 'Client');
        const safeTitle = escapeHtml(contractTitle || 'Service Agreement');
        const safeProject = projectName ? escapeHtml(projectName) : null;
        const safeDate = new Date(signedAt).toLocaleString();
        const portalUrl = `${(process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '')}/portal/contracts`;
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_TO || 'tygaodibenuah@gmail.com';

        const bodyHtml = `
            <p style="margin:0 0 16px 0; font-size:15px; color:#334155;">Hi ${safeName},</p>
            <p style="margin:0 0 20px 0; font-size:15px; color:#334155;">
                Thank you for executing the <strong>${safeTitle}</strong>. All digital signatures have been successfully recorded with a certified audit trail.
            </p>

            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; margin:20px 0;">
                <div style="font-size:14px; color:#166534; line-height:1.7;">
                    <div style="font-weight:700; font-size:16px; margin-bottom:8px;">✅ Agreement Executed & Legally Binding</div>
                    <div>Contract: <strong>${safeTitle}</strong></div>
                    ${safeProject ? `<div>Project: <strong>${safeProject}</strong></div>` : ''}
                    <div>Timestamp: <strong>${safeDate}</strong></div>
                    <div>Contract ID: <span style="font-family:monospace; font-size:12px;">${contractId}</span></div>
                </div>
            </div>

            <p style="margin:0; font-size:14px; color:#475569; line-height:1.6;">
                A permanent copy is archived in your Client Portal. You can view or download the complete signed agreement at any time:
            </p>
        `;

        const html = renderEmailShell({
            title: 'Contract Successfully Signed',
            preheader: `Agreement executed: ${safeTitle}`,
            badgeText: 'Signed & Active',
            badgeType: 'success',
            bodyHtml,
            ctaText: 'View in Client Portal',
            ctaUrl: portalUrl,
            footerNote: 'An electronic signature certificate with tamper-evident cryptographic hash has been generated for this agreement.',
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"BuildWith_Lami" <tygaodibenuah@gmail.com>',
            to: clientEmail,
            cc: adminEmail,
            subject: `Signed: ${safeTitle} — BuildWith_Lami`,
            text: `Hi ${clientName},\n\nThe agreement "${contractTitle}" has been executed on ${safeDate}.\n\nView or download your contract:\n${portalUrl}\n\nThanks,\nBuildWith_Lami`,
            html,
            attachments: getLogoAttachments(),
        };

        if (!process.env.SMTP_USER) {
            console.log('[ContractService] 📧 (mock) Contract signed notification');
            return { success: true, mocked: true };
        }

        const transporter = createTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log('[ContractService] 📧 Contract signed notification sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('[ContractService] Failed to send signed notification:', err.message);
        return { success: false, error: err.message };
    }
};
