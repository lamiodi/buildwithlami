import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Receipt, ExternalLink, Download } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';

export default function ClientInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        try {
            const res = await api.get('/client-portal/invoices');
            if (res.ok && res.data) {
                setInvoices(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch invoices', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
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
                <Receipt className="text-accent" />
                Invoices & Billing
            </h1>

            {invoices.length === 0 ? (
                <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
                    <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don't have any invoices yet.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <th className="p-4 font-semibold">Invoice ID</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Due Date</th>
                                    <th className="p-4 font-semibold text-right">Amount</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                                {invoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-gray-900 dark:text-white">
                                            {inv.invoice_number}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(inv.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                            {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="p-4 text-sm font-medium text-gray-900 dark:text-white text-right">
                                            {inv.currency} {Number(inv.total).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium inline-block ${
                                                inv.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            {inv.pdf_url && (
                                                <a href={inv.pdf_url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 inline-block" title="Download PDF">
                                                    <Download size={16} />
                                                </a>
                                            )}
                                            {inv.status === 'PENDING' ? (
                                                <Link to={`/pay/${inv.id}`} className="text-sm font-medium text-accent hover:text-accent-dark inline-flex items-center gap-1">
                                                    Pay Now <ExternalLink size={14} />
                                                </Link>
                                            ) : (
                                                <Link to={`/pay/${inv.id}`} className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 inline-flex items-center gap-1">
                                                    View Receipt
                                                </Link>
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
