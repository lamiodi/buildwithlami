// ─── src/pages/admin/AdminTestimonials.jsx ───────────────
// Phase 4 — Testimonials admin.
//
// List, filter by division, create / edit / delete / toggle
// `is_featured`. Featured testimonials surface on the home
// page and on /survey and /drone.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

import { ActionIcon, MiscIcon } from '../../data/adminIcons.jsx';

const Icon = {
    Plus: ActionIcon.Plus,
    Trash: ActionIcon.Trash,
    Star: MiscIcon.Star,
    X: ActionIcon.X,
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const emptyDraft = { client_name: '', division: 'SOFTWARE', quote: '', avatar_url: '', is_featured: false };

const AdminTestimonials = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [draft, setDraft] = useState(emptyDraft);
    const [filter, setFilter] = useState('all');
    const [divisionFilter, setDivisionFilter] = useState('all');

    const fetch = async () => {
        setLoading(true);
        const params = {};
        if (divisionFilter !== 'all') {
            params.division = divisionFilter;
        }
        const res = await api.get('/cms/testimonials', { params });
        if (res.ok) setItems(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    };

    useEffect(() => { fetch(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [divisionFilter]);

    const startNew = () => { setEditing(null); setDraft(emptyDraft); };
    const startEdit = (t) => {
        setEditing(t);
        setDraft({
            client_name: t.client_name || '',
            division: t.division || 'SOFTWARE',
            quote: t.quote || '',
            avatar_url: t.avatar_url || '',
            is_featured: !!t.is_featured,
        });
    };

    const save = async () => {
        if (!draft.client_name || !draft.quote) {
            notify.error('Name and quote are required.');
            return;
        }
        const res = editing
            ? await api.put(`/cms/testimonials/${editing.id}`, draft)
            : await api.post('/cms/testimonials', draft);
        if (res.ok) {
            notify.success(editing ? 'Testimonial updated.' : 'Testimonial created.');
            startNew();
            await fetch();
        } else {
            notify.error(res.error || 'Save failed.');
        }
    };

    const remove = async (t) => {
        if (!window.confirm(`Delete testimonial from "${t.client_name}"?`)) return;
        const res = await api.delete(`/cms/testimonials/${t.id}`);
        if (res.ok) { notify.success('Deleted.'); if (editing?.id === t.id) startNew(); await fetch(); }
        else notify.error(res.error || 'Delete failed.');
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const res = await api.upload('/upload', file);
        if (res.ok) {
            setDraft({ ...draft, avatar_url: res.data.url });
            notify.success(res.data.mocked ? 'Image stored locally (no Cloudinary).' : 'Image uploaded.');
        } else {
            notify.error(res.error || 'Upload failed.');
        }
    };

    const filtered = filter === 'all' ? items : items.filter(t => t.division === filter);

    return (
        <div className="max-w-[1400px] mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">Testimonials</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">{items.length} quote{items.length === 1 ? '' : 's'} · featured ones show on the home page</p>
            </motion.div>

            <div className="grid md:grid-cols-[1fr_400px] gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex items-center gap-1.5 flex-wrap">
                        {['all', 'SOFTWARE', 'SURVEY', 'DRONE'].map(d => (
                            <button key={d} onClick={() => setFilter(d)} className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded ${filter === d ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                                {d}
                            </button>
                        ))}
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? <p className="p-6 text-center text-sm text-gray-400">Loading…</p> :
                         filtered.length === 0 ? <p className="p-6 text-center text-sm text-gray-400">No testimonials yet.</p> :
                         filtered.map(t => (
                            <div key={t.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer flex items-start gap-3 ${editing?.id === t.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''}`} onClick={() => startEdit(t)}>
                                {t.avatar_url ? <img src={t.avatar_url} alt={t.client_name} className="w-10 h-10 rounded-full object-cover shrink-0" /> :
                                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-bold shrink-0">{t.client_name?.charAt(0).toUpperCase()}</div>}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{t.client_name}</p>
                                        {t.is_featured && <Icon.Star className="w-3.5 h-3.5 text-amber-500" />}
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400">{t.division}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{t.quote}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); remove(t); }} className="text-red-400 hover:text-red-600 p-1 shrink-0">
                                    <Icon.Trash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3 h-fit sticky top-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">{editing ? 'Edit testimonial' : 'New testimonial'}</h2>
                        {editing && <button onClick={startNew} className="text-xs text-gray-500 hover:text-accent">New</button>}
                    </div>
                    <div>
                        <label className={labelClass}>Client name</label>
                        <input value={draft.client_name} onChange={(e) => setDraft({ ...draft, client_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Division</label>
                        <select value={draft.division} onChange={(e) => setDraft({ ...draft, division: e.target.value })} className={inputClass}>
                            <option>SOFTWARE</option>
                            <option>SURVEY</option>
                            <option>DRONE</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Quote</label>
                        <textarea value={draft.quote} onChange={(e) => setDraft({ ...draft, quote: e.target.value })} rows={5} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Avatar</label>
                        <div className="flex gap-2">
                            <input value={draft.avatar_url} onChange={(e) => setDraft({ ...draft, avatar_url: e.target.value })} placeholder="https://… or upload" className={inputClass} />
                            <label className="shrink-0 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-accent hover:text-white px-3 py-2.5 rounded-xl transition-colors">
                                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                ↑
                            </label>
                        </div>
                        {draft.avatar_url && (
                            <div className="mt-2 relative inline-block">
                                <img src={draft.avatar_url} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                                <button onClick={() => setDraft({ ...draft, avatar_url: '' })} className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full">
                                    <Icon.X className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!draft.is_featured} onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })} className="w-4 h-4 accent-accent" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Featured (show on home)</span>
                    </label>
                    <button onClick={save} className="w-full bg-accent hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl">
                        {editing ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTestimonials;
