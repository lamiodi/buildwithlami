import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { notify } from '../../../services/notify';
import { inputClass, labelClass, fmtDate, fmtMoney, Badge, cardClass, thClass } from './shared.jsx';

// ─── MaintenanceTab (§48) ─────────────────────────────────
// Dedicated maintenance records — maintenance clients are NOT
// archived projects. Tracks plan, billing cycle, included vs
// used hours, SLA notes, and keeps a linked renewal row in step
// server-side so the daily cron nags about plan renewals too.

const CYCLES = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];
const CURRENCIES = ['NGN', 'GBP', 'USD', 'EUR'];

const emptyForm = {
  plan_name: '', client_id: '', project_id: '', billing_cycle: 'MONTHLY',
  amount: '', currency: 'NGN', start_date: '', renewal_date: '',
  included_hours: '', site_url: '', sla_notes: '', active: true,
};

const MaintenanceTab = ({ clients, projects }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRows = useCallback(async () => {
    setError(null);
    const res = await api.get('/aftercare/maintenance');
    if (res.ok && Array.isArray(res.data)) setRows(res.data);
    else if (!res.ok) setError(res.error || 'Failed to load maintenance plans.');
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setShowForm(true);
    setForm({
      plan_name: p.plan_name || '',
      client_id: p.client_id || '',
      project_id: p.project_id || '',
      billing_cycle: p.billing_cycle || 'MONTHLY',
      amount: p.amount ?? '',
      currency: p.currency || 'NGN',
      start_date: p.start_date ? String(p.start_date).slice(0, 10) : '',
      renewal_date: p.renewal_date ? String(p.renewal_date).slice(0, 10) : '',
      included_hours: p.included_hours ?? '',
      site_url: p.site_url || '',
      sla_notes: p.sla_notes || '',
      active: !!p.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.plan_name.trim()) { notify.error('Plan name is required'); return; }
    const payload = {
      ...form,
      amount: form.amount === '' ? 0 : Number(form.amount),
      included_hours: form.included_hours === '' ? 0 : Number(form.included_hours),
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      start_date: form.start_date || null,
      renewal_date: form.renewal_date || null,
      site_url: form.site_url || null,
      sla_notes: form.sla_notes || null,
    };
    const res = editingId
      ? await api.patch(`/aftercare/maintenance/${editingId}`, payload)
      : await api.post('/aftercare/maintenance', payload);
    if (res.ok) {
      notify.success(editingId ? 'Plan updated' : 'Maintenance plan created');
      setForm(emptyForm); setEditingId(null); setShowForm(false); fetchRows();
    } else {
      notify.error(res.error || 'Error saving plan.');
    }
  };

  const toggleActive = async (p) => {
    const res = await api.patch(`/aftercare/maintenance/${p.id}`, { active: !p.active });
    if (res.ok) { notify.success(p.active ? 'Plan paused' : 'Plan active'); fetchRows(); }
    else notify.error(res.error || 'Error updating plan.');
  };

  const logHours = async (p) => {
    const raw = window.prompt(`Hours to log against "${p.plan_name}"`, '1');
    if (raw == null) return;
    const hours = parseFloat(raw);
    if (!hours || hours <= 0) { notify.error('Enter a positive number of hours'); return; }
    const res = await api.post(`/aftercare/maintenance/${p.id}/hours`, { hours });
    if (res.ok) {
      notify.success(`Logged ${hours}h — ${Number(res.data.used_hours).toFixed(1)}h used`);
      fetchRows();
    } else {
      notify.error(res.error || 'Error logging hours.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this maintenance plan (and its renewal reminder)?')) return;
    const res = await api.delete(`/aftercare/maintenance/${id}`);
    if (res.ok) { notify.success('Plan deleted'); fetchRows(); }
    else notify.error(res.error || 'Error deleting plan.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {showForm && (
        <div className={`${cardClass} p-6 md:p-8 h-fit border-gray-100 dark:border-gray-800/60`}>
          <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
            {editingId ? 'Edit Plan' : 'New Maintenance Plan'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Plan Name</label>
              <input type="text" name="plan_name" required value={form.plan_name} onChange={handleChange}
                placeholder="e.g. StyleSence — Care Plan" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass}>
                  <option value="">— None —</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                  <option value="">— None —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Billing</label>
                <select name="billing_cycle" value={form.billing_cycle} onChange={handleChange} className={inputClass}>
                  {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount</label>
                <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={handleChange} placeholder="25000" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Renewal Date</label>
                <input type="date" name="renewal_date" value={form.renewal_date} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Included Hours / period</label>
                <input type="number" min="0" step="0.5" name="included_hours" value={form.included_hours} onChange={handleChange} placeholder="2" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Site URL</label>
                <input type="text" name="site_url" value={form.site_url} onChange={handleChange} placeholder="https://..." className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>SLA Notes (Optional)</label>
              <textarea name="sla_notes" rows="2" value={form.sla_notes} onChange={handleChange}
                placeholder="Response expectations, what's covered..." className={inputClass} />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="m-active" name="active" checked={form.active} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              <label htmlFor="m-active" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-body">Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                {editingId ? 'Update Plan' : 'Create Plan'}
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
            Retainer-style care plans. Renewal reminders sync to the Renewals tab automatically.
          </p>
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((s) => !s); }}
            className="bg-accent hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body shrink-0 ml-4">
            {showForm ? 'Close' : '+ Plan'}
          </button>
        </div>

        {loading ? (
          <div className={`${cardClass} p-8 text-center text-gray-400 font-body`}>Loading plans...</div>
        ) : error ? (
          <div className={`${cardClass} p-8 text-center text-red-500 font-body`}>{error}</div>
        ) : rows.length === 0 ? (
          <div className={`${cardClass} p-12 text-center font-body`}>
            <p className="text-gray-500 dark:text-gray-400">No maintenance plans yet. When a client signs up for aftercare, record it here — not as an archived project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {rows.map((p) => {
              const included = Number(p.included_hours || 0);
              const used = Number(p.used_hours || 0);
              const pct = included > 0 ? Math.min(Math.round((used / included) * 100), 100) : null;
              return (
                <div key={p.id} className={`${cardClass} p-5 border-gray-100 dark:border-gray-800/60 ${p.active ? '' : 'opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-white font-body truncate">{p.plan_name}</h3>
                        <Badge tone={p.active ? 'green' : 'gray'}>{p.active ? 'Active' : 'Paused'}</Badge>
                      </div>
                      <p className="text-xs text-gray-400 font-body mt-1">
                        {p.client_name || p.project_name || 'Unlinked'} · {p.billing_cycle.toLowerCase()} · {fmtMoney(p.amount, p.currency)}
                      </p>
                    </div>
                    <div className="text-right text-xs font-body shrink-0">
                      <p className="text-gray-400">Renews</p>
                      <p className="font-bold text-gray-700 dark:text-gray-200">{fmtDate(p.renewal_date)}</p>
                    </div>
                  </div>

                  {included > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-body text-gray-500 dark:text-gray-400 mb-1">
                        <span>{used.toFixed(1)}h used</span>
                        <span>{included}h included</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${pct || 0}%` }} />
                      </div>
                    </div>
                  )}

                  {p.site_url && (
                    <a href={p.site_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline font-body break-all">{p.site_url}</a>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => logHours(p)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Log hours</button>
                    <button onClick={() => toggleActive(p)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">{p.active ? 'Pause' : 'Activate'}</button>
                    <button onClick={() => startEdit(p)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Edit</button>
                    <button onClick={() => remove(p.id)} className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body ml-auto">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceTab;
