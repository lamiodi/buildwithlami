# Payment Workflow — BuildWithLami

> Phase 10 deliverable. How a client gets from "I got an invoice"
> to "payment confirmed" — and what the admin sees in between.
>
> Looking for the CEO quick-reference? See
> [CEO_QUICK_REFERENCE.md](./CEO_QUICK_REFERENCE.md). Looking for
> the docs index? See [README.md](./README.md).

## The one-screen flow

```
   1. Admin creates invoice             Admin → Invoices → New
                       │
                       ▼
   2. Client receives email              Subject: "Your BuildWithLami invoice"
                       │                  Body: branded HTML + "Pay Securely Online" button
                       ▼
   3. Client opens /pay/:token           Unique, unguessable UUID
                       │                  No login required
                       ▼
   4. Client chooses currency             🇳🇬 NGN  → Paystack (one-click)
                                          🇺🇸 USD  → Grey bank details
                                          🇬🇧 GBP  → Grey bank details
                       │
                       ▼
   5. NGN: clicks "Pay with Paystack"   redirect → Paystack checkout
   5. USD/GBP: transfers money, then    enters transaction reference,
              submits proof form         optionally uploads screenshot
                       │
                       ▼
   6. Client sees "proof received"       banner on /pay/:token
                       │
                       ▼
   7. Admin gets an email                Subject: "💰 New payment proof to review"
                       │
                       ▼
   8. Admin opens Admin → Payments      reviews, clicks Confirm or Reject
                       │
                       ▼
   9. On Confirm:                       invoice.status = 'PAID'
                       │                  paid_via = 'BANK_TRANSFER'
                       │                  Atomic transaction with proof update
                       ▼
   10. Client gets "payment confirmed"  email + /pay/:token shows "Project active"
```

## What's in the database

3 new tables / 2 new columns, all in `v18_payment_proofs.sql`:

| Object | What | Why |
|---|---|---|
| `invoices.pay_token` | UUID, unique, unguessable | Auth for the public `/pay/:token` route |
| `invoices.invoice_number` | e.g. `INV-2026-001` | Human-friendly reference for both clients and the admin |
| `invoices.paid_via` | text | Audit trail: PAYSTACK / BANK_TRANSFER / CARD |
| `bank_accounts` | (currency, provider) → Grey account details | Seeded with the CEO's actual USD + GBP accounts; never public |
| `payment_proofs` | (invoice_id, transaction_ref, optional file, status) | The review queue |

## Security notes

- **Bank details are NEVER published.** They only render on `/pay/:token` after the client picks a currency. The /pay route is unauthenticated but token-protected (128-bit UUID).
- **The `v18` migration contains the CEO's real bank account numbers** as seed data. The repo is private, but if you ever make it public, move the bank accounts to a separate `v18b_bank_secrets.sql` that's gitignored.
- **Proof file uploads** are routed through Cloudinary when `CLOUDINARY_URL` is set; otherwise they fall back to a `data:` URI (local dev only). Max 10 MB.
- **Currency-mismatch guard:** if a client submits a proof in the wrong currency (e.g. pays USD on a NGN invoice), the admin review endpoint returns 400 with a clear error.

## How the emails work

All 4 emails are built in [services/paymentEmailService.js](../backend/src/services/paymentEmailService.js). When `SMTP_USER` is unset, they're **logged to stdout** instead of sent (matches the existing pattern).

| # | When | Who | Subject |
|---|---|---|---|
| 1 | Right after `createInvoice` | Client | "Your BuildWithLami invoice — ₦X" |
| 2 | Right after client submits proof | Client | "We received your payment proof — reviewing now" |
| 3 | Right after client submits proof | Admin | "💰 New payment proof to review — $X" |
| 4 | Right after admin confirms | Client | "Payment confirmed — your project is activated" |

## Seeded bank accounts

These are the CEO's actual Grey (grey.co) settlement accounts. Edit them in **Admin → Settings → Bank Accounts** to rotate without redeploying.

| Currency | Bank | Account | Routing |
|---|---|---|---|
| USD | Lead (Grey) | 210837680768 | 101019644 (ACH + Wire) |
| GBP | Clear Junction Limited (Grey) | 43014342 | Sort 04-13-07 · IBAN GB55CLJU04130743014342 · SWIFT CLJUGB21XXX |

## Polished UX details (per the spec)

- **Currency picker is the first step** — bank details only render after the client picks a currency. The spec's exact wording is used in the headline: *"International Bank Transfer (USD/GBP) — Securely pay your invoice using a domestic US or UK bank transfer."*
- **Copy-to-clipboard** on every bank detail row (saves the client from re-typing).
- **Invoice number is the reference hint** — every bank account has `reference_hint = "Use your invoice number (e.g. INV-2026-001) as the payment reference."` which is shown in the bank details card.
- **"We've received your proof"** banner on `/pay/:token` so the client doesn't refresh-resubmit. It auto-refreshes after submission.
- **Admin sees the latest proof first** in the queue, with a 📎 indicator on rows that have an attached file.
- **Proof file** is optional, not required — the client can submit just a reference.

## What I did NOT do

- **No Stripe integration.** The spec says "Stripe in the future" — left as a Phase 11+ candidate.
- **No live FX rates.** USD/GBP amounts on the page are static (the invoice's own currency). The `fx_rates` table is still used for the NGN-equivalent revenue in the admin dashboard.
- **No client portal.** Previous phase decisions deferred /portal. The /pay/:token page IS the client's status page for now.

## FAQ

**Q: How do I rotate a bank account without redeploying?**
A: Admin → Settings → Bank Accounts → Edit. The change is live on the next page load.

**Q: Can a client submit two proofs for the same invoice?**
A: Yes — each submission creates a new PENDING row. The admin reviews the most recent. If you want first-wins semantics, add a UNIQUE INDEX on (invoice_id) WHERE status='PENDING' in a future migration.

**Q: What happens if the admin marks CONFIRM and the invoice is already PAID?**
A: The proof flips to CONFIRMED but the invoice update is a no-op (still PAID). No double-counting.

**Q: The /pay/:token page says "Invalid payment link" — what now?**
A: The token has been tampered with or the invoice was deleted. Ask the client to use the link from the original email.

**Q: I want to add a "paid in full" message to my website footer.**
A: Don't. Bank details should never be on a publicly-indexable page. The /pay/:token pattern is the right answer.
