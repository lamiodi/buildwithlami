import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SessionTimeoutModal from './admin/SessionTimeoutModal';
import NotificationBell from './admin/NotificationBell';
import GlobalSearch from './admin/GlobalSearch';
import QuickActionFAB from './admin/QuickActionFAB';
import WorkspaceSelector from './admin/WorkspaceSelector';
import { useAuth } from '../contexts/AuthContext';
import { coreNav, visibleWorkspaces } from '../data/adminNavItems.jsx';

const WORKSPACE_STORAGE_KEY = 'bwl:admin:workspace';
const ALL_WORKSPACE_ID = 'all';

// All-icon used as the marker for the "All workspaces" option.
// Defined here (not in adminNavItems.jsx) because that file is
// pure data and doesn't import the Code icon for this purpose.
const AllIcon = (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
    </svg>
);

const Icon = {
    Users: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Activity: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21"/><path d="M5.03 21a9.99 9.99 0 1 1 .02-18 7 7 0 1 0 6.97 7"/><polyline points="3 4 3 10 9 10"/></svg>,
    Bell: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    Moon: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    Sun: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    Menu: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    Settings: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    LogOut: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    Dashboard: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
    Folder: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
    Kanban: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>,
    Mail: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    CreditCard: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    FileText: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    BarChart: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    Shield: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
};

// Module-level nav arrays (core + per-workspace) live in
// `data/adminNavItems.js`. The visible nav is composed at
// runtime from `useAuth().user.divisions` and from the
// current value of the workspace selector.
//
// The selector drives a manual filter:
//   "all"      → core + every visible workspace, deduped
//   "software" → core + software only
//   "survey"   → core + survey only
//   "drone"    → core + drone only
//
// If the persisted workspace is not in the user's allowed
// set, we fall back to "all" so the selector always has
// a meaningful option.

