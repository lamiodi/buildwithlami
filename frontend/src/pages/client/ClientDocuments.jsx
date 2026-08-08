import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FileText, Download, ExternalLink } from 'lucide-react';
import Skeleton from '../../components/Skeleton';

export default function ClientDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await api.get('/api/client-portal/documents');
            if (res.ok) {
                setDocuments(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="text-accent" />
                Documents & Deliverables
            </h1>

            {documents.length === 0 ? (
                <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents</h3>
                    <p className="text-gray-500 dark:text-gray-400">Your final deliverables and contracts will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map(doc => (
                        <div key={doc.id} className="bg-white dark:bg-card p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <FileText size={20} />
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300">
                                        {doc.type}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    {doc.project_name}
                                </h3>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex justify-end">
                                {doc.url ? (
                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent hover:text-accent-dark flex items-center gap-1 transition-colors">
                                        Open <ExternalLink size={14} />
                                    </a>
                                ) : (
                                    <span className="text-sm text-gray-400 italic">Not available</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
