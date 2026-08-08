import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { ActionIcon } from '../../data/adminIcons.jsx';
import Skeleton from '../../components/Skeleton';

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

export default function AdminQuotations() {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuotations = async () => {
        setLoading(true);
        const res = await api.get('/quotations');
        if (res.ok) {
            setQuotations(res.data);
        } else {
            notify.error(res.error || 'Failed to fetch quotations');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const updateStatus = async (id, status) => {
        const res = await api.patch(`/quotations/${id}/status`, { status });
        if (res.ok) {
            notify.success(`Status updated to ${status}`);
            fetchQuotations();
        } else {
            notify.error(res.error || 'Failed to update status');
        }
    };

    const convertToContract = async (id) => {
        if (!window.confirm('Convert this quotation into a formal Contract?')) return;
        const res = await api.post(`/quotations/${id}/convert`);
        if (res.ok) {
            notify.success('Successfully converted to Contract!');
            fetchQuotations();
        } else {
            notify.error(res.error || 'Failed to convert');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto w-full">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white">Quotations</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage project estimates and pricing proposals.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {quotations.length === 0 ? (
                    <div className="p-12 text-center">
                        <ActionIcon.Plus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Quotations Yet</h3>
                        <p className="text-gray-500">Generate a quotation from a Lead in the CRM.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Prospect / Client</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Created</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotations.map(q => (
                                    <tr key={q.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 font-bold text-gray-900 dark:text-white text-sm">{q.title}</td>
                                        <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                                            {q.client_name || q.lead_name || 'Unknown'}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">₦{Number(q.amount).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                                                q.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                q.status === 'CONVERTED' ? 'bg-purple-100 text-purple-700' :
                                                q.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                q.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">{new Date(q.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right space-x-2">
                                            {q.status === 'DRAFT' && (
                                                <button onClick={() => updateStatus(q.id, 'SENT')} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold">
                                                    Mark Sent
                                                </button>
                                            )}
                                            {q.status === 'SENT' && (
                                                <>
                                                    <button onClick={() => updateStatus(q.id, 'ACCEPTED')} className="text-xs bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg font-bold">
                                                        Accept
                                                    </button>
                                                    <button onClick={() => updateStatus(q.id, 'REJECTED')} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold">
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            {q.status === 'ACCEPTED' && (
                                                <button onClick={() => convertToContract(q.id)} className="text-xs bg-accent/10 text-accent hover:bg-accent/20 px-3 py-1.5 rounded-lg font-bold flex items-center justify-center ml-auto gap-1">
                                                    <ActionIcon.Arrow className="w-3 h-3" />
                                                    Convert to Contract
                                                </button>
                                            )}
                                            {q.status === 'CONVERTED' && (
                                                <span className="text-xs text-gray-400 italic">Converted</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
