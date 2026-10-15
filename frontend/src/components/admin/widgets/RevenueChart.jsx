// ─── widgets/RevenueChart.jsx ───────────────────────────
// Monthly revenue bar chart. Memoized because it re-derives
// from the `invoices` prop on every dashboard refresh.
// ──────────────────────────────────────────────────────────

import { useState } from 'react';
import { CURRENCIES, formatMoney, monthlyCollected } from '../../../utils/adminWorkflow';

export default function RevenueChart({ invoices = [] }) {
    const [currency, setCurrency] = useState('NGN');
    const monthlyRevenue = monthlyCollected(invoices, currency);

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Money collected</h2>
                <select aria-label="Revenue chart currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-transparent p-2 text-sm">
                    {CURRENCIES.map((code) => <option key={code}>{code}</option>)}
                </select>
            </div>
            <p className="text-xs text-gray-500 mb-5">Last six months by payment date. Amounts stay in their original currency.</p>
            <div className="flex items-end justify-between gap-2 h-40" role="img" aria-label={monthlyRevenue.map((m) => `${m.month}: ${formatMoney(m.value, currency)}`).join(', ')}>
                {monthlyRevenue.map((m) => (
                    <div
                        key={m.key}
                        style={{ height: `${m.height}%` }}
                        tabIndex={0}
                        aria-label={`${m.month}: ${formatMoney(m.value, currency)}`}
                        className="flex-1 min-h-1 bg-accent rounded-t-lg relative group focus:outline-accent"
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            {formatMoney(m.value, currency)}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{m.month}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
