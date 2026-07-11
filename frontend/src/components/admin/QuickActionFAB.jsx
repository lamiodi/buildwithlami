import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Icon = {
    Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    Lead: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 11h-6" /><path d="M19 8v6" /></svg>,
    Invoice: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    Today: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    Mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    Project: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
};

const ACTIONS = [
    { id: 'today',     label: 'View today',   icon: Icon.Today,   to: '/admin' },
    { id: 'lead',      label: 'New lead',     icon: Icon.Lead,    to: '/admin/clients' },
    { id: 'invoice',   label: 'New invoice',  icon: Icon.Invoice, to: '/admin/invoices' },
    { id: 'project',   label: 'New project',  icon: Icon.Project, to: '/admin/projects' },
    { id: 'message',   label: 'Open inbox',   icon: Icon.Mail,    to: '/admin/inbox' },
];

/**
 * QuickActionFAB — the floating "+" in the lower-right of the
 * admin area. Expands into a small menu of the most common
 * actions (Phase 2 task #4). Press `?` to open it via keyboard
 * for power users; `Escape` closes it.
 */
const QuickActionFAB = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const ref = useRef(null);

    // Close on outside click / Esc
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
        const onKey = (e) => { if (e.key === '?') setOpen((o) => !o); };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onEsc);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onEsc);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const go = (to) => {
        setOpen(false);
        navigate(to);
    };

    return (
        <div ref={ref} className="fixed bottom-6 right-6 z-40 print:hidden">
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="menu"
                        initial={{ opacity: 0, y: 16, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                        className="mb-3 origin-bottom-right flex flex-col items-end gap-2"
                    >
                        {ACTIONS.slice().reverse().map((a, idx) => {
                            const Ico = a.icon;
                            return (
                                <motion.button
                                    key={a.id}
                                    initial={{ opacity: 0, x: 12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 12 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => go(a.to)}
                                    className="cursor-pointer group flex items-center gap-2"
                                >
                                    <span className="px-3 py-1.5 rounded-lg bg-gray-900/90 text-white text-xs font-extrabold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        {a.label}
                                    </span>
                                    <span className="w-11 h-11 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-white shadow-lg flex items-center justify-center hover:border-accent hover:text-accent transition-colors">
                                        <Ico className="w-4 h-4" />
                                    </span>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpen((o) => !o)}
                aria-label="Quick actions"
                className="cursor-pointer w-14 h-14 rounded-full bg-accent hover:bg-orange-600 text-white shadow-2xl shadow-accent/40 flex items-center justify-center"
            >
                <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    <Icon.Plus className="w-6 h-6" />
                </motion.span>
            </motion.button>
        </div>
    );
};

export default QuickActionFAB;
