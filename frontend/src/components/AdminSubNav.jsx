import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Admin sub-navigation bar. Rendered at the top of every admin page so the
 * user can jump between Dashboard, Projects, Clients, and Templates without
 * having to remember deep URLs.
 */
const AdminSubNav = () => {
    const tabs = [
        { to: '/admin', label: 'Dashboard', end: true },
        { to: '/admin/projects', label: 'Projects' },
        { to: '/admin/clients', label: 'Clients' },
        { to: '/admin/templates', label: 'Templates' },
    ];

    return (
        <div className="sticky top-20 z-30 bg-gray-50/90 dark:bg-background/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 -mx-6 px-6 py-3 mb-8">
            <nav className="flex flex-wrap gap-1 max-w-7xl mx-auto">
                {tabs.map(tab => (
                    <NavLink
                        key={tab.to}
                        to={tab.to}
                        end={tab.end}
                        className={({ isActive }) =>
                            `px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default AdminSubNav;
