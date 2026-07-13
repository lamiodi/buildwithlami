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
import { CoreIcon as Icon } from '../data/adminIcons.jsx';

const WORKSPACE_STORAGE_KEY = 'bwl:admin:workspace';
const ALL_WORKSPACE_ID = 'all';

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
        try { 
            const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY);
            // Only use saved value if it's a valid workspace (not 'all')
            if (saved && saved !== ALL_WORKSPACE_ID) {
                return saved;
            }
        } catch {}
        // Default to first available workspace
        return 'software';
    });

    // Persist activeWorkspace so it survives a reload.
    const handleWorkspaceChange = (id) => {
        setActiveWorkspace(id);
        setMobileMenuOpen(false);  // Close mobile sidebar on workspace switch
        try { localStorage.setItem(WORKSPACE_STORAGE_KEY, id); } catch {}
    };

    // Compute the list of options the selector can show.
    // Only show division-specific options (no "All Workspaces").
    const workspaceOptions = useMemo(() => {
        const allowed = visibleWorkspaces(user);
        return allowed.map((w) => ({
            id: w.id,
            label: w.label,
            icon: w.icon,
            description: `Only ${w.label.toLowerCase()} items`,
        }));
    }, [user]);

    // Reset to a valid workspace if the persisted one isn't in
    // the user's allowed set (e.g. role changed).
    useEffect(() => {
        const ids = workspaceOptions.map((o) => o.id);
        if (ids.length === 0) return;
        if (!ids.includes(activeWorkspace)) {
            handleWorkspaceChange(ids[0]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Compose the visible nav. Show core + selected workspace's nav.
    // The result is de-duplicated by `to` so a core
    // item that also lives in a workspace's nav still appears
    // exactly once.
    const navItems = useMemo(() => {
        if (!user) return [];
        const allowed = visibleWorkspaces(user);
        const selected = allowed.find((w) => w.id === activeWorkspace);
        const wsNav = selected ? selected.nav : [];
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
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 px-1">
                            Select a workspace to focus the sidebar on only that division's items
                        </p>
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
                                {user ? (user.name || user.email || '?').charAt(0).toUpperCase() : '?'}
                            </div>
                            <span className="text-sm font-bold hidden sm:block">{user?.name || 'Admin'}</span>
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
