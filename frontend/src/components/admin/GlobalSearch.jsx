import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { ActionIcon, DashboardIcon, CoreIcon } from '../../data/adminIcons.jsx';

const Icon = {
    Search: ActionIcon.Search,
    Lead: DashboardIcon.SingleUser,
    Client: CoreIcon.Users,
    Project: CoreIcon.Folder,
    Invoice: CoreIcon.CreditCard,
    Mail: CoreIcon.Mail,
    Kbd: DashboardIcon.Kbd,
};

const CATEGORIES = [
    { key: 'leads',     label: 'Leads',     icon: Icon.Lead,    path: (item) => `/admin/clients?lead=${item.id}` },
    { key: 'clients',   label: 'Clients',   icon: Icon.Client,  path: (item) => `/admin/clients?focus=${item.id}` },
    { key: 'projects',  label: 'Projects',  icon: Icon.Project, path: (item) => `/admin/projects/${item.id}` },
    { key: 'invoices',  label: 'Invoices',  icon: Icon.Invoice, path: (item) => `/admin/invoices?focus=${item.id}` },
    { key: 'messages',  label: 'Messages',  icon: Icon.Mail,    path: (item) => `/admin/inbox?message=${item.id}` },
];

const DEBOUNCE_MS = 300;

/**
 * GlobalSearch — top-right header search. Opens with ⌘K / Ctrl-K
 * or by clicking the search button. Debounced (300 ms) query
 * against /api/admin/search returns top 5 per category.
 */
const GlobalSearch = () => {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeIdx, setActiveIdx] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Flatten the categorised results into a single array of
    // { id, label, sublabel, category, path, onClick } so we
    // can arrow-key through the whole list and Enter on any
    // item. We also build an O(1) `flatIdxById` map so the
    // render loop doesn't have to call `flat.list.findIndex`
    // for every row (which would be O(n²) total).
    const flat = React.useMemo(() => {
        if (!results) return { list: [], flatIdxById: {} };
        const list = [];
        const flatIdxById = {};
        CATEGORIES.forEach((cat) => {
            const items = results[cat.key] || [];
            items.forEach((item) => {
                const id = `${cat.key}-${item.id}`;
                flatIdxById[id] = list.length;
                list.push({
                    id,
                    item,
                    cat: cat.key,
                    catLabel: cat.label,
                    icon: cat.icon,
                    primary: item.name || item.project_name || item.author_name || item.email || 'Item',
                    secondary: item.email || item.client_name || item.status || item.snippet || '',
                    path: cat.path(item),
                });
            });
        });
        return { list, flatIdxById };
    }, [results]);

    // ── Open / close on ⌘K + Esc ──────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        if (open) {
            setActiveIdx(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        } else {
            setQ('');
            setResults(null);
            setLoading(false);
        }
    }, [open]);

    // ── Debounced search ─────────────────────────────────
    useEffect(() => {
        const trimmed = q.trim();
        if (trimmed.length < 2) {
            // Don't leave `loading` stuck on when the user clears
            // the input or types under the minimum length.
            setLoading(false);
            setResults(null);
            return;
        }
        setLoading(true);
        const id = setTimeout(async () => {
            const res = await api.get('/admin/search', { params: { q: trimmed }, timeout: 5000 });
            if (res.ok && res.data) setResults(res.data);
            else setResults({ leads: [], clients: [], projects: [], invoices: [], messages: [] });
            setLoading(false);
            setActiveIdx(0);
        }, DEBOUNCE_MS);
        return () => clearTimeout(id);
    }, [q]);

    // ── Arrow-key navigation through the flat list ───────
    const onKeyDown = (e) => {
        const list = flat.list;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIdx((i) => Math.min(list.length - 1, i + 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIdx((i) => Math.max(0, i - 1));
        } else if (e.key === 'Enter' && list[activeIdx]) {
            e.preventDefault();
            const row = list[activeIdx];
            setOpen(false);
            navigate(row.path);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="cursor-pointer flex items-center gap-2 px-3 h-9 rounded-xl bg-white/50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-accent dark:hover:border-accent text-sm text-gray-500 dark:text-gray-400 transition-colors"
            >
                <Icon.Search className="w-4 h-4" />
                <span className="hidden md:inline">Search…</span>
                <span className="hidden md:flex items-center gap-1 ml-2">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">K</kbd>
                </span>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-24"
                        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -12, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -12, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                <Icon.Search className="w-4 h-4 text-gray-500" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    placeholder="Search clients, projects, invoices, messages…"
                                    className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                                />
                                {loading && <span className="text-xs text-gray-500">…</span>}
                                <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">ESC</kbd>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {q.trim().length < 2 ? (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">Type at least 2 characters to search.</div>
                                ) : !results ? (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">Searching…</div>
                                ) : flat.list.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-gray-500">No results for "{q}".</div>
                                ) : (
                                    CATEGORIES.map((cat) => {
                                        const items = results[cat.key] || [];
                                        if (items.length === 0) return null;
                                        return (
                                            <div key={cat.key} className="py-2">
                                                <h4 className="px-4 py-1 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                    <cat.icon className="w-3 h-3" />
                                                    {cat.label}
                                                </h4>
                                                {items.map((item) => {
                                                    // O(1) lookup using the precomputed map.
                                                    const flatIdx = flat.flatIdxById[`${cat.key}-${item.id}`];
                                                    const isActive = flatIdx === activeIdx;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => { setOpen(false); navigate(cat.path(item)); }}
                                                            onMouseEnter={() => setActiveIdx(flatIdx)}
                                                            className={`cursor-pointer w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition-colors ${isActive ? 'bg-accent/10 text-accent' : 'hover:bg-gray-50 dark:hover:bg-gray-700/40 text-gray-900 dark:text-white'}`}
                                                        >
                                                            <span className="flex-1 min-w-0">
                                                                <span className="font-bold truncate block">
                                                                    {item.name || item.project_name || item.author_name || item.email}
                                                                </span>
                                                                {item.email && (
                                                                    <span className="text-[11px] text-gray-500 dark:text-gray-400 truncate block">{item.email}</span>
                                                                )}
                                                                {item.status && (
                                                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500">{item.status}</span>
                                                                )}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">↵</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalSearch;
