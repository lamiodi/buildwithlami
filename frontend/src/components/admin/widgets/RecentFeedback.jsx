// ─── widgets/RecentFeedback.jsx ─────────────────────────
// Last 5 client feedback entries, sorted by created_at desc.
// ──────────────────────────────────────────────────────────

import React, { useMemo } from 'react';

export default function RecentFeedback({ feedback = [] }) {
    const recentFeedback = useMemo(() =>
        [...feedback].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
        [feedback]
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Recent Feedback</h2>
            {recentFeedback.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No feedback yet.</p>
            ) : (
                <ul className="space-y-3">
                    {recentFeedback.map((f) => (
                        <li key={f.id} className="border-l-2 border-blue-500 pl-3 py-1">
                            <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{f.client_comment || '—'}</p>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">{f.status}</span>
                                <time className="text-[10px] text-gray-400" dateTime={f.created_at}>
                                    {new Date(f.created_at).toLocaleDateString()}
                                </time>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
