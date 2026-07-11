// ─── src/pages/admin/survey/AdminSurveyBookings.jsx ──────
// Phase 6 — Survey-workspace bookings page.
//
// Re-uses the `WorkspaceListPage` shell. The page is purely
// a config: which endpoint, which columns, which icon.
// Everything else (loading, search, error states) is owned
// by the shell.
// ──────────────────────────────────────────────────────────

import React from 'react';
import WorkspaceListPage, { StatusBadge } from '../../../components/admin/WorkspaceListPage';
import { Icon } from '../../../data/adminNavItems.jsx';

const AdminSurveyBookings = () => (
    <WorkspaceListPage
        title="Survey Bookings"
        subtitle="Field-survey requests — both drone and terrestrial."
        division="SURVEY"
        icon={Icon.Calendar}
        endpoint="/divisions/survey/bookings"
        columns={[
            { key: 'full_name', label: 'Client', render: (b) => (
                <div>
                    <p className="font-bold text-gray-900 dark:text-white">{b.full_name}</p>
                    <a href={`mailto:${b.email}`} className="text-xs text-accent hover:underline">{b.email}</a>
                </div>
            )},
            { key: 'service', label: 'Service', render: (b) => (
                <div>
                    <p className="text-sm">{b.service || '—'}</p>
                    <p className="text-[10px] text-gray-400">{b.location || '—'}</p>
                </div>
            )},
            { key: 'preferred_date', label: 'Preferred date', render: (b) => (
                <span className="text-xs">{b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : '—'}</span>
            )},
            { key: 'status', label: 'Status', render: (b) => <StatusBadge value={b.status} /> },
            { key: 'created_at', label: 'Submitted', render: (b) => (
                <span className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</span>
            )},
        ]}
    />
);

export default AdminSurveyBookings;
