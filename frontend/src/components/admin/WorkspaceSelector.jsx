// ─── src/components/admin/WorkspaceSelector.jsx ──────────
// Static "All Workspaces" badge.
//
// The original WorkspaceSelector was a dropdown for switching
// between Software / Survey / Drone workspaces. BuildWithLami
// is a solo-CEO operation (one user, sees everything), so the
// switcher had no functional purpose — it was a visual stub
// for a workflow that doesn't exist here.
//
// Replaced with a non-interactive badge that:
//   - keeps the sidebar's visual identity (a coloured block at
//     the top of the nav)
//   - removes the dropdown, the localStorage state, and the
//     `visibleWorkspaces(user)` round-trip
//   - cannot be hidden by a missing `user.divisions` field
//
// If the codebase ever grows to support role-scoped workspaces
// (Survey Manager only sees Survey, etc.), reintroduce the
// dropdown here — the existing `data/adminNavItems.js`
// `visibleWorkspaces(user)` helper is still wired up.
// ──────────────────────────────────────────────────────────

import React from 'react';
import { Icon } from '../../data/adminNavItems.jsx';

const WorkspaceSelector = () => {
    return (
        <div
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-accent/10 to-orange-500/10 border border-accent/20"
            aria-label="All workspaces"
        >
            <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center shrink-0">
                <Icon.Code className="w-4 h-4 dark:text-white" />
            </div>
            <div className="flex-1 text-left min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">Workspace</p>
                <p className="text-sm font-extrabold text-gray-900 dark:text-white truncate">All Workspaces</p>
            </div>
        </div>
    );
};

export default WorkspaceSelector;
