// One-shot script: disable 2FA on the admin account so you can log in
// while the OTP email delivery issue is being fixed.
// Run: node src/scripts/disable2fa.js
// Delete this file after use.

import 'dotenv/config';
import pool from '../config/db.js';

const email = process.env.ADMIN_EMAIL || 'buildwithlami@gmail.com';

try {
    const { rowCount } = await pool.query(
        `UPDATE users
            SET two_factor_enabled      = false,
                two_factor_confirmed_at = NULL,
                email_otp_hash          = NULL,
                email_otp_expires_at    = NULL
          WHERE email = $1`,
        [email]
    );
    if (rowCount === 0) {
        console.error(`[disable2fa] No user found with email: ${email}`);
    } else {
        console.log(`[disable2fa] ✅ 2FA disabled for ${email}. You can now log in without an OTP code.`);
    }
} finally {
    await pool.end();
}
