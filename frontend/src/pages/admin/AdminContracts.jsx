import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FileSignature, Plus, Download, RefreshCw } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { notify } from '../../services/notify';

export default function AdminContracts() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    
    // Form state
    const [clientId, setClientId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [signatoryEmail, setSignatoryEmail] = useState('');
    const [signatoryName, setSignatoryName] = useState('');
    
    // Dropdown data
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetchContracts();
        fetchClientsAndProjects();
    }, []);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/contracts');
            if (res.ok) setContracts(await res.json());
        } catch (err) {
            notify.error('Failed to load contracts');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientsAndProjects = async () => {
        try {
            const [clientsRes, projectsRes] = await Promise.all([
                api.get('/api/clients'),
                api.get('/api/client-projects')
            ]);
            if (clientsRes.ok) setClients(await clientsRes.json());
            if (projectsRes.ok) setProjects(await projectsRes.json());
        } catch (err) {
            console.error('Failed to load dropdown data');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/contracts', {
                clientId,
                projectId: projectId || undefined,
                templateId,
                signatoryEmail,
                signatoryName
            });

            if (res.ok) {
                notify.success('Contract created and sent');
                setShowCreate(false);
                fetchContracts();
                // Reset form
                setClientId(''); setProjectId(''); setTemplateId('');
                setSignatoryEmail(''); setSignatoryName('');
            } else {
                const data = await res.json();
                notify.error(data.error || 'Failed to create contract');
            }
        } catch (err) {
            notify.error('Network error');
        }
    };

    const handleRefreshStatus = async (id) => {
        try {
            const res = await api.get(`/api/contracts/${id}`);
            if (res.ok) {
                const updated = await res.json();
                setContracts(contracts.map(c => c.id === id ? updated : c));
                notify.success('Status refreshed');
            }
        } catch (err) {
            notify.error('Failed to refresh status');
        }
    };

    if (loading) return <div className="p-8"><Skeleton className="h-64 rounded-xl" /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                    <FileSignature className="text-accent" />
                    Contracts (Zoho Sign)
                </h1>
                <button 
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-accent hover:bg-accent-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> New Contract
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="bg-white dark:bg-card p-6 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Contract</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client *</label>
                            <select 
                                required
                                value={clientId} onChange={e => setClientId(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-background text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                            >
                                <option value="">Select Client</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project (Optional)</label>
                            <select 
                                value={projectId} onChange={e => setProjectId(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-background text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                            >
                                <option value="">Select Project</option>
                                {projects.filter(p => !clientId || p.client_id === clientId).map(p => 
                                    <option key={p.id} value={p.id}>{p.project_name}</option>
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zoho Template ID *</label>
                            <input 
                                required type="text" placeholder="e.g. 4390843000000000"
                                value={templateId} onChange={e => setTemplateId(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-background text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signatory Email *</label>
                            <input 
                                required type="email" placeholder="client@example.com"
                                value={signatoryEmail} onChange={e => setSignatoryEmail(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-background text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Signatory Name *</label>
                            <input 
                                required type="text" placeholder="John Doe"
                                value={signatoryName} onChange={e => setSignatoryName(e.target.value)}
                                className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-background text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Cancel</button>
                        <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-6 py-2 rounded-lg font-bold transition-colors">Send Contract</button>
                    </div>
                </form>
            )}

            <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                {contracts.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No contracts found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 text-xs uppercase text-gray-500 dark:text-gray-400">
                                    <th className="p-4 font-semibold">Client / Project</th>
                                    <th className="p-4 font-semibold">Signatory</th>
                                    <th className="p-4 font-semibold">Sent At</th>
                                    <th className="p-4 font-semibold text-center">Status</th>
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                                {contracts.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900 dark:text-white">{c.client_name || 'Unknown Client'}</p>
                                            <p className="text-xs text-gray-500">{c.project_name || 'No Project'}</p>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                            {c.signatory_email}
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
                                            {c.status === 'SENT' && (
                                                <button onClick={() => handleRefreshStatus(c.id)} className="text-gray-500 hover:text-accent transition-colors" title="Check Status">
                                                    <RefreshCw size={18} />
                                                </button>
                                            )}
                                            {c.status === 'SIGNED' && (
                                                <a href={`/api/contracts/${c.id}/pdf`} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-accent transition-colors inline-block" title="Download PDF">
                                                    <Download size={18} />
                                                </a>
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
