import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { FolderKanban, Receipt, FileText, CheckCircle, Clock } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

export default function ClientDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/api/client-portal/dashboard');
            if (res.ok) {
                setData(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch dashboard', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

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

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FolderKanban size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeProjects?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Completed Projects</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedProjects?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-card p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm flex items-center gap-4">
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
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
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
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
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
