import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { toCSV, downloadCSV } from '../../utils/csv.jsx';
import { ActionIcon, AliasedIcon } from '../../data/adminIcons.jsx';

const formatCurrency = (n, curr = 'NGN') => {
    try {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: curr }).format(Number(n || 0));
    } catch {
        return `${curr} ${Number(n || 0).toLocaleString()}`;
    }
};

// Convert any (amount, currency) pair to NGN using a rates map
// fetched from /api/fx-rates. Missing rates are treated as 0 and
// counted in the "uncategorised" count so the admin can spot gaps.
const convertToNGN = (amount, currency, rates) => {
    if (currency === 'NGN') return Number(amount || 0);
    const rate = rates?.[currency]?.rate;
    if (rate === undefined || rate === null) return 0;
    return Number(amount || 0) * Number(rate);
};

const Icon = {
    Plus: ActionIcon.Plus,
    Search: ActionIcon.Search,
    Download: ActionIcon.Download,
    Filter: ActionIcon.Filter,
    External: ActionIcon.ExternalLink,
    X: ActionIcon.X,
    Check: ActionIcon.Check,
    Refresh: ActionIcon.Refresh,
    Copy: ActionIcon.Copy,
    File: AliasedIcon.File,
};

const StatusPill = ({ status, isOverdue }) => {
    if (isOverdue) {
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">Overdue</span>;
    }
    const map = {
        PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        REFUNDED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const StatCard = ({ label, value, hint, accent = 'blue' }) => {
    const accents = {
        blue: 'from-blue-500 to-indigo-600',
        emerald: 'from-emerald-500 to-teal-600',
        amber: 'from-amber-500 to-orange-600',
        rose: 'from-rose-500 to-pink-600',
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accents[accent]} text-white flex items-center justify-center shadow-sm mb-3`}>
                <Icon.File className="w-5 h-5" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-0.5">{hint}</p>}
        </div>
    );
};

const AdminInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [divisionFilter, setDivisionFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [projects, setProjects] = useState([]);
    const [fxRates, setFxRates] = useState({});
    const [formData, setFormData] = useState({ project_id: '', amount: '', currency: 'NGN', dueDate: '' });

    const fetchInvoices = async () => {
        const params = {};
        if (divisionFilter !== 'all') {
            params.division = divisionFilter;
        }
        const res = await api.get('/invoices', { params });
        if (res.ok && res.data) setInvoices(res.data);
        else setError(res.error || 'Failed to load invoices.');
        setLoading(false);
    };

    const fetchProjects = async () => {
        const res = await api.get('/client-projects');
        if (res.ok && res.data) setProjects(res.data);
    };

    const fetchFxRates = async () => {
        const res = await api.get('/fx-rates');
        if (res.ok && res.data?.rates) setFxRates(res.data.rates);
    };

    useEffect(() => {
        fetchInvoices();
        fetchProjects();
        fetchFxRates();
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [divisionFilter]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.project_id || !formData.amount) return;
        setSubmitting(true);

        const project = projects.find(p => p.id === formData.project_id);
        const res = await api.post('/invoices', {
            clientId: project?.client_id,
            projectId: formData.project_id,
            amount: Number(formData.amount),
            currency: formData.currency || 'NGN',
            dueDate: formData.dueDate || undefined,
        });

        if (res.ok) {
            notify.success('Invoice created successfully!');
            setFormData({ project_id: '', amount: '', currency: 'NGN', dueDate: '' });
            setShowForm(false);
            fetchInvoices();
        } else {
            notify.error(res.error || 'Failed to create invoice.');
        }
        setSubmitting(false);
    };

    const handleMarkPaid = async (id) => {
        const res = await api.patch(`/invoices/${id}/pay`);
        if (res.ok) {
            notify.success('Invoice marked as paid');
            fetchInvoices();
        } else {
            notify.error(res.error || 'Failed to mark invoice as paid');
        }
    };

    const handleRefund = async (id) => {
        if (!window.confirm('Refund this invoice? This will mark it as refunded.')) return;
        const res = await api.patch(`/invoices/${id}/refund`);
        if (res.ok) {
            notify.success('Invoice refunded');
            fetchInvoices();
        } else {
            notify.error(res.error || 'Failed to refund invoice');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this invoice? This action cannot be undone.')) return;
        const res = await api.delete(`/invoices/${id}`);
        if (res.ok) {
            notify.success('Invoice deleted');
            fetchInvoices();
        } else {
            notify.error(res.error || 'Failed to delete invoice');
        }
    };

    const exportCSV = () => {
        const csv = toCSV(filtered, [
            { label: 'Invoice ID', key: 'id' },
            { label: 'Project', key: 'project_name' },
            { label: 'Client', key: 'client_name' },
            { label: 'Amount', key: 'amount' },
            { label: 'Currency', key: 'currency' },
            { label: 'Status', key: 'status' },
            { label: 'Due Date', value: (i) => i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : '' },
            { label: 'Paid At', value: (i) => i.paid_at ? new Date(i.paid_at).toISOString() : '' },
            { label: 'Created', value: (i) => i.created_at ? new Date(i.created_at).toISOString() : '' },
        ]);
        downloadCSV(`invoices-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Invoices CSV downloaded');
    };

    const now = Date.now();

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return invoices.filter(i => {
            const matchesStatus = statusFilter === 'all'
                || (statusFilter === 'paid' && i.status === 'PAID')
                || (statusFilter === 'pending' && i.status === 'PENDING')
                || (statusFilter === 'overdue' && i.status === 'PENDING' && i.due_date && new Date(i.due_date) < new Date());
            const matchesSearch = !q
                || (i.project_name || '').toLowerCase().includes(q)
                || (i.client_name || '').toLowerCase().includes(q)
                || i.id.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [invoices, search, statusFilter]);

    const stats = useMemo(() => {
        const total = invoices.length;
        const paid = invoices.filter(i => i.status === 'PAID');
        const pending = invoices.filter(i => i.status === 'PENDING');
        const overdue = pending.filter(i => i.due_date && new Date(i.due_date) < new Date());

        // Multi-currency revenue: convert every paid invoice to NGN
        // using the latest rates. Track how many rows had a missing
        // rate so the admin can add a new currency in AdminSettings.
        let revenueNGN = 0;
        let missingRateCount = 0;
        for (const inv of paid) {
            const code = (inv.currency || 'NGN').toUpperCase();
            if (code === 'NGN') {
                revenueNGN += Number(inv.amount || 0);
            } else if (fxRates[code]?.rate) {
                revenueNGN += Number(inv.amount || 0) * Number(fxRates[code].rate);
            } else {
                missingRateCount += 1;
            }
        }

        return {
            total,
            paidCount: paid.length,
            pendingCount: pending.length,
            overdueCount: overdue.length,
            revenue: revenueNGN,
            missingRateCount,
        };
    }, [invoices, fxRates]);

    const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
    const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

    return (
        <div className="flex flex-col">
            <div className="max-w-7xl mx-auto w-full">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                                Invoices
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Billing powered by Paystack.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={exportCSV}
                                disabled={filtered.length === 0}
                                className="inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-accent text-gray-800 dark:text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                            >
                                <Icon.Download className="w-4 h-4" /> Export CSV
                            </button>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
                            >
                                {showForm ? <Icon.X className="w-4 h-4" /> : <Icon.Plus className="w-4 h-4" />}
                                {showForm ? 'Cancel' : 'New Invoice'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        label="Total Revenue (NGN Equivalent)"
                        value={formatCurrency(stats.revenue, 'NGN')}
                        hint={stats.missingRateCount > 0
                            ? `${stats.missingRateCount} invoice(s) skipped — unknown currency`
                            : 'From paid invoices, converted at live FX rates'}
                        accent="emerald"
                    />
                    <StatCard label="Paid" value={stats.paidCount} hint={`${stats.total} total`} accent="blue" />
                    <StatCard label="Pending" value={stats.pendingCount} hint="Awaiting payment" accent="amber" />
                    <StatCard label="Overdue" value={stats.overdueCount} hint="Needs action" accent="rose" />
                </div>

                {/* Create Form */}
                {showForm && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Generate New Invoice</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className={labelClass}>Project</label>
                                    <select name="project_id" value={formData.project_id} onChange={e => setFormData({ ...formData, project_id: e.target.value })} required className={inputClass}>
                                        <option value="">Select project…</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Currency</label>
                                        <select name="currency" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className={inputClass}>
                                            <option value="NGN">NGN (Naira)</option>
                                            <option value="USD">USD (Dollar)</option>
                                            <option value="EUR">EUR (Euro)</option>
                                            <option value="GBP">GBP (Pound)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Amount</label>
                                        <input type="number" name="amount" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="e.g. 50000" required className={inputClass} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Due Date (Optional)</label>
                                        <input type="date" name="dueDate" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="mt-4 bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 font-body">
                                {submitting ? 'Creating…' : 'Create Invoice'}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Filters */}
                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by project, client, or invoice ID…" className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors font-body" />
                    </div>
                    <select
                        value={divisionFilter}
                        onChange={(e) => setDivisionFilter(e.target.value)}
                        className="px-3 py-2.5 text-sm font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors font-body"
                    >
                        <option value="all">All Divisions</option>
                        <option value="SOFTWARE">Software</option>
                        <option value="SURVEY">Survey</option>
                        <option value="DRONE">Drone</option>
                    </select>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                            <Icon.Filter className="w-3.5 h-3.5" />
                        </div>
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'paid', label: 'Paid' },
                            { key: 'pending', label: 'Pending' },
                            { key: 'overdue', label: 'Overdue' },
                        ].map(f => (
                            <button key={f.key} onClick={() => setStatusFilter(f.key)} className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${statusFilter === f.key ? 'bg-accent text-white shadow-md shadow-accent/20' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-accent'}`}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-gray-400 font-body">
                        Loading invoices…
                    </div>
                ) : error ? (
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-red-500 font-body">
                        {error}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                        <p className="text-gray-400 font-body mb-4">{search || statusFilter !== 'all' ? 'No invoices match your filters.' : 'No invoices yet.'}</p>
                        {!search && statusFilter === 'all' && (
                            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors">
                                <Icon.Plus className="w-4 h-4" /> Create your first invoice
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                                        <th className="py-4 px-6">Invoice</th>
                                        <th className="py-4 px-6">Project</th>
                                        <th className="py-4 px-6">Client</th>
                                        <th className="py-4 px-6 text-center">Division</th>
                                        <th className="py-4 px-6 text-right">Amount</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th className="py-4 px-6">Due</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filtered.map(inv => {
                                        const isOverdue = inv.status === 'PENDING' && inv.due_date && new Date(inv.due_date) < new Date();
                                        return (
                                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{inv.id.slice(0, 8)}…</span>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(inv.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{inv.project_name || '—'}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">{inv.client_name || '—'}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {inv.division && (
                                                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                            inv.division === 'SURVEY' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                            inv.division === 'DRONE' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' :
                                                            'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                                        }`}>
                                                            {inv.division}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <span className="font-bold font-mono text-gray-900 dark:text-white">{formatCurrency(inv.amount, inv.currency || 'NGN')}</span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <StatusPill status={inv.status} isOverdue={isOverdue} />
                                                </td>
                                                <td className="py-4 px-6">
                                                    {inv.due_date ? (
                                                        <span className={`text-xs ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {new Date(inv.due_date).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center gap-3 justify-end">
                                                        {inv.payment_url && inv.status === 'PENDING' && (
                                                            <a href={inv.payment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline" title="Open payment link">
                                                                Pay Link <Icon.External className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                        {inv.pay_token && (
                                                            <button
                                                                onClick={() => {
                                                                    const url = `${window.location.origin}/pay/${inv.pay_token}`;
                                                                    navigator.clipboard?.writeText(url);
                                                                    notify.success('Payment page URL copied — paste into your email to the client');
                                                                }}
                                                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                                                                title="Copy secure /pay/:token link"
                                                            >
                                                                <Icon.Copy className="w-3.5 h-3.5" /> Copy /pay Link
                                                            </button>
                                                        )}
                                                        {inv.status === 'PENDING' && (
                                                            <button onClick={() => handleMarkPaid(inv.id)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1" title="Mark as paid">
                                                                <Icon.Check className="w-3.5 h-3.5" /> Paid
                                                            </button>
                                                        )}
                                                        {inv.status === 'PAID' && (
                                                            <button onClick={() => handleRefund(inv.id)} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1" title="Issue refund">
                                                                <Icon.Refresh className="w-3.5 h-3.5" /> Refund
                                                            </button>
                                                        )}
                                                        <button onClick={() => handleDelete(inv.id)} className="text-xs font-bold text-red-500 hover:text-red-600" title="Delete invoice">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInvoices;