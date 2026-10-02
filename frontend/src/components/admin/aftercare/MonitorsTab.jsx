import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { notify } from '../../../services/notify';
import { inputClass, labelClass, fmtDateTime, fmtDate, Badge, daysTone, cardClass, thClass } from './shared.jsx';

// ─── MonitorsTab (§49) ────────────────────────────────────
// Lightweight uptime + SSL watch over launched sites. Checks run
// every 15 minutes server-side (free-tier friendly); this tab
// shows the latest state, the recent event log per monitor, and
// a manual "check everything now" button.

const emptyForm = { name: '', url: '', client_id: '', project_id: '', enabled: true };

const MonitorEvents = ({ monitorId }) => {
  const [events, setEvents] = useState(null);
  useEffect(() => {
    let alive = true;
    api.get(`/aftercare/monitors/${monitorId}/events?limit=8`).then((res) => {
      if (alive && res.ok && Array.isArray(res.data)) setEvents(res.data);
    });
    return () => { alive = false; };
  }, [monitorId]);

  if (!events) return null;
  if (events.length === 0) return <p className="text-[11px] text-gray-400 font-body py-2">No checks recorded yet.</p>;
  return (
    <ul className="space-y-1 py-2">
      {events.map((ev) => (
        <li key={ev.id} className="flex items-center gap-2 text-[11px] font-body text-gray-500 dark:text-gray-400">
          <Badge tone={ev.status === 'UP' ? 'green' : 'red'}>{ev.status}</Badge>
          <span>{fmtDateTime(ev.checked_at)}</span>
          {ev.response_time_ms != null && <span>· {ev.response_time_ms}ms</span>}
          {ev.error && <span className="text-red-500">· {ev.error}</span>}
        </li>
      ))}
    </ul>
  );
};

