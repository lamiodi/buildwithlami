// ─── src/pages/admin/drone/AdminDroneFlightMissions.jsx ──
// Phase 6 — Drone-workspace "flight missions" list.
//
// This is the published-projects view for the DRONE division.
// We treat each project as a "flight mission" because in
// the drone context the units being published are individual
// aerial surveys (orthomosaics, 3D models, inspection reports)
// — not engineering work.
// ──────────────────────────────────────────────────────────

import React from 'react';
import WorkspaceListPage, { StatusBadge } from '../../../components/admin/WorkspaceListPage';
import { Icon } from '../../../data/adminNavItems.jsx';

const AdminDroneFlightMissions = () => (
    <WorkspaceListPage
        title="Flight Missions"
        subtitle="Published drone deliverables — orthomosaics, 3D models, and inspection reports."
        division="DRONE"
        icon={Icon.Plane}
        endpoint="/divisions/drone/projects"
        searchFields={['title', 'summary', 'content', 'tech_stack', 'location', 'client_name']}
        columns={[
            { key: 'title', label: 'Mission', render: (p) => (
                <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">{p.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{p.summary || '—'}</p>
                    </div>
                </div>
            )},
            { key: 'live_url', label: 'Live link', render: (p) => p.live_url ? (
                <a href={p.live_url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">View ↗</a>
            ) : <span className="text-gray-300 text-xs">—</span>},
            { key: 'tech_stack', label: 'Tags', render: (p) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {(p.tech_stack || []).slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                    ))}
                </div>
            )},
            { key: 'status', label: 'Status', render: (p) => <StatusBadge value={p.status} /> },
            { key: 'updated_at', label: 'Updated', render: (p) => (
                <span className="text-xs text-gray-500">{new Date(p.updated_at || p.created_at).toLocaleDateString()}</span>
            )},
        ]}
    />
);

export default AdminDroneFlightMissions;
