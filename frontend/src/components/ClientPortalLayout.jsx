import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useClientAuth } from '../contexts/ClientAuthContext';
import { LayoutDashboard, FolderKanban, FileText, FileBadge, Receipt, Settings, LogOut, MessageSquare, Clock } from 'lucide-react';

export default function ClientPortalLayout({ isDark, toggleTheme }) {
    const { clientUser, logout } = useClientAuth();
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/portal', icon: LayoutDashboard },
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

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-background overflow-hidden font-body">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-card border-r border-gray-200 dark:border-white/10 flex flex-col h-full flex-shrink-0 transition-colors duration-300">
                <div className="p-6">
                    <Link to="/portal" className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Client<span className="text-accent">Portal</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isActive 
                                        ? 'bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-light'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                }`}
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-card border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-8 flex-shrink-0 transition-colors duration-300">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Welcome back, {clientUser?.name || 'Client'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
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
