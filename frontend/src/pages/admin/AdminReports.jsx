import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { toCSV, downloadCSV } from '../../utils/csv.js';

const formatCurrency = (n) => `₦${Number(n || 0).toLocaleString()}`;

const Icon = {
    Download: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    TrendingUp: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    PieChart: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
    ),
    Users: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        </svg>
    ),
    Calendar: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" y2="2" x2="16" /><line x1="8" y1="2" x2="8" y2="2" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

const StatCard = ({ label, value, hint, icon: IconComp, accent = 'blue' }) => {
    const accents = {
        blue: { grad: 'from-blue-500 to-indigo-600', text: 'text-blue-600 dark:text-blue-400' },
        emerald: { grad: 'from-emerald-500 to-teal-600', text: 'text-emerald-600 dark:text-emerald-400' },
        amber: { grad: 'from-amber-500 to-orange-600', text: 'text-amber-600 dark:text-amber-400' },
        purple: { grad: 'from-purple-500 to-fuchsia-600', text: 'text-purple-600 dark:text-purple-400' },
        rose: { grad: 'from-rose-500 to-pink-600', text: 'text-rose-600 dark:text-rose-400' },
    };
    const a = accents[accent] || accents.blue;
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.grad} text-white flex items-center justify-center shadow-sm`}>
                    {IconComp && <IconComp className="w-5 h-5" />}
                </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">{hint}</p>}
        </div>
    );
};

const AdminReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const buildQuery = () => {
        const params = new URLSearchParams();
        if (dateRange.start) params.set('start', dateRange.start);
        if (dateRange.end) params.set('end', dateRange.end);
        return params.toString();
    };

    const fetchReports = async () => {
        const query = buildQuery();
        const res = await api.get(`/dashboard/reports${query ? `?${query}` : ''}`);
        if (res.ok && res.data) {
            setData(res.data);
        } else {
            setError(res.error || 'Failed to load reports.');
            notify.error(res.error || 'Failed to load reports.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);

    // ── Chart data preparation ──────────────────────────────
    const revenueChart = useMemo(() => {
        if (!data?.revenueByMonth) return [];
        const max = Math.max(...data.revenueByMonth.map(r => Number(r.total || 0)), 1);
        return data.revenueByMonth.map(r => {
            const [year, month] = r.month.split('-');
            const label = new Date(year, month - 1).toLocaleString('default', { month: 'short' });
            return { label, value: Number(r.total || 0), count: Number(r.count), height: (Number(r.total || 0) / max) * 100 };
        });
    }, [data]);

    const statusColors = {
        ONBOARDING: 'bg-amber-400',
        PLANNING: 'bg-slate-400',
        DESIGN: 'bg-pink-400',
        DEVELOPMENT: 'bg-blue-500',
        REVIEW: 'bg-purple-500',
        LAUNCHED: 'bg-emerald-500',
        MAINTENANCE: 'bg-cyan-400',
        ARCHIVED: 'bg-gray-400',
    };

    const projectTotal = data?.projectsByStatus?.reduce((s, p) => s + Number(p.count), 0) || 0;

    // ── CSV exports ─────────────────────────────────────────
    const exportRevenueCSV = () => {
        const csv = toCSV(data.revenueByMonth, [
            { label: 'Month', key: 'month' },
            { label: 'Revenue (NGN)', key: 'total' },
            { label: 'Invoices', key: 'count' },
        ]);
        downloadCSV(`revenue-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Revenue report exported');
    };

    const exportClientsCSV = () => {
        const csv = toCSV(data.topClients, [
            { label: 'Client', key: 'name' },
            { label: 'Total Revenue (NGN)', key: 'total_revenue' },
            { label: 'Invoice Count', key: 'invoice_count' },
        ]);
        downloadCSV(`top-clients-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Clients report exported');
    };

    // Set default date range to last 12 months
    const setDefaultRange = () => {
        const end = new Date().toISOString().split('T')[0];
        const start = new Date();
        start.setMonth(start.getMonth() - 12);
        setDateRange({ start: start.toISOString().split('T')[0], end });
    };

    useEffect(() => {
        if (!dateRange.start && !dateRange.end) setDefaultRange();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Loading reports…</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-red-500">{error || 'No data'}</div>
            </div>
        );
    }

    const { invoiceSummary, completionRate, avgProgress, projectsByStatus, topClients } = data;

    return (
        <div className="flex flex-col">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                                Reports
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Analytics & business insights.</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Icon.Calendar className="w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-accent font-body"
                            />
                            <span className="text-gray-400">to</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-accent font-body"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Revenue" value={formatCurrency(invoiceSummary.revenue)} hint="From paid invoices" accent="emerald" icon={Icon.TrendingUp} />
                    <StatCard label="Outstanding" value={formatCurrency(invoiceSummary.outstanding)} hint={`${invoiceSummary.pending} pending invoices`} accent="amber" icon={Icon.TrendingUp} />
                    <StatCard label="Overdue" value={invoiceSummary.overdue} hint="Past due date" accent="rose" icon={Icon.TrendingUp} />
                    <StatCard label="Avg. Progress" value={`${avgProgress}%`} hint="Across active projects" accent="purple" icon={Icon.PieChart} />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Chart */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Revenue (Last 12 Months)</h2>
                            <button onClick={exportRevenueCSV} title="Download as CSV" className="cursor-pointer text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-accent inline-flex items-center gap-1">
                                <Icon.Download className="w-3.5 h-3.5" /> CSV
                            </button>
                        </div>
                        {revenueChart.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No revenue data for this period.</div>
                        ) : (
                            <div className="flex items-end gap-2 sm:gap-3 h-48">
                                {revenueChart.map((d, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full flex-1 flex items-end justify-center">
                                            <div
                                                className="w-full max-w-[32px] bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative"
                                                style={{ height: `${Math.max(d.height, 4)}%` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold pointer-events-none">
                                                    {formatCurrency(d.value)} · {d.count} inv
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold text-gray-500 uppercase">{d.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Project Pipeline */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Project Pipeline</h2>
                        {projectsByStatus.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No projects in this period.</div>
                        ) : (
                            <div className="space-y-3">
                                {projectsByStatus.map((item, idx) => {
                                    const pct = projectTotal > 0 ? Math.round((Number(item.count) / projectTotal) * 100) : 0;
                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-24 text-right">
                                                <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.status}</span>
                                            </div>
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-r-md h-7 flex items-center">
                                                <div
                                                    className={`h-full ${statusColors[item.status] || 'bg-gray-400'} rounded-r-md flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500`}
                                                    style={{ width: `${Math.max(pct, 10)}%` }}
                                                >
                                                    {pct > 15 ? item.count : ''}
                                                </div>
                                            </div>
                                            <div className="w-10 text-right">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.count}</span>
                                            </div>
                                            <div className="w-12 text-right">
                                                <span className="text-[10px] text-gray-400 font-bold">{pct}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Completion Rate */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Completion Rate</h2>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-gray-100 dark:text-gray-700" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12"
                                        strokeDasharray={`${(Number(completionRate.completed || 0) / Math.max(Number(completionRate.total || 1), 1)) * 251.2} 251.2`}
                                        strokeLinecap="round" className="text-emerald-500" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                        {completionRate.total > 0 ? Math.round((Number(completionRate.completed || 0) / Number(completionRate.total)) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Completed</span>
                                <span className="font-bold text-emerald-600">{completionRate.completed || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">In Progress</span>
                                <span className="font-bold text-blue-600">{completionRate.in_progress || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Archived</span>
                                <span className="font-bold text-gray-500">{completionRate.archived || 0}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Top Clients */}
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
                        className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Top Clients by Revenue</h2>
                            <button onClick={exportClientsCSV} title="Download as CSV" className="cursor-pointer text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-accent inline-flex items-center gap-1">
                                <Icon.Download className="w-3.5 h-3.5" /> CSV
                            </button>
                        </div>
                        {topClients.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">No paid invoices in this period.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                                            <th className="py-3 px-4">#</th>
                                            <th className="py-3 px-4">Client</th>
                                            <th className="py-3 px-4 text-center">Invoices</th>
                                            <th className="py-3 px-4 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {topClients.map((c, idx) => (
                                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="py-3 px-4 text-gray-400 font-bold text-sm">{idx + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-orange-500 text-white flex items-center justify-center font-bold text-xs">
                                                            {c.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white text-sm">{c.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {c.invoice_count}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(c.total_revenue)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;