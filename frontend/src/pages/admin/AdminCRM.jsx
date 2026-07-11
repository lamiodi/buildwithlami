// ─── src/pages/admin/AdminCRM.jsx ────────────────────────
// Phase 3 — CRM Kanban.
//
// 8 columns matching the 8 stages from the backend
// (`crmController.js#CRM_STAGES`). Cards are drag-and-drop
// between columns; drops hit PATCH /api/crm/leads/:id/stage.
//
// Drag-and-drop uses the native HTML5 DnD API so we don't
// need a new dependency (@dnd-kit was specified in the
// roadmap but adds ~25 KB — overkill for a 8-column board).
// Each card carries `dataTransfer` payload with the lead id,
// and each column listens for `dragover` + `drop`.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

// ── 8 stages, in the canonical order. The backend's
//    CRM_STAGES is the source of truth — we keep this list
//    in sync manually because the frontend caches it on
//    first load and we don't want a network round-trip
//    before the first render.
const FALLBACK_STAGES = [
    { id: 'LEAD',        label: 'Lead',        color: 'blue' },
    { id: 'QUALIFIED',   label: 'Qualified',   color: 'cyan' },
    { id: 'PROPOSAL',    label: 'Proposal',    color: 'indigo' },
    { id: 'NEGOTIATION', label: 'Negotiation', color: 'amber' },
    { id: 'WON',         label: 'Won',         color: 'emerald' },
    { id: 'PROJECT',     label: 'Project',     color: 'purple' },
    { id: 'COMPLETED',   label: 'Completed',   color: 'teal' },
    { id: 'RETENTION',   label: 'Retention',   color: 'rose' },
];

