// ─── src/pages/admin/AdminIndustries.jsx ─────────────────
// Phase 4 — Industries admin (Drone verticals).
//
// Simple CRUD: name, description, icon (emoji or URL), sample
// image, display order.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    Trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
    X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const emptyDraft = { name: '', description: '', icon: '', sample_image: '', display_order: 0 };

const AdminIndustries = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState(emptyDraft);
    const [editingId, setEditingId] = useState(null);

    const fetch = async () => {
        setLoading(true);
        const res = await api.get('/cms/industries');
        if (res.ok) setItems(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const startNew = () => { setEditingId(null); setDraft(emptyDraft); };
    const startEdit = (e) => {
        setEditingId(e.id);
        setDraft({
            name: e.name || '',
            description: e.description || '',
            icon: e.icon || '',
            sample_image: e.sample_image || '',
            display_order: e.display_order || 0,
        });
    };

    const save = async () => {
        if (!draft.name) { notify.error('Name is required.'); return; }
        const body = { ...draft, display_order: Number(draft.display_order) || 0 };
        const res = editingId
            ? await api.put(`/cms/industries/${editingId}`, body)
            : await api.post('/cms/industries', body);
        if (res.ok) {
            notify.success(editingId ? 'Updated.' : 'Created.');
            startNew();
            await fetch();
        } else {
            notify.error(res.error || 'Save failed.');
        }
    };

    const remove = async (e) => {
        if (!window.confirm(`Delete "${e.name}"?`)) return;
        const res = await api.delete(`/cms/industries/${e.id}`);
        if (res.ok) { notify.success('Deleted.'); if (editingId === e.id) startNew(); await fetch(); }
        else notify.error(res.error || 'Delete failed.');
    };

    const handleImageUpload = async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        const res = await api.upload('/upload', file);
        if (res.ok) {
            setDraft({ ...draft, sample_image: res.data.url });
            notify.success(res.data.mocked ? 'Image stored locally (no Cloudinary).' : 'Image uploaded.');
        } else {
            notify.error(res.error || 'Upload failed.');
        }
    };

    return (
        <div className="max-w-[1500px] mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">Industries</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">{items.length} vertical{items.length === 1 ? '' : 's'} · shown on /drone</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-700 dark:text-gray-200">All industries</h2>
                        <button onClick={startNew} className="text-xs font-bold text-accent hover:text-orange-600">+ New</button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 p-3">
                        {loading ? <p className="p-6 text-center text-sm text-gray-400 col-span-full">Loading…</p> :
                         items.length === 0 ? <p className="p-6 text-center text-sm text-gray-400 col-span-full">No industries yet.</p> :
                         items.map(i => (
                            <div key={i.id} onClick={() => startEdit(i)} className={`p-3 rounded-xl border cursor-pointer hover:border-accent transition-colors flex gap-3 ${editingId === i.id ? 'border-accent bg-accent/5' : 'border-gray-100 dark:border-gray-700'}`}>
                                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-2xl shrink-0">
                                    {i.icon || '🏢'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{i.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{i.description || '—'}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">order #{i.display_order}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); remove(i); }} className="text-red-400 hover:text-red-600 p-1 shrink-0 self-start">
                                    <Icon.Trash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3 h-fit sticky top-4">
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{editingId ? 'Edit industry' : 'New industry'}</h2>
                    <div>
                        <label className={labelClass}>Name</label>
                        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Icon (emoji or URL)</label>
                        <input value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} placeholder="🏗️" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Sample image</label>
                        <div className="flex gap-2">
                            <input value={draft.sample_image} onChange={(e) => setDraft({ ...draft, sample_image: e.target.value })} placeholder="https://… or upload" className={inputClass} />
                            <label className="shrink-0 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-accent hover:text-white px-3 py-2.5 rounded-xl transition-colors">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />↑
                            </label>
                        </div>
                        {draft.sample_image && (
                            <div className="mt-2 relative inline-block">
                                <img src={draft.sample_image} alt="sample" className="w-20 h-20 rounded-lg object-cover" />
                                <button onClick={() => setDraft({ ...draft, sample_image: '' })} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"><Icon.X className="w-3 h-3" /></button>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className={labelClass}>Display order</label>
                        <input type="number" min="0" value={draft.display_order} onChange={(e) => setDraft({ ...draft, display_order: e.target.value })} className={inputClass} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={save} className="flex-1 bg-accent hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl">
                            {editingId ? 'Update' : 'Create'}
                        </button>
                        {editingId && <button onClick={startNew} className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl">New</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminIndustries;
