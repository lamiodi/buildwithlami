import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { CoreIcon, ActionIcon, MiscIcon } from '../../data/adminIcons.jsx';

const Icon = {
    Bell: CoreIcon.Bell,
    Check: ActionIcon.Check,
    Trash: ActionIcon.TrashSimple,
    Dot: MiscIcon.Dot,
};

const TONE_FOR_TYPE = {
    LEAD_NEW:           'border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/20',
    INVOICE_PAID:       'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/20',
    INVOICE_OVERDUE:    'border-rose-200 dark:border-rose-800/60 bg-rose-50/50 dark:bg-rose-900/20',
    FEEDBACK_NEW:       'border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-900/20',
    DOMAIN_EXPIRING:    'border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-900/20',
    PROJECT_LAUNCHED:   'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-900/20',
    REVIEW_REQUESTED:   'border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-900/20',
    DEFAULT:            'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
};

const POLL_INTERVAL_MS = 30_000;
const POPUP_LIMIT = 8;

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return 'just now';
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
}

/**
 * NotificationBell — admin header bell that opens a dropdown
 * with the latest notifications, polls every 30s, and exposes
 * "mark all read" + per-item "mark read" / "delete" actions.
 *
 * Polling is gated on (a) the user being logged in, and (b) the
 * browser tab being visible. Both are silent no-ops otherwise.
 */
const NotificationBell = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);

    // ── Close on outside click / Esc ──────────────────────
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onEsc);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onEsc);
        };
    }, [open]);

    // ── Polling ───────────────────────────────────────────
    const fetchNotifications = useCallback(async (silent = true) => {
        // Don't hammer the API when the admin isn't logged in or the tab is hidden.
        if (!user) return;
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

        if (!silent) setLoading(true);
        const res = await api.get('/notifications', { params: { limit: POPUP_LIMIT }, timeout: 5000 });
        if (!silent) setLoading(false);
        if (res.ok && res.data) {
            const list = Array.isArray(res.data) ? res.data : res.data.items || [];
            setItems(list);
            setUnread(list.filter((n) => !n.is_read).length);
        }
    }, [user]);

    useEffect(() => {
        if (!user) {
            setItems([]);
            setUnread(0);
            return;
        }
        fetchNotifications(true);
        const id = setInterval(() => fetchNotifications(true), POLL_INTERVAL_MS);

        // Resume polling as soon as the tab becomes visible again.
        const onVisibility = () => { if (document.visibilityState === 'visible') fetchNotifications(true); };
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchNotifications, user]);

    // ── Actions ───────────────────────────────────────────
    const markRead = async (id) => {
        setItems((cur) => cur.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        setUnread((u) => Math.max(0, u - 1));
        const res = await api.patch(`/notifications/${id}/read`);
        if (!res.ok) {
            notify.error('Failed to mark notification as read.');
            fetchNotifications(true);
        }
    };

    const markAllRead = async () => {
        setItems((cur) => cur.map((n) => ({ ...n, is_read: true })));
        setUnread(0);
        const res = await api.post('/notifications/read-all');
        if (!res.ok) {
            notify.error('Failed to mark all as read.');
            fetchNotifications(true);
        }
    };

    const remove = async (id) => {
        // Capture unread-ness from the local snapshot BEFORE mutating items.
        const wasUnread = items.find((n) => n.id === id)?.is_read === false;
        setItems((cur) => cur.filter((n) => n.id !== id));
        if (wasUnread) setUnread((u) => Math.max(0, u - 1));
        const res = await api.delete(`/notifications/${id}`);
        if (!res.ok) {
            notify.error('Failed to delete notification.');
            fetchNotifications(true);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => { setOpen((o) => !o); if (!open) fetchNotifications(false); }}
                aria-label="Notifications"
                className="cursor-pointer relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-accent dark:hover:border-accent transition-colors"
            >
                <Icon.Bell className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                <AnimatePresence>
                    {unread > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-md"
                        >
                            {unread > 9 ? '9+' : unread}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="dropdown"
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">Notifications</h3>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                    {unread > 0 ? `${unread} unread` : 'All caught up'}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={markAllRead}
                                    disabled={unread === 0}
                                    className="cursor-pointer text-[10px] font-extrabold uppercase tracking-widest text-accent hover:text-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Mark all read
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {loading && items.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">Loading…</div>
                            ) : items.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet.</div>
                            ) : (
                                <ul>
                                    {items.map((n) => (
                                        <li
                                            key={n.id}
                                            className={`relative border-b border-gray-100 dark:border-gray-700/60 px-4 py-3 ${TONE_FOR_TYPE[n.type] || TONE_FOR_TYPE.DEFAULT} hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {!n.is_read && (
                                                    <span className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-sm ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'font-extrabold text-gray-900 dark:text-white'}`}>
                                                            {n.title}
                                                        </p>
                                                        <span className="text-[10px] text-gray-500 flex-shrink-0">{timeAgo(n.created_at)}</span>
                                                    </div>
                                                    {n.message && (
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                    )}
                                                    {n.link && (
                                                        <Link
                                                            to={n.link}
                                                            onClick={() => { setOpen(false); if (!n.is_read) markRead(n.id); }}
                                                            className="text-[10px] font-extrabold uppercase tracking-widest text-accent hover:text-orange-600 mt-1 inline-block"
                                                        >
                                                            Open →
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    {!n.is_read && (
                                                        <button
                                                            onClick={() => markRead(n.id)}
                                                            title="Mark as read"
                                                            className="cursor-pointer p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-gray-500 hover:text-emerald-600 transition-colors"
                                                        >
                                                            <Icon.Check className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => remove(n.id)}
                                                        title="Delete"
                                                        className="cursor-pointer p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-gray-500 hover:text-rose-600 transition-colors"
                                                    >
                                                        <Icon.Trash className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 text-center">
                            <Link
                                to="/admin"
                                onClick={() => setOpen(false)}
                                className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 hover:text-accent transition-colors"
                            >
                                View dashboard
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
