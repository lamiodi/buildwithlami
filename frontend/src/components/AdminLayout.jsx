import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import SessionTimeoutModal from './admin/SessionTimeoutModal';
import NotificationBell from './admin/NotificationBell';
import GlobalSearch from './admin/GlobalSearch';
import QuickActionFAB from './admin/QuickActionFAB';
import WorkspaceSelector from './admin/WorkspaceSelector';
import AdminNavigation from './admin/AdminNavigation';
import { useAuth } from '../contexts/AuthContext';
import { navigationGroups, workspaces } from '../data/adminNavigation';
import { CoreIcon as Icon } from '../data/adminIcons.jsx';

const STORAGE_KEY = 'bwl:admin:workspace';

const AdminLayout = ({ isDark, toggleTheme }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [detailName, setDetailName] = useState(null);
    const location = useLocation();
    const { user, logout } = useAuth();
    const [activeWorkspace, setActiveWorkspace] = useState(() => {
        const pathWorkspace = location.pathname.split('/')[2];
        if (workspaces.some((w) => w.id === pathWorkspace)) return pathWorkspace;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (workspaces.some((w) => w.id === saved)) return saved;
        } catch { /* Selection still works when storage is unavailable. */ }
        return 'software';
    });
    const handleWorkspaceChange = useCallback((id) => {
        if (!workspaces.some((w) => w.id === id)) return;
        setActiveWorkspace(id);
        setMobileMenuOpen(false);
        try { localStorage.setItem(STORAGE_KEY, id); } catch { /* Optional persistence. */ }
    }, []);
    useEffect(() => {
        const id = location.pathname.split('/')[2];
        if (id === 'survey' || id === 'drone' || location.pathname === '/admin/portfolio') {
            handleWorkspaceChange(id === 'portfolio' ? 'software' : id);
        }
        setMobileMenuOpen(false);
    }, [location.pathname, handleWorkspaceChange]);
    const setBreadcrumbName = useCallback((label) => {
        setDetailName(label ? { path: location.pathname, label } : null);
    }, [location.pathname]);
    const groups = navigationGroups(activeWorkspace);
    const workspaceOptions = workspaces.map((w) => ({ ...w, description: `Manage ${w.label.toLowerCase()} work` }));
    const segments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isId = /^[0-9a-f-]{32,36}$/i.test(segment);
        return { path, label: index === 0 ? 'Today' : isId ? (detailName?.path === location.pathname ? detailName.label : 'Details') : segment.replace(/-/g, ' ').replace(/^./, (s) => s.toUpperCase()) };
    });
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-body">
            <aside className={`hidden md:flex flex-col shrink-0 bg-white dark:bg-[#111] border-r border-gray-200 dark:border-gray-800 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
                <Link to="/admin" className="h-16 flex items-center px-5 font-extrabold text-lg border-b border-gray-200 dark:border-gray-800">{sidebarOpen ? 'BuildWithLami' : 'Ob'}</Link>
                {sidebarOpen && <div className="p-3"><WorkspaceSelector activeId={activeWorkspace} onChange={handleWorkspaceChange} options={workspaceOptions} /></div>}
                <div className="flex-1 overflow-y-auto px-3 py-3"><AdminNavigation groups={groups} collapsed={!sidebarOpen} /></div>
                <button type="button" aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)} className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-center"><Icon.Menu className="w-5 h-5" /></button>
            </aside>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="min-h-16 flex items-center justify-between gap-2 px-3 sm:px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <Dialog.Trigger asChild><button type="button" aria-label="Open admin navigation" className="md:hidden p-2"><Icon.Menu className="w-5 h-5" /></button></Dialog.Trigger>
                            <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
                                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(20rem,90vw)] bg-white dark:bg-[#111] flex flex-col shadow-xl">
                                    <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800">
                                        <Dialog.Title className="font-extrabold text-lg">Admin navigation</Dialog.Title>
                                        <Dialog.Close asChild><button type="button" aria-label="Close navigation" className="p-2 text-xl">×</button></Dialog.Close>
                                    </div>
                                    <Dialog.Description className="sr-only">Choose a workspace or open an admin screen.</Dialog.Description>
                                    <div className="p-4"><WorkspaceSelector activeId={activeWorkspace} onChange={handleWorkspaceChange} options={workspaceOptions} /></div>
                                    <div className="flex-1 overflow-y-auto px-4 pb-5"><AdminNavigation groups={groups} onNavigate={() => setMobileMenuOpen(false)} /></div>
                                </Dialog.Content>
                            </Dialog.Portal>
                        </Dialog.Root>
                        <nav aria-label="Breadcrumbs" className="hidden sm:flex items-center gap-2 text-sm text-gray-500 min-w-0">
                            {breadcrumbs.map((crumb, index) => <Fragment key={crumb.path}>{index > 0 && <span aria-hidden="true">/</span>}{index === breadcrumbs.length - 1 ? <span aria-current="page" className="truncate max-w-64 text-gray-900 dark:text-gray-100">{crumb.label}</span> : <Link to={crumb.path} className="hover:text-accent">{crumb.label}</Link>}</Fragment>)}
                        </nav>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-3">
                        <GlobalSearch /><NotificationBell />
                        <button type="button" aria-label={isDark ? 'Use light theme' : 'Use dark theme'} onClick={toggleTheme} className="p-2 text-gray-500">{isDark ? <Icon.Sun className="w-5 h-5" /> : <Icon.Moon className="w-5 h-5" />}</button>
                        <details className="relative">
                            <summary aria-label="Account menu" className="list-none cursor-pointer rounded-full p-2 bg-accent/10 text-accent font-bold">{(user?.name || user?.email || 'Admin').charAt(0).toUpperCase()}</summary>
                            <div className="absolute right-0 z-30 mt-2 w-52 p-2 rounded-xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <p className="px-3 py-2 text-sm font-bold truncate">{user?.name || 'Admin'}</p>
                                <Link to="/admin/settings" className="block px-3 py-2 text-sm hover:bg-accent/10 rounded-lg">Account settings</Link>
                                <button type="button" onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Sign out</button>
                            </div>
                        </details>
                    </div>
                </header>
                <main id="admin-main" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto"><Outlet context={{ workspace: activeWorkspace, division: activeWorkspace.toUpperCase(), setWorkspace: handleWorkspaceChange, setBreadcrumbName }} /></div>
                </main>
            </div>
            <SessionTimeoutModal /><QuickActionFAB />
        </div>
    );
};
export default AdminLayout;
