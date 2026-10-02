import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

// ─── AdminOutreach — Admin OS Phase 4 (blueprint §18–§22, §61, §95) ──
// Five tabs: Pipeline (prospects + sends), Sequences, Website Audits,
// Suppression list, Settings + Analytics. The backend owns every
// deliverability guard; this page only surfaces them.

const TABS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'sequences', label: 'Sequences' },
  { id: 'audits', label: 'Website Audits' },
  { id: 'suppressions', label: 'Suppression' },
  { id: 'settings', label: 'Settings & Analytics' },
];

const STATUS_STYLES = {
  RESEARCH: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  READY_TO_CONTACT: 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  EMAIL_DRAFTED: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300',
  SENT: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  FOLLOW_UP_1: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  FOLLOW_UP_2: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  FOLLOW_UP_3: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  REPLIED: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  INTERESTED: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  NOT_INTERESTED: 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500',
  UNSUBSCRIBED: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  BOUNCED: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  CONVERTED: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
};
const STATUS_LABELS = {
  RESEARCH: 'Research', READY_TO_CONTACT: 'Ready', EMAIL_DRAFTED: 'Drafted',
  SENT: 'Sent', FOLLOW_UP_1: 'Follow-up 1', FOLLOW_UP_2: 'Follow-up 2',
  FOLLOW_UP_3: 'Follow-up 3', REPLIED: 'Replied', INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not interested', UNSUBSCRIBED: 'Unsubscribed',
  BOUNCED: 'Bounced', CONVERTED: 'Converted',
};
const STATUS_ORDER = Object.keys(STATUS_STYLES);

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";
const cardClass = "bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm";
const btnPrimary = "bg-accent hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body cursor-pointer";
const btnGhost = "text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body cursor-pointer";
const btnDanger = "text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body cursor-pointer";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtMoney = (v, cur) => v == null ? '—' : `${cur || ''} ${Number(v).toLocaleString()}`.trim();

