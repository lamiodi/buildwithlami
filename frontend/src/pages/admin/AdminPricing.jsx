// ─── src/pages/admin/AdminPricing.jsx ───────────────────
// Pricing tier manager (Phase 11 — content cleanup).
//
// CRUD on the `pricing` table that powers the public
// /pricing page. Each row is a tier. `highlight` toggles the
// "Most popular" badge, `display_order` controls the
// left-to-right order on the public page.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { ActionIcon, MiscIcon } from '../../data/adminIcons.jsx';

const Icon = {
    Plus: ActionIcon.Plus,
    Trash: ActionIcon.Trash,
    Save: ActionIcon.Save,
    X: ActionIcon.X,
    Sparkle: MiscIcon.Sparkle,
    Star: MiscIcon.Star,
};

const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const emptyDraft = {
    name: '',
    price: '',
    cadence: 'one-time',
    description: '',
    features: [],
    highlight: false,
    display_order: 0,
    status: 'PUBLISHED',
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const AdminPricing = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [draft, setDraft] = useState(emptyDraft);
    const [featuresInput, setFeaturesInput] = useState('');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newDraft, setNewDraft] = useState({ ...emptyDraft });

    const load = async () => {
        setLoading(true);
        const res = await api.get('/pricing/admin');
        if (res.ok) {
            setTiers(Array.isArray(res.data) ? res.data : []);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const select = (t) => {
        setSelected(t);
        setDraft({
            name: t.name || '',
            price: t.price || '',
            cadence: t.cadence || 'one-time',
            description: t.description || '',
            features: t.features || [],
            highlight: !!t.highlight,
            display_order: t.display_order ?? 0,
            status: t.status || 'PUBLISHED',
        });
        setFeaturesInput((t.features || []).join('\n'));
        setDirty(false);
    };

    // Mark dirty on any change.
    useEffect(() => {
        if (!selected) return;
        const featuresNow = featuresInput.split('\n').map((s) => s.trim()).filter(Boolean);
        const original = {
            name: selected.name || '',
            price: selected.price || '',
            cadence: selected.cadence || 'one-time',
            description: selected.description || '',
            features: selected.features || [],
            highlight: !!selected.highlight,
            display_order: selected.display_order ?? 0,
            status: selected.status || 'PUBLISHED',
        };
        const dirtyNow = JSON.stringify({ ...draft, features: featuresNow }) !== JSON.stringify(original);
        setDirty(dirtyNow);
    }, [draft, featuresInput, selected]);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        const payload = {
            ...draft,
            features: featuresInput.split('\n').map((s) => s.trim()).filter(Boolean),
            description: draft.description || null,
            display_order: Number(draft.display_order) || 0,
        };
        const res = await api.put(`/pricing/${selected.id}`, payload);
        setSaving(false);
        if (res.ok) {
            notify.success('Tier saved.');
            setTiers(prev => prev.map(t => t.id === res.data.id ? res.data : t));
            setSelected(res.data);
            setDirty(false);
        } else {
            notify.error(res.error || 'Failed to save.');
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm(`Delete the "${selected.name}" tier? This cannot be undone.`)) return;
        const res = await api.delete(`/pricing/${selected.id}`);
        if (res.ok) {
            notify.success('Tier deleted.');
            const remaining = tiers.filter(t => t.id !== selected.id);
            setTiers(remaining);
            setSelected(remaining[0] || null);
            if (remaining[0]) select(remaining[0]);
        } else {
            notify.error(res.error || 'Failed to delete.');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDraft.name.trim() || !newDraft.price.trim()) {
            notify.error('Name and price are required.');
            return;
        }
        const res = await api.post('/pricing', {
            ...newDraft,
            features: (newDraft.features || []).filter(Boolean),
        });
        if (res.ok) {
            notify.success('Tier created.');
            setTiers(prev => [...prev, res.data]);
            select(res.data);
            setShowCreate(false);
            setNewDraft({ ...emptyDraft });
        } else {
            notify.error(res.error || 'Failed to create.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="max-w-[1600px] mx-auto w-full flex flex-col h-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                            Pricing Tiers
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                            {tiers.length} tier{tiers.length === 1 ? '' : 's'} · powers the public /pricing page
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                        <Icon.Plus className="w-4 h-4" /> New Tier
                    </button>
                </motion.div>

                <div className="flex-1 flex gap-4 min-h-0">
                    {/* ── List ── */}
                    <div className="w-80 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
                            ) : tiers.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">No tiers yet.</p>
                            ) : (
                                tiers.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => select(t)}
                                        className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${
                                            selected?.id === t.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''
                                        }`}
                                    >
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                                            {t.name}
                                            {t.highlight && <Icon.Star className="w-3.5 h-3.5 text-accent" />}
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {t.price} · {t.cadence} · {t.status}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Editor ── */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {!selected ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Icon.Sparkle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Select a tier to edit, or create a new one.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                                    <input
                                        value={draft.name}
                                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                                        className="flex-1 min-w-0 px-3 py-2 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent"
                                        placeholder="Tier name"
                                    />
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors" title="Delete">
                                            <Icon.Trash className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleSave} disabled={!dirty || saving} className="flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50 transition-colors">
                                            <Icon.Save className="w-4 h-4" />
                                            {saving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Price</label>
                                            <input value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} className={inputClass} placeholder="e.g. ₦1.2M" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cadence</label>
                                            <input value={draft.cadence} onChange={(e) => setDraft({ ...draft, cadence: e.target.value })} className={inputClass} placeholder="e.g. one-time / month / engagement" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className={labelClass}>Status</label>
                                            <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className={inputClass}>
                                                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Display order</label>
                                            <input type="number" min="0" value={draft.display_order} onChange={(e) => setDraft({ ...draft, display_order: e.target.value })} className={inputClass} />
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none h-[44px]">
                                                <input
                                                    type="checkbox"
                                                    checked={!!draft.highlight}
                                                    onChange={(e) => setDraft({ ...draft, highlight: e.target.checked })}
                                                    className="w-4 h-4 accent-accent"
                                                />
                                                Mark as "Most popular"
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={inputClass} rows={2} placeholder="1-2 sentence summary" />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Features (one per line)</label>
                                        <textarea value={featuresInput} onChange={(e) => setFeaturesInput(e.target.value)} className={`${inputClass} font-mono text-xs`} rows={8} placeholder={'1-page responsive site\nContact form + email\nCloudinary image hosting'} />
                                    </div>

                                    {/* Live preview */}
                                    <div className="pt-2">
                                        <label className={labelClass}>Preview</label>
                                        <div className={`rounded-2xl p-6 border ${draft.highlight ? 'border-accent bg-accent/5' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                                            {draft.highlight && (
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">Most popular</span>
                                            )}
                                            <h3 className="text-2xl font-extrabold font-heading mt-1">{draft.name || 'Tier name'}</h3>
                                            <p className="text-3xl font-extrabold mt-3 mb-1">{draft.price || '—'}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{draft.cadence}</p>
                                            {draft.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 font-body">{draft.description}</p>
                                            )}
                                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200 font-body">
                                                {featuresInput.split('\n').map((s) => s.trim()).filter(Boolean).map((f, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-accent mt-0.5">✓</span> {f}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Create modal ── */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.form
                            initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 12 }}
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={handleCreate}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg p-6 space-y-3 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-lg font-extrabold font-heading flex items-center gap-2">
                                    <Icon.Sparkle className="w-5 h-5 text-accent" /> New Tier
                                </h2>
                                <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-700">
                                    <Icon.X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <label className={labelClass}>Name</label>
                                <input value={newDraft.name} onChange={(e) => setNewDraft({ ...newDraft, name: e.target.value })} className={inputClass} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Price</label>
                                    <input value={newDraft.price} onChange={(e) => setNewDraft({ ...newDraft, price: e.target.value })} className={inputClass} placeholder="e.g. ₦500k" required />
                                </div>
                                <div>
                                    <label className={labelClass}>Cadence</label>
                                    <input value={newDraft.cadence} onChange={(e) => setNewDraft({ ...newDraft, cadence: e.target.value })} className={inputClass} placeholder="one-time" />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={newDraft.description} onChange={(e) => setNewDraft({ ...newDraft, description: e.target.value })} className={inputClass} rows={2} />
                            </div>
                            <button type="submit" className="w-full bg-accent hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">
                                Create Tier
                            </button>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPricing;
