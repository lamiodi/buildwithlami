import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { FileSignature, Plus, Download, RefreshCw, Search, X, CheckCircle, Clock, FileText, User } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { notify } from '../../services/notify';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminContracts() {
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedContract, setSelectedContract] = useState(null);
    
    // Form state
    const [clientId, setClientId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [signatoryEmail, setSignatoryEmail] = useState('');
    const [signatoryName, setSignatoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Dropdown data
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/contracts');
            if (res.ok && res.data) setContracts(res.data);
        } catch {
            notify.error('Failed to load contracts');
        } finally {
            setLoading(false);
        }
    };

    const fetchClientsAndProjects = async () => {
        try {
            const [clientsRes, projectsRes] = await Promise.all([
                api.get('/clients'),
                api.get('/client-projects')
            ]);
            if (clientsRes.ok && clientsRes.data) setClients(clientsRes.data);
            if (projectsRes.ok && projectsRes.data) setProjects(projectsRes.data);
        } catch {
            // dropdown fallback
        }
    };

    useEffect(() => {
        fetchContracts();
        fetchClientsAndProjects();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/contracts', {
                clientId,
                projectId: projectId || undefined,
                templateId,
                signatoryEmail,
                signatoryName
            });

            if (res.ok) {
                notify.success('Contract generated and sent to client');
                setShowCreate(false);
                fetchContracts();
                // Reset form
                setClientId(''); setProjectId(''); setTemplateId('');
                setSignatoryEmail(''); setSignatoryName('');
            } else {
                notify.error(res.error || (res.data && res.data.error) || 'Failed to create contract');
            }
        } catch {
            notify.error('Network error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRefreshStatus = async (id) => {
        try {
            const res = await api.get(`/contracts/${id}`);
            if (res.ok && res.data) {
                const updated = res.data;
                setContracts(contracts.map(c => c.id === id ? updated : c));
                if (selectedContract && selectedContract.id === id) {
                    setSelectedContract(updated);
                }
                notify.success('Status refreshed');
            }
        } catch {
            notify.error('Failed to refresh status');
        }
    };

    const filteredContracts = useMemo(() => {
        return contracts.filter(c => {
            const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
            const searchLower = search.toLowerCase();
            const matchesSearch = !search ||
                (c.client_name || '').toLowerCase().includes(searchLower) ||
                (c.project_name || '').toLowerCase().includes(searchLower) ||
                (c.signatory_email || '').toLowerCase().includes(searchLower) ||
                (c.signatory_name || '').toLowerCase().includes(searchLower);
            return matchesStatus && matchesSearch;
        });
    }, [contracts, statusFilter, search]);

    if (loading) return <div className="p-8 max-w-7xl mx-auto"><Skeleton className="h-64 rounded-2xl" /></div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                        <FileSignature className="w-8 h-8 text-accent" />
                        Legal Contracts & Agreements
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Manage e-signatures, Zoho Sign workflows, and project agreements.
                    </p>
                </div>
                <button 
                    onClick={() => setShowCreate(!showCreate)}
                    className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 inline-flex items-center gap-2 text-sm uppercase tracking-wider self-start sm:self-auto"
                >
                    <Plus size={18} /> New Contract
                </button>
            </div>

            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search contracts..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {['ALL', 'SENT', 'SIGNED', 'DRAFT', 'DECLINED'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                                statusFilter === st
                                    ? 'bg-accent text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.form 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleCreate} 
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl space-y-4"
                    >
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generate & Send Legal Contract</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Client *</label>
                                <select 
                                    required
                                    value={clientId} onChange={e => setClientId(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Project (Optional)</label>
                                <select 
                                    value={projectId} onChange={e => setProjectId(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                                >
                                    <option value="">Select Project</option>
                                    {projects.filter(p => !clientId || p.client_id === clientId).map(p => 
                                        <option key={p.id} value={p.id}>{p.project_name}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Template ID / Type *</label>
                                <input 
                                    required type="text" placeholder="e.g. standard-service-agreement-v2"
                                    value={templateId} onChange={e => setTemplateId(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Signatory Email *</label>
                                <input 
                                    required type="email" placeholder="client@example.com"
                                    value={signatoryEmail} onChange={e => setSignatoryEmail(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">Signatory Full Name *</label>
                                <input 
                                    required type="text" placeholder="John Doe"
                                    value={signatoryName} onChange={e => setSignatoryName(e.target.value)}
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="bg-accent hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Contract'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {filteredContracts.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 dark:text-gray-400">
                        <FileSignature className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Contracts Found</h3>
                        <p className="text-sm mt-1">Convert an accepted quotation or create a new contract agreement.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-extrabold">
                                    <th className="p-4">Client / Project</th>
                                    <th className="p-4">Signatory</th>
                                    <th className="p-4">Sent At</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                                {filteredContracts.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-gray-900 dark:text-white">{c.client_name || 'Unknown Client'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{c.project_name || 'Direct Agreement'}</p>
                                        </td>
                                        <td className="p-4 text-gray-700 dark:text-gray-300 text-xs">
                                            <div className="font-bold">{c.signatory_name || 'Signatory'}</div>
                                            <div className="text-gray-500">{c.signatory_email}</div>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(c.sent_at || c.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider inline-block ${
                                                c.status === 'SIGNED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                                                c.status === 'SENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => handleRefreshStatus(c.id)} 
                                                className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors inline-block" 
                                                title="Sync / Refresh Status"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                            {c.status === 'SIGNED' && (
                                                <a 
                                                    href={`/api/contracts/${c.id}/pdf`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors inline-block" 
                                                    title="Download Signed PDF"
                                                >
                                                    <Download size={16} />
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
