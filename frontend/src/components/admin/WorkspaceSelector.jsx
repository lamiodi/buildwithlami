// ─── src/components/admin/WorkspaceSelector.jsx ──────────
// Manual workspace switcher.
//
// BuildWithLami is a solo-CEO operation, but the admin nav
// spans four logical surfaces (Software / Survey / Drone /
// Core cross-cutting). This dropdown lets you focus the
// sidebar on one surface at a time:
//
//   "All"      — core + every division (deduped)
//   "Software" — core + software nav only
//   "Survey"   — core + survey nav only
//   "Drone"    — core + drone nav only
//
// The active value is owned by `AdminLayout` and persisted to
// localStorage so the choice survives a page reload. Only the
// workspaces the user is allowed to see (via their JWT
// `divisions` claim) appear as options — the layout already
// filters that list before handing it to this component.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../../data/adminNavItems.jsx';
import { ActionIcon } from '../../data/adminIcons.jsx';

const Chevron = ActionIcon.ChevronDown;
const Check = ActionIcon.Check;

const WorkspaceSelector = ({ activeId, onChange, options }) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on outside click / Escape.
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const active = options.find((o) => o.id === activeId) || options[0];
    const ActiveIcon = active?.icon || Icon.Code;

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label="Switch workspace"
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                    open
                        ? 'bg-white dark:bg-[#1a1a1a] border-accent ring-2 ring-accent/20'
                        : 'bg-gradient-to-r from-accent/10 to-orange-500/10 border-accent/20 hover:border-accent/40'
                }`}
            >
                <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
                    <ActiveIcon className="w-4 h-4 dark:text-white" />
                </div>
                <div className="flex-1 text-left min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        Workspace
                    </p>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">
                        {active?.label || 'All'}
                    </p>
                </div>
                <Chevron
                    className={`w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 transition-transform duration-200 ${
                        open ? 'rotate-180' : ''
                    }`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        role="listbox"
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.12, ease: 'easeOut' }}
                        className="absolute z-30 left-0 right-0 mt-1.5 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl shadow-black/5 overflow-hidden"
                    >
                        {options.map((opt) => {
                            const isActive = opt.id === activeId;
                            const OptIcon = opt.icon;
                            return (
                                <li
                                    key={opt.id}
                                    role="option"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setOpen(false);
                                    }}
                                    className={`flex items-center gap-2.5 px-3 py-2.5 cursor-pointer text-sm transition-colors ${
                                        isActive
                                            ? 'bg-accent/10 text-accent'
                                            : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            isActive
                                                ? 'bg-accent text-white'
                                                : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                                        }`}
                                    >
                                        <OptIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-extrabold truncate">{opt.label}</p>
                                        {opt.description && (
                                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate">
                                                {opt.description}
                                            </p>
                                        )}
                                    </div>
                                    {isActive && <Check className="w-4 h-4 shrink-0" />}
                                </li>
                            );
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WorkspaceSelector;
