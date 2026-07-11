import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';

// ── PaymentPage — Branded multi-currency payment page (Phase 10) ──
// Public route, no auth. The URL token IS the auth — the client
// receives the link in their invoice email. The page:
//   1. Shows a clean invoice summary (number, project, amount)
//   2. Lets the client pick a currency (NGN / USD / GBP) — the
//      currency picker is the FIRST step so we never display
//      bank details on a public-facing page before the client
//      has chosen
//   3. For NGN: shows a "Pay with Paystack" button
//   4. For USD / GBP: shows the Grey bank details + the proof
//      submission form
//   5. Tracks the latest proof submission so the client sees
//      "we're reviewing" without needing to refresh

// No auth header — uses the bare `fetch` API instead of the
// admin `api` helper which would 401 on unauthenticated calls.
const apiFetch = async (path, options = {}) => {
    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}${path}`, options);
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    return { ok: res.ok, status: res.status, data };
};

const CURRENCY_META = {
    NGN: { flag: '🇳🇬', name: 'Nigerian Naira', method: 'Paystack', tagline: 'Pay securely with your local debit card or bank transfer.' },
    USD: { flag: '🇺🇸', name: 'US Dollar',      method: 'Grey · US Bank Transfer', tagline: 'Securely pay your invoice using a domestic US bank transfer. ACH, FedNow, and Wire accepted.' },
    GBP: { flag: '🇬🇧', name: 'British Pound',  method: 'Grey · UK Bank Transfer', tagline: 'Securely pay your invoice using a domestic UK bank transfer (Faster Payments or BACS).' },
};

const PaymentPage = () => {
    const { token } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState(null);  // null = "choose a currency" landing
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [proofFile, setProofFile] = useState(null);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        transaction_reference: '',
        amount_paid: '',
        submitted_email: '',
    });

    const handlePrint = () => window.print();

    const handleDownloadInvoice = () => {
        // Generate a clean, self-contained HTML invoice and trigger
        // a download. PDF generation is left to the browser's
        // "Print → Save as PDF" so we don't need a heavyweight
        // client-side PDF library. The downloaded HTML is also
        // useful for accounting packages that ingest structured
        // invoice data.
        const { invoice } = data || {};
        if (!invoice) return;
        const symbol = invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency === 'GBP' ? '£' : '';
        const amount = `${symbol}${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const invoiceNo = invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase();
        const issued = new Date().toLocaleDateString();
        const due = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '—';
        const html = `<!doctype html><html><head><meta charset="utf-8"/><title>Invoice ${invoiceNo}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:760px;margin:32px auto;padding:0 24px}
  h1{font-size:24px;margin:0 0 4px}
  table{width:100%;border-collapse:collapse;margin-top:24px}
  td,th{padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:top}
  th{background:#f9fafb;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280}
  .row{display:flex;justify-content:space-between;gap:24px;margin-top:8px}
  .muted{color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em}
  .amount{font-size:32px;font-weight:800}
  .footer{margin-top:48px;border-top:1px solid #e5e7eb;padding-top:16px;color:#6b7280;font-size:12px}
</style></head><body>
  <div class="row">
    <div>
      <p class="muted">BuildWithLami.com</p>
      <h1>Invoice ${invoiceNo}</h1>
      ${invoice.project_name ? `<p>Project: <strong>${invoice.project_name}</strong></p>` : ''}
      ${invoice.client_name ? `<p>For: <strong>${invoice.client_name}</strong></p>` : ''}
    </div>
    <div style="text-align:right">
      <p class="muted">Amount Due</p>
      <p class="amount">${amount}</p>
      <p>${invoice.currency}</p>
      <p class="muted">Issued ${issued} · Due ${due}</p>
    </div>
  </div>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody><tr>
      <td>${invoice.project_name ? `Services — ${invoice.project_name}` : 'Services rendered'}</td>
      <td>${amount}</td>
    </tr></tbody>
  </table>
  <div class="footer">
    <p>Status: <strong>${invoice.status || 'PENDING'}</strong></p>
    <p>BuildWithLami · Lami Survey & Drone Division · Lagos, Nigeria</p>
  </div>
</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice-${invoiceNo}.html`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const load = async () => {
            const res = await apiFetch(`/api/payments/public/${token}`);
            if (res.ok) {
                setData(res.data);
                setError('');
            } else {
                setError(res.data?.error || 'Could not load this invoice.');
            }
            setLoading(false);
        };
        load();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-mono text-sm">Loading your secure payment page…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
                <div className="max-w-md text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-200">
                    <div className="text-5xl mb-4">🔗</div>
                    <h1 className="text-2xl font-bold mb-2">Invalid Payment Link</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/" className="text-accent hover:underline font-bold">← Back to BuildWithLami</Link>
                </div>
            </div>
        );
    }

    const { invoice, bankAccounts, latestProof } = data;
    const isPaid = invoice.status === 'PAID';
    const meta = selectedCurrency ? CURRENCY_META[selectedCurrency] : null;
    const bankForCurrency = bankAccounts.find(b => b.currency === selectedCurrency);

    const copyToClipboard = (value) => {
        navigator.clipboard?.writeText(value).catch(() => {});
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const fd = new FormData();
            fd.append('transaction_reference', form.transaction_reference);
            fd.append('amount_paid', form.amount_paid);
            fd.append('currency', selectedCurrency);
            if (form.submitted_email) fd.append('submitted_email', form.submitted_email);
            if (proofFile) fd.append('proof_file', proofFile);

            const res = await apiFetch(`/api/payments/public/${token}/proof`, {
                method: 'POST',
                body: fd,
            });
            if (res.ok) {
                setSubmitted(true);
                // Re-fetch latest proof so the user sees the new row.
                const refresh = await apiFetch(`/api/payments/public/${token}`);
                if (refresh.ok) setData(refresh.data);
            } else {
                setError(res.data?.error || 'Could not submit your proof. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-body">
            {/* Print stylesheet — strips the header/footer/wrapper
                so a printed page is just the invoice. */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { background: #fff !important; }
                    header, footer, .print\\:hidden { display: none !important; }
                    main { max-width: 100% !important; padding: 0 !important; }
                }
            ` }} />
            {/* Header — minimal branding, no public nav (intentional) */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
                    <Link to="/" className="font-mono font-black text-lg tracking-tighter">
                        &lt;BUILDWITH_LAMI /&gt;
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        Secure Payment Page
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                {/* Invoice summary card — always visible */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6"
                >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1">Invoice</p>
                            <h1 className="text-2xl font-bold font-mono">
                                {invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}
                            </h1>
                            {invoice.project_name && (
                                <p className="text-sm text-gray-600 mt-1">Project: <span className="font-bold">{invoice.project_name}</span></p>
                            )}
                            {invoice.client_name && (
                                <p className="text-sm text-gray-600">For: <span className="font-bold">{invoice.client_name}</span></p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1">Amount Due</p>
                            <p className="text-4xl font-extrabold font-mono text-accent">
                                {invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency === 'GBP' ? '£' : ''}
                                {Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{invoice.currency}</p>
                            {invoice.due_date && (
                                <p className="text-xs text-gray-500 mt-1">Due by {new Date(invoice.due_date).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>

                    {isPaid && (
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl">✓</div>
                            <div>
                                <p className="font-bold text-green-900">Payment Confirmed</p>
                                <p className="text-sm text-green-800">
                                    Thank you. Your project is now active.
                                    {invoice.paid_via && ` (Paid via ${invoice.paid_via === 'BANK_TRANSFER' ? 'Bank Transfer' : invoice.paid_via})`}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Print / Download — works in any state. Useful for the
                        client's records and for the "Save as PDF" workflow. */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3 print:hidden">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            🖨 Print Invoice
                        </button>
                        <button
                            type="button"
                            onClick={handleDownloadInvoice}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        >
                            ⬇ Download Invoice
                        </button>
                    </div>
                </motion.div>

                {/* Already-submitted-proof banner (reviewing) */}
                {!isPaid && latestProof && latestProof.status === 'PENDING' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xl flex-shrink-0">⏳</div>
                        <div>
                            <p className="font-bold text-amber-900">Proof received — reviewing now</p>
                            <p className="text-sm text-amber-800">
                                Reference: <span className="font-mono">{latestProof.transaction_reference}</span> ·
                                Submitted {new Date(latestProof.created_at).toLocaleString()}
                            </p>
                            <p className="text-xs text-amber-700 mt-1">We'll email you when your payment is confirmed (typically within 1 business hour).</p>
                        </div>
                    </div>
                )}

                {!isPaid && (
                    <>
                        {/* Step 1 — Currency picker (the polished first step) */}
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6"
                        >
                            <h2 className="text-lg font-bold font-heading mb-1">Choose your payment currency</h2>
                            <p className="text-sm text-gray-500 mb-6">Pick how you'd like to pay. Bank transfer details appear after you choose.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['NGN', 'USD', 'GBP'].map(code => {
                                    const m = CURRENCY_META[code];
                                    const available = code === 'NGN' || !!bankAccounts.find(b => b.currency === code);
                                    return (
                                        <button
                                            key={code}
                                            onClick={() => available && setSelectedCurrency(code)}
                                            disabled={!available}
                                            className={`text-left p-5 rounded-xl border-2 transition-all ${
                                                selectedCurrency === code
                                                    ? 'border-accent bg-orange-50 shadow-md'
                                                    : available
                                                        ? 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                                                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            <div className="text-3xl mb-2">{m.flag}</div>
                                            <p className="font-bold text-sm mb-1">{m.name}</p>
                                            <p className="text-xs text-gray-500">{m.method}</p>
                                            {!available && <p className="text-[10px] text-red-500 mt-2">Not yet available</p>}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>

                        {/* Step 2 — Method-specific block */}
                        <AnimatePresence mode="wait">
                            {selectedCurrency && (
                                <motion.div
                                    key={selectedCurrency}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6"
                                >
                                    <button
                                        onClick={() => setSelectedCurrency(null)}
                                        className="text-xs text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center gap-1"
                                    >
                                        ← Change currency
                                    </button>

                                    {selectedCurrency === 'NGN' ? (
                                        <PaystackBlock invoice={invoice} />
                                    ) : (
                                        <BankTransferBlock
                                            invoice={invoice}
                                            currency={selectedCurrency}
                                            meta={meta}
                                            bank={bankForCurrency}
                                            form={form}
                                            setForm={setForm}
                                            proofFile={proofFile}
                                            setProofFile={setProofFile}
                                            fileInputRef={fileInputRef}
                                            submitted={submitted}
                                            submitting={submitting}
                                            handleSubmitProof={handleSubmitProof}
                                            error={error}
                                            copyToClipboard={copyToClipboard}
                                        />
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}

                {/* Footer reassurance */}
                <div className="text-center mt-12 text-xs text-gray-500 font-mono">
                    <p>🔒 This page is protected by a unique, unguessable link. Your payment details are processed securely.</p>
                    <p className="mt-2">Questions? Email <a href="mailto:eugeneodibenuah@gmail.com" className="text-accent hover:underline">eugeneodibenuah@gmail.com</a></p>
                </div>
            </main>
        </div>
    );
};

// ── Paystack (NGN) — shows a "Pay with Paystack" button ──
const PaystackBlock = ({ invoice }) => (
    <div>
        <h3 className="text-lg font-bold mb-2">🇳🇬 Pay in Nigerian Naira</h3>
        <p className="text-sm text-gray-600 mb-6">Pay securely with your debit card, bank transfer, or USSD via Paystack.</p>
        {invoice.payment_url ? (
            <a
                href={invoice.payment_url}
                className="inline-block w-full sm:w-auto bg-accent hover:bg-[#d43d1a] text-white px-8 py-4 rounded-xl font-bold text-center transition-colors shadow-md shadow-accent/20"
            >
                Pay {invoice.currency === 'NGN' ? '₦' : ''}{Number(invoice.amount).toLocaleString()} with Paystack →
            </a>
        ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
                <p className="font-bold mb-1">Payment link coming soon</p>
                <p>Our team is generating your secure Paystack link. You'll receive an email shortly, or refresh this page in a few minutes.</p>
            </div>
        )}
        <p className="text-xs text-gray-500 mt-4">After payment, this page will automatically update and your project will be activated.</p>
    </div>
);

// ── Bank transfer (USD / GBP) — shows details + proof form ──
const BankTransferBlock = ({ invoice, currency, meta, bank, form, setForm, proofFile, setProofFile, fileInputRef, submitted, submitting, handleSubmitProof, error, copyToClipboard }) => {
    if (!bank) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <p className="font-bold mb-1">Bank details coming soon</p>
                <p>We're setting up our {meta.name} account. You'll receive an email when it's ready, or contact us for alternative payment methods.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-lg font-bold mb-1">International Bank Transfer ({currency})</h3>
            <p className="text-sm text-gray-600 mb-6">{meta.tagline}</p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-3">Bank Transfer Details</h4>
                <DetailRow label="Account Name" value={bank.account_name} onCopy={copyToClipboard} />
                <DetailRow label="Bank Name" value={bank.bank_name} onCopy={copyToClipboard} />
                <DetailRow label="Account Number" value={bank.account_number} onCopy={copyToClipboard} mono />
                {bank.sort_code && <DetailRow label="Sort Code" value={bank.sort_code} onCopy={copyToClipboard} mono />}
                {bank.routing_code && <DetailRow label="Routing Number" value={bank.routing_code} onCopy={copyToClipboard} mono />}
                {bank.iban && <DetailRow label="IBAN" value={bank.iban} onCopy={copyToClipboard} mono />}
                {bank.swift_code && <DetailRow label="SWIFT/BIC" value={bank.swift_code} onCopy={copyToClipboard} mono />}
                {bank.reference_hint && (
                    <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500 mb-1">Reference</p>
                        <p className="text-sm font-bold text-gray-900">{bank.reference_hint}</p>
                    </div>
                )}
            </div>

            {/* Important instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                <h4 className="text-sm font-bold text-blue-900 mb-2">Important instructions</h4>
                <ul className="text-sm text-blue-900 space-y-1.5 list-disc list-inside">
                    <li>Please use your invoice number <span className="font-mono font-bold">{invoice.invoice_number || invoice.id.slice(0, 8).toUpperCase()}</span> as the payment reference.</li>
                    <li>Payments are typically confirmed within 1–2 business days, depending on your bank.</li>
                    <li>Your project will commence once payment has been received and verified.</li>
                </ul>
            </div>

            {/* Proof submission form */}
            {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-2xl">✓</div>
                    <p className="font-bold text-green-900">Thank you — proof received</p>
                    <p className="text-sm text-green-800 mt-1">Our team will review and confirm your payment within 1 business hour. You'll receive an email when it's confirmed.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmitProof} className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-t border-gray-200 pt-6">After making payment</h4>
                    <p className="text-xs text-gray-600">☐ Enter your payment reference or upload proof of payment.</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-xl p-3">{error}</div>
                    )}

                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                            Transaction Reference <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={form.transaction_reference}
                            onChange={e => setForm({ ...form, transaction_reference: e.target.value })}
                            placeholder="e.g. F1234ABC567 or your bank's confirmation #"
                            className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                                Amount Paid <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0.01"
                                value={form.amount_paid}
                                onChange={e => setForm({ ...form, amount_paid: e.target.value })}
                                placeholder={String(invoice.amount)}
                                className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Currency</label>
                            <input
                                type="text"
                                value={currency}
                                readOnly
                                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                            Your Email (for confirmation)
                        </label>
                        <input
                            type="email"
                            value={form.submitted_email}
                            onChange={e => setForm({ ...form, submitted_email: e.target.value })}
                            placeholder={invoice.primary_contact_email || 'you@example.com'}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-accent focus:border-accent text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                            Proof of Payment (optional)
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => setProofFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-accent hover:file:bg-orange-100"
                        />
                        {proofFile && (
                            <p className="text-xs text-gray-500 mt-1">📎 {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-accent hover:bg-[#d43d1a] text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-md shadow-accent/20"
                    >
                        {submitting ? 'Submitting…' : "I've Completed My Payment →"}
                    </button>
                </form>
            )}
        </div>
    );
};

// ── Reusable detail row with copy-to-clipboard ──
const DetailRow = ({ label, value, onCopy, mono }) => (
    <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 font-extrabold uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
            <p className={`text-sm font-bold text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
            {onCopy && (
                <button
                    type="button"
                    onClick={() => onCopy(value)}
                    className="text-[10px] text-accent hover:underline font-bold uppercase tracking-widest"
                    title="Copy"
                >
                    Copy
                </button>
            )}
        </div>
    </div>
);

export default PaymentPage;
