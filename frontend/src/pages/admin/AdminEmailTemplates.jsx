// ─── src/pages/admin/AdminEmailTemplates.jsx ────────────
// Phase 3 — Email template editor.
//
// Features:
//   - List of templates on the left
//   - Editor on the right with subject + body
//   - Live preview using sample data (or current values)
//   - Placeholder detection (`{{client_name}}` etc.)
//   - Send-test-to-self button (Owner only)
//
// The placeholders list shown in the UI is auto-derived from
// the subject + body of the template; the server also stores
// its own authoritative list in `email_templates.placeholders`.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    Plus:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y1="12"/></svg>,
    Trash:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
    Save:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    Mail:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    Sparkle:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.9 5.7L19 10l-5.1 1.4L12 17l-1.9-5.6L5 10l5.1-1.3L12 3z"/></svg>,
    X:      (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Eye:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
};

const PLACEHOLDER_RE = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

// Default sample values — used when a placeholder isn't in the
// `sampleData` form below. The preview sidebar shows what the
// template would look like fully rendered.
const DEFAULT_SAMPLE = {
    client_name: 'Mr. Adekunle',
    project_name: 'buildwithlami.com Platform',
    amount: '₦1,500,000',
    invoice_number: 'INV-2026-0042',
    payment_url: 'https://paystack.com/pay/abc123',
    live_url: 'https://buildwithlami.com',
};

function extractPlaceholders(text) {
    if (typeof text !== 'string') return [];
    const set = new Set();
    let m;
    PLACEHOLDER_RE.lastIndex = 0;
    while ((m = PLACEHOLDER_RE.exec(text)) !== null) {
        set.add(m[1]);
    }
    return Array.from(set);
}

