import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { Link } from 'react-router-dom';
import { FolderKanban, Receipt, FileText, CheckCircle, Clock, ClipboardCheck, ClipboardList } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

export default function ClientDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actions, setActions] = useState([]);
    const [onboarding, setOnboarding] = useState(null);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/client-portal/dashboard', {}, 'client');
            if (res.ok && res.data) {
                setData(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchActionsAndOnboarding = useCallback(async () => {
        const [actionsRes, onboardingRes] = await Promise.all([
            api.get('/client-portal/actions', {}, 'client'),
            api.get('/client-portal/onboarding', {}, 'client'),
        ]);
        if (actionsRes.ok && Array.isArray(actionsRes.data)) setActions(actionsRes.data);
        if (onboardingRes.ok) setOnboarding(onboardingRes.data);
    }, []);

    useEffect(() => {
        fetchDashboard();
        fetchActionsAndOnboarding();
    }, [fetchActionsAndOnboarding]);

    const completeAction = async (id) => {
        const res = await api.patch(`/client-portal/actions/${id}/complete`, {}, 'client');
        if (res.ok) {
            notify.success('Marked as done — thanks!');
            fetchActionsAndOnboarding();
        } else {
            notify.error(res.error || 'Could not update action.');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    if (!data) {
        return <div className="text-red-500">Failed to load dashboard data.</div>;
    }

    const { activeProjects, completedProjects, recentInvoices } = data;
    const activeOnboarding = onboarding && ['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_CHANGES'].includes(onboarding.status) ? onboarding : null;

    return (
        <div className="space-y-8">
            {/* Onboarding banner (Admin OS Phase 1) */}
            {activeOnboarding && (
                <Link to="/portal/onboarding"
                    className="block bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-xl p-5 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="p-3 bg-accent/10 text-accent rounded-lg self-start">
                            <ClipboardList size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                Project onboarding {activeOnboarding.status === 'NEEDS_CHANGES' ? '— updates needed' : activeOnboarding.completion_percent < 100 ? 'in progress' : '— almost there'}
                            </p>
                            <div className="mt-2 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden max-w-md">
                                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${activeOnboarding.completion_percent || 0}%` }} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{activeOnboarding.completion_percent || 0}% complete — your progress saves automatically.</p>
                        </div>
                        <span className="text-sm font-bold text-accent whitespace-nowrap">
                            {activeOnboarding.status === 'NEEDS_CHANGES' ? 'Update now →' : 'Continue →'}
                        </span>
                    </div>
                </Link>
            )}

            {/* Action Required (Admin OS Phase 1 — blueprint §15) */}
            {actions.length > 0 && (
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <ClipboardCheck size={18} className="text-accent" />
                            Action Required
                            <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold">{actions.length}</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                        {actions.map((a) => (
                            <div key={a.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                                    {a.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</p>}
                                    {a.due_at && (
                                        <p className={`text-xs mt-1 font-medium ${a.overdue ? 'text-red-500' : 'text-gray-400'}`}>
                                            Due {new Date(a.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}{a.overdue ? ' — overdue' : ''}
                                        </p>
                                    )}
                                </div>
                                <button onClick={() => completeAction(a.id)}
                                    className="self-start md:self-center inline-flex items-center gap-1.5 text-sm font-bold bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                                    <CheckCircle size={15} /> Mark Done
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FolderKanban size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProjects?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedProjects?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Recent Invoices</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentInvoices?.length || 0}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Projects */}
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FolderKanban size={18} className="text-accent" />
                            Active Projects
                        </h3>
                        <Link to="/portal/projects" className="text-sm text-accent hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                        {activeProjects?.length > 0 ? (
                            activeProjects.map(p => (
                                <div key={p.id} className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{p.title}</h4>
                                        <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-medium">
                                            {p.status}
                                        </span>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            <span>Progress</span>
                                            <span>{p.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2">
                                            <div className="bg-accent h-2 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">No active projects.</div>
                        )}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-none overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Receipt size={18} className="text-accent" />
                            Recent Invoices
                        </h3>
                        <Link to="/portal/invoices" className="text-sm text-accent hover:underline">View All</Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/10">
                        {recentInvoices?.length > 0 ? (
                            recentInvoices.map(inv => (
                                <div key={inv.id} className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{inv.invoice_number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {inv.currency} {Number(inv.total).toLocaleString()}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                            inv.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                            inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">No recent invoices.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
