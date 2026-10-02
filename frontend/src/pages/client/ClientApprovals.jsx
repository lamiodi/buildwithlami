import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import Skeleton from '../../components/Skeleton';
import { CheckCircle2, XCircle, MessageSquarePlus, FileDiff } from 'lucide-react';

// ─── Client Approvals & Change Requests ───────────────────
// Admin OS Phase 3a (blueprint §35/§37) — the client's decision
// surface. Sign-offs made here are timestamped records (with a
// decision log entry on the project), not WhatsApp messages.
// ──────────────────────────────────────────────────────────

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtMoney = (a, c) => c === 'NGN' ? `₦${Number(a || 0).toLocaleString()}` : `${c} ${Number(a || 0).toLocaleString()}`;

export default function ClientApprovals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [commentFor, setCommentFor] = useState(null); // { kind: 'approval'|'cr', id }
  const [comment, setComment] = useState('');

  const fetchAll = useCallback(async () => {
    const res = await api.get('/client-portal/approvals', {}, 'client');
    if (res.ok) setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const decide = async (kind, id, decision, needsComment) => {
    if (needsComment && !comment.trim()) {
      setCommentFor({ kind, id });
      notify.error('Please describe the changes you need first.');
      return;
    }
    setBusyId(id);
    const path = kind === 'approval'
      ? `/client-portal/approvals/${id}/decide`
      : `/client-portal/change-requests/${id}/decide`;
    const res = await api.patch(path, { decision, comment: comment.trim() || undefined }, 'client');
    setBusyId(null);
    if (res.ok) {
      notify.success(
        decision === 'APPROVED'
          ? (kind === 'cr' ? 'Change approved — thank you!' : 'Approved — thank you!')
          : 'Feedback sent to Lami.'
      );
      setComment(''); setCommentFor(null);
      fetchAll();
    } else {
      notify.error(res.error || 'Could not record your decision.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    );
  }

  const approvals = data?.approvals || [];
  const changeRequests = data?.changeRequests || [];
  const empty = approvals.length === 0 && changeRequests.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="text-accent" />
          Approvals & Changes
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your sign-offs here are recorded with a timestamp — no need to confirm over WhatsApp.
        </p>
      </div>

      {empty && (
        <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nothing waiting on you</h3>
          <p className="text-gray-500 dark:text-gray-400">When Lami needs your approval on work, it will appear here.</p>
        </div>
      )}

      {/* ── Approvals ── */}
      {approvals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400">Awaiting your approval ({approvals.length})</h2>
          {approvals.map(a => (
            <div key={a.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {a.title}{a.version_label && <span className="text-gray-400 font-medium"> · {a.version_label}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.project_name} · requested {fmtDate(a.requested_at)}</p>
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{a.item_type}</span>
              </div>
              {a.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{a.description}</p>}

              {commentFor?.kind === 'approval' && commentFor.id === a.id && (
                <textarea
                  rows="3" autoFocus
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="What would you like changed?"
                  className="w-full mt-4 p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent font-body"
                />
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  disabled={busyId === a.id}
                  onClick={() => decide('approval', a.id, 'APPROVED', false)}
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
                >
                  <CheckCircle2 size={15} /> Approve
                </button>
                <button
                  disabled={busyId === a.id}
                  onClick={() => decide('approval', a.id, 'CHANGES_REQUESTED', true)}
                  className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/40 disabled:opacity-60 text-amber-700 dark:text-amber-300 text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
                >
                  <MessageSquarePlus size={15} /> Request Changes
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Change requests ── */}
      {changeRequests.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-400">Proposed changes ({changeRequests.length})</h2>
          {changeRequests.map(cr => (
            <div key={cr.id} className="bg-white dark:bg-card rounded-xl border border-amber-100 dark:border-amber-900/20 shadow-sm p-6">
              <div className="flex items-start gap-3">
                <FileDiff size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{cr.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cr.project_name} · sent {fmtDate(cr.sent_at)}</p>
                </div>
              </div>
              {cr.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{cr.description}</p>}
              {cr.reason && <p className="text-xs text-gray-400 mt-2">Reason: {cr.reason}</p>}

              {(Number(cr.additional_cost) > 0 || cr.additional_days > 0 || cr.launch_impact) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {Number(cr.additional_cost) > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Added cost</p>
                      <p className="font-bold text-gray-900 dark:text-white mt-1">{fmtMoney(cr.additional_cost, cr.currency)}</p>
                    </div>
                  )}
                  {cr.additional_days > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Timeline</p>
                      <p className="font-bold text-gray-900 dark:text-white mt-1">+{cr.additional_days} day{cr.additional_days === 1 ? '' : 's'}</p>
                    </div>
                  )}
                  {cr.launch_impact && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Launch</p>
                      <p className="font-bold text-gray-900 dark:text-white mt-1 text-sm">{cr.launch_impact}</p>
                    </div>
                  )}
                </div>
              )}

              {commentFor?.kind === 'cr' && commentFor.id === cr.id && (
                <textarea
                  rows="3" autoFocus
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Optional note for Lami…"
                  className="w-full mt-4 p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent font-body"
                />
              )}

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  disabled={busyId === cr.id}
                  onClick={() => decide('cr', cr.id, 'APPROVED', false)}
                  className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
                >
                  <CheckCircle2 size={15} /> Approve Change
                </button>
                <button
                  disabled={busyId === cr.id}
                  onClick={() => decide('cr', cr.id, 'REJECTED', false)}
                  className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 disabled:opacity-60 text-rose-600 dark:text-rose-300 text-sm font-bold py-2.5 px-5 rounded-xl transition-colors"
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
