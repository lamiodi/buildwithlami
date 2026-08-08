import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FolderKanban, Calendar, ExternalLink } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';

export default function ClientProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/api/client-portal/projects');
            if (res.ok) {
                setProjects(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch projects', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="text-accent" />
                My Projects
            </h1>

            {projects.length === 0 ? (
                <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
                    <FolderKanban className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects yet</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don't have any active or completed projects.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {projects.map(p => (
                        <div key={p.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                        {p.project_name}
                                    </h3>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {p.division || 'General'}
                                    </span>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    p.status === 'COMPLETED' || p.status === 'LAUNCHED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                    p.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                    'bg-accent/10 text-accent'
                                }`}>
                                    {p.status}
                                </span>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                                        <span>Overall Progress</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{p.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-2.5">
                                        <div className="bg-accent h-2.5 rounded-full" style={{ width: `${p.progress}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar size={14} /> Started
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar size={14} /> Expected Completion
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {p.expected_completion_date ? new Date(p.expected_completion_date).toLocaleDateString() : 'TBD'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex justify-end gap-3">
                                {p.assets_url && (
                                    <a href={p.assets_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent hover:text-accent-dark flex items-center gap-1">
                                        View Assets <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
