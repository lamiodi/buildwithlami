import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FileText, Calendar, CheckCircle2, Clock } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { notify } from '../../services/notify';

export default function ClientQuotations() {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotations = async () => {
        try {
            const res = await api.get('/api/client-portal/quotations');
            if (res.ok) {
                setQuotations(await res.json());
            } else {
                notify.error('Failed to load quotations');
            }
        } catch (err) {
            console.error('Failed to fetch quotations', err);
            notify.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-accent" />
                Proposals & Quotations
            </h1>

            {quotations.length === 0 ? (
                <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Quotations Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">Formal price proposals and project quotes will appear here.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <th className="p-4 font-semibold">Title / Description</th>
                                    <th className="p-4 font-semibold">Date Sent</th>
                                    <th className="p-4 font-semibold">Valid Until</th>
                                    <th className="p-4 font-semibold text-right">Amount</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                                {quotations.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900 dark:text-white">{q.title}</p>
                                            {q.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{q.notes}</p>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {q.valid_until ? new Date(q.valid_until).toLocaleDateString() : 'No expiry'}
                                        </td>
                                        <td className="p-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                            ${Number(q.amount).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium inline-block ${
                                                q.status === 'ACCEPTED' || q.status === 'CONVERTED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                q.status === 'SENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
