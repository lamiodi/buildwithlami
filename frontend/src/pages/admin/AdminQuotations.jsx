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
  User,
  Sparkles,
  Zap,
  Layers,
  Server,
  Calculator,
  CheckCircle2,
  Sliders,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import Skeleton from '../../components/Skeleton';

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5";

// Studio Packages & Presets for instant quotation generation
const STUDIO_PRESETS = [
  {
    id: "web_starter",
    category: "Websites",
    label: "Websites: Starter (₦250k)",
    title: "Starter Digital Platform & Portfolio",
    currency: "NGN",
    items: [
      { description: "Phase 1: Minimalist UI/UX Design & Brand Asset Integration", qty: 1, rate: 100000 },
      { description: "Phase 2: High-Performance Frontend Build & WhatsApp Capture", qty: 1, rate: 100000 },
      { description: "Phase 3: Core Web Vitals Optimization & 1-Month Support", qty: 1, rate: 50000 }
    ],
    notes: "Starter Web Package. Includes 1-month post-launch support and 50% kickoff / 50% delivery milestone payment terms."
  },
  {
    id: "web_business",
    category: "Websites",
    label: "Websites: Business ⭐ (₦600k)",
    title: "Business Corporate Platform & CMS",
    currency: "NGN",
    items: [
      { description: "Phase 1: Information Architecture, UX Wireframes & Design System", qty: 1, rate: 150000 },
      { description: "Phase 2: Full Corporate Build (Up to 10 Pages) + CMS Integration", qty: 1, rate: 300000 },
      { description: "Phase 3: Lead Capture CRM Pipeline, SEO Setup & 4-Mo SLA Support", qty: 1, rate: 150000 }
    ],
    notes: "Standard Corporate Platform. Includes CMS management, CRM lead sync, 4 months post-launch support warranty, and 50/50 milestone payment terms."
  },
  {
    id: "web_plus",
    category: "Websites",
    label: "Websites: Business Plus (₦850k)",
    title: "Business Plus Portal & Multi-Department Platform",
    currency: "NGN",
    items: [
      { description: "Phase 1: Enterprise Information Architecture & Portal UI/UX", qty: 1, rate: 200000 },
      { description: "Phase 2: Custom Multi-Page Portal, Staff Directory & Invoicing", qty: 1, rate: 450000 },
      { description: "Phase 3: Technical SEO Audit, Speed Optimization & 6-Mo SLA Support", qty: 1, rate: 200000 }
    ],
    notes: "Business Plus Platform. Includes custom multi-page portal, staff directory, 6 months post-launch support, and 50/50 milestone billing."
  },
  {
    id: "ecom_launch",
    category: "E-Commerce",
    label: "E-Commerce: Launch (₦650k)",
    title: "E-Commerce Launch Engine (Boutique)",
    currency: "NGN",
    items: [
      { description: "Phase 1: Storefront UI/UX & Catalog Architecture (Up to 30 SKUs)", qty: 1, rate: 200000 },
      { description: "Phase 2: Frictionless Checkout, Paystack/Cards & Inventory Setup", qty: 1, rate: 350000 },
      { description: "Phase 3: Order Management Dashboard, Testing & 1-Month Support", qty: 1, rate: 100000 }
    ],
    notes: "E-Commerce Launch Package. Includes 30 products setup, single gateway integration, 1 month support, and 50/50 milestone billing."
  },
  {
    id: "ecom_growth",
    category: "E-Commerce",
    label: "E-Commerce: Growth ⭐ (₦850k — e.g. Sassy Brand)",
    title: "E-Commerce Growth Platform (Multi-Gateway & Cross-Border)",
    currency: "NGN",
    items: [
      { description: "Phase 1: Bespoke Storefront UI/UX, Product Filtering & Category Hierarchy", qty: 1, rate: 250000 },
      { description: "Phase 2: Multi-Gateway Setup (Paystack + Stripe/UAE), Multi-Zone Shipping & Accounts", qty: 1, rate: 400000 },
      { description: "Phase 3: Abandoned Cart Automation, Discount Engine, GA4/Meta Pixel & 4-Mo SLA", qty: 1, rate: 200000 }
    ],
    notes: "E-Commerce Growth Package. Includes up to 100 products, multi-gateway & multi-zone shipping (UAE/Nigeria/Intl), customer accounts, abandoned-cart recovery, discount engine, 4 months post-launch support, and 50/50 milestone billing."
  },
  {
    id: "ecom_pro",
    category: "E-Commerce",
    label: "E-Commerce: Commerce Pro (₦1.2M)",
    title: "Enterprise Commerce Operations & Multi-Warehouse Platform",
    currency: "NGN",
    items: [
      { description: "Phase 1: Enterprise Commerce Architecture & Complex Variant Matrices", qty: 1, rate: 350000 },
      { description: "Phase 2: Global Multi-Currency Checkout, Courier API Sync & Logistics Ledger", qty: 1, rate: 550000 },
      { description: "Phase 3: Custom Accounting Webhooks, ERP Sync, Analytics & 6-Mo SLA", qty: 1, rate: 300000 }
    ],
    notes: "Enterprise Commerce Pro. Includes multi-warehouse shipping logic, courier APIs, multi-currency checkout, 6 months post-launch support, and 50/50 milestone terms."
  },
  {
    id: "soft_mvp",
    category: "Software",
    label: "Custom Software: MVP Platform (₦1.2M)",
    title: "Custom Web Application & SaaS Prototype MVP",
    currency: "NGN",
    items: [
      { description: "Phase 1: Data Modeling, RBAC Auth & REST API Architecture", qty: 1, rate: 350000 },
      { description: "Phase 2: Full-Stack Web Application, Interactive Dashboards & Logic", qty: 1, rate: 600000 },
      { description: "Phase 3: Webhook Integrations, QA Testing, Production Deployment & 4-Mo SLA", qty: 1, rate: 250000 }
    ],
    notes: "Custom Web App MVP. Includes custom database, RBAC authentication, interactive dashboard, 4 months post-launch support, 100% IP transfer, and 50/50 milestone terms."
  },
  {
    id: "soft_growth",
    category: "Software",
    label: "Custom Software: Growth Platform ⭐ (₦2.0M)",
    title: "Enterprise ERP & Scalable Business Operating System",
    currency: "NGN",
    items: [
      { description: "Phase 1: Enterprise System Modeling, Multi-Role Workflows & API Specs", qty: 1, rate: 600000 },
      { description: "Phase 2: Custom ERP Modules, Financial Ledgers & Client Data Vault", qty: 1, rate: 1000000 },
      { description: "Phase 3: Partner Integrations, Automated CI/CD, Load Testing & 6-Mo SLA", qty: 1, rate: 400000 }
    ],
    notes: "Growth Platform Architecture. Includes multi-role workflows, automated reporting ledgers, 6 months post-launch support, and 50/50 milestone terms."
  }
];

