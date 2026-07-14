// ─── widgets/RevenueChart.jsx ───────────────────────────
// Monthly revenue bar chart. Memoized because it re-derives
// from the `invoices` prop on every dashboard refresh.
// ──────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function RevenueChart({ invoices = [] }) {
    const monthlyRevenue = useMemo(() => {
        const months = {};
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            months[d.toLocaleString('default', { month: 'short' })] = 0;
        }
        invoices.filter(i => i.status === 'PAID').forEach(inv => {
            const m = new Date(inv.paid_at || inv.created_at).toLocaleString('default', { month: 'short' });
            if (months[m] !== undefined) months[m] += Number(inv.amount || 0);
        });
        const max = Math.max(...Object.values(months), 1);
        return Object.entries(months).map(([m, val]) => ({ month: m, value: val, height: (val / max) * 100 }));
    }, [invoices]);

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Monthly Revenue</h2>
            <div className="flex items-end justify-between gap-2 h-40">
                {monthlyRevenue.map((m, i) => (
                    <motion.div
                        key={m.month}
                        initial={{ height: 0 }}
                        animate={{ height: `${m.height}%` }}
                        transition={{ delay: i * 0.05, duration: 0.4 }}
                        className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-lg relative group"
                    >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            ₦{m.value.toLocaleString()}
                        </div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-gray-500 dark:text-gray-400 font-bold uppercase">{m.month}</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
