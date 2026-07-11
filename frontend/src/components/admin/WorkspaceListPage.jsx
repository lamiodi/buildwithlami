// ─── src/components/admin/WorkspaceListPage.jsx ──────────
// Phase 6 — shared list-page shell for workspace pages.
//
// Each division page (Survey bookings, Drone missions, etc.)
// passes a `fetcher(endpoint, params)` and a `columns` array.
// This component owns: loading state, error state, search
// input, division badge in the header, and the table render.
//
// The fetcher is the only API-specific thing, so the same
// shell renders bookings, projects, or flight missions
// without per-page duplication.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

const STATUS_COLORS = {
    PENDING:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    CONFIRMED: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    COMPLETED: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    CANCELLED: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    DRAFT:     'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    PUBLISHED: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    ARCHIVED:  'bg-gray-200 dark:bg-gray-700 text-gray-500',
    WON:       'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    ACTIVE:    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
};

const DIVISION_BADGES = {
    SOFTWARE: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    SURVEY:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    DRONE:    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
};

const WorkspaceListPage = ({
    title,
    subtitle,
    division,
    icon: PageIcon,
    endpoint,
    columns,
    searchFields = ['title', 'name', 'full_name', 'client_name', 'service', 'location', 'email', 'summary'],
    extraParams = {},
}) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        const res = await api.get(endpoint, { params: extraParams });
        if (res.ok) setItems(Array.isArray(res.data) ? res.data : []);
        else setError(res.error || 'Failed to load.');
        setLoading(false);
    };

    useEffect(() => { fetch(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [endpoint, JSON.stringify(extraParams)]);

    const filtered = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.trim().toLowerCase();
        return items.filter((it) => {
            for (const f of searchFields) {
                if (typeof it[f] === 'string' && it[f].toLowerCase().includes(q)) return true;
            }
            return false;
        });
    }, [items, search, searchFields]);

    const DivIcon = PageIcon;

    return (
        <div className="max-w-[1500px] mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                    {DivIcon && (
                        <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <DivIcon className="w-6 h-6" />
                        </div>
                    )}
                    <div>
                        <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                            {subtitle}
                            {division && (
                                <span className={`ml-2 inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${DIVISION_BADGES[division] || ''}`}>
                                    {division}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${title.toLowerCase()}…`}
                    className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors font-body"
                />
                <button
                    onClick={fetch}
                    className="px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-accent transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <p className="p-12 text-center text-sm text-gray-400 font-body">Loading…</p>
                ) : error ? (
                    <p className="p-12 text-center text-sm text-red-500 font-body">{error}</p>
                ) : filtered.length === 0 ? (
                    <p className="p-12 text-center text-sm text-gray-400 font-body">
                        No {title.toLowerCase()} yet. {search && 'Try a different search.'}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-[10px] font-extrabold uppercase tracking-widest text-gray-500 bg-gray-50 dark:bg-gray-900/40">
                                    {columns.map((c) => (
                                        <th key={c.key} className="px-4 py-3 whitespace-nowrap">{c.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.map((it, i) => (
                                    <tr key={it.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        {columns.map((c) => (
                                            <td key={c.key} className="px-4 py-3 align-top text-gray-700 dark:text-gray-200">
                                                {c.render ? c.render(it) : (
                                                    <span className="font-body">{c.value ? c.value(it) : it[c.key] ?? '—'}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-400 mt-3 font-body text-right">
                Showing {filtered.length} of {items.length}
            </p>
        </div>
    );
};

// Reusable status badge renderer — call from any `columns[].render`.
export const StatusBadge = ({ value }) => {
    if (!value) return <span className="text-gray-400">—</span>;
    return (
        <span className={`inline-block text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${STATUS_COLORS[value] || STATUS_COLORS.DRAFT}`}>
            {value}
        </span>
    );
};

export default WorkspaceListPage;