function renderPreview(text, data) {
    if (typeof text !== 'string') return '';
    return text.replace(PLACEHOLDER_RE, (match, key) => {
        const v = (data && data[key]) ?? DEFAULT_SAMPLE[key] ?? match;
        return v;
    });
}

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const AdminEmailTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [editName, setEditName] = useState('');
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [sampleData, setSampleData] = useState({ ...DEFAULT_SAMPLE });
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const fetchTemplates = async () => {
        setLoading(true);
        const res = await api.get('/email-templates');
        if (res.ok) {
            setTemplates(Array.isArray(res.data) ? res.data : []);
            if (!selected && res.data?.length) {
                selectTemplate(res.data[0]);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectTemplate = (t) => {
        setSelected(t);
        setEditName(t.name || '');
        setEditSubject(t.subject || '');
        setEditBody(t.body || '');
        setDirty(false);
    };

    // Detect any change to mark dirty.
    useEffect(() => {
        if (!selected) return;
        const dirtyNow =
            editName !== selected.name ||
            editSubject !== selected.subject ||
            editBody !== selected.body;
        setDirty(dirtyNow);
    }, [editName, editSubject, editBody, selected]);

    const detectedPlaceholders = useMemo(() => {
        return Array.from(new Set([
            ...extractPlaceholders(editSubject),
            ...extractPlaceholders(editBody),
        ]));
    }, [editSubject, editBody]);

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        const res = await api.put(`/email-templates/${selected.id}`, {
            name: editName,
            subject: editSubject,
            body: editBody,
            placeholders: detectedPlaceholders,
        });
        setSaving(false);
        if (res.ok) {
            notify.success('Template saved.');
            setTemplates(prev => prev.map(t => t.id === res.data.id ? res.data : t));
            setSelected(res.data);
            setDirty(false);
        } else {
            notify.error(res.error || 'Failed to save.');
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!window.confirm(`Delete the "${selected.name}" template? This cannot be undone.`)) return;
        const res = await api.delete(`/email-templates/${selected.id}`);
        if (res.ok) {
            notify.success('Template deleted.');
            const remaining = templates.filter(t => t.id !== selected.id);
            setTemplates(remaining);
            setSelected(remaining[0] || null);
            if (remaining[0]) selectTemplate(remaining[0]);
        } else {
            notify.error(res.error || 'Failed to delete.');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        setCreating(true);
        const res = await api.post('/email-templates', {
            name: newName.trim(),
            subject: 'New template — edit me',
            body: 'Hi {{client_name}},\n\nThis is a brand new template. Edit me!\n\n— The BuildWithLami team',
            placeholders: ['client_name'],
        });
        setCreating(false);
        if (res.ok) {
            notify.success('Template created.');
            setTemplates(prev => [...prev, res.data]);
            selectTemplate(res.data);
            setNewName('');
        } else {
            notify.error(res.error || 'Failed to create template.');
        }
    };

    const handleSendTest = async () => {
        if (!selected) return;
        const testEmail = window.prompt('Send a test render to which email?', 'eugeneodibenuah@gmail.com');
        if (!testEmail) return;
        const res = await api.post(`/email-templates/${selected.id}/send`, {
            to: testEmail,
            data: sampleData,
        });
        if (res.ok) {
            notify.success(res.data.mocked ? 'Test render logged (SMTP not configured).' : `Test email sent to ${testEmail}.`);
        } else {
            notify.error(res.error || 'Failed to send test.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="max-w-[1600px] mx-auto w-full flex flex-col h-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                        Email Templates
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                        {templates.length} template{templates.length === 1 ? '' : 's'} · use <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-accent">{'{{placeholder}}'}</code> for dynamic content
                    </p>
                </motion.div>

                <div className="flex-1 flex gap-4 min-h-0">
                    {/* ── List ── */}
                    <div className="w-72 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <form onSubmit={handleCreate} className="p-3 border-b border-gray-100 dark:border-gray-700 flex gap-2">
                            <input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="New template name…"
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                                type="submit"
                                disabled={creating || !newName.trim()}
                                className="bg-accent hover:bg-orange-600 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
                                title="Create template"
                            >
                                <Icon.Plus className="w-4 h-4" />
                            </button>
                        </form>
                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
                            ) : templates.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-400">No templates yet.</p>
                            ) : (
                                templates.map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => selectTemplate(t)}
                                        className={`w-full text-left p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors ${
                                            selected?.id === t.id ? 'bg-accent/5 border-l-2 border-l-accent' : ''
                                        }`}
                                    >
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{t.name}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{t.subject}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                            {(t.placeholders || []).length} placeholder{(t.placeholders || []).length === 1 ? '' : 's'}
                                        </p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ── Editor + preview ── */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {!selected ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <Icon.Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Select a template to edit, or create a new one.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="flex-1 min-w-0 px-3 py-2 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent"
                                        placeholder="Template name"
                                    />
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-accent transition-colors"
                                            title="Toggle preview"
                                        >
                                            <Icon.Eye className="w-4 h-4" />
                                            {showPreview ? 'Hide' : 'Show'} Preview
                                        </button>
                                        <button
                                            onClick={handleSendTest}
                                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                            title="Send a test render"
                                        >
                                            <Icon.Mail className="w-4 h-4" /> Test
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                                            title="Delete template"
                                        >
                                            <Icon.Trash className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={!dirty || saving}
                                            className="flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50 transition-colors"
                                        >
                                            <Icon.Save className="w-4 h-4" />
                                            {saving ? 'Saving…' : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                <div className={`flex-1 grid ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'} min-h-0`}>
                                    <div className="p-4 space-y-3 overflow-y-auto border-r border-gray-100 dark:border-gray-700">
                                        <div>
                                            <label className={labelClass}>Subject</label>
                                            <input
                                                value={editSubject}
                                                onChange={(e) => setEditSubject(e.target.value)}
                                                className={inputClass}
                                                placeholder="e.g. Welcome to {{project_name}}!"
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Body</label>
                                            <textarea
                                                value={editBody}
                                                onChange={(e) => setEditBody(e.target.value)}
                                                rows={16}
                                                className={`${inputClass} font-mono text-xs`}
                                                placeholder="Hi {{client_name}},&#10;&#10;Welcome aboard!&#10;&#10;— The BuildWithLami team"
                                            />
                                        </div>
                                        {detectedPlaceholders.length > 0 && (
                                            <div>
                                                <label className={labelClass}>Detected placeholders</label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {detectedPlaceholders.map(p => (
                                                        <code key={p} className="text-[10px] font-extrabold uppercase tracking-wider bg-accent/10 text-accent px-2 py-1 rounded">
                                                            {`{{${p}}}`}
                                                        </code>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {showPreview && (
                                        <div className="p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30">
                                            <label className={labelClass}>Sample data</label>
                                            <div className="space-y-2 mb-4">
                                                {detectedPlaceholders.map(p => (
                                                    <div key={p}>
                                                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{p}</label>
                                                        <input
                                                            value={sampleData[p] || ''}
                                                            onChange={(e) => setSampleData({ ...sampleData, [p]: e.target.value })}
                                                            placeholder={DEFAULT_SAMPLE[p] || `{{${p}}}`}
                                                            className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent"
                                                        />
                                                    </div>
                                                ))}
                                                {detectedPlaceholders.length === 0 && (
                                                    <p className="text-xs text-gray-400">Add a <code className="text-accent">{'{{placeholder}}'}</code> to see sample fields here.</p>
                                                )}
                                            </div>

                                            <label className={labelClass}>Live preview</label>
                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-extrabold">Subject</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
                                                        {renderPreview(editSubject, sampleData)}
                                                    </p>
                                                </div>
                                                <div className="p-4">
                                                    <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-body leading-relaxed">
                                                        {renderPreview(editBody, sampleData)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEmailTemplates;
