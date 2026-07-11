// ─── src/pages/admin/AdminCMS.jsx ────────────────────────
// Phase 4 — CMS pages admin (list + edit + create).
//
// Single-page layout: left = pages list, right = editor.
// The editor has a Markdown textarea + a live rendered preview
// side-by-side so the admin can see the public output while
// they type.
//
// `Hero image` accepts either a URL pasted in OR an upload
// through the existing `/api/upload` endpoint (which now also
// has a mocked fallback for environments without Cloudinary).
// ──────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { renderMarkdown } from '../../utils/markdown';

const Icon = {
    Plus: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    Trash: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
    Save: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    Eye: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    Upload: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const emptyDraft = { slug: '', title: '', body: '', hero_image: '', meta_description: '', status: 'DRAFT' };

const AdminCMS = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [edit, setEdit] = useState(emptyDraft);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all');
    const [uploadingHero, setUploadingHero] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const fetchPages = async () => {
        setLoading(true);
        const res = await api.get('/cms/pages', { params: { status: 'all' } });
        if (res.ok) setPages(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    };

    useEffect(() => { fetchPages(); }, []);

    const filtered = useMemo(() => {
        if (filter === 'all') return pages;
        return pages.filter(p => p.status === filter);
    }, [pages, filter]);

    const startNew = () => {
        setSelected(null);
        setEdit(emptyDraft);
    };

    const startEdit = (p) => {
        setSelected(p);
        setEdit({
            slug: p.slug || '',
            title: p.title || '',
            body: p.body || '',
            hero_image: p.hero_image || '',
            meta_description: p.meta_description || '',
            status: p.status || 'DRAFT',
        });
    };

    const handleSave = async () => {
        if (!edit.slug || !edit.title) {
            notify.error('Slug and title are required.');
            return;
        }
        setSaving(true);
        const res = selected
            ? await api.put(`/cms/pages/${selected.id}`, edit)
            : await api.post('/cms/pages', edit);
        setSaving(false);
        if (res.ok) {
            notify.success(selected ? 'Page updated.' : 'Page created.');
            setSelected(res.data);
            setEdit({ ...edit, status: res.data.status });
            await fetchPages();
        } else {
            notify.error(res.error || 'Save failed.');
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm(`Delete the "${selected.title}" page? This cannot be undone.`)) return;
        const res = await api.delete(`/cms/pages/${selected.id}`);
        if (res.ok) {
            notify.success('Page deleted.');
            startNew();
            await fetchPages();
        } else {
            notify.error(res.error || 'Delete failed.');
        }
    };

    const handleHeroUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingHero(true);
        const res = await api.upload('/upload', file);
        setUploadingHero(false);
        if (res.ok) {
            setEdit({ ...edit, hero_image: res.data.url });
            notify.success(res.data.mocked ? 'Image stored locally (no Cloudinary).' : 'Image uploaded.');
        } else {
            notify.error(res.error || 'Upload failed.');
        }
    };

    const isDirty = selected
        ? edit.slug !== selected.slug ||
          edit.title !== selected.title ||
          edit.body !== (selected.body || '') ||
          edit.hero_image !== (selected.hero_image || '') ||
          edit.meta_description !== (selected.meta_description || '') ||
          edit.status !== selected.status
        : edit.slug || edit.title || edit.body;

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="max-w-[1600px] mx-auto w-full flex flex-col h-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                                CMS
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                                {pages.length} page{pages.length === 1 ? '' : 's'} · powers /resources, /portfolio, /pricing
                            </p>
                        </div>
                        <button
                            onClick={startNew}
                            className="inline-flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md"
                        >
                            <Icon.Plus className="w-4 h-4" /> New Page
                        </button>
                    </div>
                </motion.div>

                <div className="flex-1 flex gap-4 min-h-0">
                    {/* List */}
                    <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 flex gap-1.5 flex-wrap">
                            {['all', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 rounded ${
                                        filter === s ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
                            ) : filtered.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">No pages yet.</p>
                            ) : (
                                filtered.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => startEdit(p)}
                                        className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${
                                            selected?.id === p.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.title}</p>
                                            <span className={`shrink-0 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                                p.status === 'PUBLISHED' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                                                p.status === 'ARCHIVED' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' :
                                                'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                            }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">/{p.slug}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">
                                {selected ? `Editing /${selected.slug}` : 'New page'}
                            </h2>
                            <div className="flex items-center gap-2">
                                {selected && (
                                    <button onClick={handleDelete} className="text-red-500 hover:text-red-600 p-1.5" title="Delete">
                                        <Icon.Trash className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-accent"
                                >
                                    <Icon.Eye className="w-4 h-4" /> {showPreview ? 'Hide' : 'Show'} Preview
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!isDirty || saving}
                                    className="flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50"
                                >
                                    <Icon.Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </div>

                        <div className={`flex-1 grid ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'} min-h-0`}>
                            <div className="p-4 space-y-3 overflow-y-auto border-r border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Slug</label>
                                        <input
                                            value={edit.slug}
                                            onChange={(e) => setEdit({ ...edit, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                                            placeholder="resources"
                                            className={`${inputClass} font-mono`}
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1">URL: /{edit.slug || 'your-slug'}</p>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })} className={inputClass}>
                                            <option>DRAFT</option>
                                            <option>PUBLISHED</option>
                                            <option>ARCHIVED</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Title</label>
                                    <input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Resources" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Meta description</label>
                                    <input value={edit.meta_description} onChange={(e) => setEdit({ ...edit, meta_description: e.target.value })} maxLength={300} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Hero image</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={edit.hero_image}
                                            onChange={(e) => setEdit({ ...edit, hero_image: e.target.value })}
                                            placeholder="https://… or upload below"
                                            className={inputClass}
                                        />
                                        <label className="shrink-0 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-accent hover:text-white px-3 py-2.5 rounded-xl transition-colors">
                                            <input type="file" accept="image/*" onChange={handleHeroUpload} className="hidden" />
                                            <Icon.Upload className="w-4 h-4" />
                                        </label>
                                    </div>
                                    {edit.hero_image && (
                                        <div className="mt-2 relative">
                                            <img src={edit.hero_image} alt="hero" className="w-full h-32 object-cover rounded-lg" />
                                            <button onClick={() => setEdit({ ...edit, hero_image: '' })} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded">
                                                <Icon.X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                    {uploadingHero && <p className="text-xs text-gray-400 mt-1">Uploading…</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Body (Markdown)</label>
                                    <textarea
                                        value={edit.body}
                                        onChange={(e) => setEdit({ ...edit, body: e.target.value })}
                                        rows={20}
                                        className={`${inputClass} font-mono text-xs`}
                                        placeholder={`# Heading\n\nWrite your page in **Markdown**.\n\n- bullet\n- another\n\n[link](https://example.com)`}
                                    />
                                </div>
                            </div>

                            {showPreview && (
                                <div className="p-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Live preview</p>
                                    {edit.hero_image && (
                                        <img src={edit.hero_image} alt="hero" className="w-full h-40 object-cover rounded-xl mb-4" />
                                    )}
                                    <h1 className="text-3xl font-extrabold font-heading mb-2">{edit.title || 'Untitled'}</h1>
                                    {edit.meta_description && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{edit.meta_description}</p>
                                    )}
                                    <article
                                        className="prose-content text-gray-800 dark:text-gray-200 font-body"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(edit.body || '*Nothing to preview yet.*') }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCMS;