const StatusPill = ({ status }) => (
  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded whitespace-nowrap ${STATUS_STYLES[status] || STATUS_STYLES.RESEARCH}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

// ═══ Pipeline tab ═════════════════════════════════════════

const emptyProspectForm = {
  company_name: '', contact_name: '', email: '', website: '', instagram: '',
  industry: '', country: '', city: '', source: '', research_notes: '',
  website_issues: '', service_opportunity: '', estimated_value: '', sequence_id: '',
};

const ProspectsTab = ({ sequences }) => {
  const [prospects, setProspects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyProspectForm);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [replyForm, setReplyForm] = useState(null); // { subject, body }
  const [editDraft, setEditDraft] = useState(null); // { id, subject, body }

  const fetchProspects = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (dueOnly) params.due = '1';
    if (q.trim().length >= 2) params.q = q.trim();
    const res = await api.get('/outreach/prospects', { params });
    if (res.ok) setProspects(res.data);
    else notify.error(res.error || 'Failed to load prospects.');
    setLoading(false);
  }, [statusFilter, dueOnly, q]);

  useEffect(() => {
    const t = setTimeout(fetchProspects, 250);
    return () => clearTimeout(t);
  }, [fetchProspects]);

  const openDetail = async (id) => {
    setSelectedId(id);
    setDetail(null);
    setReplyForm(null);
    setEditDraft(null);
    const res = await api.get(`/outreach/prospects/${id}`);
    if (res.ok) setDetail(res.data);
    else notify.error(res.error || 'Failed to load prospect.');
  };

  const refreshDetail = () => openDetail(selectedId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      estimated_value: form.estimated_value ? Number(form.estimated_value) : null,
      sequence_id: form.sequence_id || null,
    };
    const res = await api.post('/outreach/prospects', payload);
    setBusy(false);
    if (res.ok) {
      notify.success('Prospect added to the pipeline.');
      setForm(emptyProspectForm);
      setShowForm(false);
      fetchProspects();
    } else if (res.status === 409) {
      notify.error(typeof res.data?.error === 'string' ? res.data.error : 'Duplicate or suppressed email.');
    } else {
      notify.error(res.error || 'Failed to create prospect.');
    }
  };

  const act = async (path, body = {}, okMsg = 'Done.') => {
    setBusy(true);
    const res = await api.post(`/outreach/prospects/${selectedId}${path}`, body);
    setBusy(false);
    if (res.ok) {
      notify.success(okMsg);
      fetchProspects();
      refreshDetail();
      return res.data;
    }
    notify.error(typeof res.data?.error === 'string' ? res.data.error : (res.error || 'Action failed.'));
    return null;
  };

  const patchStatus = async (status, okMsg) => {
    setBusy(true);
    const res = await api.patch(`/outreach/prospects/${selectedId}`, { status });
    setBusy(false);
    if (res.ok) { notify.success(okMsg); fetchProspects(); refreshDetail(); }
    else notify.error(res.error || 'Update failed.');
  };

  const saveDraft = async () => {
    setBusy(true);
    const res = await api.patch(`/outreach/messages/${editDraft.id}`, {
      subject: editDraft.subject, body: editDraft.body,
    });
    setBusy(false);
    if (res.ok) { notify.success('Draft saved.'); setEditDraft(null); refreshDetail(); }
    else notify.error(typeof res.data?.error === 'string' ? res.data.error : 'Only unsent drafts can be edited.');
  };

  const convert = async () => {
    const data = await act('/convert', {}, 'Converted to a lead — see it in the CRM pipeline.');
    if (data?.lead) {
      notify.success(`Lead created: ${data.lead.full_name}. Open CRM → LEAD stage.`);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this prospect and its whole outreach history? This cannot be undone.')) return;
    const res = await api.delete(`/outreach/prospects/${selectedId}`);
    if (res.ok) {
      notify.success('Prospect deleted.');
      setSelectedId(null);
      setDetail(null);
      fetchProspects();
    } else notify.error(res.error || 'Delete failed.');
  };

  const openDraft = detail?.messages?.find((m) => m.direction === 'OUTBOUND' && ['DRAFT', 'QUEUED'].includes(m.status) && !m.step_id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* ── Left column: filters + table ── */}
      <div className={detail ? 'lg:col-span-2' : 'lg:col-span-3'}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${!statusFilter ? 'bg-accent text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >All</button>
          {['RESEARCH', 'READY_TO_CONTACT', 'EMAIL_DRAFTED', 'SENT', 'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3', 'REPLIED', 'INTERESTED', 'CONVERTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? '' : s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${statusFilter === s ? 'bg-accent text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
            >{STATUS_LABELS[s]}</button>
          ))}
          <button
            onClick={() => setDueOnly((d) => !d)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${dueOnly ? 'bg-red-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          >Follow-up due</button>
          <div className="relative ml-auto w-full md:w-56">
            <input
              type="text" placeholder="Search prospects…" value={q} onChange={(e) => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" /></svg>
          </div>
          <button onClick={() => setShowForm((s) => !s)} className={btnPrimary}>
            {showForm ? 'Close' : '+ New Prospect'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className={`${cardClass} p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div>
              <label className={labelClass}>Company *</label>
              <input name="company_name" required value={form.company_name} onChange={handleChange} placeholder="e.g. Sassy Brand" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Contact Name</label>
              <input name="contact_name" value={form.contact_name} onChange={handleChange} placeholder="e.g. Ada Obi" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="https://…" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram</label>
              <input name="instagram" value={form.instagram} onChange={handleChange} placeholder="@handle" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <input name="industry" value={form.industry} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country / City</label>
              <div className="flex gap-2">
                <input name="country" value={form.country} onChange={handleChange} placeholder="Country" className={inputClass} />
                <input name="city" value={form.city} onChange={handleChange} placeholder="City" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Estimated Value</label>
              <input type="number" min="0" name="estimated_value" value={form.estimated_value} onChange={handleChange} placeholder="350000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sequence</label>
              <select name="sequence_id" value={form.sequence_id} onChange={handleChange} className={inputClass}>
                <option value="">— Attach later —</option>
                {sequences.filter((s) => s.is_active).map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.steps?.length || 0} steps)</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Research Notes</label>
              <textarea name="research_notes" rows="2" value={form.research_notes} onChange={handleChange} placeholder="What you learned while researching…" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Website Issues Observed</label>
              <textarea name="website_issues" rows="2" value={form.website_issues} onChange={handleChange} placeholder="Slow mobile load, no online ordering…" className={inputClass} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Adding…' : 'Add Prospect'}</button>
            </div>
          </form>
        )}

        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                  <th className="py-4 px-4">Company</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Sends</th>
                  <th className="py-4 px-4 text-center">Replies</th>
                  <th className="py-4 px-4">Next Follow-up</th>
                  <th className="py-4 px-4 text-right">Est. Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr><td colSpan="6" className="py-8 px-4 text-center text-gray-400 font-body">Loading pipeline…</td></tr>
                ) : prospects.length === 0 ? (
                  <tr><td colSpan="6" className="py-10 px-4 text-center text-gray-500 dark:text-gray-400 font-body">
                    No prospects yet. Add the first company you want to reach out to.
                  </td></tr>
                ) : prospects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openDetail(p.id)}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50 ${selectedId === p.id ? 'bg-orange-50/60 dark:bg-orange-900/10' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 dark:text-white font-body">{p.company_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-body">{p.contact_name || '—'} · {p.email}</p>
                    </td>
                    <td className="py-4 px-4">
                      <StatusPill status={p.status} />
                      {p.do_not_contact && (
                        <span className="ml-1 text-[9px] font-extrabold uppercase tracking-widest text-rose-500">DNC</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center text-sm text-gray-600 dark:text-gray-300 font-body">{p.sends}</td>
                    <td className="py-4 px-4 text-center text-sm font-bold font-body">
                      <span className={p.replies > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}>{p.replies}</span>
                    </td>
                    <td className="py-4 px-4 text-sm font-body">
                      {p.next_follow_up_at ? (
                        <span className={new Date(p.next_follow_up_at) < new Date() ? 'text-red-500 font-bold' : 'text-gray-600 dark:text-gray-300'}>
                          {fmtDate(p.next_follow_up_at)}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-600 dark:text-gray-300 font-body whitespace-nowrap">
                      {fmtMoney(p.estimated_value, p.estimated_value_currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Right column: detail panel ── */}
      {detail && (
        <div className={`${cardClass} p-6 h-fit lg:sticky lg:top-4`}>
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h3 className="text-lg font-extrabold font-heading text-gray-900 dark:text-white">{detail.company_name}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusPill status={detail.status} />
                {detail.sequence_name && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{detail.sequence_name}</span>}
              </div>
            </div>
            <button onClick={() => { setSelectedId(null); setDetail(null); }} className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl leading-none cursor-pointer">×</button>
          </div>

          <div className="text-sm space-y-1.5 font-body text-gray-600 dark:text-gray-300 mb-5">
            <p><a href={`mailto:${detail.email}`} className="text-accent hover:underline">{detail.email}</a></p>
            {detail.website && <p><a href={detail.website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{detail.website}</a></p>}
            {detail.instagram && <p>@{detail.instagram.replace(/^@/, '')}</p>}
            {(detail.city || detail.country) && <p>{[detail.city, detail.country].filter(Boolean).join(', ')}</p>}
            {detail.estimated_value != null && <p>Est. value: <strong>{fmtMoney(detail.estimated_value, detail.estimated_value_currency)}</strong></p>}
            {detail.next_follow_up_at && <p>Next follow-up: <strong className={new Date(detail.next_follow_up_at) < new Date() ? 'text-red-500' : ''}>{fmtDateTime(detail.next_follow_up_at)}</strong></p>}
            {detail.lead_id && <p className="text-teal-600 dark:text-teal-400 font-bold">→ Lead created (CRM)</p>}
            {detail.research_notes && <p className="text-xs pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">{detail.research_notes}</p>}
            {detail.website_issues && <p className="text-xs">Issues: {detail.website_issues}</p>}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => act('/generate-draft', {}, 'Draft generated from the template + audit notes.')} disabled={busy} className={btnGhost}>Generate Draft</button>
            {openDraft && (
              <button onClick={() => setEditDraft({ id: openDraft.id, subject: openDraft.subject, body: openDraft.body })} className={btnGhost}>Edit Draft</button>
            )}
            {openDraft && !editDraft && (
              <button onClick={() => act('/send', { message_id: openDraft.id }, 'Draft sent.')} disabled={busy} className={btnGhost}>Send Draft</button>
            )}
            {detail.sequence_id && !openDraft && (
              <button onClick={() => act('/send', {}, 'Sequence step sent.')} disabled={busy} className={btnGhost}>Send Next Step</button>
            )}
            <button onClick={() => setReplyForm({ subject: '', body: '' })} className={btnGhost}>Log Reply</button>
            {['REPLIED', 'RESEARCH', 'SENT', 'FOLLOW_UP_1', 'FOLLOW_UP_2', 'FOLLOW_UP_3'].includes(detail.status) && (
              <button onClick={() => patchStatus('INTERESTED', 'Marked interested.')} className={btnGhost}>Mark Interested</button>
            )}
            {!['NOT_INTERESTED', 'CONVERTED'].includes(detail.status) && (
              <button onClick={() => patchStatus('NOT_INTERESTED', 'Marked not interested — pending follow-ups cancelled.')} className={btnGhost}>Not Interested</button>
            )}
            {!['UNSUBSCRIBED', 'BOUNCED', 'CONVERTED'].includes(detail.status) && (
              <button onClick={() => { if (window.confirm('Mark as unsubscribed? The address is suppressed permanently.')) patchStatus('UNSUBSCRIBED', 'Unsubscribed + suppressed.'); }} className={btnGhost}>Unsubscribed</button>
            )}
            {['REPLIED', 'INTERESTED'].includes(detail.status) && !detail.lead_id && (
              <button onClick={convert} disabled={busy} className={btnPrimary}>Convert to Lead</button>
            )}
            <button onClick={remove} className={btnDanger}>Delete</button>
          </div>

          {/* Draft editor */}
          {editDraft && (
            <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <label className={labelClass}>Subject</label>
                <input value={editDraft.subject} onChange={(e) => setEditDraft((d) => ({ ...d, subject: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Body — {'{{first_name}} {{business_name}} {{website}} {{industry}} {{observed_issue}} {{service}} {{portfolio_url}}'}</label>
                <textarea rows="9" value={editDraft.body} onChange={(e) => setEditDraft((d) => ({ ...d, body: e.target.value }))} className={`${inputClass} font-mono text-xs leading-relaxed`} />
              </div>
              <div className="flex gap-2">
                <button onClick={saveDraft} disabled={busy} className={btnPrimary}>Save</button>
                <button onClick={() => act('/send', { message_id: editDraft.id }, 'Draft sent.')} disabled={busy} className={btnPrimary}>Save & Send</button>
                <button onClick={() => setEditDraft(null)} className={btnGhost}>Cancel</button>
              </div>
            </div>
          )}

          {/* Reply logger */}
          {replyForm && (
            <div className="mb-5 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/40 space-y-3">
              <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest">Log their reply — the sequence stops and pending follow-ups cancel.</p>
              <input placeholder="Subject (optional)" value={replyForm.subject} onChange={(e) => setReplyForm((f) => ({ ...f, subject: e.target.value }))} className={inputClass} />
              <textarea placeholder="What did they say?" rows="3" value={replyForm.body} onChange={(e) => setReplyForm((f) => ({ ...f, body: e.target.value }))} className={inputClass} />
              <div className="flex gap-2">
                <button onClick={async () => { await act('/record-reply', replyForm, 'Reply logged — sequence stopped.'); setReplyForm(null); }} disabled={busy} className={btnPrimary}>Save Reply</button>
                <button onClick={() => setReplyForm(null)} className={btnGhost}>Cancel</button>
              </div>
            </div>
          )}

          {/* Messages */}
          <h4 className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Email History</h4>
          <div className="space-y-2 max-h-72 overflow-y-auto mb-5 pr-1">
            {detail.messages.length === 0 ? (
              <p className="text-xs text-gray-400 font-body">Nothing sent yet.</p>
            ) : detail.messages.map((m) => (
              <div key={m.id} className={`p-3 rounded-xl border text-xs font-body ${m.direction === 'INBOUND' ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/40' : m.status === 'SENT' ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/40'}`}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-extrabold uppercase tracking-widest text-[9px] text-gray-500 dark:text-gray-400">
                    {m.direction === 'INBOUND' ? '← Reply' : m.step_order ? `Step ${m.step_order}` : 'One-off'} · {m.status}
                  </span>
                  <span className="text-[10px] text-gray-400">{fmtDateTime(m.sent_at || m.created_at)}</span>
                </div>
                {m.subject && <p className="font-bold text-gray-800 dark:text-gray-100 mb-0.5">{m.subject}</p>}
                {m.body && <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-4">{m.body}</p>}
                {m.error && <p className="text-red-500 mt-1">{m.error}</p>}
              </div>
            ))}
          </div>

          {/* Audits */}
          {detail.audits.length > 0 && (
            <>
              <h4 className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Website Audits</h4>
              <div className="space-y-2">
                {detail.audits.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-body space-y-1">
                    <p className="font-bold text-gray-800 dark:text-gray-100">{a.website}</p>
                    {a.opportunities && <p><span className="font-bold">Opportunity:</span> {a.opportunities}</p>}
                    {a.performance_notes && <p><span className="font-bold">Performance:</span> {a.performance_notes}</p>}
                    {a.mobile_notes && <p><span className="font-bold">Mobile:</span> {a.mobile_notes}</p>}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {a.ssl_valid != null && <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${a.ssl_valid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>SSL {a.ssl_valid ? 'OK' : 'Bad'}</span>}
                      {a.analytics_present != null && <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${a.analytics_present ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>Analytics</span>}
                      {a.ecommerce_available != null && <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${a.ecommerce_available ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>Ecommerce</span>}
                      {a.booking_available != null && <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${a.booking_available ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>Booking</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ═══ Sequences tab ════════════════════════════════════════

const SequencesTab = ({ sequences, reload }) => {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null); // { name, description, is_active, stop_on_reply, steps: [] }
  const [busy, setBusy] = useState(false);

  const startCreate = () => setDraft({
    name: '', description: '', is_active: true, stop_on_reply: true,
    steps: [{ step_order: 1, delay_days: 0, subject: '', body: '', is_active: true }],
  });

  const startEdit = (seq) => setDraft({
    name: seq.name, description: seq.description || '',
    is_active: seq.is_active, stop_on_reply: seq.stop_on_reply,
    steps: (seq.steps || []).map((s) => ({
      step_order: s.step_order, delay_days: s.delay_days, subject: s.subject, body: s.body, is_active: s.is_active,
    })),
  });

  const addStep = () => setDraft((d) => ({
    ...d,
    steps: [...d.steps, {
      step_order: d.steps.length + 1,
      delay_days: 3,
      subject: `Re: ${d.steps[0]?.subject || '{{business_name}}'}`,
      body: '', is_active: true,
    }],
  }));

  const removeStep = (idx) => setDraft((d) => ({
    ...d,
    steps: d.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 })),
  }));

  const save = async () => {
    if (!draft.name.trim()) { notify.error('Sequence name is required.'); return; }
    if (draft.steps.some((s) => !s.subject.trim() || !s.body.trim())) {
      notify.error('Every step needs a subject and a body.');
      return;
    }
    setBusy(true);
    const payload = {
      name: draft.name, description: draft.description || null,
      is_active: draft.is_active, stop_on_reply: draft.stop_on_reply,
      steps: draft.steps.map((s, i) => ({
        step_order: i + 1, delay_days: Number(s.delay_days) || 0,
        subject: s.subject, body: s.body, is_active: s.is_active ?? true,
      })),
    };
    const res = editingId
      ? await api.patch(`/outreach/sequences/${editingId}`, payload)
      : await api.post('/outreach/sequences', payload);
    setBusy(false);
    if (res.ok) {
      notify.success(editingId ? 'Sequence updated.' : 'Sequence created.');
      setDraft(null); setEditingId(null); reload();
    } else notify.error(res.error || 'Save failed.');
  };

  const toggleActive = async (seq) => {
    const res = await api.patch(`/outreach/sequences/${seq.id}`, { is_active: !seq.is_active });
    if (res.ok) { notify.success(seq.is_active ? 'Sequence deactivated — attached prospects stop receiving follow-ups.' : 'Sequence activated.'); reload(); }
    else notify.error(res.error || 'Update failed.');
  };

  const remove = async (seq) => {
    if (!window.confirm(`Delete sequence "${seq.name}"?`)) return;
    const res = await api.delete(`/outreach/sequences/${seq.id}`);
    if (res.ok) { notify.success('Sequence deleted.'); reload(); }
    else notify.error(typeof res.data?.error === 'string' ? res.data.error : 'Delete failed.');
  };

  return (
    <div className="space-y-4">
      {!draft && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
            A sequence is a set of timed emails (Day 0, 3, 7, 14…). Attach prospects to it and follow-ups go out automatically — pausing on any reply.
          </p>
          <button onClick={startCreate} className={btnPrimary}>+ New Sequence</button>
        </div>
      )}

      {draft && (
        <div className={`${cardClass} p-6 space-y-4`}>
          <h3 className="text-xl font-bold font-heading text-gray-900 dark:text-white">{editingId ? 'Edit Sequence' : 'New Sequence'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name *</label>
              <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="e.g. Cold Outreach — Restaurants" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <input value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 font-body">
              <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 font-body">
              <input type="checkbox" checked={draft.stop_on_reply} onChange={(e) => setDraft((d) => ({ ...d, stop_on_reply: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              Stop on reply
            </label>
          </div>

          {draft.steps.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-gray-500">Step {i + 1}</span>
                {draft.steps.length > 1 && <button type="button" onClick={() => removeStep(i)} className={btnDanger}>Remove step</button>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Delay (days after previous)</label>
                  <input type="number" min="0" value={s.delay_days} onChange={(e) => setDraft((d) => ({ ...d, steps: d.steps.map((x, xi) => xi === i ? { ...x, delay_days: e.target.value } : x) }))} className={inputClass} />
                </div>
                <div className="md:col-span-3">
                  <label className={labelClass}>Subject</label>
                  <input value={s.subject} onChange={(e) => setDraft((d) => ({ ...d, steps: d.steps.map((x, xi) => xi === i ? { ...x, subject: e.target.value } : x) }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Body — variables: {'{{first_name}} {{business_name}} {{website}} {{industry}} {{observed_issue}} {{service}} {{portfolio_url}}'}</label>
                <textarea rows="6" value={s.body} onChange={(e) => setDraft((d) => ({ ...d, steps: d.steps.map((x, xi) => xi === i ? { ...x, body: e.target.value } : x) }))} className={`${inputClass} font-mono text-xs leading-relaxed`} />
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <button type="button" onClick={addStep} className={btnGhost}>+ Add Step</button>
            <button onClick={save} disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save Sequence'}</button>
            <button onClick={() => { setDraft(null); setEditingId(null); }} className={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {!draft && sequences.map((seq) => (
        <div key={seq.id} className={`${cardClass} p-6`}>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-extrabold font-heading text-gray-900 dark:text-white flex items-center gap-2">
                {seq.name}
                {!seq.is_active && <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-gray-200 text-gray-500">Inactive</span>}
                {seq.stop_on_reply && <span className="text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">Stops on reply</span>}
              </h3>
              {seq.description && <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-0.5">{seq.description}</p>}
              <p className="text-xs text-gray-400 font-body mt-1">{seq.prospect_count} prospect(s) attached · {seq.sends} email(s) sent</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => { setEditingId(seq.id); startEdit(seq); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={btnGhost}>Edit</button>
              <button onClick={() => toggleActive(seq)} className={btnGhost}>{seq.is_active ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => remove(seq)} className={btnDanger}>Delete</button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {seq.steps.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-body">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold uppercase tracking-widest text-[9px] text-accent">Day {s.delay_days} · Step {s.step_order}</span>
                  {!s.is_active && <span className="text-[9px] font-extrabold uppercase text-gray-400">Off</span>}
                </div>
                <p className="font-bold text-gray-800 dark:text-gray-100 mb-1 line-clamp-2">{s.subject}</p>
                <p className="text-gray-500 dark:text-gray-400 line-clamp-4 whitespace-pre-wrap">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══ Audits tab ═══════════════════════════════════════════

const emptyAuditForm = {
  prospect_id: '', website: '', mobile_notes: '', design_notes: '', performance_notes: '',
  seo_notes: '', cta_notes: '', ecommerce_available: '', booking_available: '',
  analytics_present: '', ssl_valid: '', contact_options: '', opportunities: '',
};

const TriState = ({ name, value, onChange }) => (
  <select name={name} value={value} onChange={onChange} className={inputClass}>
    <option value="">— Unknown —</option>
    <option value="true">Yes</option>
    <option value="false">No</option>
  </select>
);

const AuditsTab = ({ prospects }) => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAuditForm);
  const [busy, setBusy] = useState(false);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/outreach/audits');
    if (res.ok) setAudits(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAudits(); }, [fetchAudits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    const boolKeys = ['ecommerce_available', 'booking_available', 'analytics_present', 'ssl_valid'];
    const payload = { ...form, prospect_id: form.prospect_id || null };
    for (const k of boolKeys) payload[k] = form[k] === '' ? null : form[k] === 'true';
    const res = await api.post('/outreach/audits', payload);
    setBusy(false);
    if (res.ok) {
      notify.success('Audit saved. Generate the outreach draft from the prospect to use it.');
      setForm(emptyAuditForm);
      setShowForm(false);
      fetchAudits();
    } else notify.error(res.error || 'Failed to save audit.');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this audit?')) return;
    const res = await api.delete(`/outreach/audits/${id}`);
    if (res.ok) { notify.success('Audit deleted.'); fetchAudits(); }
    else notify.error(res.error || 'Delete failed.');
  };

  const boolPill = (v, label) => v == null ? null : (
    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${v ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>{label} {v ? '✓' : '✗'}</span>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-body max-w-2xl">
          Keep audits factual (blueprint §21) — notes on what the site does and doesn't do, not opinions. The latest audit's notes feed the {'{{observed_issue}}'} variable in outreach drafts.
        </p>
        <button onClick={() => setShowForm((s) => !s)} className={btnPrimary}>{showForm ? 'Close' : '+ New Audit'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className={`${cardClass} p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <div>
            <label className={labelClass}>Prospect (optional)</label>
            <select name="prospect_id" value={form.prospect_id} onChange={handleChange} className={inputClass}>
              <option value="">— Standalone —</option>
              {prospects.map((p) => <option key={p.id} value={p.id}>{p.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Website *</label>
            <input name="website" required value={form.website} onChange={handleChange} placeholder="https://…" className={inputClass} />
          </div>
          <div className="md:grid-cols-2 md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><label className={labelClass}>Ecommerce?</label><TriState name="ecommerce_available" value={form.ecommerce_available} onChange={handleChange} /></div>
            <div><label className={labelClass}>Booking?</label><TriState name="booking_available" value={form.booking_available} onChange={handleChange} /></div>
            <div><label className={labelClass}>Analytics?</label><TriState name="analytics_present" value={form.analytics_present} onChange={handleChange} /></div>
            <div><label className={labelClass}>SSL valid?</label><TriState name="ssl_valid" value={form.ssl_valid} onChange={handleChange} /></div>
          </div>
          <div><label className={labelClass}>Mobile Usability Notes</label><textarea name="mobile_notes" rows="2" value={form.mobile_notes} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>Design Notes</label><textarea name="design_notes" rows="2" value={form.design_notes} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>Performance Notes</label><textarea name="performance_notes" rows="2" value={form.performance_notes} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>SEO Basics</label><textarea name="seo_notes" rows="2" value={form.seo_notes} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>CTA Quality</label><textarea name="cta_notes" rows="2" value={form.cta_notes} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>Contact Options</label><textarea name="contact_options" rows="2" value={form.contact_options} onChange={handleChange} className={inputClass} /></div>
          <div className="md:col-span-2"><label className={labelClass}>Opportunities (feeds the outreach draft)</label><textarea name="opportunities" rows="2" value={form.opportunities} onChange={handleChange} placeholder="e.g. Improve mobile conversion and add direct online purchasing." className={inputClass} /></div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save Audit'}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className={`${cardClass} p-8 text-center text-gray-400 font-body md:col-span-2 xl:col-span-3`}>Loading audits…</div>
        ) : audits.length === 0 ? (
          <div className={`${cardClass} p-10 text-center text-gray-500 dark:text-gray-400 font-body md:col-span-2 xl:col-span-3`}>
            No audits yet. Audit a prospect's site before drafting outreach so the email can reference specific, real observations.
          </div>
        ) : audits.map((a) => (
          <div key={a.id} className={`${cardClass} p-5 text-sm font-body`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{a.company_name || 'Standalone'}</p>
                <a href={a.website} target="_blank" rel="noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all">{a.website}</a>
              </div>
              <button onClick={() => remove(a.id)} className={btnDanger}>Delete</button>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {boolPill(a.ssl_valid, 'SSL')}
              {boolPill(a.analytics_present, 'Analytics')}
              {boolPill(a.ecommerce_available, 'Ecom')}
              {boolPill(a.booking_available, 'Booking')}
            </div>
            {a.opportunities && <p className="text-xs text-gray-600 dark:text-gray-300 mb-1"><span className="font-bold">Opportunity:</span> {a.opportunities}</p>}
            {a.performance_notes && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1"><span className="font-bold">Perf:</span> {a.performance_notes}</p>}
            {a.mobile_notes && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1"><span className="font-bold">Mobile:</span> {a.mobile_notes}</p>}
            <p className="text-[10px] text-gray-400 mt-2">{fmtDate(a.created_at)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══ Suppressions tab ═════════════════════════════════════

const SuppressionsTab = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ email: '', reason: 'MANUAL', note: '' });
  const [busy, setBusy] = useState(false);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/outreach/suppressions');
    if (res.ok) setRows(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await api.post('/outreach/suppressions', { ...form, note: form.note || null });
    setBusy(false);
    if (res.ok) {
      notify.success(`${form.email} will never receive outreach while it's on this list.`);
      setForm({ email: '', reason: 'MANUAL', note: '' });
      fetchRows();
    } else notify.error(res.error || 'Failed to add.');
  };

  const remove = async (id) => {
    if (!window.confirm('Remove from the suppression list? They can receive email again.')) return;
    const res = await api.delete(`/outreach/suppressions/${id}`);
    if (res.ok) { notify.success('Removed.'); fetchRows(); }
    else notify.error(res.error || 'Failed.');
  };

  const REASON_STYLES = {
    UNSUBSCRIBED: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    BOUNCED: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    MANUAL: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    COMPLAINT: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form onSubmit={add} className={`${cardClass} p-6 space-y-4 h-fit`}>
        <h3 className="text-lg font-extrabold font-heading text-gray-900 dark:text-white">Suppress an address</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-body">Suppressed addresses are checked before every send — manual or automated. Unsubscribes and bounces land here automatically.</p>
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Reason</label>
          <select value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} className={inputClass}>
            <option value="MANUAL">Manual (do not contact)</option>
            <option value="COMPLAINT">Complaint</option>
            <option value="BOUNCED">Bounced</option>
            <option value="UNSUBSCRIBED">Unsubscribed</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Note</label>
          <input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Why?" className={inputClass} />
        </div>
        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>{busy ? 'Adding…' : 'Add to Suppression List'}</button>
      </form>

      <div className={`${cardClass} overflow-hidden lg:col-span-2`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Reason</th>
                <th className="py-4 px-4">Note</th>
                <th className="py-4 px-4">Since</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="py-8 px-4 text-center text-gray-400 font-body">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="5" className="py-10 px-4 text-center text-gray-500 dark:text-gray-400 font-body">Empty — nobody is suppressed yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white font-body">{r.email}</td>
                  <td className="py-4 px-4">
                    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${REASON_STYLES[r.reason] || REASON_STYLES.MANUAL}`}>{r.reason}</span>
                  </td>
                  <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 font-body">{r.note || '—'}</td>
                  <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 font-body">{fmtDate(r.created_at)}</td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => remove(r.id)} className={btnDanger}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ═══ Settings + Analytics tab ═════════════════════════════

const SettingsTab = () => {
  const [settings, setSettings] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    api.get('/outreach/settings').then((res) => { if (res.ok) setSettings(res.data); });
    api.get('/outreach/analytics').then((res) => { if (res.ok) setAnalytics(res.data); });
  }, []);

  const patch = (name, value) => setSettings((s) => ({ ...s, [name]: value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await api.patch('/outreach/settings', {
      daily_send_limit: Number(settings.daily_send_limit),
      send_window_start: settings.send_window_start,
      send_window_end: settings.send_window_end,
      paused: settings.paused,
      from_name: settings.from_name,
      reply_to: settings.reply_to || null,
    });
    setBusy(false);
    if (res.ok) notify.success('Outreach guardrails updated.');
    else notify.error(res.error || 'Save failed.');
  };

  const runFollowUps = async () => {
    setRunning(true);
    const res = await api.post('/outreach/follow-ups/run');
    setRunning(false);
    if (res.ok) {
      notify.success(`Checked ${res.data.checked}, sent ${res.data.sent}, skipped ${res.data.skipped}, failed ${res.data.failed}.`);
    } else notify.error(res.error || 'Run failed.');
  };

  if (!settings || !analytics) {
    return <div className={`${cardClass} p-8 text-center text-gray-400 font-body`}>Loading outreach settings…</div>;
  }

  const t = analytics.totals;

  return (
    <div className="space-y-6">
      {/* Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {[
          { label: 'Prospects', value: t.prospects },
          { label: 'Contacted', value: t.contacted },
          { label: 'Replies', value: t.replies, sub: `${t.reply_rate}% rate` },
          { label: 'Interested', value: t.interested },
          { label: 'Converted', value: t.converted, sub: `${t.conversion_rate}% rate` },
          { label: 'Audits', value: t.audits },
        ].map((c) => (
          <div key={c.label} className={`${cardClass} p-4`}>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{c.label}</p>
            <p className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white mt-1">{c.value}</p>
            {c.sub && <p className="text-[10px] text-gray-400 font-bold">{c.sub}</p>}
          </div>
        ))}
      </div>

      {analytics.today.paused && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 text-sm font-bold text-amber-700 dark:text-amber-300 font-body">
          ⏸ Outreach is globally paused — no emails will go out until you resume it below.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guardrails */}
        <form onSubmit={save} className={`${cardClass} p-6 space-y-4`}>
          <h3 className="text-lg font-extrabold font-heading text-gray-900 dark:text-white">Deliverability Guardrails</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-body">Every send path — manual and automated — respects these limits (blueprint §19). No features exist to bypass them.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Daily Send Limit</label>
              <input type="number" min="1" max="200" value={settings.daily_send_limit} onChange={(e) => patch('daily_send_limit', e.target.value)} className={inputClass} />
              <p className="text-[10px] text-gray-400 mt-1">Sent today: {analytics.today.sends}</p>
            </div>
            <div>
              <label className={labelClass}>From Name</label>
              <input value={settings.from_name} onChange={(e) => patch('from_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Send Window Start</label>
              <input type="time" value={settings.send_window_start} onChange={(e) => patch('send_window_start', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Send Window End</label>
              <input type="time" value={settings.send_window_end} onChange={(e) => patch('send_window_end', e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Reply-To (optional)</label>
              <input type="email" value={settings.reply_to || ''} onChange={(e) => patch('reply_to', e.target.value)} placeholder="hello@buildwithlami.com" className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 font-body">
            <input type="checkbox" checked={settings.paused} onChange={(e) => patch('paused', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
            Pause all outreach sends (kill switch, §83)
          </label>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Saving…' : 'Save Settings'}</button>
        </form>

        {/* Sequence performance + trend */}
        <div className="space-y-6">
          <div className={`${cardClass} p-6`}>
            <h3 className="text-lg font-extrabold font-heading text-gray-900 dark:text-white mb-4">Sequence Performance (§61)</h3>
            <div className="space-y-3">
              {analytics.sequences.length === 0 ? (
                <p className="text-sm text-gray-400 font-body">No sequences yet.</p>
              ) : analytics.sequences.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 text-sm font-body">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.prospects} prospects · {s.sends} sends · {s.replies} replies</p>
                  </div>
                  <div className="w-28 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${s.sends ? Math.min(100, Math.round((s.replies / s.sends) * 100)) : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardClass} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold font-heading text-gray-900 dark:text-white">Last 6 Months</h3>
              <button onClick={runFollowUps} disabled={running} className={btnGhost}>{running ? 'Running…' : 'Run Follow-ups Now'}</button>
            </div>
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-2 text-left">Month</th>
                  <th className="py-2 text-right">Added</th>
                  <th className="py-2 text-right">Sends</th>
                  <th className="py-2 text-right">Replies</th>
                </tr>
              </thead>
              <tbody>
                {analytics.trend.map((r) => (
                  <tr key={r.month} className="border-b border-gray-50 dark:border-gray-800/50">
                    <td className="py-2 font-bold text-gray-700 dark:text-gray-200">{r.month}</td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-300">{r.added}</td>
                    <td className="py-2 text-right text-gray-600 dark:text-gray-300">{r.sends}</td>
                    <td className="py-2 text-right font-bold text-purple-600 dark:text-purple-400">{r.replies}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══ Page shell ═══════════════════════════════════════════

const AdminOutreach = () => {
  const [tab, setTab] = useState('pipeline');
  const [sequences, setSequences] = useState([]);
  const [prospects, setProspects] = useState([]);

  const fetchSequences = useCallback(async () => {
    const res = await api.get('/outreach/sequences');
    if (res.ok) setSequences(res.data);
  }, []);

  const fetchProspectsLight = useCallback(async () => {
    const res = await api.get('/outreach/prospects', { params: { limit: 500 } });
    if (res.ok) setProspects(res.data);
  }, []);

  useEffect(() => {
    fetchSequences();
    fetchProspectsLight();
  }, [fetchSequences, fetchProspectsLight]);

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white font-heading">Outreach</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-1">
              Cold prospects → drafts → sequences → replies → leads. Every send is guarded by the suppression list, daily limit and sending window.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${
                tab === t.id
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {tab === 'pipeline' && <ProspectsTab sequences={sequences} />}
        {tab === 'sequences' && <SequencesTab sequences={sequences} reload={fetchSequences} />}
        {tab === 'audits' && <AuditsTab prospects={prospects} />}
        {tab === 'suppressions' && <SuppressionsTab />}
        {tab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default AdminOutreach;

