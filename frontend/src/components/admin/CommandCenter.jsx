import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { formatNaira } from '../../utils/currency';

// ─── CommandCenter ────────────────────────────────────────
// Admin OS Phase 1 + Phase 6 — the dashboard's action layer
// (blueprint §5, §74, §94). Answers "what needs my attention
// next?" with:
//   • Priority tasks — the existing task priorities and due dates
//   • Waiting on Client — pending client actions
//   • Needs Attention — overdue invoices, stale leads, etc.
//   • Next Actions    — the §30 next-action fields across
//                       leads / clients / projects
// Data: GET /api/dashboard/command-center (layout + client
// lists), today's message counts and upcoming renewals. The
// dashboard owns the shared refresh cadence.

const PRIORITY_STYLES = {
  URGENT: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  HIGH: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  LOW: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

const ACTION_TYPE_ICONS = {
  UPLOAD: '📤', APPROVAL: '✅', PAYMENT: '💳', INFO: 'ℹ️', REVIEW: '👀',
};

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  : '—';

const fmtTime = (m) => {
  if (!m) return '';
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`;
};

// Outstanding amounts are shown in their own currency — never
// silently converted into a single total (blueprint §42).
const fmtMoney = (amount, currency) =>
  currency === 'NGN'
    ? formatNaira(amount)
    : `${currency} ${Number(amount || 0).toLocaleString()}`;

const PanelTitle = ({ label, count, link, linkLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-2">
      {label}
      {count > 0 && (
        <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </h3>
    {link && (
      <Link to={link} className="text-xs font-extrabold uppercase tracking-widest text-accent hover:text-orange-600">
        {linkLabel || 'View all'} →
      </Link>
    )}
  </div>
);

const EmptyNote = ({ children }) => (
  <p className="text-sm text-gray-400 dark:text-gray-500 font-body py-3">{children}</p>
);

const CommandCenter = ({ refreshKey }) => {
  const [data, setData] = useState(null);
  const [snapshot, setSnapshot] = useState(null);
  const [partialError, setPartialError] = useState('');
  const [renewals, setRenewals] = useState([]);
  const [error, setError] = useState(false);

  const fetchCenter = useCallback(async () => {
    if (document.visibilityState === 'hidden') return;
    const [res, today, rn] = await Promise.all([
      api.get('/dashboard/command-center'),
      api.get('/dashboard/today'),
      // Phase 5 — upcoming renewals live in Aftercare; a failure
      // here is additive and must not blank the command center.
      api.get('/aftercare/renewals/upcoming?days=30'),
    ]);
    if (res.ok && res.data) {
      setData(res.data);
      setError(false);
    } else if (!res.ok) {
      setError(res.error || 'Could not refresh your work queue.');
    }
    // Secondary counts must not blank an otherwise available queue.
    if (today.ok && today.data) setSnapshot(today.data);
    if (rn.ok && Array.isArray(rn.data)) setRenewals(rn.data);
    setPartialError([!today.ok && 'Message and feedback counts unavailable.', !rn.ok && 'Renewals unavailable.'].filter(Boolean).join(' '));
  }, []);

  useEffect(() => {
    fetchCenter();
  }, [fetchCenter, refreshKey]);

  if (error && !data) {
    return (
      <div className="mb-6 bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 p-4 text-sm text-gray-400 font-body">
        {error} <button type="button" onClick={fetchCenter} className="font-bold underline">Retry</button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-6 grid grid-cols-1 xl:grid-cols-2 gap-4" aria-busy="true">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 p-5 animate-pulse">
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded mb-4" />
            <div className="space-y-2.5">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { tonightQueue = [], waitingOnClient = [], needsAttention = [], nextActions = {}, counters = {}, outstandingByCurrency = [] } = data;
  // Phase 6 scored queue wins when it has loaded; otherwise fall
  // back to the basic queue from the command-center payload.
  const scoredQueue = tonightQueue;
  const capacity = null;
  const allNextActions = [
    ...(nextActions.leads || []).map((x) => ({ ...x, kind: 'Lead', link: '/admin/crm' })),
    ...(nextActions.clients || []).map((x) => ({ ...x, kind: 'Client', link: `/admin/clients/${x.id}` })),
    ...(nextActions.projects || []).map((x) => ({ ...x, kind: 'Project', link: `/admin/projects/${x.id}` })),
  ];

  const showNextActions = allNextActions.length > 0;
  const showOutstanding = outstandingByCurrency.length > 0;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-bold">Today’s work</h2><p className="text-xs text-gray-500">Across all workspaces</p></div>
      {(error || partialError) && <div role="alert" className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-sm">{error || partialError} Previously loaded information may be out of date. <button type="button" onClick={fetchCenter} className="font-bold underline">Retry</button></div>}
      {/* Counter strip */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Enquiries to reply', value: snapshot?.leadsNeedReply, link: '/admin/inbox?status=New', hot: snapshot?.leadsNeedReply > 0 },
          { label: 'Messages to read', value: snapshot?.unreadMessages, link: '/admin/inbox', hot: snapshot?.unreadMessages > 0 },
          { label: 'Open feedback', value: snapshot?.openFeedback, link: '/admin/inbox?kind=feedback', hot: snapshot?.openFeedback > 0 },
          { label: 'Due Today', value: counters.tasksDueToday, link: '/admin/tasks', hot: counters.tasksDueToday > 0 },
          { label: 'Overdue', value: counters.overdueTasks, link: '/admin/tasks', hot: counters.overdueTasks > 0 },
          { label: 'Waiting on Client', value: counters.waitingOnClient, link: '/admin/tasks', hot: false },
          { label: 'New Leads (7d)', value: counters.newLeads7d, link: '/admin/crm', hot: false },
          { label: 'Renewals (60d)', value: counters.upcomingRenewals, link: '/admin/aftercare', hot: false },
          { label: 'Proof Queue', value: counters.pendingPaymentProofs, link: '/admin/payments', hot: counters.pendingPaymentProofs > 0 },
        ].map((c) => (
          <Link key={c.label} to={c.link}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-body transition-colors border ${
              c.hot
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 hover:bg-red-100'
                : 'bg-white dark:bg-[#1c1c1c] border-gray-100 dark:border-gray-800/60 text-gray-600 dark:text-gray-300 hover:border-accent/40'
            }`}>
            {c.label}: <span className="font-extrabold">{c.value ?? '—'}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* ── Tonight Queue (Phase 6 scored) ── */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-5">
          <PanelTitle label="Priority tasks" count={scoredQueue.length} link="/admin/tasks" />
          {capacity && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-1.5">
                <span>Tonight's plan</span>
                <span className={capacity.overCommitted ? 'text-red-500' : 'text-gray-400'}>
                  {fmtTime(capacity.committedMinutes)} of {fmtTime(capacity.capacityMinutes)}
                  {capacity.overCommitted ? ' — over capacity' : ''}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${capacity.overCommitted ? 'bg-red-500' : 'bg-accent'}`}
                  style={{ width: `${Math.min((capacity.committedMinutes / Math.max(capacity.capacityMinutes, 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          {scoredQueue.length === 0 ? (
            <EmptyNote>No urgent tasks right now.</EmptyNote>
          ) : (
            <ol className="space-y-2.5">
              {scoredQueue.map((t, i) => (
                <li key={t.id}>
                  <Link to={t.project_id ? `/admin/projects/${t.project_id}` : '/admin/tasks'}
                    className="flex items-start gap-3 p-2.5 -m-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-body truncate group-hover:text-accent transition-colors">
                        {t.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                        <span className={`text-xs font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
                        <span className="text-xs text-gray-400 font-body">{t.client_name || t.project_name || 'Standalone'}</span>
                        {t.estimated_minutes && <span className="text-xs text-gray-400 font-body">· {fmtTime(t.estimated_minutes)}</span>}
                        {t.score > 0 && (
                          <span className={`text-xs font-bold font-body ${t.overdue ? 'text-red-500' : 'text-gray-400'}`}>
                            · {t.reason}{t.due_at ? ` (${fmtDate(t.due_at)})` : ''}
                          </span>
                        )}
                        {t.blocked && <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600">Blocked</span>}
                      </div>
                      {/* §74 — show the full why, not just the top reason */}
                      {Array.isArray(t.reasons) && t.reasons.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {t.reasons.map((r) => (
                            <span key={r} className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded px-1.5 py-0.5">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* ── Waiting on Client ── */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-5">
          <PanelTitle label="Waiting on Client" count={waitingOnClient.length} />
          {waitingOnClient.length === 0 ? (
            <EmptyNote>Nothing pending from clients right now.</EmptyNote>
          ) : (
            <ul className="space-y-2.5">
              {waitingOnClient.map((a) => (
                <li key={a.id}>
                  <Link to={`/admin/clients/${a.client_id || ''}`}
                    className="flex items-start gap-3 p-2.5 -m-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <span className="text-base leading-none shrink-0 mt-0.5" aria-hidden="true">
                      {ACTION_TYPE_ICONS[a.type] || 'ℹ️'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-body truncate group-hover:text-accent transition-colors">
                        {a.title}
                      </p>
                      <p className={`text-xs font-body mt-0.5 ${a.overdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {a.client_name}{a.due_at ? ` · due ${fmtDate(a.due_at)}${a.overdue ? ' (overdue)' : ''}` : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Needs Attention ── */}
        <div className={`bg-white dark:bg-[#1c1c1c] rounded-2xl border shadow-sm p-5 ${needsAttention.length > 0 ? 'border-amber-200 dark:border-amber-900/50' : 'border-gray-100 dark:border-gray-800/60'}`}>
          <PanelTitle label="Needs My Attention" count={needsAttention.length} />
          {needsAttention.length === 0 ? (
            <EmptyNote>All clear. ✅</EmptyNote>
          ) : (
            <ul className="space-y-2">
              {needsAttention.map((n) => (
                <li key={`${n.kind}-${n.id}`}>
                  <Link to={n.link}
                    className="flex items-start gap-3 p-2.5 -m-2.5 rounded-xl hover:bg-amber-50/60 dark:hover:bg-amber-900/10 transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-body group-hover:text-accent transition-colors">{n.title}</p>
                      <p className="text-xs text-gray-400 font-body">{n.detail}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Upcoming Renewals (Phase 5 — Aftercare) ── */}
        {renewals.length > 0 && (
          <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-5">
            <PanelTitle label="Upcoming Renewals" count={renewals.length} link="/admin/aftercare" />
            <ul className="space-y-2">
              {renewals.map((r) => {
                const days = r.days_remaining != null ? Number(r.days_remaining) : null;
                const tone = days != null && days <= 7 ? 'text-red-500' : days != null && days <= 30 ? 'text-amber-600' : 'text-gray-400';
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white font-body truncate">{r.label}</p>
                      <p className="text-xs text-gray-400 font-body">{r.client_name || r.service}{r.amount != null ? ` · ${fmtMoney(r.amount, r.currency)}` : ''}</p>
                    </div>
                    <span className={`text-xs font-bold font-body shrink-0 ${tone}`}>
                      {days != null && days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Next Actions + Money ── */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-5">
          <PanelTitle label="Next Actions" count={allNextActions.length} />
          {!showNextActions && !showOutstanding && <EmptyNote>No next actions set. Add them on leads, clients and projects.</EmptyNote>}
          {showNextActions && (
            <ul className="space-y-2.5 mb-4">
              {allNextActions.slice(0, 6).map((x) => (
                <li key={`${x.kind}-${x.id}`} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white font-body truncate">{x.next_action}</p>
                    <p className="text-xs text-gray-400 font-body">
                      <span className="font-extrabold uppercase tracking-widest text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded mr-1.5">{x.kind}</span>
                      {x.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Link to={x.link} className="text-xs font-bold text-accent hover:text-orange-600 font-body">Open →</Link>
                    <p className={`text-xs font-body ${x.overdue ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {x.next_action_due_at ? fmtDate(x.next_action_due_at) : 'No date'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {showOutstanding && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 mb-3">Outstanding Payments</h3>
              <div className="flex flex-wrap gap-2">
                {outstandingByCurrency.map((o) => (
                  <span key={o.currency} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-xl font-body">
                    {fmtMoney(o.amount, o.currency)} · {o.count} invoice{o.count === 1 ? '' : 's'}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 font-body mt-2">Shown per currency — not combined across FX rates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
