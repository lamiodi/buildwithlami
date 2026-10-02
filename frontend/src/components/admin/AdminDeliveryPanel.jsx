import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

// ─── AdminDeliveryPanel ───────────────────────────────────
// Admin OS Phase 3a — Delivery Control (blueprint §35–§38) in
// one self-contained panel: client approvals, change requests,
// and the decision log. Fetches its own data so the project
// page only needs a one-line hook.
// ──────────────────────────────────────────────────────────

const ITEM_TYPES = ['DESIGN', 'FEATURE', 'CONTENT', 'STAGE', 'OTHER'];

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  CHANGES_REQUESTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  SUPERSEDED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  CANCELLED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  DRAFT: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  SENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

const Badge = ({ status }) => (
  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${STATUS_STYLES[status] || STATUS_STYLES.DRAFT}`}>
    {status.replace(/_/g, ' ')}
  </span>
);

const inputClass = "w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';
const fmtMoney = (a, c) => c === 'NGN' ? `₦${Number(a || 0).toLocaleString()}` : `${c} ${Number(a || 0).toLocaleString()}`;

const AdminDeliveryPanel = ({ projectId, project }) => {
  const [approvals, setApprovals] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [approvalForm, setApprovalForm] = useState({ title: '', item_type: 'DESIGN', version_label: '', description: '', notify_client: true });
  const [crForm, setCrForm] = useState({ title: '', description: '', reason: '', additional_cost: '', currency: 'NGN', additional_days: '', launch_impact: '', send_now: true });
  const [decisionForm, setDecisionForm] = useState({ title: '', decision: '' });
  const [busy, setBusy] = useState(false);

  const fetchAll = useCallback(async () => {
    const [a, c, d] = await Promise.all([
      api.get(`/delivery/projects/${projectId}/approvals`),
      api.get(`/delivery/projects/${projectId}/change-requests`),
      api.get(`/delivery/projects/${projectId}/decisions`),
    ]);
    if (a.ok) setApprovals(a.data);
    if (c.ok) setChangeRequests(c.data);
    if (d.ok) setDecisions(d.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createApproval = async (e) => {
    e.preventDefault();
    if (!approvalForm.title.trim()) { notify.error('Title is required'); return; }
    setBusy(true);
    const res = await api.post(`/delivery/projects/${projectId}/approvals`, approvalForm);
    setBusy(false);
    if (res.ok) {
      notify.success(res.data.emailStatus === 'sent' ? 'Approval requested — client emailed.' : 'Approval requested.');
      setApprovalForm({ title: '', item_type: 'DESIGN', version_label: '', description: '', notify_client: true });
      fetchAll();
    } else notify.error(res.error || 'Failed to create approval.');
  };

  const setApprovalStatus = async (id, status) => {
    const res = await api.patch(`/delivery/approvals/${id}`, { status });
    if (res.ok) { notify.success(`Approval ${status.toLowerCase()}.`); fetchAll(); }
    else notify.error(res.error || 'Failed to update approval.');
  };

  const createChangeRequest = async (e) => {
    e.preventDefault();
    if (!crForm.title.trim()) { notify.error('Title is required'); return; }
    setBusy(true);
    const res = await api.post(`/delivery/projects/${projectId}/change-requests`, {
      ...crForm,
      additional_cost: crForm.additional_cost === '' ? 0 : Number(crForm.additional_cost),
      additional_days: crForm.additional_days === '' ? 0 : Number(crForm.additional_days),
    });
    setBusy(false);
    if (res.ok) {
      notify.success(res.data.emailStatus === 'sent' ? 'Change request sent — client emailed.' : 'Change request saved as draft.');
      setCrForm({ title: '', description: '', reason: '', additional_cost: '', currency: 'NGN', additional_days: '', launch_impact: '', send_now: true });
      fetchAll();
    } else notify.error(res.error || 'Failed to create change request.');
  };

  const sendChangeRequest = async (id) => {
    const res = await api.patch(`/delivery/change-requests/${id}`, { status: 'SENT' });
    if (res.ok) { notify.success(res.data.emailStatus === 'sent' ? 'Change request sent — client emailed.' : 'Change request sent.'); fetchAll(); }
    else notify.error(res.error || 'Failed to send change request.');
  };

  const createDecision = async (e) => {
    e.preventDefault();
    if (!decisionForm.title.trim() || !decisionForm.decision.trim()) { notify.error('Title and decision are required'); return; }
    setBusy(true);
    const res = await api.post(`/delivery/projects/${projectId}/decisions`, decisionForm);
    setBusy(false);
    if (res.ok) {
      notify.success('Decision logged.');
      setDecisionForm({ title: '', decision: '' });
      fetchAll();
    } else notify.error(res.error || 'Failed to log decision.');
  };

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');
  const openCRs = changeRequests.filter(c => c.status === 'SENT' || c.status === 'DRAFT');
  const included = project?.included_revision_rounds ?? 2;
  const used = project?.used_revision_rounds ?? 0;

  if (loading) {
    return <div className="animate-pulse text-gray-400 font-body text-sm py-8 text-center">Loading delivery records…</div>;
  }

  return (
    <div className="space-y-8">

      {/* ── Approvals (§35) ── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2">
            Client Approvals
            {pendingApprovals.length > 0 && (
              <span className="text-[9px] bg-amber-400 text-white px-1.5 py-0.5 rounded-full font-extrabold">{pendingApprovals.length} pending</span>
            )}
          </h2>
          {project && (
            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg ${used > included ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
              Revision rounds {used}/{included}{used > included ? ' — extra needs a change request' : ''}
            </span>
          )}
        </div>

        <form onSubmit={createApproval} className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>What needs sign-off?</label>
              <input className={inputClass} value={approvalForm.title} onChange={e => setApprovalForm({ ...approvalForm, title: e.target.value })} placeholder="Homepage V2" />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select className={inputClass} value={approvalForm.item_type} onChange={e => setApprovalForm({ ...approvalForm, item_type: e.target.value })}>
                {ITEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Version label</label>
              <input className={inputClass} value={approvalForm.version_label} onChange={e => setApprovalForm({ ...approvalForm, version_label: e.target.value })} placeholder="V2" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes for the client (optional)</label>
            <input className={inputClass} value={approvalForm.description} onChange={e => setApprovalForm({ ...approvalForm, description: e.target.value })} placeholder="What changed since the last version…" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 font-body">
              <input type="checkbox" checked={approvalForm.notify_client} onChange={e => setApprovalForm({ ...approvalForm, notify_client: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              Email the client
            </label>
            <button type="submit" disabled={busy} className="bg-accent hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold py-2 px-5 rounded-xl transition-colors">
              Request Approval
            </button>
          </div>
        </form>

        {approvals.length === 0 ? (
          <p className="text-sm text-gray-400 font-body">No approvals requested yet.</p>
        ) : (
          <div className="space-y-2">
            {approvals.map(a => (
              <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white font-body">
                    {a.title}{a.version_label && <span className="text-gray-400 font-normal"> · {a.version_label}</span>}
                  </p>
                  {a.description && <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-0.5">{a.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge status={a.status} />
                    <span className="text-[10px] text-gray-400 font-body">{a.item_type}</span>
                    <span className="text-[10px] text-gray-400 font-body">requested {fmtDate(a.requested_at)}</span>
                    {a.decided_at && <span className="text-[10px] text-gray-400 font-body">decided {fmtDate(a.decided_at)}</span>}
                  </div>
                  {a.client_comment && <p className="text-xs text-gray-600 dark:text-gray-300 font-body mt-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">“{a.client_comment}”</p>}
                </div>
                {a.status === 'PENDING' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => setApprovalStatus(a.id, 'SUPERSEDED')} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg font-bold">Supersede</button>
                    <button onClick={() => setApprovalStatus(a.id, 'CANCELLED')} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 px-3 py-1.5 rounded-lg font-bold">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Change requests (§37) ── */}
      <section>
        <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Change Requests</h2>
        <form onSubmit={createChangeRequest} className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className={labelClass}>Change</label>
              <input className={inputClass} value={crForm.title} onChange={e => setCrForm({ ...crForm, title: e.target.value })} placeholder="Add multi-currency checkout" />
            </div>
            <div>
              <label className={labelClass}>Additional cost</label>
              <input type="number" min="0" className={inputClass} value={crForm.additional_cost} onChange={e => setCrForm({ ...crForm, additional_cost: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Extra days</label>
              <input type="number" min="0" className={inputClass} value={crForm.additional_days} onChange={e => setCrForm({ ...crForm, additional_days: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Why (optional)</label>
              <input className={inputClass} value={crForm.reason} onChange={e => setCrForm({ ...crForm, reason: e.target.value })} placeholder="Client request on today's call" />
            </div>
            <div>
              <label className={labelClass}>Launch impact (optional)</label>
              <input className={inputClass} value={crForm.launch_impact} onChange={e => setCrForm({ ...crForm, launch_impact: e.target.value })} placeholder="Launch moves to Nov 12" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea rows="2" className={inputClass} value={crForm.description} onChange={e => setCrForm({ ...crForm, description: e.target.value })} placeholder="Exactly what changes, what's included, what's not…" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-300 font-body">
              <input type="checkbox" checked={crForm.send_now} onChange={e => setCrForm({ ...crForm, send_now: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              Send to client immediately
            </label>
            <button type="submit" disabled={busy} className="bg-accent hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold py-2 px-5 rounded-xl transition-colors">
              {crForm.send_now ? 'Send Change Request' : 'Save Draft'}
            </button>
          </div>
        </form>

        {changeRequests.length === 0 ? (
          <p className="text-sm text-gray-400 font-body">No change requests yet.</p>
        ) : (
          <div className="space-y-2">
            {changeRequests.map(cr => (
              <div key={cr.id} className="flex flex-wrap items-start justify-between gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white font-body">{cr.title}</p>
                  {cr.description && <p className="text-xs text-gray-500 dark:text-gray-400 font-body mt-0.5">{cr.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Badge status={cr.status} />
                    {Number(cr.additional_cost) > 0 && <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 font-body">+{fmtMoney(cr.additional_cost, cr.currency)}</span>}
                    {cr.additional_days > 0 && <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 font-body">+{cr.additional_days}d</span>}
                    <span className="text-[10px] text-gray-400 font-body">{cr.status === 'SENT' ? `sent ${fmtDate(cr.sent_at)}` : `created ${fmtDate(cr.created_at)}`}</span>
                    {cr.decided_at && <span className="text-[10px] text-gray-400 font-body">decided {fmtDate(cr.decided_at)}</span>}
                  </div>
                  {cr.client_comment && <p className="text-xs text-gray-600 dark:text-gray-300 font-body mt-1.5 bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2">“{cr.client_comment}”</p>}
                </div>
                {cr.status === 'DRAFT' && (
                  <button onClick={() => sendChangeRequest(cr.id)} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-3 py-1.5 rounded-lg font-bold shrink-0">Send</button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Decision log (§38) ── */}
      <section>
        <h2 className="text-lg font-bold font-heading text-gray-900 dark:text-white mb-4">Decision Log</h2>
        <form onSubmit={createDecision} className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60 space-y-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={decisionForm.title} onChange={e => setDecisionForm({ ...decisionForm, title: e.target.value })} placeholder="Shipping logic confirmed" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Decision</label>
              <input className={inputClass} value={decisionForm.decision} onChange={e => setDecisionForm({ ...decisionForm, decision: e.target.value })} placeholder="Client confirmed GBP/USD fixed product pricing on WhatsApp." />
            </div>
          </div>
          <button type="submit" disabled={busy} className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-sm font-bold py-2 px-5 rounded-xl transition-colors">
            Save as Decision
          </button>
        </form>

        {decisions.length === 0 ? (
          <p className="text-sm text-gray-400 font-body">No decisions logged yet — approvals and change requests add entries automatically.</p>
        ) : (
          <ol className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-2 space-y-4">
            {decisions.map(d => (
              <li key={d.id} className="ml-5">
                <span className="absolute -left-[7px] w-3 h-3 rounded-full bg-accent border-2 border-white dark:border-gray-800" />
                <p className="text-sm font-bold text-gray-900 dark:text-white font-body">{d.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-body">{d.decision}</p>
                <p className="text-[10px] text-gray-400 font-body mt-0.5">
                  {new Date(d.created_at).toLocaleString()} · {d.source.replace(/_/g, ' ')}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
};

export default AdminDeliveryPanel;