const AdminLayout = ({ isDark, toggleTheme }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user } = useAuth();

    // Active workspace — read from localStorage on first mount,
    // then re-evaluate when the user/their divisions change.
    const [activeWorkspace, setActiveWorkspace] = useState(() => {
        try { return localStorage.getItem(WORKSPACE_STORAGE_KEY) || ALL_WORKSPACE_ID; } catch { return ALL_WORKSPACE_ID; }
    });

    // Persist activeWorkspace so it survives a reload.
    const handleWorkspaceChange = (id) => {
        setActiveWorkspace(id);
        try { localStorage.setItem(WORKSPACE_STORAGE_KEY, id); } catch {}
    };

    // Compute the list of options the selector can show.
    // Always include "all" as the first option; the per-division
    // options are filtered by the user's allowed divisions.
    const workspaceOptions = useMemo(() => {
        const allowed = visibleWorkspaces(user);
        const divisionOptions = allowed.map((w) => ({
            id: w.id,
            label: w.label,
            icon: w.icon,
            description: `Only ${w.label.toLowerCase()} items`,
        }));
        return [
            { id: ALL_WORKSPACE_ID, label: 'All Workspaces', icon: AllIcon, description: 'Every division' },
            ...divisionOptions,
        ];
    }, [user]);

    // Reset to a valid workspace if the persisted one isn't in
    // the user's allowed set (e.g. role changed).
    useEffect(() => {
        const ids = workspaceOptions.map((o) => o.id);
        if (ids.length === 0) return;
        if (!ids.includes(activeWorkspace)) {
            handleWorkspaceChange(ALL_WORKSPACE_ID);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Compose the visible nav. When "all" is active, we union
    // core + every allowed workspace. When a specific workspace
    // is active, we show only core + that workspace's nav.
    // Either way, the result is de-duplicated by `to` so a core
    // item that also lives in a workspace's nav still appears
    // exactly once.
    const navItems = useMemo(() => {
        if (!user) return [];
        const allowed = visibleWorkspaces(user);
        let wsNav = [];
        if (activeWorkspace === ALL_WORKSPACE_ID) {
            wsNav = allowed.flatMap((w) => w.nav);
        } else {
            const selected = allowed.find((w) => w.id === activeWorkspace);
            wsNav = selected ? selected.nav : [];
        }
        const combined = [...coreNav, ...wsNav];
        const seen = new Set();
        return combined.filter((it) => {
            if (seen.has(it.to)) return false;
            seen.add(it.to);
            return true;
        });
    }, [user, activeWorkspace]);

    // Generate breadcrumbs from pathname
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, idx) => {
        const url = `/${paths.slice(0, idx + 1).join('/')}`;
        return { label: path.charAt(0).toUpperCase() + path.slice(1), url };
    });

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-body selection:bg-accent selection:text-white">

            {/* ── SIDEBAR (Desktop) ── */}
            <motion.aside
                animate={{ width: sidebarOpen ? 260 : 72 }}
                className="hidden md:flex flex-col bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-20"
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
                    {sidebarOpen ? (
                        <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LAMI ODI CRM</span>
                    ) : (
                        <span className="font-extrabold text-xl mx-auto text-blue-600">L</span>
                    )}
                </div>

                {/* Manual workspace switcher. The active value is owned
                    by this layout; the selector stays a pure presentational
                    component and just renders the options we hand it. */}
                {sidebarOpen && (
                    <div className="px-3 pt-4">
                        <WorkspaceSelector
                            activeId={activeWorkspace}
                            onChange={handleWorkspaceChange}
                            options={workspaceOptions}
                        />
                    </div>
                )}

                <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
                    {!user ? (
                        <div className="space-y-2 px-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-9 rounded-xl bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        navItems.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                title={!sidebarOpen ? item.label : undefined}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm ${
                                        isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {sidebarOpen && <span className="truncate">{item.label}</span>}
                            </NavLink>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Icon.Menu className="w-5 h-5" />
                    </button>
                </div>
            </motion.aside>

            {/* ── MOBILE MENU ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
                                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">LAMI ODI</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div className="px-4 pt-4">
                                <WorkspaceSelector
                                    activeId={activeWorkspace}
                                    onChange={handleWorkspaceChange}
                                    options={workspaceOptions}
                                />
                            </div>
                            <div className="flex-1 py-6 flex flex-col gap-2 px-4 overflow-y-auto">
                                {navItems.map(item => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        end={item.end}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                                                isActive
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`
                                        }
                                    >
                                        <item.icon className="w-5 h-5 shrink-0" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── MAIN CONTENT AREA ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* ── TOP HEADER ── */}
                <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#0A0A0A]/50 backdrop-blur-md shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <Icon.Menu className="w-5 h-5" />
                        </button>

                        {/* Breadcrumbs */}
                        <nav className="hidden sm:flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                            {breadcrumbs.map((bc, idx) => (
                                <React.Fragment key={bc.url}>
                                    {idx > 0 && <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>}
                                    <NavLink
                                        to={bc.url}
                                        className={({ isActive }) =>
                                            `hover:text-gray-900 dark:hover:text-white transition-colors ${isActive ? 'text-gray-900 dark:text-white font-bold' : ''}`
                                        }
                                    >
                                        {bc.label}
                                    </NavLink>
                                </React.Fragment>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Global Search (⌘K) */}
                        <GlobalSearch />

                        {/* Notifications */}
                        <NotificationBell />

                        <button onClick={toggleTheme} className="cursor-pointer p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                            {isDark ? <Icon.Sun className="w-5 h-5" /> : <Icon.Moon className="w-5 h-5" />}
                        </button>

                        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

                        {/* User Avatar */}
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-1 pr-3 rounded-full transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                                AD
                            </div>
                            <span className="text-sm font-bold hidden sm:block">Admin</span>
                        </div>
                    </div>
                </header>

                {/* ── PAGE CONTENT ── */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* ── SESSION TIMEOUT WARNING ── */}
            <SessionTimeoutModal />

            {/* ── QUICK-ACTION FLOATING BUTTON ── */}
            <QuickActionFAB />
        </div>
    );
};

export default AdminLayout;
