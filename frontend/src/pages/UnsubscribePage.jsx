import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// ─── UnsubscribePage — public one-click unsubscribe (blueprint §19) ──
// Reached from the footer of every outreach email via
// /unsubscribe/:token. The unguessable 32-hex token IS the auth —
// no login, no forms. On success the address is suppressed forever
// server-side and any queued sequence emails are cancelled.

const UnsubscribePage = () => {
    const { token } = useParams();
    const [state, setState] = useState('working'); // working | done | invalid | error
    const [company, setCompany] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/outreach/unsubscribe/${encodeURIComponent(token || '')}`);
                const data = await res.json().catch(() => ({}));
                if (cancelled) return;
                if (res.ok && data.success) {
                    setCompany(data.company_name || '');
                    setState('done');
                } else if (res.status === 404) {
                    setState('invalid');
                } else {
                    setState('error');
                }
            } catch {
                if (!cancelled) setState('error');
            }
        })();
        return () => { cancelled = true; };
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background px-4">
            <div className="max-w-md w-full bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-10 text-center font-body">
                {state === 'working' && (
                    <>
                        <div className="w-10 h-10 mx-auto mb-4 border-3 border-gray-200 border-t-accent rounded-full animate-spin" />
                        <p className="text-gray-500 dark:text-gray-400">Processing your request…</p>
                    </>
                )}

                {state === 'done' && (
                    <>
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                            <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white mb-2">You're unsubscribed</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            {company ? `BuildWithLami won't email ${company} again` : 'BuildWithLami won\'t email this address again'} — any scheduled follow-ups have been cancelled, and the address is permanently suppressed from future outreach.
                        </p>
                    </>
                )}

                {state === 'invalid' && (
                    <>
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                            <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z" /></svg>
                        </div>
                        <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white mb-2">Link not valid</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                            This unsubscribe link doesn't match any active outreach. You may have already unsubscribed, or the link was mistyped.
                        </p>
                    </>
                )}

                {state === 'error' && (
                    <>
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                            <svg className="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </div>
                        <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white mb-2">Something went wrong</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                            We couldn't process the unsubscribe request. Please try again in a moment.
                        </p>
                        <button
                            onClick={() => { setState('working'); window.location.reload(); }}
                            className="bg-accent hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm cursor-pointer"
                        >
                            Try again
                        </button>
                    </>
                )}

                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-8 tracking-wide uppercase">
                    BuildWithLami — buildwithlami.com
                </p>
            </div>
        </div>
    );
};

export default UnsubscribePage;
