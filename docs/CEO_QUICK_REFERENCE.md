# CEO Quick Reference — BuildWithLami

> **Print this. Laminate it. Pin it to the wall.**
> If the system is on fire at 2am, this is the only doc you need.

---

## 🚨 Emergency: Site is down

1. **Check Render:** [dashboard.render.com](https://dashboard.render.com) → Service → Logs
2. **Check Vercel:** [vercel.com/dashboard](https://vercel.com/dashboard) → Project → Logs
3. **Check database:** `curl https://<api>/api/ping` — should return `{"status":"ok",...}`
4. **Rollback:**
   - Vercel: Deployments → last good deploy → ⋮ → Promote to Production
   - Render: Service → Events → last good deploy → Rollback

## 🔥 Emergency: Database is corrupted

See [BACKUP.md](./BACKUP.md) §3. TL;DR:
1. Stop backend (Render → Manual Deploy → Stop)
2. `gunzip -c backup.sql.gz | psql "$DATABASE_URL"`
3. `node src/scripts/runUpdateSchema.js` to re-apply migrations
4. Restart backend

## 📞 Support contacts

| Service | Contact |
|---|---|
| Vercel | [vercel.com/support](https://vercel.com/support) (or in-app chat) |
| Render | [render.com/support](https://render.com/support) (or in-app chat) |
| Supabase | [supabase.com/support](https://supabase.com/support) |
| Paystack | [paystack.com/contact](https://paystack.com/contact) |
| Stripe | [support.stripe.com](https://support.stripe.com) |
| Zoho Sign | [zoho.com/sign/contact](https://www.zoho.com/sign/contact.html) |
| Cloudinary | [cloudinary.com/contact](https://cloudinary.com/contact) |

## 🔐 Where to find things

| Thing | Where |
|---|---|
| Vercel env vars | Vercel → Project → Settings → Environment Variables |
| Render env vars | Render → Service → Environment |
| Database URL | Render → DB → Internal Database URL (or Supabase → Settings → Database) |
| JWT secret | Render → Service → Environment → `JWT_SECRET` |
| Paystack keys | Render → Service → Environment |
| Stripe keys | Render → Service → Environment (when wired) |
| 2FA recovery codes | Your 1Password / printed copy from when you enabled 2FA |
| Stripe webhook signing secret | Render → Service → Environment |
| Zoho Sign OAuth token | Render → Service → Environment (when wired) |

## ⏪ Rollback in 60 seconds

| What broke | Where to roll back |
|---|---|
| Frontend bug | Vercel → Deployments → last good → Promote |
| Backend bug (no DB change) | Render → Events → last good → Rollback |
| Backend bug (DB change) | Restore from backup (see above), then re-apply forward migrations |
| Wrong env var | Fix the env var → Manual Deploy → Deploy latest commit |

## 💾 Backup routine

- **Automatic:** Render takes daily snapshots of the database, retained 7 days.
- **Manual (you, weekly):** see [BACKUP.md §2](./BACKUP.md#2-manual-full-backup) — run the `pg_dump` command, upload to S3, keep the last 12.
- **Calendar:** every Sunday, 6pm. Set a recurring event. **Do not skip.**

## 🔐 2FA recovery codes

- **Stored:** in your 1Password, tag `BuildWithLami`.
- **Backup copy:** printed in the safe.
- **Out of codes?** Contact the database admin (Eugene) to reset via SQL: `UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL WHERE email = '...';`

## 🆘 When in doubt

- [BACKUP.md](./BACKUP.md) — restore procedure
- [DEPLOYMENT.md](./DEPLOYMENT.md) — how deploys work
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) — every env var explained
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — common errors
- [/admin/help](https://buildwithlami.vercel.app/admin/help) — in-app help (when deployed)

## ☎️ You

- **Name:** Odibenuah Eugene
- **Role:** CEO
- **Email:** EUGENEODIBENUAH@GMAIL.COM
- **Backup calendar reminder:** "BuildWithLami — pg_dump + S3" (every Sunday, 6pm WAT)
- **Vault:** 1Password → BuildWithLami