// Tailwind class fragments per stage color. Centralised so
// the column header, count badge, and card borders all stay
// visually consistent.
const COLOR_CLASSES = {
    blue:    { ring: 'ring-blue-500/40',    bg: 'bg-blue-50 dark:bg-blue-900/20',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-800/50',    dot: 'bg-blue-500' },
    cyan:    { ring: 'ring-cyan-500/40',    bg: 'bg-cyan-50 dark:bg-cyan-900/20',    text: 'text-cyan-700 dark:text-cyan-300',    border: 'border-cyan-200 dark:border-cyan-800/50',    dot: 'bg-cyan-500' },
    indigo:  { ring: 'ring-indigo-500/40',  bg: 'bg-indigo-50 dark:bg-indigo-900/20',text: 'text-indigo-700 dark:text-indigo-300',border: 'border-indigo-200 dark:border-indigo-800/50',dot: 'bg-indigo-500' },
    amber:   { ring: 'ring-amber-500/40',   bg: 'bg-amber-50 dark:bg-amber-900/20',  text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-800/50',  dot: 'bg-amber-500' },
    emerald: { ring: 'ring-emerald-500/40', bg: 'bg-emerald-50 dark:bg-emerald-900/20',text:'text-emerald-700 dark:text-emerald-300',border:'border-emerald-200 dark:border-emerald-800/50',dot:'bg-emerald-500' },
    purple:  { ring: 'ring-purple-500/40',  bg: 'bg-purple-50 dark:bg-purple-900/20',text: 'text-purple-700 dark:text-purple-300',border: 'border-purple-200 dark:border-purple-800/50',dot: 'bg-purple-500' },
    teal:    { ring: 'ring-teal-500/40',    bg: 'bg-teal-50 dark:bg-teal-900/20',    text: 'text-teal-700 dark:text-teal-300',    border: 'border-teal-200 dark:border-teal-800/50',    dot: 'bg-teal-500' },
    rose:    { ring: 'ring-rose-500/40',    bg: 'bg-rose-50 dark:bg-rose-900/20',    text: 'text-rose-700 dark:text-rose-300',    border: 'border-rose-200 dark:border-rose-800/50',    dot: 'bg-rose-500' },
};

const DIVISION_BADGES = {
    SOFTWARE: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    SURVEY:   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    DRONE:    'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
};

const Icon = {
    Search:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    Plus:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y1="12"/></svg>,
    Mail:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    User:     (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    X:        (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    Check:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
    Arrow:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    Trash:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>,
    Sparkle:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3l1.9 5.7L19 10l-5.1 1.4L12 17l-1.9-5.6L5 10l5.1-1.3L12 3z"/><path d="M19 17l.7 2.1L22 19l-2.3.6L19 22l-.7-2.4L16 19l2.3-.5L19 17z"/></svg>,
    Filter:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

// ── Lead detail drawer ──────────────────────────────────
const LeadDrawer = ({ lead, stages, onClose, onUpdate, onConvert, onSendTemplate, templates }) => {
    const [notes, setNotes] = useState(lead?.notes || '');
    const [savingNotes, setSavingNotes] = useState(false);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);

    useEffect(() => {
        setNotes(lead?.notes || '');
    }, [lead?.id, lead?.notes]);

    if (!lead) return null;

    const handleSaveNotes = async () => {
        setSavingNotes(true);
        const res = await api.patch(`/crm/leads/${lead.id}`, { notes });
        setSavingNotes(false);
        if (res.ok) {
            notify.success('Notes saved.');
            onUpdate(res.data);
        } else {
            notify.error(res.error || 'Failed to save notes.');
        }
    };

    const handleMoveStage = async (newStage) => {
        if (newStage === lead.stage) return;
        const res = await api.patch(`/crm/leads/${lead.id}/stage`, { stage: newStage });
        if (res.ok) {
            notify.success(`Moved to ${stages.find(s => s.id === newStage)?.label || newStage}.`);
            onUpdate(res.data);
        } else {
            notify.error(res.error || 'Failed to move lead.');
        }
    };

    const handleConvert = async () => {
        if (!window.confirm('Convert this lead to a client? This creates a client record and marks the lead as WON.')) return;
        const res = await api.post(`/crm/leads/${lead.id}/convert`, {});
        if (res.ok) {
            notify.success(res.data.alreadyConverted ? 'Already converted.' : 'Lead converted to client.');
            onConvert(res.data.lead, res.data.client);
            onClose();
        } else {
            notify.error(res.error || 'Failed to convert lead.');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 flex justify-end"
                onClick={onClose}
            >
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="w-full max-w-md bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-start gap-3 sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-bold shrink-0">
                            {lead.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-extrabold text-gray-900 dark:text-white truncate">{lead.full_name}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.email}</p>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${DIVISION_BADGES[lead.division] || ''}`}>
                                    {lead.division}
                                </span>
                                {lead.source && (
                                    <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                        {lead.source}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                            <Icon.X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-5 space-y-5">
                        {/* Contact details */}
                        <section>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Contact</h3>
                            <div className="space-y-1.5 text-sm">
                                <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <Icon.Mail className="w-4 h-4 text-gray-400" />
                                    <a href={`mailto:${lead.email}`} className="hover:text-accent truncate">{lead.email}</a>
                                </p>
                                {lead.phone && (
                                    <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Icon.User className="w-4 h-4 text-gray-400" />
                                        <a href={`https://wa.me/${lead.phone.replace(/[^\d+]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-accent">{lead.phone}</a>
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Stage transition */}
                        <section>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Stage</h3>
                            <div className="grid grid-cols-4 gap-1.5">
                                {stages.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleMoveStage(s.id)}
                                        className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-1.5 rounded-lg transition-colors ${
                                            lead.stage === s.id
                                                ? `${COLOR_CLASSES[s.color].bg} ${COLOR_CLASSES[s.color].text} ring-1 ${COLOR_CLASSES[s.color].ring}`
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Notes */}
                        <section>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Notes</h3>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={6}
                                className={inputClass}
                                placeholder="Add notes about this lead…"
                            />
                            <button
                                onClick={handleSaveNotes}
                                disabled={savingNotes || notes === (lead.notes || '')}
                                className="mt-2 w-full bg-accent hover:bg-orange-600 text-white text-sm font-bold py-2.5 rounded-xl disabled:opacity-50 transition-colors"
                            >
                                {savingNotes ? 'Saving…' : 'Save Notes'}
                            </button>
                        </section>

                        {/* Actions */}
                        <section className="space-y-2">
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Actions</h3>

                            {lead.stage !== 'WON' && lead.stage !== 'COMPLETED' && (
                                <button
                                    onClick={handleConvert}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-500/20"
                                >
                                    <Icon.Check className="w-4 h-4" />
                                    Convert to Client
                                </button>
                            )}

                            {lead.stage === 'WON' && (
                                <button
                                    onClick={handleConvert}
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-bold py-2.5 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
                                >
                                    <Icon.Arrow className="w-4 h-4" />
                                    Re-run Convert
                                </button>
                            )}

                            <button
                                onClick={() => setShowTemplatePicker(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-accent text-gray-800 dark:text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                            >
                                <Icon.Sparkle className="w-4 h-4" />
                                Send Template Email
                            </button>
                        </section>

                        {/* Meta */}
                        <section>
                            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Meta</h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                <p>Created: {new Date(lead.created_at).toLocaleString()}</p>
                                <p>Updated: {new Date(lead.updated_at).toLocaleString()}</p>
                                {lead.converted_client_id && (
                                    <p className="text-emerald-600 dark:text-emerald-400">Linked to client ✓</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {showTemplatePicker && (
                        <TemplatePickerModal
                            lead={lead}
                            templates={templates}
                            onClose={() => setShowTemplatePicker(false)}
                            onSend={async (templateId, to, data) => {
                                const res = await api.post(`/email-templates/${templateId}/send`, { to, data });
                                if (res.ok) {
                                    notify.success(res.data.mocked ? 'Email logged (SMTP not configured).' : 'Email sent.');
                                    setShowTemplatePicker(false);
                                    onSendTemplate && onSendTemplate(res.data);
                                } else {
                                    notify.error(res.error || 'Failed to send.');
                                }
                            }}
                        />
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Template picker modal ───────────────────────────────
const TemplatePickerModal = ({ lead, templates, onClose, onSend }) => {
    const [selected, setSelected] = useState(templates[0]?.id || '');
    const [data, setData] = useState({
        client_name: lead.full_name,
        project_name: lead.notes?.split('\n')[0]?.replace(/^Project:\s*/i, '').trim() || 'your project',
    });
    const [preview, setPreview] = useState(null);
    const [previewing, setPreviewing] = useState(false);

    useEffect(() => {
        if (!selected) return;
        setPreviewing(true);
        api.post(`/email-templates/${selected}/render`, { data })
            .then(res => { if (res.ok) setPreview(res.data); })
            .finally(() => setPreviewing(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, data.client_name, data.project_name]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">Send Template Email</h2>
                    <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                        <Icon.X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className={labelClass}>Template</label>
                        <select value={selected} onChange={(e) => setSelected(e.target.value)} className={inputClass}>
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Client name</label>
                            <input value={data.client_name} onChange={(e) => setData({ ...data, client_name: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Project name</label>
                            <input value={data.project_name} onChange={(e) => setData({ ...data, project_name: e.target.value })} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>To</label>
                        <input value={lead.email} readOnly className={`${inputClass} bg-gray-50 dark:bg-gray-800 cursor-not-allowed`} />
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Live Preview</p>
                        {previewing ? (
                            <p className="text-sm text-gray-400">Rendering…</p>
                        ) : preview ? (
                            <>
                                <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">{preview.subject}</p>
                                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-body">{preview.body}</pre>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Select a template to preview.</p>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2 bg-gray-50 dark:bg-gray-900">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSend(selected, lead.email, data)}
                        disabled={!selected || !preview}
                        className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50"
                    >
                        <Icon.Mail className="w-4 h-4" /> Send Email
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Lead card ───────────────────────────────────────────
const LeadCard = ({ lead, onClick, onDragStart, onDragEnd }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', lead.id);
                onDragStart(lead.id);
            }}
            onDragEnd={onDragEnd}
            onClick={() => onClick(lead)}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
        >
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{lead.full_name}</p>
                <span className={`shrink-0 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${DIVISION_BADGES[lead.division] || 'bg-gray-100 text-gray-600'}`}>
                    {lead.division?.charAt(0)}
                </span>
            </div>
            {lead.source && (
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{lead.source.replace(/_/g, ' ')}</p>
            )}
            {lead.notes && (
                <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{lead.notes.split('\n').slice(1).join('\n').trim() || lead.notes}</p>
            )}
            <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{lead.days_in_stage || 0}d in stage</span>
                {lead.converted_client_id && <span className="text-emerald-500">●</span>}
            </div>
        </motion.div>
    );
};

// ── Column ──────────────────────────────────────────────
const KanbanColumn = ({ stage, leads, onDrop, onCardClick, onDragStart, onDragEnd, draggingId }) => {
    const [isOver, setIsOver] = useState(false);
    const c = COLOR_CLASSES[stage.color] || COLOR_CLASSES.blue;

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsOver(false);
                const id = e.dataTransfer.getData('text/plain');
                if (id) onDrop(id, stage.id);
            }}
            className={`flex flex-col w-72 shrink-0 rounded-2xl border ${c.border} ${c.bg} transition-all ${isOver ? 'ring-2 ring-accent' : ''}`}
        >
            <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50 flex items-center justify-between sticky top-0 backdrop-blur z-[1]">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`}></span>
                    <h3 className={`text-sm font-extrabold uppercase tracking-wider ${c.text}`}>{stage.label}</h3>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                    {leads.length}
                </span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
                <AnimatePresence>
                    {leads.map(lead => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            onClick={onCardClick}
                            onDragStart={onDragStart}
                            onDragEnd={onDragEnd}
                        />
                    ))}
                </AnimatePresence>
                {leads.length === 0 && (
                    <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-8 px-2">
                        Drop a lead here.
                    </div>
                )}
            </div>
        </div>
    );
};

// ── New-lead form ───────────────────────────────────────
const NewLeadForm = ({ onClose, onCreate }) => {
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', division: 'SOFTWARE', source: '', notes: '' });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await api.post('/crm/leads', form);
        setSubmitting(false);
        if (res.ok) {
            notify.success('Lead created.');
            onCreate(res.data.lead);
            onClose();
        } else {
            notify.error(res.error || 'Failed to create lead.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">New Lead</h2>
                        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                            <Icon.X className="w-5 h-5" />
                        </button>
                    </div>
                    <div>
                        <label className={labelClass}>Name</label>
                        <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Email</label>
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Phone (optional)</label>
                            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Division</label>
                            <select value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} className={inputClass}>
                                <option>SOFTWARE</option>
                                <option>SURVEY</option>
                                <option>DRONE</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className={labelClass}>Source (optional)</label>
                        <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="referral, twitter, …" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Notes (optional)</label>
                        <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className={inputClass} />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300">Cancel</button>
                        <button type="submit" disabled={submitting} className="bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50">
                            {submitting ? 'Creating…' : 'Create Lead'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// ── Main page ───────────────────────────────────────────
const AdminCRM = () => {
    const [stages, setStages] = useState(FALLBACK_STAGES);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [divisionFilter, setDivisionFilter] = useState('all');
    const [sourceFilter, setSourceFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const [templates, setTemplates] = useState([]);

    // Pull the canonical 8-stage list from the backend once.
    useEffect(() => {
        api.get('/crm/stages').then(res => {
            if (res.ok && Array.isArray(res.data)) setStages(res.data);
        });
        api.get('/email-templates').then(res => {
            if (res.ok && Array.isArray(res.data)) setTemplates(res.data);
        });
    }, []);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        const params = {};
        if (divisionFilter !== 'all') params.division = divisionFilter;
        if (sourceFilter !== 'all') params.source = sourceFilter;
        if (search.trim()) params.q = search.trim();
        const res = await api.get('/crm/leads', { params });
        if (res.ok) setLeads(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
    }, [divisionFilter, sourceFilter, search]);

    useEffect(() => {
        const t = setTimeout(fetchLeads, 200);
        return () => clearTimeout(t);
    }, [fetchLeads]);

    // Group leads by stage.
    const grouped = useMemo(() => {
        const map = {};
        for (const s of stages) map[s.id] = [];
        for (const lead of leads) {
            if (map[lead.stage]) map[lead.stage].push(lead);
        }
        return map;
    }, [leads, stages]);

    // Drop a lead into a new stage.
    const handleDrop = async (leadId, newStage) => {
        const lead = leads.find(l => l.id === leadId);
        if (!lead || lead.stage === newStage) return;

        // Optimistic update — move the card immediately.
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage, days_in_stage: 0, updated_at: new Date().toISOString() } : l));

        const res = await api.patch(`/crm/leads/${leadId}/stage`, { stage: newStage });
        if (!res.ok) {
            notify.error(res.error || 'Failed to move lead.');
            fetchLeads(); // re-sync on failure
        }
    };

    const handleLeadUpdate = (updated) => {
        setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
        if (selected?.id === updated.id) setSelected(updated);
    };

    const handleLeadConvert = (updatedLead, _client) => {
        setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    };

    const sources = useMemo(() => {
        const set = new Set(leads.map(l => l.source).filter(Boolean));
        return ['all', ...Array.from(set)];
    }, [leads]);

    return (
        <div className="flex flex-col h-full">
            <div className="max-w-[1600px] mx-auto w-full flex flex-col h-full">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                                CRM Pipeline
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">
                                {leads.length} lead{leads.length === 1 ? '' : 's'} · drag cards between columns
                            </p>
                        </div>
                        <button
                            onClick={() => setShowNewForm(true)}
                            className="inline-flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
                        >
                            <Icon.Plus className="w-4 h-4" /> New Lead
                        </button>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Icon.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, notes…"
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-colors font-body"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Icon.Filter className="w-3.5 h-3.5 text-gray-400" />
                        {['all', 'SOFTWARE', 'SURVEY', 'DRONE'].map(d => (
                            <button
                                key={d}
                                onClick={() => setDivisionFilter(d)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                                    divisionFilter === d
                                        ? 'bg-accent text-white shadow-md shadow-accent/20'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-accent'
                                }`}
                            >
                                {d === 'all' ? 'All' : d.charAt(0) + d.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                    {sources.length > 1 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {sources.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSourceFilter(s)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
                                        sourceFilter === s
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-blue-600'
                                    }`}
                                >
                                    {s === 'all' ? 'Any source' : s.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Kanban */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                        <p className="text-gray-400 font-body">Loading leads…</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-x-auto pb-4">
                        <div className="flex gap-3 min-w-max">
                            {stages.map(stage => (
                                <KanbanColumn
                                    key={stage.id}
                                    stage={stage}
                                    leads={grouped[stage.id] || []}
                                    onDrop={handleDrop}
                                    onCardClick={setSelected}
                                    onDragStart={setDraggingId}
                                    onDragEnd={() => setDraggingId(null)}
                                    draggingId={draggingId}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selected && (
                <LeadDrawer
                    lead={selected}
                    stages={stages}
                    templates={templates}
                    onClose={() => setSelected(null)}
                    onUpdate={handleLeadUpdate}
                    onConvert={handleLeadConvert}
                    onSendTemplate={() => {}}
                />
            )}

            {showNewForm && (
                <NewLeadForm
                    onClose={() => setShowNewForm(false)}
                    onCreate={(lead) => setLeads(prev => [lead, ...prev])}
                />
            )}
        </div>
    );
};

export default AdminCRM;
