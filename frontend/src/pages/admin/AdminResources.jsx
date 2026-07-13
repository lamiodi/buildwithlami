// ─── src/pages/admin/AdminResources.jsx ──────────────────
// Knowledge-base article manager (Phase 11 — content cleanup).
//
// CRUD on the `resources` table that powers the public
// /resources page. Mirrors the v12 schema + v28 additions
// (display_order, cover_image, reading_time).
//
// Surface: split-pane list on the left, editor on the right.
// Save is explicit (Save button) to keep accidental edits
// from leaking into the public site.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { ActionIcon, CoreIcon, MiscIcon } from '../../data/adminIcons.jsx';

const Icon = {
    Plus: ActionIcon.Plus,
    Trash: ActionIcon.Trash,
    Save: ActionIcon.Save,
    X: ActionIcon.X,
    Book: CoreIcon.FileText,
    Sparkle: MiscIcon.Sparkle,
};

const STATUS_OPTIONS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

const emptyDraft = {
    slug: '',
    title: '',
    excerpt: '',
    body: '',
    hero_image: '',
    cover_image: '',
    category: '',
    tags: [],
    status: 'DRAFT',
    display_order: 0,
    reading_time: '',
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [draft, setDraft] = useState(emptyDraft);
    const [tagsInput, setTagsInput] = useState('');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newDraft, setNewDraft] = useState({ ...emptyDraft });

    const load = async () => {
        setLoading(true);
        const res = await api.get('/resources/admin');
        if (res.ok) {
            setResources(Array.isArray(res.data) ? res.data : []);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const select = (r) => {
        setSelected(r);
        setDraft({
            slug: r.slug || '',
            title: r.title || '',
            excerpt: r.excerpt || '',
            body: r.body || '',
            hero_image: r.hero_image || '',
            cover_image: r.cover_image || '',
            category: r.category || '',
            tags: r.tags || [],
            status: r.status || 'DRAFT',
            display_order: r.display_order ?? 0,
            reading_time: r.reading_time || '',
        });
        setTagsInput((r.tags || []).join(', '));
        setDirty(false);
    };

    // Mark dirty on any change.
    useEffect(() => {
        if (!selected) return;
        const original = {
            slug: selected.slug || '',
            title: selected.title || '',
            excerpt: selected.excerpt || '',
            body: selected.body || '',
            hero_image: selected.hero_image || '',
            cover_image: selected.cover_image || '',
            category: selected.category || '',
            tags: selected.tags || [],
            status: selected.status || 'DRAFT',
            display_order: selected.display_order ?? 0,
            reading_time: selected.reading_time || '',
        };
        const tagsNow = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
        const dirtyNow = JSON.stringify({ ...draft, tags: tagsNow }) !== JSON.stringify(original);
        setDirty(dirtyNow);
    }, [draft, tagsInput, selected]);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        const payload = {
            ...draft,
            tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
            hero_image: draft.hero_image || null,
            cover_image: draft.cover_image || null,
            excerpt: draft.excerpt || null,
            body: draft.body || null,
            category: draft.category || null,
            reading_time: draft.reading_time || null,
            display_order: Number(draft.display_order) || 0,
        };
        const res = await api.put(`/resources/${selected.id}`, payload);
        setSaving(false);
        if (res.ok) {
            notify.success('Resource saved.');
            setResources(prev => prev.map(r => r.id === res.data.id ? res.data : r));
            setSelected(res.data);
            setDirty(false);
        } else {
            notify.error(res.error || 'Failed to save.');
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm(`Delete "${selected.title}"? This cannot be undone.`)) return;
        const res = await api.delete(`/resources/${selected.id}`);
        if (res.ok) {
            notify.success('Resource deleted.');
            const remaining = resources.filter(r => r.id !== selected.id);
            setResources(remaining);
            setSelected(remaining[0] || null);
            if (remaining[0]) select(remaining[0]);
        } else {
            notify.error(res.error || 'Failed to delete.');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newDraft.title.trim() || !newDraft.slug.trim()) {
            notify.error('Title and slug are required.');
            return;
        }
        const res = await api.post('/resources', {
            ...newDraft,
            tags: (newDraft.tags || []).filter(Boolean),
            status: newDraft.status || 'DRAFT',
        });
        if (res.ok) {
            notify.success('Resource created.');
            setResources(prev => [...prev, res.data]);
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
                            Resources
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                            {resources.length} article{resources.length === 1 ? '' : 's'} · powers the public /resources page
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                        <Icon.Plus className="w-4 h-4" /> New Article
                    </button>
                </motion.div>

                <div className="flex-1 flex gap-4 min-h-0">
                    {/* ── List ── */}
                    <div className="w-80 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
                            ) : resources.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">No resources yet.</p>
                            ) : (
                                resources.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => select(r)}
                                        className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${
                                            selected?.id === r.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''
                                        }`}
                                    >
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{r.title}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{r.category || '—'} · {r.status}</p>
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
                                    <Icon.Book className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Select a resource to edit, or create a new one.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                                    <input
                                        value={draft.title}
                                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                        className="flex-1 min-w-0 px-3 py-2 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent"
                                        placeholder="Article title"
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
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                            <label className={labelClass}>Slug</label>
                                            <input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className={inputClass} placeholder="kebab-case-slug" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Category</label>
                                            <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className={inputClass} placeholder="e.g. Strategy" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Reading time</label>
                                            <input value={draft.reading_time} onChange={(e) => setDraft({ ...draft, reading_time: e.target.value })} className={inputClass} placeholder="e.g. 5 min" />
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
                                        <div>
                                            <label className={labelClass}>Tags (comma separated)</label>
                                            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className={inputClass} placeholder="e.g. software, retention" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Excerpt</label>
                                        <textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className={inputClass} rows={2} placeholder="1-2 sentence summary" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Hero image URL</label>
                                            <input value={draft.hero_image} onChange={(e) => setDraft({ ...draft, hero_image: e.target.value })} className={inputClass} placeholder="https://…" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cover image URL</label>
                                            <input value={draft.cover_image} onChange={(e) => setDraft({ ...draft, cover_image: e.target.value })} className={inputClass} placeholder="https://…" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Body (Markdown supported)</label>
                                        <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} className={`${inputClass} font-mono text-xs`} rows={14} placeholder="Write the article…" />
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
                                    <Icon.Sparkle className="w-5 h-5 text-accent" /> New Article
                                </h2>
                                <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-700">
                                    <Icon.X className="w-5 h-5" />
                                </button>
                            </div>
                            <div>
                                <label className={labelClass}>Title</label>
                                <input value={newDraft.title} onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value, slug: newDraft.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Slug</label>
                                <input value={newDraft.slug} onChange={(e) => setNewDraft({ ...newDraft, slug: e.target.value })} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Category</label>
                                <input value={newDraft.category} onChange={(e) => setNewDraft({ ...newDraft, category: e.target.value })} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Excerpt</label>
                                <textarea value={newDraft.excerpt} onChange={(e) => setNewDraft({ ...newDraft, excerpt: e.target.value })} className={inputClass} rows={2} />
                            </div>
                            <button type="submit" className="w-full bg-accent hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-lg transition-colors">
                                Create Article
                            </button>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminResources;
