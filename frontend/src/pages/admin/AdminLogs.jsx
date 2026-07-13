import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

import { ActionIcon } from '../../data/adminIcons.jsx';

const Icon = {
    RefreshCw: ActionIcon.Refresh,
};

const ACTION_LABELS = {
    CREATE_CLIENT: 'Created client',
    UPDATE_CLIENT: 'Updated client',
    DELETE_CLIENT: 'Deleted client',
    CREATE_PROJECT: 'Created project',
    UPDATE_PROJECT: 'Updated project',
    DELETE_PROJECT: 'Deleted project',
    CREATE_INVOICE: 'Created invoice',
    UPDATE_INVOICE: 'Updated invoice',
    DELETE_INVOICE: 'Deleted invoice',
    MARK_PAID: 'Marked invoice paid',
    REFUND: 'Refunded invoice',
    CREATE_TEMPLATE: 'Created template',
    UPDATE_TEMPLATE: 'Updated template',
    DELETE_TEMPLATE: 'Deleted template',
    SUBMIT_INTAKE: 'Submitted intake form',
    SEND_MESSAGE: 'Sent client message',
    REPLY_FEEDBACK: 'Replied to feedback',
};

const AdminLogs = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        setLoading(true);
        const res = await api.get('/activity');
        if (res.ok) setActivities(res.data || []);
        else notify.error(res.error || 'Failed to load activity logs');
        setLoading(false);
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString();
    };

    return (
        <div className="flex flex-col">
            <div className="max-w-7xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                                Activity Logs
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Audit trail of all admin actions.</p>
                        </div>
                        <button
                            onClick={fetchActivities}
                            disabled={loading}
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-accent text-gray-800 dark:text-gray-300 font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 font-body"
                        >
                            <Icon.RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
                >
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 font-body">Loading logs…</div>
                    ) : activities.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 font-body">No activity recorded yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase tracking-wider text-gray-500 font-body">
                                        <th className="py-4 px-6">Time</th>
                                        <th className="py-4 px-6">User</th>
                                        <th className="py-4 px-6">Action</th>
                                        <th className="py-4 px-6">Resource</th>
                                        <th className="py-4 px-6">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {activities.map((a, i) => (
                                        <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="py-3 px-6 text-sm text-gray-600 dark:text-gray-400 font-mono">{formatTime(a.created_at)}</td>
                                            <td className="py-3 px-6">
                                                <span className="font-bold text-gray-900 dark:text-white font-body">{a.user_name || 'Admin'}</span>
                                            </td>
                                            <td className="py-3 px-6">
                                                <span className="font-bold text-accent font-body">
                                                    {ACTION_LABELS[a.action] || a.action}
                                                </span>
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-700 dark:text-gray-300 font-body">
                                                {a.resource_type?.toLowerCase() || '-'}
                                            </td>
                                            <td className="py-3 px-6 text-sm text-gray-500 dark:text-gray-400 font-body max-w-sm truncate" title={a.details?.name || a.details?.email || ''}>
                                                {a.details?.name || a.details?.email || a.details?.project_name || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default AdminLogs;