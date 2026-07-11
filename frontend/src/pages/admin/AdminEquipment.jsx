// ─── src/pages/admin/AdminEquipment.jsx ──────────────────
// Phase 4 — Equipment admin (Survey + Drone gear).
//
// Two columns (one per division), each a sortable list. Drag
// the order handle to reorder; saves `display_order` on the
// backend via a quick PATCH.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
    X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const emptyDraft = { name: '', division: 'SURVEY', description: '', image_url: '', display_order: 0 };

const AdminEquipment = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draft, setDraft] = useState(emptyDraft);
    const [editingId, setEditingId] = useState(null);

    const fetch = async () => {
        setLoading(true);
        const res = await api.get('/cms/equipment');
        if (res.ok) setItems(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const startNew = (division = 'SURVEY') => {
        setEditingId(null);
        setDraft({ ...emptyDraft, division });
    };

    const startEdit = (e) => {
        setEditingId(e.id);
        setDraft({
            name: e.name || '',
            division: e.division || 'SURVEY',
            description: e.description || '',
            image_url: e.image_url || '',
            display_order: e.display_order || 0,
        });
    };

    const save = async () => {
        if (!draft.name) { notify.error('Name is required.'); return; }
        const body = { ...draft, display_order: Number(draft.display_order) || 0 };
        const res = editingId
            ? await api.put(`/cms/equipment/${editingId}`, body)
            : await api.post('/cms/equipment', body);
        if (res.ok) {
            notify.success(editingId ? 'Updated.' : 'Created.');
            startNew(draft.division);
            await fetch();
        } else {
            notify.error(res.error || 'Save failed.');
        }
    };

    const remove = async (e) => {
        if (!window.confirm(`Delete "${e.name}"?`)) return;
        const res = await api.delete(`/cms/equipment/${e.id}`);
        if (res.ok) { notify.success('Deleted.'); if (editingId === e.id) startNew(); await fetch(); }
        else notify.error(res.error || 'Delete failed.');
    };

    const handleImageUpload = async (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        const res = await api.upload('/upload', file);
        if (res.ok) {
            setDraft({ ...draft, image_url: res.data.url });
            notify.success(res.data.mocked ? 'Image stored locally (no Cloudinary).' : 'Image uploaded.');
        } else {
            notify.error(res.error || 'Upload failed.');
        }
    };

    const survey = items.filter(i => i.division === 'SURVEY');
    const drone = items.filter(i => i.division === 'DRONE');

    return (
        <div className="max-w-[1500px] mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">Equipment</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">{items.length} item{items.length === 1 ? '' : 's'} · shown on /survey and /drone</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4">
                {['SURVEY', 'DRONE'].map(div => (
                    <div key={div} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                            <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-700 dark:text-gray-200">{div === 'SURVEY' ? '🛰️ Survey' : '✈️ Drone'}</h2>
                            <button onClick={() => startNew(div)} className="text-accent hover:text-orange-600 p-1" title="Add"><Icon.Plus className="w-4 h-4" /></button>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? <p className="p-6 text-center text-sm text-gray-400">Loading…</p> :
                             (div === 'SURVEY' ? survey : drone).length === 0 ? <p className="p-6 text-center text-sm text-gray-400">No items.</p> :
                             (div === 'SURVEY' ? survey : drone).map(e => (
                                <div key={e.id} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer flex items-start gap-3 ${editingId === e.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`} onClick={() => startEdit(e)}>
                                    {e.image_url ? <img src={e.image_url} alt={e.name} className="w-12 h-12 rounded-lg object-cover shrink-0" /> :
                                     <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 shrink-0" />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{e.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{e.description || '—'}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">order #{e.display_order}</p>
                                    </div>
                                    <button onClick={(ev) => { ev.stopPropagation(); remove(e); }} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                                        <Icon.Trash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3 h-fit sticky top-4">
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{editingId ? 'Edit equipment' : 'New equipment'}</h2>
                    <div>
                        <label className={labelClass}>Name</label>
                        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Division</label>
                        <select value={draft.division} onChange={(e) => setDraft({ ...draft, division: e.target.value })} className={inputClass}>
                            <option>SURVEY</option>
                            <option>DRONE</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={3} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Image</label>
                        <div className="flex gap-2">
                            <input value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://… or upload" className={inputClass} />
                            <label className="shrink-0 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-accent hover:text-white px-3 py-2.5 rounded-xl transition-colors">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />↑
                            </label>
                        </div>
                        {draft.image_url && (
                            <div className="mt-2 relative inline-block">
                                <img src={draft.image_url} alt="equipment" className="w-20 h-20 rounded-lg object-cover" />
                                <button onClick={() => setDraft({ ...draft, image_url: '' })} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full"><Icon.X className="w-3 h-3" /></button>
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
                        {editingId && <button onClick={() => startNew(draft.division)} className="px-3 py-2.5 border border-gray-200 dark:border-gray-700 text-sm font-bold rounded-xl">New</button>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEquipment;