const MonitorsTab = ({ clients, projects }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRows = useCallback(async () => {
    setError(null);
    const res = await api.get('/aftercare/monitors');
    if (res.ok && Array.isArray(res.data)) setRows(res.data);
    else if (!res.ok) setError(res.error || 'Failed to load monitors.');
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (m) => {
    setEditingId(m.id);
    setShowForm(true);
    setForm({
      name: m.name || '',
      url: m.url || '',
      client_id: m.client_id || '',
      project_id: m.project_id || '',
      enabled: !!m.enabled,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      client_id: form.client_id || null,
      project_id: form.project_id || null,
    };
    const res = editingId
      ? await api.patch(`/aftercare/monitors/${editingId}`, payload)
      : await api.post('/aftercare/monitors', payload);
    if (res.ok) {
      notify.success(editingId ? 'Monitor updated' : 'Monitor added — first check runs within 15 minutes');
      setForm(emptyForm); setEditingId(null); setShowForm(false); fetchRows();
    } else {
      notify.error(res.error || 'Error saving monitor.');
    }
  };

  const runChecks = async () => {
    setChecking(true);
    const res = await api.post('/aftercare/monitors/run-checks', {});
    setChecking(false);
    if (res.ok) {
      notify.success(`Checked ${res.data?.checked ?? 0} monitor(s) — ${res.data?.down ?? 0} down`);
      fetchRows();
    } else {
      notify.error(res.error || 'Check run failed.');
    }
  };

  const toggleEnabled = async (m) => {
    const res = await api.patch(`/aftercare/monitors/${m.id}`, { enabled: !m.enabled });
    if (res.ok) { notify.success(m.enabled ? 'Monitor paused' : 'Monitor enabled'); fetchRows(); }
    else notify.error(res.error || 'Error updating monitor.');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this monitor?')) return;
    const res = await api.delete(`/aftercare/monitors/${id}`);
    if (res.ok) { notify.success('Monitor deleted'); fetchRows(); }
    else notify.error(res.error || 'Error deleting monitor.');
  };

  const downCount = rows.filter((m) => m.enabled && m.last_status === 'DOWN').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {showForm && (
        <div className={`${cardClass} p-6 md:p-8 h-fit border-gray-100 dark:border-gray-800/60`}>
          <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
            {editingId ? 'Edit Monitor' : 'New Monitor'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input type="text" name="name" required value={form.name} onChange={handleChange}
                placeholder="e.g. StyleSence store" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL (http/https)</label>
              <input type="url" name="url" required value={form.url} onChange={handleChange}
                placeholder="https://stylesence.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Client (Optional)</label>
              <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass}>
                <option value="">— None —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Project (Optional)</label>
              <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                <option value="">— None —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="mon-enabled" name="enabled" checked={form.enabled} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              <label htmlFor="mon-enabled" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-body">Enabled</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                {editingId ? 'Update Monitor' : 'Add Monitor'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl transition-all text-sm font-bold font-body">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
            Checked every 15 minutes · alerts on 2 consecutive failures, recovery and SSL expiring ≤14 days.
          </p>
          <div className="flex gap-2 ml-auto">
            {downCount > 0 && <Badge tone="red">{downCount} down</Badge>}
            <button onClick={runChecks} disabled={checking}
              className="bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-2 px-4 rounded-xl transition-all text-sm font-body disabled:opacity-50">
              {checking ? 'Checking…' : 'Check now'}
            </button>
            <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((s) => !s); }}
              className="bg-accent hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
              {showForm ? 'Close' : '+ Monitor'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`${cardClass} p-8 text-center text-gray-400 font-body`}>Loading monitors...</div>
        ) : error ? (
          <div className={`${cardClass} p-8 text-center text-red-500 font-body`}>{error}</div>
        ) : rows.length === 0 ? (
          <div className={`${cardClass} p-12 text-center font-body`}>
            <p className="text-gray-500 dark:text-gray-400">No monitors yet. Add the sites you've launched — especially stores taking payments.</p>
          </div>
        ) : (
          <div className={cardClass}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className={thClass}>Site</th>
                    <th className={thClass + ' text-center'}>Status</th>
                    <th className={thClass + ' text-center'}>Last check</th>
                    <th className={thClass + ' text-center'}>SSL</th>
                    <th className={thClass + ' text-right'}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((m) => (
                    <React.Fragment key={m.id}>
                      <tr className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${m.enabled ? '' : 'opacity-50'}`}>
                        <td className="py-4 px-4">
                          <p className="font-bold text-gray-900 dark:text-white font-body">
                            {m.name}{!m.enabled && ' (paused)'}
                          </p>
                          <a href={m.url} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-body break-all">{m.url}</a>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {m.last_status
                            ? <Badge tone={m.last_status === 'UP' ? 'green' : 'red'}>
                                {m.last_status}{m.last_status_code ? ` ${m.last_status_code}` : ''}
                              </Badge>
                            : <Badge tone="gray">Pending</Badge>}
                          {m.consecutive_failures > 0 && (
                            <span className="block mt-1 text-[9px] font-extrabold uppercase tracking-widest text-red-500">
                              {m.consecutive_failures}× failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center text-xs text-gray-500 dark:text-gray-400 font-body">
                          {fmtDateTime(m.last_checked_at)}
                          {m.last_response_time_ms != null && <span className="block text-gray-400">{m.last_response_time_ms}ms</span>}
                          {m.last_error && <span className="block text-red-500 max-w-[180px] truncate" title={m.last_error}>{m.last_error}</span>}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {m.ssl_expires_at ? (
                            <>
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-200 font-body">{fmtDate(m.ssl_expires_at)}</span>
                              <span className="block mt-1">
                                <Badge tone={daysTone(Math.round((new Date(m.ssl_expires_at) - new Date()) / 86400000))}>
                                  {Math.round((new Date(m.ssl_expires_at) - new Date()) / 86400000)}d
                                </Badge>
                              </span>
                            </>
                          ) : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>}
                        </td>
                        <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                            className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">
                            {expandedId === m.id ? 'Hide log' : 'Log'}
                          </button>
                          <button onClick={() => toggleEnabled(m)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">{m.enabled ? 'Pause' : 'Resume'}</button>
                          <button onClick={() => startEdit(m)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Edit</button>
                          <button onClick={() => remove(m.id)} className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Delete</button>
                        </td>
                      </tr>
                      {expandedId === m.id && (
                        <tr className="bg-gray-50/60 dark:bg-gray-900/40">
                          <td colSpan="5" className="py-3 px-6">
                            <MonitorEvents monitorId={m.id} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorsTab;
