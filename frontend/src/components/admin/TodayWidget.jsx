import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

const Icon = {
    Leads: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11h-6" /><path d="M19 8v6" /></svg>,
    Invoice: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    Globe: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    Review: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    Feedback: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    Bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    Mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    Arrow: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>,
};

// Map of metric → { link, label, tone } for the seven counters
// returned by /api/dashboard/today. Only non-zero metrics are
// rendered so the widget doesn't fill the dashboard with zeros.
const METRIC_CONFIG = {
    leadsNeedReply:       { to: '/admin/inbox?status=New',     label: 'Leads need reply',     tone: 'blue' },
    overdueInvoices:      { to: '/admin/invoices?status=PENDING', label: 'Overdue invoices',  tone: 'rose' },
    domainsExpiring:      { to: '/admin/projects',              label: 'Domains expiring (30d)', tone: 'amber' },
    projectsInReview:     { to: '/admin/projects',              label: 'Projects in review',  tone: 'purple' },
    openFeedback:         { to: '/admin/inbox?kind=feedback',   label: 'Open feedback',       tone: 'emerald' },
    unreadNotifications:  { to: '/admin',                       label: 'Unread notifications', tone: 'slate' },
    unreadMessages:       { to: '/admin/inbox?kind=message',    label: 'Unread messages',     tone: 'cyan' },
};

const TONES = {
    blue:    { grad: 'from-blue-500 to-indigo-600',     text: 'text-blue-700 dark:text-blue-300',     border: 'border-blue-200/60 dark:border-blue-800/40' },
    rose:    { grad: 'from-rose-500 to-pink-600',       text: 'text-rose-700 dark:text-rose-300',     border: 'border-rose-200/60 dark:border-rose-800/40' },
    amber:   { grad: 'from-amber-500 to-orange-600',    text: 'text-amber-700 dark:text-amber-300',   border: 'border-amber-200/60 dark:border-amber-800/40' },
    purple:  { grad: 'from-purple-500 to-fuchsia-600',  text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200/60 dark:border-purple-800/40' },
    emerald: { grad: 'from-emerald-500 to-teal-600',    text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200/60 dark:border-emerald-800/40' },
    slate:   { grad: 'from-slate-500 to-gray-700',      text: 'text-slate-700 dark:text-slate-300',   border: 'border-slate-200/60 dark:border-slate-800/40' },
    cyan:    { grad: 'from-cyan-500 to-sky-600',         text: 'text-cyan-700 dark:text-cyan-300',     border: 'border-cyan-200/60 dark:border-cyan-800/40' },
};

const ICON_FOR_KEY = {
    leadsNeedReply: Icon.Leads,
    overdueInvoices: Icon.Invoice,
    domainsExpiring: Icon.Globe,
    projectsInReview: Icon.Review,
    openFeedback: Icon.Feedback,
    unreadNotifications: Icon.Bell,
    unreadMessages: Icon.Mail,
};

/**
 * TodayWidget — top-of-dashboard snapshot.
 * Fetches /api/dashboard/today and renders a row of cards
 * for every metric that has a non-zero value. Quiet
 * when there's nothing to do (the rest of the dashboard
 * has plenty of context).
 */
const TodayWidget = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const res = await api.get('/dashboard/today', { timeout: 7000 });
            if (cancelled) return;
            if (res.ok && res.data) setData(res.data);
            setLoading(false);
        };
        load();
        // Refresh every 2 minutes so the widget stays roughly live.
        const id = setInterval(load, 120_000);
        return () => { cancelled = true; clearInterval(id); };
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 h-24 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!data) return null;

    const items = Object.entries(METRIC_CONFIG)
        .map(([key, cfg]) => {
            const value = data[key];
            return { key, value, ...cfg };
        })
        .filter((item) => Number(item.value) > 0);

    if (items.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-center"
            >
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                    ✓ Inbox zero. Nothing on fire.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
            {items.map(({ key, value, to, label, tone }, i) => {
                const toneClasses = TONES[tone] || TONES.blue;
                const Ico = ICON_FOR_KEY[key];
                return (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                    >
                        <Link
                            to={to}
                            className={`block h-full bg-white dark:bg-gray-800 p-4 rounded-2xl border ${toneClasses.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                        >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${toneClasses.grad} text-white flex items-center justify-center mb-2 shadow-sm`}>
                                {Ico && <Ico className="w-4 h-4" />}
                            </div>
                            <div className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{value}</div>
                            <div className={`text-[10px] font-extrabold uppercase tracking-wider ${toneClasses.text} mt-0.5 truncate`}>
                                {label}
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default TodayWidget;
