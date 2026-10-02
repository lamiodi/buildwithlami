import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { notify } from '../../../services/notify';
import { Badge, fmtDate, cardClass } from './shared.jsx';

// ─── HandoverTab (§51–§53) ────────────────────────────────
// Project-level offboarding: the handover checklist (required
// items enforced server-side), the launch button that fires the
// post-launch automation (7/30-day checks, testimonial, referral,
// maintenance, renewal), and a copyable handover pack summary
// (§52 — deliberately no credentials in it).

const HandoverTab = ({ projectId, onProjectChanged }) => {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextStatus, setNextStatus] = useState('MAINTENANCE');
  const [busy, setBusy] = useState(false);
  const [showPack, setShowPack] = useState(false);

  const fetchState = useCallback(async () => {
    setError('');
    const res = await api.get(`/aftercare/projects/${projectId}/handover`);
    if (res.ok && res.data) setState(res.data);
    else setError(res.error || 'Failed to load handover state.');
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchState(); }, [fetchState]);

  const toggleItem = async (item) => {
    const res = await api.patch(`/aftercare/projects/${projectId}/handover/checklist`, {
      key: item.key, done: !item.done,
    });
    if (res.ok) {
      setState((prev) => ({
        ...prev,
        checklist: res.data.checklist,
        missing_required: res.data.missing_required,
      }));
    } else {
      notify.error(res.error || 'Failed to update checklist.');
    }
  };

  const launch = async () => {
    if (!window.confirm('Mark this project as LAUNCHED? This schedules the post-launch checks (7-day, 30-day, testimonial, referral, maintenance, renewal).')) return;
    setBusy(true);
    const res = await api.post(`/aftercare/projects/${projectId}/launch`, {});
    setBusy(false);
    if (res.ok) {
      notify.success(`Launched 🚀 — ${res.data?.automation?.created ?? 0} post-launch task(s) scheduled`);
      fetchState();
      onProjectChanged?.();
    } else {
      notify.error(res.error || 'Launch failed.');
    }
  };

  const complete = async () => {
    const label = nextStatus === 'MAINTENANCE' ? 'MAINTENANCE (care plan continues)' : 'ARCHIVED (fully wrapped)';
    if (!window.confirm(`Complete handover and move the project to ${label}?`)) return;
    setBusy(true);
    const res = await api.post(`/aftercare/projects/${projectId}/handover/complete`, { next_status: nextStatus });
    setBusy(false);
    if (res.ok) {
      notify.success('Handover completed — offboarding done ✅');
      fetchState();
      onProjectChanged?.();
    } else {
      notify.error(res.error || 'Handover completion blocked.');
    }
  };

  const startHandover = async () => {
    const res = await api.post(`/aftercare/projects/${projectId}/handover/start`, {});
    if (res.ok) { notify.success('Handover started'); fetchState(); }
    else notify.error(res.error || 'Failed to start handover.');
  };

  const buildPack = () => {
    if (!state) return '';
    const p = state.project;
    const doneItems = state.checklist.filter((i) => i.done).map((i) => `  ✓ ${i.label}`);
    return [
      `HANDOVER PACK — ${p.project_name}`,
      `Client: ${p.client_name || '—'}${p.client_email ? ` (${p.client_email})` : ''}`,
      `Website: ${p.domain_name || '—'}`,
      `Status: ${p.status}${p.offboarding_completed_at ? ` · handover completed ${fmtDate(p.offboarding_completed_at)}` : ''}`,
      '',
      'Checklist completed:',
      ...(doneItems.length ? doneItems : ['  (none yet)']),
      '',
      'Support: buildwithlami@gmail.com — reply time within 1 business day.',
      'Tip: renewals are tracked in the admin Aftercare → Renewals tab.',
      '',
      '(Credentials are never included here — they live in the encrypted vault.)',
    ].join('\n');
  };

  if (loading) {
    return <p className="text-sm text-gray-400 font-body py-4">Loading handover state…</p>;
  }
  if (error || !state) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-500 font-body">{error || 'Handover unavailable.'}</p>
        <button onClick={fetchState} className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-orange-600 transition-colors font-body">Retry</button>
      </div>
    );
  }

  const p = state.project;
  const missing = state.missing_required || [];
  const doneCount = state.checklist.filter((i) => i.done).length;
  const canLaunch = !['LAUNCHED', 'ARCHIVED'].includes(p.status);

  return (
    <div className="space-y-8">
      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={p.offboarding_status === 'COMPLETED' ? 'green' : p.offboarding_status === 'IN_PROGRESS' ? 'amber' : 'gray'}>
          Handover: {p.offboarding_status.replace('_', ' ')}
        </Badge>
        <Badge tone={p.status === 'LAUNCHED' ? 'purple' : p.status === 'ARCHIVED' ? 'gray' : 'blue'}>Project: {p.status}</Badge>
        {p.offboarding_started_at && (
          <span className="text-[11px] text-gray-400 font-body">Started {fmtDate(p.offboarding_started_at)}</span>
        )}
        {canLaunch && (
          <button onClick={launch} disabled={busy}
            className="ml-auto bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-2 px-4 rounded-xl transition-all text-sm font-body disabled:opacity-50">
            🚀 Mark as Launched
          </button>
        )}
      </div>

      {/* Checklist */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-400 font-body">Handover Checklist</h3>
          <span className="text-xs font-bold text-gray-500 font-body">{doneCount}/{state.checklist.length} done</span>
        </div>
        <div className={`${cardClass} divide-y divide-gray-100 dark:divide-gray-800 border-gray-100 dark:border-gray-800/60`}>
          {state.checklist.map((item) => (
            <button key={item.key} onClick={() => toggleItem(item)}
              className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                item.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 dark:border-gray-600'
              }`}>
                {item.done && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                )}
              </span>
              <span className="flex-1">
                <span className={`text-sm font-body font-bold ${item.done ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                  {item.label}
                </span>
                {item.required && <Badge tone={item.done ? 'green' : 'red'}>{item.done ? 'Required ✓' : 'Required'}</Badge>}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Complete handover */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-400 font-body mb-3">Complete Handover</h3>
        {missing.length > 0 ? (
          <p className="text-sm text-amber-600 dark:text-amber-400 font-body">
            Blocked — {missing.length} required item{missing.length === 1 ? '' : 's'} outstanding:
            <span className="block mt-1 text-[11px] text-gray-500 font-body">{missing.join(' · ')}</span>
          </p>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 font-body">
              <option value="MAINTENANCE">Move to MAINTENANCE (care plan)</option>
              <option value="ARCHIVED">Move to ARCHIVED (fully wrapped)</option>
            </select>
            <button onClick={complete} disabled={busy}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm font-body disabled:opacity-50">
              Complete Handover
            </button>
            {p.offboarding_status === 'COMPLETED' && (
              <span className="text-xs text-gray-400 font-body">Already completed {fmtDate(p.offboarding_completed_at)} — status can still be adjusted.</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button onClick={() => setShowPack((s) => !s)}
            className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">
            {showPack ? 'Hide handover pack' : 'Preview handover pack'}
          </button>
          <button onClick={() => {
            navigator.clipboard.writeText(buildPack())
              .then(() => notify.success('Handover pack copied — paste into an email or the portal'))
              .catch(() => notify.error('Could not copy — clipboard unavailable'));
          }} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">
            Copy pack
          </button>
        </div>
        {showPack && (
          <pre className="mt-3 text-[11px] leading-relaxed bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl p-4 overflow-x-auto text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">{buildPack()}</pre>
        )}
      </div>
    </div>
  );
};

export default HandoverTab;
