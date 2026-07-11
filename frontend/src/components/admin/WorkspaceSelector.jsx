// ─── src/components/admin/WorkspaceSelector.jsx ──────────
// Phase 6 — Workspace switcher in the admin sidebar header.
//
// Persists the active workspace to localStorage so the choice
// survives a page reload but stays per-browser. The component
// reads the available workspaces from the user's `divisions`
// via the `visibleWorkspaces(user)` helper in
// `data/adminNavItems.js`.
//
// Layout: small button + chevron. Click toggles a dropdown
// listing every workspace the user is allowed to enter.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { visibleWorkspaces, workspaces as allWorkspaces } from '../../data/adminNavItems.jsx';

const STORAGE_KEY = 'bwl:admin:workspace';

const WorkspaceSelector = ({ user, active, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close on outside click.
    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    // What the user is allowed to see.
    const allowed = visibleWorkspaces(user);

    // If the persisted active workspace is no longer in the
    // allowed set (e.g. role changed), fall back to the first
    // allowed workspace and persist the new choice.
    useEffect(() => {
        if (allowed.length === 0) return;
        if (!active || !allowed.find(w => w.id === active)) {
            const fallback = allowed[0].id;
            localStorage.setItem(STORAGE_KEY, fallback);
            onChange && onChange(fallback);
        }
    }, [active, allowed, onChange]);

    // If we still don't have a current value, default to the
    // first allowed workspace; this keeps the component
    // working even when no parent state is supplied.
    const current = active && allowed.find(w => w.id === active)
        ? allowed.find(w => w.id === active)
        : allowed[0];

    if (!current) {
        return (
            <div className="text-xs text-gray-400 px-3 py-2 font-body">No workspace access</div>
        );
    }

    const CurrentIcon = current.icon;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-accent/10 to-orange-500/10 border border-accent/20 hover:border-accent/40 transition-colors"
            >
                <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
                    <CurrentIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">Workspace</p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{current.label}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden"
                    >
                        {allowed.map((w) => {
                            const WIcon = w.icon;
                            const isActive = w.id === current.id;
                            return (
                                <button
                                    key={w.id}
                                    onClick={() => {
                                        localStorage.setItem(STORAGE_KEY, w.id);
                                        onChange && onChange(w.id);
                                        setOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isActive ? 'bg-accent/5' : ''}`}
                                >
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                        <WIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{w.label}</p>
                                    </div>
                                    {isActive && (
                                        <svg className="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                        {allowed.length < allWorkspaces.length && (
                            <p className="text-[10px] text-gray-400 px-3 py-2 border-t border-gray-100 dark:border-gray-700">
                                You have access to {allowed.length} of {allWorkspaces.length} workspaces.
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkspaceSelector;
