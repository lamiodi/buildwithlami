// ─── src/components/admin/DashboardWidgets.jsx ──────────
// Reusable widgets for the admin dashboard.
// Each widget fetches its own data (or accepts props) and renders
// a skeleton while loading. Splitting them out of AdminDashboard
// lets them be lazy-loaded individually, so a slow `/invoices`
// query doesn't block the user from seeing the rest of the page.
// ──────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import Skeleton from '../Skeleton';

// ── Generic skeleton block — used while data is loading ──
export const WidgetSkeleton = ({ height = 'h-32', lines = 3 }) => (
    <div className={`p-5 ${height} rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111]`}>
        <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className="h-3" style={{ width: `${100 - i * 15}%` }} />
            ))}
        </div>
    </div>
);

// ── Stat Card Widget (KPI display) ───────────────────────
export const StatCard = ({ label, value, hint, icon: IconComp, accent = 'blue', isCurrency }) => {
    const accents = {
        blue: { grad: 'from-blue-500 to-indigo-600', ring: 'ring-blue-500/10', text: 'text-blue-500' },
        emerald: { grad: 'from-emerald-500 to-teal-600', ring: 'ring-emerald-500/10', text: 'text-emerald-500' },
        amber: { grad: 'from-amber-500 to-orange-600', ring: 'ring-amber-500/10', text: 'text-amber-500' },
        purple: { grad: 'from-purple-500 to-fuchsia-600', ring: 'ring-purple-500/10', text: 'text-purple-500' },
        rose: { grad: 'from-rose-500 to-pink-600', ring: 'ring-rose-500/10', text: 'text-rose-500' },
        slate: { grad: 'from-slate-500 to-gray-700', ring: 'ring-slate-500/10', text: 'text-slate-500' },
    };
    const a = accents[accent] || accents.blue;
    return (
        <div className={`p-5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 ring-1 ${a.ring}`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`size-10 rounded-xl bg-gradient-to-br ${a.grad} text-white flex items-center justify-center shadow-md`}>
                    {IconComp && <IconComp className="size-5" aria-hidden="true" />}
                </div>
                {isCurrency && (
                    <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500">NGN / FX</span>
                )}
            </div>
            <div className={`text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white ${isCurrency ? 'whitespace-nowrap' : ''}`}>{value}</div>
            <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                {hint && <p className="text-[10px] text-gray-400 font-semibold">{hint}</p>}
            </div>
        </div>
    );
};


// ── Independent Stat Widget: fetches its own data ────────
export const LazyStatCard = ({ label, endpoint, hint, icon, accent, transform, isCurrency }) => {
    const [value, setValue] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const res = await api.get(endpoint);
            if (cancelled) return;
            if (res.ok) {
                const v = transform ? transform(res.data) : res.data;
                setValue(v);
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, [endpoint, transform]);

    if (loading) return <WidgetSkeleton height="h-32" lines={2} />;
    return <StatCard label={label} value={value} hint={hint} icon={icon} accent={accent} isCurrency={isCurrency} />;
};

// ── Time-of-day greeting (deterministic from the local hour) ──
export const useGreeting = () => {
    return useMemo(() => {
        const h = new Date().getHours();
        if (h < 5) return 'Working late';
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        if (h < 22) return 'Good evening';
        return 'Working late';
    }, []);
};

// ── Status Pill (extracted for reuse + memoization) ──────
const STATUS_STYLES = {
    ONBOARDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    PLANNING: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
    DESIGN: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    DEVELOPMENT: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    REVIEW: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    LAUNCHED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    MAINTENANCE: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    ARCHIVED: 'bg-gray-50 dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-800',
};

export const StatusPill = React.memo(({ status }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold uppercase tracking-wider whitespace-nowrap border ${STATUS_STYLES[status] || STATUS_STYLES.PLANNING}`}>
        {status}
    </span>
));
StatusPill.displayName = 'StatusPill';


// ── Lazy-loaded section widgets ──────────────────────────
// These split the dashboard into independently-rendered regions
// so each section can stream in as its data arrives, instead of
// holding the entire dashboard hostage until /dashboard returns.
export const RevenueChart = lazy(() => import('./widgets/RevenueChart'));
export const RecentFeedback = lazy(() => import('./widgets/RecentFeedback'));
export const RecentInvoices = lazy(() => import('./widgets/RecentInvoices'));
export const ProjectsByStage = lazy(() => import('./widgets/ProjectsByStage'));
export const ActivityFeed = lazy(() => import('./widgets/ActivityFeed'));

// ── Suspense boundary for the whole dashboard ────────────
export const WidgetSuspense = ({ children, fallback = <WidgetSkeleton /> }) => (
    <Suspense fallback={fallback}>{children}</Suspense>
);
