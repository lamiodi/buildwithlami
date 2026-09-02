// ── src/services/emailLayout.js ────────────────────────────
// Unified professional HTML email layout and Nodemailer transport
// for all transactional emails in BuildWith_Lami.
// ──────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_LOGO_PATH = path.resolve(__dirname, '../assets/logo.png');

/**
 * Escapes HTML characters to prevent XSS in email bodies.
 */
export const escapeHtml = (str) =>
    String(str ?? '').replace(/[&<>"']/g, (c) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );

/**
 * Returns inline logo attachment configuration for Nodemailer CID embedding.
 */
export const getLogoAttachments = () => {
    if (fs.existsSync(LOCAL_LOGO_PATH)) {
        return [
            {
                filename: 'buildwithlami-logo.png',
                path: LOCAL_LOGO_PATH,
                cid: 'buildwithlami-logo',
            },
        ];
    }
    return [];
};

/**
 * Factory for creating configured Nodemailer transport using Brevo or custom SMTP.
 */
export const createTransporter = () => {
    const host = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
        },
    });
};

/**
 * Wraps content in an ultra-clean, professional responsive HTML shell.
 */
export const renderEmailShell = ({
    title,
    preheader = '',
    badgeText = '',
    badgeType = 'info', // 'info' | 'success' | 'warning' | 'accent'
    bodyHtml,
    ctaText = '',
    ctaUrl = '',
    footerNote = '',
}) => {
    const frontendUrl = (process.env.FRONTEND_URL || 'https://buildwithlami.com').replace(/\/+$/, '');
    const fallbackLogoUrl = `${frontendUrl}/2.png`;

    const badgeStyles = {
        accent: 'background:#fff7ed; color:#ea580c; border:1px solid #fed7aa;',
        success: 'background:#f0fdf4; color:#166534; border:1px solid #bbf7d0;',
        warning: 'background:#fefce8; color:#854d0e; border:1px solid #fef08a;',
        info: 'background:#f8fafc; color:#334155; border:1px solid #e2e8f0;',
    };

    const currentBadgeStyle = badgeStyles[badgeType] || badgeStyles.info;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#0f172a; -webkit-font-smoothing:antialiased; line-height:1.6;">
  ${preheader ? `<span style="display:none;font-size:0;line-height:0;max-height:0;mso-hide:all;opacity:0;">${escapeHtml(preheader)}</span>` : ''}
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; width:100%; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width:580px; width:100%; background:#ffffff; border-radius:16px; border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,0.03); overflow:hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding:32px 32px 24px 32px; background:#ffffff; border-bottom:1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="left" style="vertical-align:middle;">
                    <a href="${frontendUrl}" target="_blank" style="text-decoration:none; display:inline-flex; align-items:center;">
                      <img 
                        src="cid:buildwithlami-logo" 
                        onerror="this.onerror=null; this.src='${fallbackLogoUrl}';" 
                        alt="BuildWith_Lami" 
                        height="44" 
                        style="height:44px; width:auto; max-width:180px; border:0; display:block; object-fit:contain;" 
                      />
                    </a>
                  </td>
                  ${badgeText ? `
                  <td align="right" style="vertical-align:middle;">
                    <span style="display:inline-block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; padding:5px 12px; border-radius:999px; ${currentBadgeStyle}">
                      ${escapeHtml(badgeText)}
                    </span>
                  </td>` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding:32px; font-size:15px; color:#334155; line-height:1.65;">
              ${title ? `<h1 style="margin:0 0 16px 0; font-size:22px; font-weight:800; color:#0f172a; letter-spacing:-0.02em;">${escapeHtml(title)}</h1>` : ''}
              
              <div style="margin-bottom:24px;">
                ${bodyHtml}
              </div>

              ${ctaText && ctaUrl ? `
              <div style="margin:32px 0 20px 0; text-align:left;">
                <a href="${ctaUrl}" target="_blank" style="background:#ff5500; background:linear-gradient(135deg, #ff5500 0%, #ea580c 100%); color:#ffffff; font-weight:700; font-size:14px; text-decoration:none; padding:14px 28px; border-radius:10px; display:inline-block; letter-spacing:0.02em; box-shadow:0 4px 12px rgba(255,85,0,0.25);">
                  ${escapeHtml(ctaText)} &rarr;
                </a>
              </div>` : ''}

              ${footerNote ? `
              <div style="margin-top:24px; padding-top:16px; border-top:1px dashed #e2e8f0; font-size:12px; color:#64748b; line-height:1.5;">
                ${footerNote}
              </div>` : ''}
            </td>
          </tr>

          <!-- High-End Branded Footer -->
          <tr>
            <td style="padding:24px 32px; background:#f8fafc; border-top:1px solid #f1f5f9; font-size:12px; color:#64748b; line-height:1.6;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="font-weight:700; color:#0f172a; font-size:13px; margin-bottom:4px;">
                      BuildWith<span style="color:#ff5500;">_Lami</span> Studio
                    </div>
                    <div style="color:#64748b; margin-bottom:12px;">
                      Software Architecture · Drone Aerial Surveying · Geodetic Mapping
                    </div>
                    <div style="color:#94a3b8; font-size:11px;">
                      Lagos, Nigeria · Serving Clients Worldwide
                    </div>
                  </td>
                  <td align="right" style="vertical-align:bottom;">
                    <div style="font-size:11px;">
                      <a href="${frontendUrl}" style="color:#ff5500; text-decoration:none; margin-right:8px;">Website</a>
                      <a href="${frontendUrl}/portal/login" style="color:#ff5500; text-decoration:none; margin-right:8px;">Portal</a>
                      <a href="${frontendUrl}/contact" style="color:#ff5500; text-decoration:none;">Support</a>
                    </div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:16px; pt:12px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; line-height:1.4;">
                This is an automated operational notification regarding your BuildWith_Lami account or inquiry.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
