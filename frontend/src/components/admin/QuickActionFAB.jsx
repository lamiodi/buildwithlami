import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ActionIcon, DashboardIcon, CoreIcon } from '../../data/adminIcons.jsx';

const Icon = {
    Plus: ActionIcon.Plus,
    Lead: DashboardIcon.Lead,
    Invoice: CoreIcon.CreditCard,
    Today: DashboardIcon.Clock,
    Mail: CoreIcon.Mail,
    Project: CoreIcon.Folder,
};

const ACTIONS = [
    { id: 'today',     label: 'View today',   icon: Icon.Today,   to: '/admin' },
    { id: 'lead',      label: 'New lead',     icon: Icon.Lead,    to: '/admin/clients?action=new' },
    { id: 'invoice',   label: 'New invoice',  icon: Icon.Invoice, to: '/admin/invoices?action=new' },
    { id: 'project',   label: 'New project',  icon: Icon.Project, to: '/admin/projects?action=new' },
    { id: 'message',   label: 'Open inbox',   icon: Icon.Mail,    to: '/admin/inbox' },
];

/**
 * Returns true if the key event originated inside an editable
 * element (input, textarea, contenteditable, select). Used to
 * avoid hijacking the `?` keystroke when the user is typing.
 */
function isTypingTarget(target) {
    if (!target) return false;
    const tag = (target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (target.isContentEditable) return true;
    return false;
}

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

    // Keyboard + outside-click listeners stay mounted for the
    // lifetime of the component; gating happens inside the
    // handlers. Single effect → no listener re-attach churn.
    useEffect(() => {
        const onClick = (e) => {
            if (open && ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
                return;
            }
            // `?` is the toggle — but never while the user is typing.
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
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
