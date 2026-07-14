// ─── widgets/ActivityFeed.jsx ───────────────────────────
// Latest activity log entries (uses /api/activity endpoint).
// Fetches independently so a slow activity log doesn't block
// the rest of the dashboard.
// ──────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';

export default function ActivityFeed() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            const res = await api.get('/activity', { params: { limit: 8 } });
            if (cancelled) return;
            if (res.ok && Array.isArray(res.data)) {
                setItems(res.data);
            } else if (res.ok && res.data?.data) {
                setItems(res.data.data);
            }
            setLoading(false);
        };
        load();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-48">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">Activity Feed</h2>
            {items.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No activity yet.</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((a) => (
                        <li key={a.id} className="flex items-start gap-2 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" aria-hidden="true" />
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-800 dark:text-gray-200 truncate">{a.action || a.message || a.event || 'Activity'}</p>
                                <time className="text-[10px] text-gray-400" dateTime={a.created_at}>
                                    {new Date(a.created_at).toLocaleString()}
                                </time>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
