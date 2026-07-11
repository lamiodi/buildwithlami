// ─── src/pages/admin/drone/AdminDroneBookings.jsx ───────
// Phase 6 — Drone-workspace bookings page.
// ──────────────────────────────────────────────────────────

import React from 'react';
import WorkspaceListPage, { StatusBadge } from '../../../components/admin/WorkspaceListPage';
import { Icon } from '../../../data/adminNavItems.jsx';

const AdminDroneBookings = () => (
    <WorkspaceListPage
        title="Drone Bookings"
        subtitle="Aerial-imagery and survey flight requests."
        division="DRONE"
        icon={Icon.Calendar}
        endpoint="/divisions/drone/bookings"
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
            { key: 'preferred_date', label: 'Flight date', render: (b) => (
                <span className="text-xs">{b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : '—'}</span>
            )},
            { key: 'status', label: 'Status', render: (b) => <StatusBadge value={b.status} /> },
            { key: 'created_at', label: 'Submitted', render: (b) => (
                <span className="text-xs text-gray-500">{new Date(b.created_at).toLocaleDateString()}</span>
            )},
        ]}
    />
);

export default AdminDroneBookings;
