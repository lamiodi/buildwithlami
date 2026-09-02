import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { FileSignature, Download, ExternalLink } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { notify } from '../../services/notify';

export default function ClientContracts() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchContracts = async () => {
        try {
            const res = await api.get('/client-portal/contracts', {}, 'client');
            if (res.ok && res.data) {
                setContracts(res.data);
            } else {
                notify.error('Failed to load contracts');
            }
        } catch (err) {
            console.error('Failed to fetch contracts', err);
            notify.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContracts();
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
                <FileSignature className="text-accent" />
                Agreements & Contracts
            </h1>

            {contracts.length === 0 ? (
                <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
                    <FileSignature className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Contracts</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don't have any contracts or agreements yet.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <th className="p-4 font-semibold">Project</th>
                                    <th className="p-4 font-semibold">Date Received</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                                {contracts.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {c.project_name || 'General Agreement'}
                                            </p>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(c.sent_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${
                                                c.status === 'SIGNED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                c.status === 'SENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            {c.status === 'SIGNED' ? (
                                                <a href={`/api/contracts/${c.id}/pdf`} target="_blank" rel="noreferrer" className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1.5">
                                                    Download PDF <Download size={13} />
                                                </a>
                                            ) : c.status === 'SENT' && c.signing_token ? (
                                                <Link
                                                    to={`/sign/${c.signing_token}`}
                                                    className="text-xs font-bold text-white bg-accent hover:bg-orange-600 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm transition-all"
                                                >
                                                    Review & Sign <ExternalLink size={12} />
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Processing</span>
                                            )}
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