const PRESET_ADDONS = [
  { label: "+ Int'l Shipping (₦100k)", desc: "Advanced Multi-Zone International Shipping Setup & Courier APIs", rate: 100000 },
  { label: "+ Extra Gateway (₦80k)", desc: "Additional Payment Gateway (Stripe, UAE Gateway, PayPal)", rate: 80000 },
  { label: "+ Advanced SEO (₦100k)", desc: "Advanced Technical SEO, Schema Markup & 100% Core Web Vitals", rate: 100000 },
  { label: "+ Custom Automation (₦100k)", desc: "Custom Business Workflow Automations & Webhooks", rate: 100000 },
  { label: "+ CRM Pipeline (₦100k)", desc: "CRM & Leads Pipeline Integration (HubSpot / Airtable)", rate: 100000 },
  { label: "+ Analytics & Meta Pixel (₦50k)", desc: "Advanced Conversion Analytics & Meta Pixel CAPI Tracking", rate: 50000 },
  { label: "+ Multi-Currency (₦75k)", desc: "Multi-Currency & Regional Language Localization", rate: 75000 },
  { label: "+ Performance Cloud (₦150k)", desc: "Performance Cloud Infrastructure (Redis, DB Pooling, Media Optimization)", rate: 150000 },
  { label: "+ Scale Cloud Cluster (₦350k)", desc: "Enterprise Scale Cloud Cluster (Autoscaling, Dedicated DB, DDoS)", rate: 350000 }
];

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
        notes: 'Payment Terms: 50% Kickoff Deposit to commence architecture & development. 50% Final Delivery Balance upon QA, handover, and production deployment. Includes 4 months post-launch support included.',
        valid_until: '',
        line_items: [
            { description: 'Phase 1: Discovery & System Architecture', qty: 1, rate: 150000 },
            { description: 'Phase 2: Full-Stack Platform Development', qty: 1, rate: 450000 },
            { description: 'Phase 3: QA Testing, Deployment & 4-Mo SLA Support', qty: 1, rate: 100000 }
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

    const upfrontDeposit50 = useMemo(() => Math.round(totalFormAmount * 0.5), [totalFormAmount]);
    const deliveryBalance50 = useMemo(() => totalFormAmount - upfrontDeposit50, [totalFormAmount, upfrontDeposit50]);

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

    // Apply Studio Preset
    const applyStudioPreset = (presetId) => {
        const preset = STUDIO_PRESETS.find(p => p.id === presetId);
        if (!preset) return;

        setForm(prev => ({
            ...prev,
            title: preset.title,
            currency: preset.currency,
            line_items: preset.items.map(it => ({ ...it })),
            notes: `${preset.notes}\n\nMilestone Terms: 50% Upfront Kickoff (${form.currency === 'USD' ? '$' : '₦'}${Math.round(preset.items.reduce((a, b) => a + b.rate, 0) * 0.5).toLocaleString()}) / 50% Final Delivery.`
        }));
        notify.success(`Applied preset: ${preset.title}`);
    };

    // Quick Append Add-on
    const appendAddon = (addon) => {
        setForm(prev => ({
            ...prev,
            line_items: [...prev.line_items, { description: addon.desc, qty: 1, rate: addon.rate }]
        }));
        notify.info(`Added: ${addon.label}`);
    };

    // Auto-Generate 50/50 Note
    const apply5050TermsToNotes = () => {
        const symbol = form.currency === 'USD' ? '$' : '₦';
        const noteText = `Payment Terms: 50% Kickoff Deposit (${symbol}${upfrontDeposit50.toLocaleString()}) to commence architecture & development. 50% Final Delivery Balance (${symbol}${deliveryBalance50.toLocaleString()}) upon QA, handover, and production deployment. Includes 4 months post-launch support included.`;
        setForm(prev => ({ ...prev, notes: noteText }));
        notify.success('Updated notes with 50/50 milestone payment terms');
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
                    notes: 'Payment Terms: 50% Kickoff Deposit to commence architecture & development. 50% Final Delivery Balance upon QA, handover, and production deployment. Includes 4 months post-launch support included.',
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
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                            Commercial Quotation Engine
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-8 h-8 text-accent" />
                        Quotations & Estimates
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Generate modular 3-tier proposals, customize infrastructure & add-ons, and issue 50/50 milestone contracts.
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
                        placeholder="Search quotations, clients, amounts..."
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
                            {search || statusFilter !== 'ALL' ? 'No items match your filter.' : 'Click "Create Quotation" to generate an estimate using studio package presets.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50 text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    <th className="p-4">Quotation Title</th>
                                    <th className="p-4">Prospect / Client</th>
                                    <th className="p-4">Total Amount</th>
                                    <th className="p-4">Milestone (50/50)</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Date</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                                {filteredQuotations.map(q => {
                                    const total = Number(q.amount || 0);
                                    const deposit = Math.round(total * 0.5);

                                    return (
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
                                                ₦{total.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-xs font-mono">
                                                <span className="text-emerald-600 dark:text-emerald-400 font-bold block">50%: ₦{deposit.toLocaleString()}</span>
                                                <span className="text-gray-400 text-[10px]">upon delivery</span>
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
                                    );
                                })}
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
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-accent" />
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Studio Quotation Generator</h3>
                                        <p className="text-xs text-gray-500">Fast, modular scope builder with 50/50 milestone calculation</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* ── QUICK STUDIO PRESET SELECTOR ── */}
                            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                                        <Sparkles className="w-3.5 h-3.5" /> 1-Click Studio Package Presets
                                    </span>
                                    <span className="text-[10px] text-gray-500">Auto-populates phased deliverables & rates</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                    {STUDIO_PRESETS.map(preset => (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            onClick={() => applyStudioPreset(preset.id)}
                                            className="p-2 rounded-xl text-left border border-blue-200 dark:border-blue-800/80 bg-white dark:bg-gray-800 hover:border-accent text-gray-800 dark:text-gray-200 text-xs font-semibold transition-all flex flex-col justify-between"
                                        >
                                            <span className="text-[9px] uppercase font-bold text-accent">{preset.category}</span>
                                            <span className="truncate">{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleCreateQuotation} className="space-y-5">
                                <div>
                                    <label className={labelClass}>Quotation Title *</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. E-Commerce Growth Platform (Multi-Gateway & Cross-Border Logistics)"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Recipient Type</label>
                                        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, recipientType: 'client' })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    form.recipientType === 'client' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                                                }`}
                                            >
                                                Client
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setForm({ ...form, recipientType: 'lead' })}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                    form.recipientType === 'lead' ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'
                                                }`}
                                            >
                                                Lead
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

                                    <div>
                                        <label className={labelClass}>Currency</label>
                                        <select 
                                            value={form.currency}
                                            onChange={e => setForm({ ...form, currency: e.target.value })}
                                            className={inputClass}
                                        >
                                            <option value="NGN">₦ NGN (Nigeria)</option>
                                            <option value="USD">$ USD (International)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* ── MODULAR ADD-ONS QUICK CLICK PILLS ── */}
                                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 block mb-2">
                                        + Quick Add Scope Items & Add-ons:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PRESET_ADDONS.map((add, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => appendAddon(add)}
                                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-accent text-gray-700 dark:text-gray-300 transition-colors"
                                            >
                                                {add.label}
                                            </button>
                                        ))}
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
                                            <Plus className="w-3 h-3" /> Add Custom Line Item
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {form.line_items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Deliverable description"
                                                    value={item.description}
                                                    onChange={e => handleLineItemChange(idx, 'description', e.target.value)}
                                                    className="flex-1 p-2.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-accent"
                                                />
                                                <input 
                                                    type="number" 
                                                    placeholder="Rate"
                                                    value={item.rate}
                                                    onChange={e => handleLineItemChange(idx, 'rate', Number(e.target.value))}
                                                    className="w-32 p-2.5 text-xs font-mono rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-accent"
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

                                    {/* Real-time 50/50 Breakdown Card */}
                                    <div className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 mt-3 space-y-2">
                                        <div className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-gray-700 pb-2">
                                            <span className="font-bold text-gray-700 dark:text-gray-300">Total Project Estimate:</span>
                                            <span className="font-mono font-extrabold text-gray-900 dark:text-white text-lg">
                                                {form.currency === 'USD' ? '$' : '₦'}{totalFormAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                                            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                                                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">1. 50% Kickoff Deposit</span>
                                                <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-200 text-sm">
                                                    {form.currency === 'USD' ? '$' : '₦'}{upfrontDeposit50.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
                                                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">2. 50% Final Delivery</span>
                                                <span className="font-mono font-extrabold text-blue-800 dark:text-blue-200 text-sm">
                                                    {form.currency === 'USD' ? '$' : '₦'}{deliveryBalance50.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className={labelClass}>Scope Terms & Milestone Conditions</label>
                                        <button
                                            type="button"
                                            onClick={apply5050TermsToNotes}
                                            className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                                        >
                                            <Calculator className="w-3 h-3" /> Auto-Format 50/50 Milestone Terms
                                        </button>
                                    </div>
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
                                        className="px-6 py-2.5 rounded-xl bg-accent text-white text-xs font-bold uppercase tracking-wider hover:bg-orange-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting ? 'Generating...' : 'Issue Official Quotation'}
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
                                        <p className="text-xs text-gray-500">Software Architecture & Digital Engineering</p>
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

                                {/* Structured Milestone Terms Box */}
                                <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/60 text-xs">
                                    <div className="font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider text-[10px] mb-2">
                                        Milestone Payment Schedule (50/50 Split):
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-gray-500 block text-[11px]">1. 50% Kickoff Deposit:</span>
                                            <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                                ₦{Math.round(Number(previewQuotation.amount || 0) * 0.5).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-[11px]">2. 50% Final Delivery:</span>
                                            <span className="font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                                                ₦{(Number(previewQuotation.amount || 0) - Math.round(Number(previewQuotation.amount || 0) * 0.5)).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
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
