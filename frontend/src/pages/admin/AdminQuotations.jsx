import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  ArrowRight, 
  X, 
  Trash2, 
  Building, 
  User
} from 'lucide-react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import Skeleton from '../../components/Skeleton';

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5";

export default function AdminQuotations() {
    const [quotations, setQuotations] = useState([]);
    const [leads, setLeads] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [previewQuotation, setPreviewQuotation] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // New quotation form state
    const [form, setForm] = useState({
        recipientType: 'client', // 'client' | 'lead'
        client_id: '',
        lead_id: '',
        title: '',
        currency: 'NGN',
        notes: 'Standard 14-day quotation. Includes architecture documentation, QA testing, and 4 months warranty.',
        valid_until: '',
        line_items: [
            { description: 'Phase 1: Discovery & System Architecture', qty: 1, rate: 150000 },
            { description: 'Phase 2: Full-Stack Platform Development', qty: 1, rate: 450000 },
            { description: 'Phase 3: QA Testing, Deployment & 4-Mo SLA', qty: 1, rate: 100000 }
        ]
    });

    const fetchDropdowns = async () => {
        try {
            const [leadsRes, clientsRes] = await Promise.all([
                api.get('/crm/leads'),
                api.get('/clients')
            ]);
            if (leadsRes.ok && leadsRes.data) setLeads(leadsRes.data);
            if (clientsRes.ok && clientsRes.data) setClients(clientsRes.data);
        } catch {
            // dropdown fetch fallback
        }
    };

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
        fetchDropdowns();
    }, []);

    const totalFormAmount = useMemo(() => {
        return form.line_items.reduce((acc, item) => acc + (Number(item.qty || 1) * Number(item.rate || 0)), 0);
    }, [form.line_items]);

    const handleLineItemChange = (index, field, val) => {
        const items = [...form.line_items];
        items[index][field] = val;
        setForm({ ...form, line_items: items });
    };

    const addLineItem = () => {
        setForm({
            ...form,
            line_items: [...form.line_items, { description: '', qty: 1, rate: 0 }]
        });
    };

    const removeLineItem = (index) => {
        if (form.line_items.length <= 1) return;
        const items = form.line_items.filter((_, i) => i !== index);
        setForm({ ...form, line_items: items });
    };

    const handleCreateQuotation = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            notify.error('Please enter a quotation title');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: form.title,
                amount: totalFormAmount,
                client_id: form.recipientType === 'client' ? (form.client_id || undefined) : undefined,
                lead_id: form.recipientType === 'lead' ? (form.lead_id || undefined) : undefined,
                line_items: form.line_items.filter(i => i.description.trim() !== ''),
                notes: form.notes,
                valid_until: form.valid_until || undefined
            };

            const res = await api.post('/quotations', payload);
            if (res.ok) {
                notify.success('Quotation generated successfully!');
                setShowCreateModal(false);
                fetchQuotations();
                // Reset form
                setForm({
                    recipientType: 'client',
                    client_id: '',
                    lead_id: '',
                    title: '',
                    currency: 'NGN',
                    notes: 'Standard 14-day quotation. Includes architecture documentation, QA testing, and 4 months warranty.',
                    valid_until: '',
                    line_items: [{ description: 'Custom Software Development', qty: 1, rate: 350000 }]
                });
            } else {
                notify.error(res.error || 'Failed to create quotation');
            }
        } catch {
            notify.error('Network error creating quotation');
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, status) => {
        const res = await api.patch(`/quotations/${id}/status`, { status });
        if (res.ok) {
            notify.success(`Status updated to ${status}`);
            fetchQuotations();
            if (previewQuotation && previewQuotation.id === id) {
                setPreviewQuotation({ ...previewQuotation, status });
            }
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
            if (previewQuotation && previewQuotation.id === id) {
                setPreviewQuotation({ ...previewQuotation, status: 'CONVERTED' });
            }
        } else {
            notify.error(res.error || 'Failed to convert');
        }
    };

    const filteredQuotations = useMemo(() => {
        return quotations.filter(q => {
            const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
            const searchLower = search.toLowerCase();
            const matchesSearch = !search || 
                (q.title || '').toLowerCase().includes(searchLower) ||
                (q.client_name || '').toLowerCase().includes(searchLower) ||
                (q.lead_name || '').toLowerCase().includes(searchLower) ||
                String(q.amount || '').includes(searchLower);
            return matchesStatus && matchesSearch;
        });
    }, [quotations, statusFilter, search]);

    if (loading) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto w-full p-6">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full p-6 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-accent" />
                        Quotations & Estimates
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Create, track, and convert technical proposals into binding contracts.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 inline-flex items-center gap-2 text-sm uppercase tracking-wider self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" /> Create Quotation
                </button>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search quotations..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {['ALL', 'DRAFT', 'SENT', 'ACCEPTED', 'CONVERTED', 'REJECTED'].map(st => (
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

            {/* Table / List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {filteredQuotations.length === 0 ? (
                    <div className="p-16 text-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Quotations Found</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1">
                            {search || statusFilter !== 'ALL' ? 'No items match your filter.' : 'Click "Create Quotation" to generate an estimate for a client or lead.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    <th className="p-4">Quotation Title</th>
                                    <th className="p-4">Prospect / Client</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {filteredQuotations.map(q => (
                                    <tr key={q.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">
                                                {q.title}
                                            </div>
                                            <span className="text-[11px] text-gray-400 font-mono">ID: {q.id.slice(0, 8)}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-700 dark:text-gray-300">
                                            {q.client_name ? (
                                                <span className="inline-flex items-center gap-1.5 font-medium">
                                                    <Building className="w-3.5 h-3.5 text-blue-500" />
                                                    {q.client_name}
                                                </span>
                                            ) : q.lead_name ? (
                                                <span className="inline-flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400">
                                                    <User className="w-3.5 h-3.5" />
                                                    {q.lead_name} (Lead)
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-mono text-sm font-extrabold text-gray-900 dark:text-white">
                                            ₦{Number(q.amount || 0).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                                q.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                                                q.status === 'CONVERTED' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' :
                                                q.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                                                q.status === 'SENT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                            }`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button 
                                                onClick={() => setPreviewQuotation(q)}
                                                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg font-bold transition-colors"
                                            >
                                                Preview / Sheet
                                            </button>
                                            
                                            {q.status === 'DRAFT' && (
                                                <button onClick={() => updateStatus(q.id, 'SENT')} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold">
                                                    Mark Sent
                                                </button>
                                            )}
                                            {q.status === 'SENT' && (
                                                <button onClick={() => updateStatus(q.id, 'ACCEPTED')} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold">
                                                    Accept
                                                </button>
                                            )}
                                            {q.status === 'ACCEPTED' && (
                                                <button onClick={() => convertToContract(q.id)} className="text-xs bg-accent text-white hover:bg-orange-600 px-3 py-1.5 rounded-lg font-bold inline-flex items-center gap-1 shadow-sm">
                                                    <ArrowRight className="w-3 h-3" />
                                                    Convert to Contract
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── CREATE QUOTATION MODAL ── */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-6 my-8"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-accent" />
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Quotation</h3>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateQuotation} className="space-y-5">
                                <div>
                                    <label className={labelClass}>Quotation Title *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. Full-Stack Web Platform & Mobile API"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Recipient Type</label>
                                        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, recipientType: 'client' })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    form.recipientType === 'client' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                                                }`}
                                            >
                                                Existing Client
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, recipientType: 'lead' })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    form.recipientType === 'lead' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                                                }`}
                                            >
                                                CRM Lead
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Select Recipient</label>
                                        {form.recipientType === 'client' ? (
                                            <select 
                                                value={form.client_id}
                                                onChange={e => setForm({ ...form, client_id: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="">Choose Client</option>
                                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        ) : (
                                            <select 
                                                value={form.lead_id}
                                                onChange={e => setForm({ ...form, lead_id: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="">Choose Lead</option>
                                                {leads.map(l => <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>)}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Line items */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className={labelClass}>Deliverables & Line Items</label>
                                        <button 
                                            type="button" 
                                            onClick={addLineItem}
                                            className="text-xs font-bold text-accent hover:underline inline-flex items-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> Add Item
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {form.line_items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                                                    className="flex-1 p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-accent"
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Rate (NGN)"
                                                    value={item.rate}
                                                    onChange={e => handleLineItemChange(idx, 'rate', Number(e.target.value))}
                                                    className="w-28 p-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-accent"
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => removeLineItem(idx)}
                                                    className="p-2 text-gray-400 hover:text-rose-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl mt-3 text-sm">
                                        <span className="font-bold text-gray-600 dark:text-gray-400">Total Calculated Amount:</span>
                                        <span className="font-mono font-extrabold text-gray-900 dark:text-white text-base">₦{totalFormAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Notes / Scope Terms</label>
                                    <textarea 
                                        rows={3}
                                        value={form.notes}
                                        onChange={e => setForm({ ...form, notes: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={submitting}
                                        className="px-6 py-2.5 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md disabled:opacity-50"
                                    >
                                        {submitting ? 'Generating...' : 'Save & Issue Quotation'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── VIEW / PRINT QUOTATION MODAL ── */}
            <AnimatePresence>
                {previewQuotation && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 print:p-0 print:border-none print:shadow-none"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 print:hidden">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs uppercase tracking-widest font-extrabold text-accent">Official Quotation Preview</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => window.print()}
                                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
                                    >
                                        <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                                    </button>
                                    <button onClick={() => setPreviewQuotation(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Printable Sheet */}
                            <div className="space-y-6 text-gray-900 dark:text-white">
                                <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black font-heading tracking-tight text-accent">BUILDWITHLAMI</h2>
                                        <p className="text-xs text-gray-500">Software Development & Digital Solutions</p>
                                        <p className="text-xs text-gray-500">buildwithlami.com · Lagos, Nigeria</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Estimate #</div>
                                        <div className="font-mono text-sm font-bold">{previewQuotation.id.slice(0, 8)}</div>
                                        <div className="text-xs text-gray-500 mt-1">Date: {new Date(previewQuotation.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Prepared For:</div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                                            {previewQuotation.client_name || previewQuotation.lead_name || 'Valued Client'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Project Scope:</div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                                            {previewQuotation.title}
                                        </div>
                                    </div>
                                </div>

                                {/* Line items table */}
                                <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-gray-50 dark:bg-gray-800 font-bold uppercase tracking-wider text-gray-500">
                                            <tr>
                                                <th className="p-3">Deliverable Item</th>
                                                <th className="p-3 text-right">Amount (NGN)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {(() => {
                                                let items;
                                                try {
                                                    items = typeof previewQuotation.line_items === 'string' ? JSON.parse(previewQuotation.line_items) : (previewQuotation.line_items || []);
                                                } catch {
                                                    items = [];
                                                }
                                                if (!items.length) {
                                                    return (
                                                        <tr>
                                                            <td className="p-3">{previewQuotation.title}</td>
                                                            <td className="p-3 text-right font-mono font-bold">₦{Number(previewQuotation.amount).toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                }
                                                return items.map((it, idx) => (
                                                    <tr key={idx}>
                                                        <td className="p-3">{it.description}</td>
                                                        <td className="p-3 text-right font-mono font-bold">₦{Number(it.rate || it.amount || 0).toLocaleString()}</td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-800 font-bold text-sm">
                                            <tr>
                                                <td className="p-3 text-right uppercase tracking-wider text-xs">Total Estimate:</td>
                                                <td className="p-3 text-right font-mono font-extrabold text-accent text-base">₦{Number(previewQuotation.amount).toLocaleString()}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                {previewQuotation.notes && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                        <div className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">Terms & Conditions:</div>
                                        <p>{previewQuotation.notes}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 print:hidden">
                                <div className="text-xs text-gray-500">
                                    Current Status: <strong className="text-accent">{previewQuotation.status}</strong>
                                </div>
                                {previewQuotation.status === 'ACCEPTED' && (
                                    <button
                                        onClick={() => convertToContract(previewQuotation.id)}
                                        className="px-5 py-2 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-all inline-flex items-center gap-1.5"
                                    >
                                        Convert to Formal Contract →
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
