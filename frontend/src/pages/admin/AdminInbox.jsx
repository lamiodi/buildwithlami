import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    Mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    Chat: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    Form: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></svg>,
    Send: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
    Search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
};

const KIND_ICON = {
    message:  Icon.Mail,
    feedback: Icon.Chat,
    intake:   Icon.Form,
};

const STATUS_PILL = {
    'New':          'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'In Progress':  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    'Waiting':      'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'Resolved':     'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

const STATUS_OPTIONS = ['All', 'New', 'In Progress', 'Waiting', 'Resolved'];
const KIND_OPTIONS = [
    { id: 'all',      label: 'All kinds' },
    { id: 'message',  label: 'Messages' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'intake',   label: 'Intake' },
];

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

const AdminInbox = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [kindFilter, setKindFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);

    // ── Read filters from URL (deep-linkable state) ──────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const s = params.get('status');
        const k = params.get('kind');
        const msg = params.get('message');
        if (s && STATUS_OPTIONS.includes(s)) setStatusFilter(s);
        if (k && KIND_OPTIONS.find((o) => o.id === k)) setKindFilter(k);
        if (msg) {
            // auto-select the matching item after fetch
            setTimeout(() => autoSelectMessage(msg), 600);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        const params = {};
        if (statusFilter !== 'All') params.status = statusFilter;
        if (kindFilter !== 'all')   params.kind = kindFilter;
        if (search.trim())          params.q = search.trim();
        const res = await api.get('/admin', { params, timeout: 7000 });
        if (res.ok) setItems(res.data?.items || []);
        setLoading(false);
    }, [statusFilter, kindFilter, search]);

    useEffect(() => { load(); }, [load]);

    const autoSelectMessage = (id) => {
        const found = items.find((i) => i.id === id);
        if (found) setSelected(found);
    };

    const sendReply = async (e) => {
        e.preventDefault();
        if (!selected || !reply.trim()) return;
        setSending(true);
        const res = await api.post(`/admin/${selected.kind}/${selected.id}/reply`, {
            reply: reply.trim(),
            status: 'RESOLVED',
        });
        setSending(false);
        if (res.ok) {
            notify.success('Reply sent.');
            setReply('');
            setSelected(null);
            load();
        } else {
            notify.error(res.error || 'Reply failed.');
        }
    };

    const filtered = items.filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (i.author_name || '').toLowerCase().includes(q) ||
            (i.author_email || '').toLowerCase().includes(q) ||
            (i.body || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* ── LEFT: list ──────────────────────────────── */}
            <div className="w-full md:w-2/5 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="flex items-center gap-2">
                        <Icon.Mail className="w-5 h-5 text-accent" />
                        <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">Unified Inbox</h1>
                    </div>
                    <div className="relative">
                        <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search messages…"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`cursor-pointer text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg transition-colors ${
                                    statusFilter === s
                                        ? 'bg-accent text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {KIND_OPTIONS.map((k) => (
                            <button
                                key={k.id}
                                onClick={() => setKindFilter(k.id)}
                                className={`cursor-pointer text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg transition-colors ${
                                    kindFilter === k.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                {k.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-gray-500">Loading inbox…</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-center text-sm text-gray-500">No messages match the current filters.</div>
                    ) : (
                        <ul>
                            {filtered.map((item) => {
                                const Ico = KIND_ICON[item.kind] || Icon.Mail;
                                const isSelected = selected && selected.id === item.id && selected.kind === item.kind;
                                return (
                                    <li
                                        key={`${item.kind}-${item.id}`}
                                        onClick={() => setSelected(item)}
                                        className={`cursor-pointer p-4 border-b border-gray-100 dark:border-gray-700/60 hover:bg-gray-50 dark:hover:bg-gray-700/40 ${isSelected ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-300 flex-shrink-0">
                                                <Ico className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                                        {item.author_name || item.subject || 'Unknown'}
                                                    </p>
                                                    <span className="text-[10px] text-gray-500 flex-shrink-0">{timeAgo(item.created_at)}</span>
                                                </div>
                                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                                                    {item.kind} {item.subject ? `· ${item.subject}` : ''}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{item.body}</p>
                                                <span className={`inline-block mt-1 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${STATUS_PILL[item.status] || ''}`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* ── RIGHT: detail / reply ───────────────────── */}
            <div className="hidden md:flex flex-1 flex-col">
                {selected ? (
                    <>
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                                {(selected.author_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-extrabold text-gray-900 dark:text-white">{selected.author_name || 'Unknown'}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {selected.author_email || '—'} {selected.project_name ? `· ${selected.project_name}` : ''}
                                </p>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mt-1">
                                    {selected.kind} · {timeAgo(selected.created_at)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                            >
                                <Icon.X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1">
                                    Their message
                                </p>
                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{selected.body}</p>
                            </div>
                        </div>
                        {selected.kind === 'feedback' && (
                            <form onSubmit={sendReply} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                                <textarea
                                    value={reply}
                                    onChange={(e) => setReply(e.target.value)}
                                    rows={3}
                                    placeholder="Write a reply…"
                                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent resize-none"
                                />
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="submit"
                                        disabled={sending || !reply.trim()}
                                        className="cursor-pointer flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 disabled:opacity-50"
                                    >
                                        <Icon.Send className="w-4 h-4" />
                                        {sending ? 'Sending…' : 'Send & Resolve'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-center text-gray-500 p-8">
                        <div>
                            <Icon.Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Select a message from the list to read it.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInbox;
