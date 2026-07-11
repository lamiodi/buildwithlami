import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

// ── AdminHelp — In-app reference for common tasks (Phase 9) ──
// Single-page, no API calls. The intent is "the answers you
// need while you're in the middle of doing something", not
// full documentation. Long-form docs live in /docs at the
// repo root.
//
// Sections are defined as a plain data array (not separate
// files) so the whole help page is a single import and the
// search index is trivial to compute.

const SECTIONS = [
    {
        id: 'create-invoice',
        title: 'Create an invoice',
        tag: 'Billing',
        steps: [
            'Go to Invoices (sidebar) → click "New Invoice".',
            'Pick the project from the dropdown. The client is auto-filled from the project.',
            'Choose the currency. NGN gets a Paystack link automatically. USD/EUR/GBP are saved as PENDING — you wire up payment manually.',
            'Set the amount and (optionally) a due date.',
            'Click "Create Invoice". The invoice appears in the list as PENDING.',
            'When the client pays, click the green "Paid" button to mark it as paid (or wait for the Paystack webhook to do it).',
        ],
        tip: 'Multi-currency revenue is auto-converted to NGN using the rates in Settings → FX Rates.',
    },
    {
        id: 'send-proposal',
        title: 'Send a proposal (CRM → Email template)',
        tag: 'CRM',
        steps: [
            'Inbox → CRM Pipeline. Drag a LEAD to the PROPOSAL column.',
            'Click the lead to open the detail drawer.',
            'Click "Send Email" → pick a template (e.g. "Software Proposal").',
            'The template is pre-filled with the lead\'s name, company, project. Edit if needed.',
            'Click "Send". The lead receives the email; the inbox thread is updated.',
        ],
        tip: 'Templates support {{placeholders}}. Manage them in Admin → Email Templates.',
    },
    {
        id: 'add-user',
        title: 'Add a user / admin',
        tag: 'Admin',
        steps: [
            'Currently user creation is a SQL operation — there\'s no in-app "Add User" form yet.',
            'SSH into the database or use the Supabase SQL editor.',
            'Insert a row: INSERT INTO users (email, password_hash, full_name, role, divisions) VALUES (..., ...);',
            'Or use the seed script: `cd backend && node src/scripts/seedAdmin.js <email> <password> <role> <divisions>`.',
            'Tell the new user to log in and immediately enable 2FA at /admin/security/2fa.',
        ],
        tip: 'Roles: Owner, Administrator, Project Manager, Developer, Survey Manager, Surveyor, Drone Manager, Drone Pilot, Finance, Client.',
    },
    {
        id: 'change-role',
        title: 'Change a user\'s role',
        tag: 'Admin',
        steps: [
            'There\'s no in-app role editor yet — same as adding a user.',
            'UPDATE users SET role = \'Administrator\' WHERE email = \'user@example.com\';',
            'The change takes effect on the user\'s next API call (no logout needed for role upgrade; downgrade may require re-login).',
        ],
        tip: 'Role names are case-insensitive in the middleware. "Administrator" and "ADMIN" both work.',
    },
    {
        id: 'deploy',
        title: 'Deploy a code change',
        tag: 'DevOps',
        steps: [
            'git push origin main (from the repo root).',
            'Both Vercel (frontend) and Render (backend) auto-deploy.',
            'Watch the build logs in each dashboard. Frontend takes ~3 min, backend ~5 min.',
            'Once both are green, smoke-test: log in, hit /api/ping, view the homepage.',
            'If something broke, see the rollback procedure in docs/CEO_QUICK_REFERENCE.md.',
        ],
        tip: 'Migrations do NOT auto-run. Apply new SQL files manually (see docs/DEPLOYMENT.md §3).',
    },
    {
        id: 'backup-now',
        title: 'Trigger a manual backup',
        tag: 'Admin',
        steps: [
            'The "Refresh" button in Admin → Settings → Database Backup is a LIVENESS CHECK only — it does not write a backup.',
            'For a real backup, run pg_dump from your laptop (see docs/BACKUP.md §2).',
            'Recommended cadence: every Sunday.',
        ],
        tip: 'Render also takes daily snapshots automatically. They live in Render → DB → Snapshots.',
    },
    {
        id: 'fx-rates',
        title: 'Update FX rates',
        tag: 'Billing',
        steps: [
            'Admin → Settings → FX Rates (Multi-Currency).',
            'Edit the USD/EUR/GBP rates. NGN is locked at 1.0.',
            'Click "Save FX Rates".',
            'New rates apply on the next page load — refresh the Invoices page to see the updated NGN-equivalent revenue.',
        ],
        tip: 'Rates are "1 NGN = X foreign" (not the inverse). For example, if $1 = ₦1,538, then the USD rate is 1/1538 = 0.00065.',
    },
    {
        id: 'send-contract',
        title: 'Send a contract (Zoho Sign)',
        tag: 'Contracts',
        steps: [
            'Admin → Contracts → "Create Contract".',
            'Pick the client, paste the Zoho Sign template ID, fill the signatory name + email.',
            'Click "Send Contract". A SENT row is created. (In stub mode the agreement auto-signs immediately.)',
            'When the client signs, the signed PDF is stored in the database (bytea).',
            'Download it from the row\'s "Download PDF" button.',
        ],
        tip: 'Zoho Sign is in stub mode until you set ZOHO_SIGN_TOKEN. See docs/ENV_VARIABLES.md.',
    },
    {
        id: 'convert-lead',
        title: 'Convert a lead to a client',
        tag: 'CRM',
        steps: [
            'In the lead\'s detail drawer, click "Convert to Client".',
            'A new client row is created (tagged with the lead\'s division), the lead is moved to WON, and a project is auto-created with the default onboarding checklist.',
            'The lead\'s CRM card now shows a link to the new client.',
        ],
        tip: 'Conversion is idempotent — re-running on the same lead returns the existing client, no duplicates.',
    },
    {
        id: 'recover-2fa',
        title: 'I lost my 2FA device',
        tag: 'Security',
        steps: [
            'Use one of your 10 recovery codes (printed when you first enabled 2FA, stored in your 1Password).',
            'At the 2FA prompt, click "Use a recovery code" instead of entering a 6-digit code.',
            'Each code is single-use. After using it, regenerate new ones at /admin/security/2fa.',
            'Out of recovery codes? Ask the database admin to reset your 2FA: UPDATE users SET two_factor_enabled = false, two_factor_secret = NULL, two_factor_recovery_codes = NULL WHERE email = \'...\';',
        ],
        tip: 'Recovery codes are SHA-256 hashed in the database. Resetting 2FA invalidates the old codes immediately.',
    },
];

