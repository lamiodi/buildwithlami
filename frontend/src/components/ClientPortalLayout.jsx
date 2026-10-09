import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { LayoutDashboard, FolderKanban, FileText, FileBadge, Receipt, Settings, LogOut, MessageSquare, Clock, ClipboardList, CheckCircle2, Menu, X } from 'lucide-react';

export default function ClientPortalLayout({ isDark, toggleTheme }) {
    const { clientUser, logout } = useClientAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/portal', icon: LayoutDashboard },
        { name: 'Onboarding', path: '/portal/onboarding', icon: ClipboardList },
        { name: 'Approvals', path: '/portal/approvals', icon: CheckCircle2 },
        { name: 'Projects', path: '/portal/projects', icon: FolderKanban },
        { name: 'Quotations', path: '/portal/quotations', icon: FileText },
        { name: 'Contracts', path: '/portal/contracts', icon: FileBadge },
        { name: 'Invoices', path: '/portal/invoices', icon: Receipt },
        { name: 'Documents', path: '/portal/documents', icon: FileText },
        { name: 'Messages', path: '/portal/messages', icon: MessageSquare },
        { name: 'Timeline', path: '/portal/timeline', icon: Clock },
    ];

    const handleLogout = async () => {
        await logout();
        window.location.href = '/portal/login';
    };

    const navLinkClass = (isActive) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
            ? 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
    }`;

    const sidebarNav = (
        <>
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={navLinkClass(isActive)}
                        >
                            <Icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-2">
                <Link
                    to="/portal/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    <Settings size={18} />
                    Profile Settings
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} />
                    Log Out
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden font-body">
            {/* Sidebar (Desktop) */}
            <aside className="hidden md:flex w-64 bg-white dark:bg-card border-r border-gray-200 dark:border-white/10 flex-col h-full flex-shrink-0 transition-colors duration-300">
                <div className="p-6">
                    <Link to="/portal" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Client<span className="text-accent">Portal</span>
                    </Link>
                </div>
                {sidebarNav}
            </aside>

            {/* Sidebar (Mobile drawer) */}
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
                            className="fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-white dark:bg-card border-r border-gray-200 dark:border-white/10 z-50 flex flex-col"
                        >
                            <div className="flex items-center justify-between p-6 pb-4">
                                <Link to="/portal" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                    Client<span className="text-accent">Portal</span>
                                </Link>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            {sidebarNav}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden min-w-0">
                <header className="h-16 bg-white dark:bg-card border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 transition-colors duration-300 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
                            Welcome back, {clientUser?.name || 'Client'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
