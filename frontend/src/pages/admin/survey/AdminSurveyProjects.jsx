// ─── src/pages/admin/survey/AdminSurveyProjects.jsx ──────
// Phase 6 — Survey-workspace project list.
//
// Reads from the public `projects` table filtered to the
// `SURVEY` division via `/api/divisions/survey/projects`.
// ──────────────────────────────────────────────────────────

import React from 'react';
import WorkspaceListPage, { StatusBadge } from '../../../components/admin/WorkspaceListPage';
import { Icon } from '../../../data/adminNavItems.jsx';

const AdminSurveyProjects = () => (
    <WorkspaceListPage
        title="Survey Projects"
        subtitle="Published survey case studies — visible on the public site."
        division="SURVEY"
        icon={Icon.Satellite}
        endpoint="/divisions/survey/projects"
        searchFields={['title', 'summary', 'content', 'tech_stack', 'location', 'client_name']}
        columns={[
            { key: 'title', label: 'Project', render: (p) => (
                <div className="flex items-center gap-3">
                    {p.image_url && <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white">{p.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{p.summary || '—'}</p>
                    </div>
                </div>
            )},
            { key: 'tech_stack', label: 'Tags', render: (p) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {(p.tech_stack || []).slice(0, 3).map(t => (
                        <span key={t} className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                    ))}
                </div>
            )},
            { key: 'status', label: 'Status', render: (p) => <StatusBadge value={p.status} /> },
            { key: 'featured', label: 'Featured', render: (p) => p.featured ? <span className="text-amber-500 text-sm">★</span> : <span className="text-gray-300">—</span> },
            { key: 'updated_at', label: 'Updated', render: (p) => (
                <span className="text-xs text-gray-500">{new Date(p.updated_at || p.created_at).toLocaleDateString()}</span>
            )},
        ]}
    />
);

export default AdminSurveyProjects;