const TAGS = ['All', 'Billing', 'CRM', 'Admin', 'DevOps', 'Contracts', 'Security'];

const AdminHelp = () => {
    const [query, setQuery] = useState('');
    const [activeTag, setActiveTag] = useState('All');
    const [expandedId, setExpandedId] = useState(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return SECTIONS.filter(s => {
            const tagMatch = activeTag === 'All' || s.tag === activeTag;
            if (!tagMatch) return false;
            if (!q) return true;
            return (
                s.title.toLowerCase().includes(q) ||
                s.steps.some(step => step.toLowerCase().includes(q)) ||
                (s.tip && s.tip.toLowerCase().includes(q))
            );
        });
    }, [query, activeTag]);

    const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
    const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

    return (
        <div className="max-w-4xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                            Help & Reference
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                            Quick answers to the 10 things you do most. Long-form docs live in <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 rounded text-xs">/docs</code> at the repo root.
                        </p>
                    </div>
                </motion.div>

                {/* Search + filter */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6 space-y-4">
                    <div>
                        <label className={labelClass}>Search</label>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="e.g. 'invoice', 'deploy', '2FA'…"
                            className={inputClass}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${activeTag === tag
                                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sections */}
                {filtered.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-gray-400 font-body">
                        No results for "{query}".
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((section, i) => {
                            const isOpen = expandedId === section.id;
                            return (
                                <motion.div
                                    key={section.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25, delay: i * 0.02 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedId(isOpen ? null : section.id)}
                                        className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                {section.tag}
                                            </span>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">{section.title}</h3>
                                        </div>
                                        <svg
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                        >
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
                                            <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 font-body">
                                                {section.steps.map((step, idx) => (
                                                    <li key={idx} className="leading-relaxed">{step}</li>
                                                ))}
                                            </ol>
                                            {section.tip && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200 font-body">
                                                    <span className="font-extrabold uppercase tracking-widest mr-2">Tip:</span>
                                                    {section.tip}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Footer links */}
                <div className="mt-8 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-xs text-gray-600 dark:text-gray-400 font-body">
                    <p className="font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">More in /docs</p>
                    <ul className="space-y-1">
                        <li>📄 <a href="https://github.com/EugeneOd/buildwithlami/blob/main/docs/README.md" target="_blank" rel="noreferrer" className="text-accent hover:underline">docs/README.md</a> — index of all docs</li>
                        <li>🚀 <a href="https://github.com/EugeneOd/buildwithlami/blob/main/docs/DEPLOYMENT.md" target="_blank" rel="noreferrer" className="text-accent hover:underline">docs/DEPLOYMENT.md</a> — deploy + rollback</li>
                        <li>💾 <a href="https://github.com/EugeneOd/buildwithlami/blob/main/docs/BACKUP.md" target="_blank" rel="noreferrer" className="text-accent hover:underline">docs/BACKUP.md</a> — backup + restore</li>
                        <li>🔐 <a href="https://github.com/EugeneOd/buildwithlami/blob/main/docs/ENV_VARIABLES.md" target="_blank" rel="noreferrer" className="text-accent hover:underline">docs/ENV_VARIABLES.md</a> — every env var</li>
                        <li>🆘 <a href="https://github.com/EugeneOd/buildwithlami/blob/main/docs/CEO_QUICK_REFERENCE.md" target="_blank" rel="noreferrer" className="text-accent hover:underline">docs/CEO_QUICK_REFERENCE.md</a> — emergency card (print me)</li>
                    </ul>
                </div>
            </div>
    );
};

export default AdminHelp;
