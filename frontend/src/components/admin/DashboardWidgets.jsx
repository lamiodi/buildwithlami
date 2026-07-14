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

// ── Generic skeleton block — used while data is loading ──
export const WidgetSkeleton = ({ height = 'h-32', lines = 3 }) => (
    <div className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm ${height}`}>
        <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" style={{ width: `${100 - i * 15}%` }} />
            ))}
        </div>
    </div>
);

// ── Stat Card Widget (KPI display) ───────────────────────
export const StatCard = ({ label, value, hint, icon: IconComp, accent = 'blue', isCurrency }) => {
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
                    {IconComp && <IconComp className="w-5 h-5" aria-hidden="true" />}
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

// ── Independent Stat Widget: fetches its own data ────────
// Use this to lazy-load individual KPIs so a slow endpoint
// doesn't block the rest of the dashboard.
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
const STATUS_MAP = {
    ONBOARDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    PLANNING: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    DESIGN: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    DEVELOPMENT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    LAUNCHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    MAINTENANCE: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export const StatusPill = React.memo(({ status }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap ${STATUS_MAP[status] || 'bg-gray-100 text-gray-600'}`}>
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
