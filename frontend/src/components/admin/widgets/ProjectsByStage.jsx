// ─── widgets/ProjectsByStage.jsx ────────────────────────
// Project counts grouped by status (pie-style or bar list).
// ──────────────────────────────────────────────────────────

import React, { useMemo } from 'react';

const STAGE_COLORS = {
    ONBOARDING: 'bg-amber-500',
    PLANNING: 'bg-slate-500',
    DESIGN: 'bg-pink-500',
    DEVELOPMENT: 'bg-blue-500',
    REVIEW: 'bg-purple-500',
    LAUNCHED: 'bg-emerald-500',
    MAINTENANCE: 'bg-cyan-500',
    ARCHIVED: 'bg-gray-500',
};

export default function ProjectsByStage({ projects = [] }) {
    const byStage = useMemo(() => {
        const map = {};
        for (const p of projects) {
            map[p.status] = (map[p.status] || 0) + 1;
        }
        const total = projects.length || 1;
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => ({
                status,
                count,
                pct: Math.round((count / total) * 100)
            }));
    }, [projects]);

    if (byStage.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Projects by Stage</h2>
                <p className="text-xs text-gray-400 text-center py-6">No projects yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Projects by Stage</h2>
            <ul className="space-y-2">
                {byStage.map(({ status, count, pct }) => (
                    <li key={status}>
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">{status}</span>
                            <span className="font-extrabold text-gray-900 dark:text-white">{count}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${STAGE_COLORS[status] || 'bg-gray-400'} transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin="0"
                                aria-valuemax="100"
                                aria-label={`${status}: ${pct}%`}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
