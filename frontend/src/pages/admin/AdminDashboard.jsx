import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { toCSV, downloadCSV } from '../../utils/csv.js';

// Simple Naira formatter (stored amounts are already in NGN in the DB).
const formatCurrency = (n) => `₦${Number(n || 0).toLocaleString()}`;

// ── Inline SVG icon set (no emoji, no external deps) ─────
const Icon = {
    Clients: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Active: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    ),
    Rocket: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    Money: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    Check: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    Chat: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    Alert: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    Clock: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Plus: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    Arrow: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    Search: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Download: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    Command: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
        </svg>
    ),
    X: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    CornerDownLeft: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" />
        </svg>
    ),
    ArrowUpDown: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polyline points="17 11 21 7 17 3" /><line x1="21" y1="7" x2="9" y2="7" />
            <polyline points="7 21 3 17 7 13" /><line x1="15" y1="17" x2="3" y2="17" />
        </svg>
    ),
    Filter: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    ),
};

const StatusPill = ({ status }) => {
    const map = {
        ONBOARDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
        PLANNING: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        DESIGN: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
        DEVELOPMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        LAUNCHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
        MAINTENANCE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
        ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const StatCard = ({ label, value, hint, icon: IconComp, accent = 'blue', isCurrency }) => {
    const accents = {
        blue: { grad: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500/10' },
        emerald: { grad: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500/10' },
        amber: { grad: 'from-amber-500 to-orange-600', ring: 'ring-amber-500/10' },
        purple: { grad: 'from-purple-500 to-fuchsia-600', ring: 'ring-purple-500/10' },
        rose: { grad: 'from-rose-500 to-pink-600', ring: 'ring-rose-500/10' },
        slate: { grad: 'from-slate-500 to-gray-700', ring: 'ring-slate-500/10' },
    };
    const a = accents[accent] || accents.blue;
    return (
        <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ring-1 ${a.ring}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.grad} text-white flex items-center justify-center shadow-sm`}>
                    {IconComp && <IconComp className="w-5 h-5" />}
                </div>
                {isCurrency && (
                    <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500">Money</span>
                )}
            </div>
            <div className={`text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white ${isCurrency ? 'whitespace-nowrap' : ''}`}>{value}</div>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                {hint && <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">{hint}</p>}
            </div>
        </div>
    );
};

// ── Time-of-day greeting (deterministic from the local hour) ──
const useGreeting = () => {
    return useMemo(() => {
        const h = new Date().getHours();
        if (h < 5) return 'Working late';
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        if (h < 22) return 'Good evening';
        return 'Working late';
    }, []);
};

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [now, setNow] = useState(new Date());
    const [smartView, setSmartView] = useState('all');
    const [paletteOpen, setPaletteOpen] = useState(false);
    const navigate = useNavigate();
    const greeting = useGreeting();

    useEffect(() => {
        fetchAll();
        const t = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(t);
    }, []);

    // Global Cmd/Ctrl-K opens the command palette — the single fastest way
    // to jump between clients, projects, templates, and admin actions.
    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setPaletteOpen((v) => !v);
            } else if (e.key === 'Escape') {
                setPaletteOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ── ALL useMemo calls must live above any early return so the hook order
    // stays stable across renders (loading → loaded, data: null → object).
    const nowMs = now.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const projects = data?.projects || [];
    const clients = data?.clients || [];
    const templates = data?.templates || [];
    const feedback = data?.feedback || [];
    const invoices = data?.invoices || [];

    // Count for each smart-view chip. Must run on every render, even before
    // data arrives (yields zeros in that case) — that's why it's a hook.
    const smartViewCounts = useMemo(() => {
        const c = { all: projects.length, active: 0, launched: 0, stalled: 0, overdue: 0, thisweek: 0 };
        for (const p of projects) {
            if (!['LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].includes(p.status)) c.active++;
            if (p.status === 'LAUNCHED' || p.status === 'MAINTENANCE') c.launched++;
            const updated = p.updated_at ? new Date(p.updated_at).getTime() : 0;
            if (updated && (nowMs - updated) > 30 * 24 * 60 * 60 * 1000 &&
                !['LAUNCHED', 'ARCHIVED'].includes(p.status)) c.stalled++;
            const owed = Number(p.amount_due || 0);
            const overdueInv = invoices.find(
                (i) => i.project_id === p.id && i.status === 'PENDING' && i.due_date && new Date(i.due_date) < now
            );
            if (owed > 0 || overdueInv) c.overdue++;
            const created = p.created_at ? new Date(p.created_at).getTime() : 0;
            if (created && (nowMs - created) <= sevenDays) c.thisweek++;
        }
        return c;
    }, [projects, invoices, nowMs]);

    // Monthly Revenue for Chart
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

    const fetchAll = async () => {
        const res = await api.get('/dashboard');
        if (res.ok && res.data) {
            setData(res.data);
        } else {
            setError(res.error || 'Failed to load dashboard.');
            notify.error(res.error || 'Failed to load dashboard.');
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Loading dashboard…</div>
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

    const stats = data.stats;
    const recentFeedback = [...feedback].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    const recentInvoices = [...invoices].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
    const openFeedback = feedback.filter(f => f.status === 'OPEN');
    const pendingInvoices = invoices.filter(i => i.status === 'PENDING');
    const overdueInvoices = pendingInvoices.filter(i => i.due_date && new Date(i.due_date) < new Date());
    const needsAttention = openFeedback.length + overdueInvoices.length;

    // Revenue Calculation
    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const activeClients = new Set(projects.filter(p => !['LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].includes(p.status)).map(p => p.client_id)).size;

    // ── Smart view filter ──────────────────────────────
    // One-click filters that surface the work the admin actually came here to do.
    const matchesSmartView = (p) => {
        switch (smartView) {
            case 'all':
                return true;
            case 'active':
                return !['LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].includes(p.status);
            case 'launched':
                return p.status === 'LAUNCHED' || p.status === 'MAINTENANCE';
            case 'stalled': {
                // No movement in 30+ days, not yet finished.
                const updated = p.updated_at ? new Date(p.updated_at).getTime() : 0;
                const isDone = ['LAUNCHED', 'ARCHIVED'].includes(p.status);
                return !isDone && updated && (nowMs - updated) > 30 * 24 * 60 * 60 * 1000;
            }
            case 'overdue': {
                const owed = Number(p.amount_due || 0);
                const overdueInv = invoices.find(
                    (i) => i.project_id === p.id && i.status === 'PENDING' && i.due_date && new Date(i.due_date) < now
                );
                return owed > 0 || !!overdueInv;
            }
            case 'thisweek': {
                const created = p.created_at ? new Date(p.created_at).getTime() : 0;
                return created && (nowMs - created) <= sevenDays;
            }
            default:
                return true;
        }
    };

    // Client-side search + smart-view filter
    const q = search.trim().toLowerCase();
    const filteredProjects = projects
        .filter(matchesSmartView)
        .filter((p) =>
            !q
                ? true
                : p.project_name.toLowerCase().includes(q) || (p.client_name || '').toLowerCase().includes(q)
        );
    const filteredClients = q
        ? clients.filter((c) => c.name.toLowerCase().includes(q) || c.primary_contact_email.toLowerCase().includes(q))
        : clients;

    // ── CSV exports (the next thing an admin does after looking at the data) ──
    const exportProjectsCSV = () => {
        const csv = toCSV(projects, [
            { label: 'Project', key: 'project_name' },
            { label: 'Client', key: 'client_name' },
            { label: 'Status', key: 'status' },
            { label: 'Progress %', key: 'progress' },
            { label: 'Amount Due (NGN)', key: 'amount_due' },
            { label: 'Payment Type', key: 'payment_type' },
            { label: 'Payment Status', key: 'payment_status' },
            { label: 'Domain', key: 'domain_name' },
            { label: 'Domain Expiration', value: (p) => p.domain_expiration ? new Date(p.domain_expiration).toISOString().slice(0, 10) : '' },
            { label: 'Created', value: (p) => p.created_at ? new Date(p.created_at).toISOString() : '' },
        ]);
        downloadCSV(`projects-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Projects CSV downloaded');
    };
    const exportInvoicesCSV = () => {
        const csv = toCSV(invoices, [
            { label: 'Invoice ID', key: 'id' },
            { label: 'Project ID', key: 'project_id' },
            { label: 'Client ID', key: 'client_id' },
            { label: 'Amount (NGN)', key: 'amount' },
            { label: 'Status', key: 'status' },
            { label: 'Due Date', value: (i) => i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : '' },
            { label: 'Paid At', value: (i) => i.paid_at ? new Date(i.paid_at).toISOString() : '' },
            { label: 'Created', value: (i) => i.created_at ? new Date(i.created_at).toISOString() : '' },
        ]);
        downloadCSV(`invoices-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Invoices CSV downloaded');
    };
    const exportClientsCSV = () => {
        const csv = toCSV(clients, [
            { label: 'Name', key: 'name' },
            { label: 'Primary Email', key: 'primary_contact_email' },
            { label: 'Billing Email', key: 'billing_email' },
            { label: 'Paystack Code', key: 'paystack_customer_code' },
            { label: 'Notes', key: 'notes' },
            { label: 'Created', value: (c) => c.created_at ? new Date(c.created_at).toISOString() : '' },
        ]);
        downloadCSV(`clients-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Clients CSV downloaded');
    };
    const exportFeedbackCSV = () => {
        const csv = toCSV(feedback, [
            { label: 'Project ID', key: 'project_id' },
            { label: 'Stage Index', key: 'stage_index' },
            { label: 'Status', key: 'status' },
            { label: 'Client Comment', key: 'client_comment' },
            { label: 'Admin Reply', key: 'admin_reply' },
            { label: 'Created', value: (f) => f.created_at ? new Date(f.created_at).toISOString() : '' },
        ]);
        downloadCSV(`feedback-${new Date().toISOString().slice(0, 10)}.csv`, csv);
        notify.success('Feedback CSV downloaded');
    };

    return (
        <div className="flex flex-col">
            {/* ── HEADER ─────────────────────────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-8 flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4"
                >
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <Icon.Clock className="w-3.5 h-3.5" />
                            <time dateTime={now.toISOString()}>
                                {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} · {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </time>
                        </div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {greeting}.
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                            One page for everything — clients, projects, billing, feedback.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link to="/admin/clients" className="cursor-pointer inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-800 dark:text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">
                            <Icon.Plus className="w-4 h-4" /> Client
                        </Link>
                        <Link to="/admin/projects" className="cursor-pointer inline-flex items-center gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-800 dark:text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-colors">
                            <Icon.Plus className="w-4 h-4" /> Project
                        </Link>
                        <Link to="/admin/templates" className="cursor-pointer inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-colors">
                            <Icon.Plus className="w-4 h-4" /> Template
                        </Link>
                    </div>
                </motion.div>

                {/* ── ALERT BANNER (only if there are issues) ───────── */}
                {needsAttention > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex flex-wrap items-center gap-3"
                    >
                        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                            <Icon.Alert className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                                {needsAttention} {needsAttention === 1 ? 'item needs' : 'items need'} your attention
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                                {openFeedback.length > 0 && <span>{openFeedback.length} open feedback</span>}
                                {openFeedback.length > 0 && overdueInvoices.length > 0 && <span> · </span>}
                                {overdueInvoices.length > 0 && <span>{overdueInvoices.length} overdue invoice{overdueInvoices.length === 1 ? '' : 's'}</span>}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {overdueInvoices.length > 0 && (
                                <a href="#invoices" className="cursor-pointer text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-lg transition-colors">
                                    Review invoices
                                </a>
                            )}
                            {openFeedback.length > 0 && (
                                <a href="#feedback" className="cursor-pointer text-xs font-bold bg-white dark:bg-gray-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 px-3 py-2 rounded-lg transition-colors">
                                    Review feedback
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── STATS GRID ────────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total Projects" value={projects.length} icon={Icon.Rocket} accent="blue" />
                    <StatCard label="Active Clients" value={activeClients} hint="With active projects" icon={Icon.Clients} accent="purple" />
                    <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} hint="From paid invoices" icon={Icon.Money} accent="emerald" isCurrency />
                    <StatCard label="Overdue Invoices" value={overdueInvoices.length} hint="Needs action" icon={Icon.Alert} accent="rose" />
                </div>

                {/* ── CHARTS ROW ────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* ── REVENUE CHART ─────────────────────────────────── */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Revenue Overview</h2>
                        <div className="flex-1 min-h-[12rem] flex items-end gap-2 sm:gap-4 pt-4">
                            {monthlyRevenue.map((data, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative flex-1 flex items-end justify-center">
                                        <div 
                                            className="w-full max-w-[40px] bg-emerald-500/80 hover:bg-emerald-500 rounded-t-md transition-all duration-300 relative group"
                                            style={{ height: `${Math.max(data.height, 5)}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold pointer-events-none">
                                                {formatCurrency(data.value)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{data.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── PIPELINE FUNNEL ─────────────────────────────────── */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                        <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Project Pipeline</h2>
                        <div className="flex-1 flex flex-col justify-center gap-2">
                            {['ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED'].map((stage, idx, arr) => {
                                const count = projects.filter(p => p.status === stage).length;
                                const maxCount = Math.max(...arr.map(s => projects.filter(p => p.status === s).length), 1);
                                const width = `${Math.max((count / maxCount) * 100, 15)}%`;
                                const colors = ['bg-amber-400', 'bg-slate-400', 'bg-pink-400', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500'];
                                return (
                                    <div key={stage} className="flex items-center gap-3">
                                        <div className="w-24 text-right">
                                            <span className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stage}</span>
                                        </div>
                                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-r-md h-6 flex items-center">
                                            <div 
                                                className={`h-full ${colors[idx]} rounded-r-md flex items-center justify-end px-2 text-[10px] font-bold text-white transition-all duration-500`}
                                                style={{ width }}
                                            >
                                                {count > 0 ? count : ''}
                                            </div>
                                        </div>
                                        <div className="w-8">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── SMART VIEW FILTERS + SEARCH ────────────────────── */}
                <div className="mb-6 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mr-1">
                            <Icon.Filter className="w-3.5 h-3.5" /> Smart views
                        </div>
                        {[
                            { key: 'all', label: 'All' },
                            { key: 'active', label: 'Active' },
                            { key: 'overdue', label: 'Overdue', tone: 'rose' },
                            { key: 'stalled', label: 'Stalled >30d', tone: 'amber' },
                            { key: 'thisweek', label: 'This week' },
                            { key: 'launched', label: 'Launched' },
                        ].map((v) => {
                            const count = smartViewCounts[v.key] || 0;
                            const isActive = smartView === v.key;
                            const toneClasses = v.tone === 'rose'
                                ? isActive ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                                : v.tone === 'amber'
                                ? isActive ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                                : isActive
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-blue-500';
                            return (
                                <button
                                    key={v.key}
                                    onClick={() => setSmartView(v.key)}
                                    className={`cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${toneClasses}`}
                                >
                                    {v.label}
                                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex items-center gap-2 max-w-2xl">
                        <div className="relative flex-1">
                            <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search projects or clients…"
                                className="w-full pl-9 pr-24 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                            <kbd className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 px-1.5 py-0.5 rounded">
                                <Icon.Command className="w-3 h-3" />K
                            </kbd>
                        </div>
                        <button
                            onClick={() => setPaletteOpen(true)}
                            className="cursor-pointer hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 text-gray-700 dark:text-gray-200 transition-colors"
                            title="Open command palette (Ctrl/⌘+K)"
                        >
                            <Icon.Command className="w-4 h-4" /> Jump to…
                        </button>
                    </div>
                </div>

                {/* ── TWO-COLUMN: PROJECTS + CLIENTS ────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="xl:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Projects</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {filteredProjects.length} of {projects.length} · sorted by activity
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={exportProjectsCSV}
                                    title="Download all projects as CSV"
                                    className="cursor-pointer text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                                >
                                    <Icon.Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                <Link to="/admin/projects" className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                                    View all <Icon.Arrow className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                        {filteredProjects.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                <p className="text-gray-400 text-sm">{q ? 'No matches for your search.' : 'No projects yet. Create your first one!'}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredProjects.slice(0, 5).map(p => (
                                    <Link
                                        to={`/admin/projects/${p.id}`}
                                        key={p.id}
                                        className="cursor-pointer block p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-400 hover:shadow-sm hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-150"
                                    >
                                        <div className="flex justify-between items-start gap-3 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{p.project_name}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{p.client_name || 'No client'}</p>
                                            </div>
                                            <StatusPill status={p.status} />
                                        </div>
                                        <div className="flex items-center gap-3 text-xs">
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all" style={{ width: `${p.progress}%` }} />
                                            </div>
                                            <span className="font-bold text-gray-600 dark:text-gray-300 w-10 text-right">{p.progress}%</span>
                                            {p.amount_due > 0 && (
                                                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">
                                                    {formatCurrency(p.amount_due)}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Clients</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{filteredClients.length} of {clients.length}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={exportClientsCSV}
                                    title="Download all clients as CSV"
                                    className="cursor-pointer text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                                >
                                    <Icon.Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                <Link to="/admin/clients" className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                                    Manage <Icon.Arrow className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                        {filteredClients.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">{q ? 'No matches.' : 'No clients yet.'}</p>
                        ) : (
                            <div className="space-y-2">
                                {filteredClients.slice(0, 6).map(c => (
                                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{c.name}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.primary_contact_email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* ── THREE-COLUMN: FEEDBACK + INVOICES + TEMPLATES ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <motion.div
                        id="feedback"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm scroll-mt-32"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Feedback</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{feedback.length} total · {openFeedback.length} open</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportFeedbackCSV}
                                    title="Download all feedback as CSV"
                                    className="cursor-pointer text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                                >
                                    <Icon.Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                {openFeedback.length > 0 && (
                                    <span className="cursor-default text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
                                        {openFeedback.length} open
                                    </span>
                                )}
                            </div>
                        </div>
                        {recentFeedback.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">No feedback yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentFeedback.map(f => {
                                    const project = projects.find(p => p.id === f.project_id);
                                    return (
                                        <div key={f.id} className={`p-3 rounded-xl border ${f.status === 'OPEN' ? 'bg-rose-50/40 dark:bg-rose-900/10 border-rose-200/60 dark:border-rose-800/40' : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700'}`}>
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-300">Stage {f.stage_index + 1}</span>
                                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${f.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                    {f.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 italic">"{f.client_comment}"</p>
                                            {project && <p className="text-[10px] text-gray-400 mt-2 truncate">— {project.project_name}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        id="invoices"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm scroll-mt-32"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Invoices</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{invoices.length} total · billed via Paystack</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={exportInvoicesCSV}
                                    title="Download all invoices as CSV"
                                    className="cursor-pointer text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-1"
                                >
                                    <Icon.Download className="w-3.5 h-3.5" /> CSV
                                </button>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                                    Paystack
                                </span>
                            </div>
                        </div>
                        {recentInvoices.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">No invoices yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentInvoices.map(inv => {
                                    const isOverdue = inv.status === 'PENDING' && inv.due_date && new Date(inv.due_date) < new Date();
                                    return (
                                        <div key={inv.id} className={`p-3 rounded-xl border ${isOverdue ? 'bg-rose-50/40 dark:bg-rose-900/10 border-rose-200/60 dark:border-rose-800/40' : 'bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-700'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">{formatCurrency(inv.amount)}</span>
                                                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {isOverdue ? 'OVERDUE' : inv.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400">Created {new Date(inv.created_at).toLocaleDateString()}</p>
                                            {inv.due_date && <p className="text-[10px] text-gray-400">Due {new Date(inv.due_date).toLocaleDateString()}</p>}
                                            {inv.payment_url && inv.status === 'PENDING' && (
                                                <a href={inv.payment_url} target="_blank" rel="noreferrer" className="cursor-pointer block mt-2 text-center text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-md transition-colors">
                                                    Pay via Paystack →
                                                </a>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">Intake Templates</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{templates.length} saved</p>
                            </div>
                            <Link to="/admin/templates" className="cursor-pointer text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1">
                                Manage <Icon.Arrow className="w-3 h-3" />
                            </Link>
                        </div>
                        {templates.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center py-6">No templates yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {templates.map(t => (
                                    <div key={t.id} className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{t.description}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                                                {t.schema?.length || 0} fields
                                            </span>
                                            <a href={`/form/${t.id}`} target="_blank" rel="noreferrer" className="cursor-pointer text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1">
                                                Preview <Icon.Arrow className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

            {/* ── COMMAND PALETTE (Cmd/Ctrl + K) ─────────────────────── */}
            {paletteOpen && (
                <CommandPalette
                    projects={projects}
                    clients={clients}
                    templates={templates}
                    onClose={() => setPaletteOpen(false)}
                    onNavigate={(path) => { setPaletteOpen(false); navigate(path); }}
                />
            )}
        </div>
    );
};

// ── Command palette ───────────────────────────────────────────
// Renders nothing more than a single modal that searches across clients,
// projects, templates, and admin actions. No router lookup, no fancy state —
// just a filter against the data already on screen.
const CommandPalette = ({ projects, clients, templates, onClose, onNavigate }) => {
    const [q, setQ] = useState('');
    const [active, setActive] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const items = useMemo(() => {
        const navActions = [
            { kind: 'action', label: 'Go to Dashboard', path: '/admin', hint: 'Nav' },
            { kind: 'action', label: 'Go to Projects', path: '/admin/projects', hint: 'Nav' },
            { kind: 'action', label: 'Go to Clients', path: '/admin/clients', hint: 'Nav' },
            { kind: 'action', label: 'Go to Invoices', path: '/admin/invoices', hint: 'Nav' },
            { kind: 'action', label: 'Go to Templates', path: '/admin/templates', hint: 'Nav' },
            { kind: 'action', label: 'Create new Project', path: '/admin/projects', hint: 'Nav' },
            { kind: 'action', label: 'Create new Invoice', path: '/admin/invoices', hint: 'Nav' },
        ];
        const fromClients = clients.map((c) => ({
            kind: 'client',
            label: c.name,
            sub: c.primary_contact_email,
            path: '/admin/clients',
            id: c.id,
        }));
        const fromProjects = projects.map((p) => ({
            kind: 'project',
            label: p.project_name,
            sub: p.client_name || 'No client',
            path: `/admin/projects/${p.id}`,
            id: p.id,
        }));
        const fromTemplates = templates.map((t) => ({
            kind: 'template',
            label: t.name,
            sub: t.description || `${t.schema?.length || 0} fields`,
            path: '/admin/templates',
            id: t.id,
        }));
        return [...navActions, ...fromClients, ...fromProjects, ...fromTemplates];
    }, [projects, clients, templates]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return items.slice(0, 10);
        return items.filter((i) => i.label.toLowerCase().includes(term) || (i.sub || '').toLowerCase().includes(term)).slice(0, 12);
    }, [q, items]);

    useEffect(() => {
        setActive(0);
    }, [q]);

    const onKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(filtered.length - 1, a + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const target = filtered[active];
            if (target) onNavigate(target.path);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [filtered, active, onNavigate, onClose]);

    const kindBadge = (kind) => {
        const map = {
            action: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            client: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            project: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            template: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        };
        return map[kind] || map.action;
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                    <Icon.Command className="w-4 h-4 text-gray-400" />
                    <input
                        ref={inputRef}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Jump to a client, project, template, or action…"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                    />
                    <button onClick={onClose} className="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Icon.X className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {filtered.length === 0 ? (
                        <div className="px-4 py-10 text-center text-sm text-gray-400">No matches.</div>
                    ) : (
                        filtered.map((item, i) => (
                            <button
                                key={`${item.kind}-${item.id || item.path}`}
                                onClick={() => onNavigate(item.path)}
                                onMouseEnter={() => setActive(i)}
                                className={`w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === active ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                            >
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${kindBadge(item.kind)}`}>
                                    {item.kind}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.label}</p>
                                    {item.sub && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.sub}</p>}
                                </div>
                                {i === active && <Icon.CornerDownLeft className="w-3.5 h-3.5 text-blue-500" />}
                            </button>
                        ))
                    )}
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 text-[10px] text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><kbd className="font-mono font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1 rounded">↑↓</kbd> navigate</span>
                        <span className="flex items-center gap-1"><kbd className="font-mono font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1 rounded">↵</kbd> open</span>
                        <span className="flex items-center gap-1"><kbd className="font-mono font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1 rounded">esc</kbd> close</span>
                    </div>
                    <span className="font-bold">{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
