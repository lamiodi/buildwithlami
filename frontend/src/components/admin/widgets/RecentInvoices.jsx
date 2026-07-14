// ─── widgets/RecentInvoices.jsx ─────────────────────────
// Last 5 invoices, sorted by created_at desc.
// ──────────────────────────────────────────────────────────

import React, { useMemo } from 'react';

const STATUS_COLORS = {
    PAID: 'text-emerald-600 dark:text-emerald-400',
    PENDING: 'text-amber-600 dark:text-amber-400',
    OVERDUE: 'text-red-600 dark:text-red-400',
    CANCELLED: 'text-gray-500',
};

export default function RecentInvoices({ invoices = [] }) {
    const recent = useMemo(() =>
        [...invoices].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
        [invoices]
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Recent Invoices</h2>
            {recent.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No invoices yet.</p>
            ) : (
                <ul className="space-y-3">
                    {recent.map((i) => (
                        <li key={i.id} className="flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">₦{Number(i.amount || 0).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500">Invoice #{i.id}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-[10px] font-extrabold uppercase ${STATUS_COLORS[i.status] || 'text-gray-500'}`}>{i.status}</p>
                                <time className="text-[10px] text-gray-400" dateTime={i.created_at}>
                                    {new Date(i.created_at).toLocaleDateString()}
                                </time>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
