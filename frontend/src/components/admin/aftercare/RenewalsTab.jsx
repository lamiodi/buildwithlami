import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { notify } from '../../../services/notify';
import { inputClass, labelClass, fmtDate, fmtMoney, Badge, daysTone, cardClass, thClass } from './shared.jsx';

// ─── RenewalsTab (§47) ────────────────────────────────────
// One reminder surface for every renewable service — domains,
// hosting, email, maintenance, SaaS. "Renew" pushes the date a
// year forward; the daily cron nags at T-60/30/14/7 + overdue.

const SERVICES = ['DOMAIN', 'HOSTING', 'MAINTENANCE', 'EMAIL', 'SSL', 'SAAS', 'SUPPORT', 'OTHER'];
const STATUSES = ['ACTIVE', 'RENEWED', 'CANCELLED', 'LAPSED'];
const CURRENCIES = ['NGN', 'GBP', 'USD', 'EUR'];

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'due', label: 'Due ≤30d' },
  { id: 'renewed', label: 'Renewed' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'lapsed', label: 'Lapsed' },
];

const emptyForm = {
  service: 'DOMAIN', label: '', renewal_date: '', amount: '',
  currency: 'NGN', client_id: '', project_id: '', notes: '',
};

const SERVICE_TONES = {
  DOMAIN: 'purple', HOSTING: 'blue', MAINTENANCE: 'green',
  EMAIL: 'amber', SSL: 'amber', SAAS: 'blue', SUPPORT: 'gray', OTHER: 'gray',
};

const RenewalsTab = ({ clients, projects }) => {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRows = useCallback(async () => {
    setError(null);
    const params = {};
    if (filter === 'active') params.status = 'ACTIVE';
    else if (filter === 'due') params.due_within = 30;
    else if (filter) params.status = filter.toUpperCase();
    const res = await api.get('/aftercare/renewals', { params });
    if (res.ok && Array.isArray(res.data)) setRows(res.data);
    else if (!res.ok) setError(res.error || 'Failed to load renewals.');
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setShowForm(true);
    setForm({
      service: r.service || 'DOMAIN',
      label: r.label || '',
      renewal_date: r.renewal_date ? String(r.renewal_date).slice(0, 10) : '',
      amount: r.amount ?? '',
      currency: r.currency || 'NGN',
      client_id: r.client_id || '',
      project_id: r.project_id || '',
      notes: r.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.renewal_date) {
      notify.error('Label and renewal date are required');
      return;
    }
    const payload = {
      ...form,
      amount: form.amount === '' ? null : Number(form.amount),
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      notes: form.notes || null,
    };
    const res = editingId
      ? await api.patch(`/aftercare/renewals/${editingId}`, payload)
      : await api.post('/aftercare/renewals', payload);
    if (res.ok) {
      notify.success(editingId ? 'Renewal updated' : 'Renewal added');
      setForm(emptyForm); setEditingId(null); setShowForm(false); fetchRows();
    } else {
      notify.error(res.error || 'Error saving renewal.');
    }
  };

  const renew = async (r) => {
    const res = await api.post(`/aftercare/renewals/${r.id}/renew`, {});
    if (res.ok) {
      notify.success(`Renewed — next date ${fmtDate(res.data?.renewal_date)}`);
      fetchRows();
    } else {
      notify.error(res.error || 'Error renewing.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this renewal record?')) return;
    const res = await api.delete(`/aftercare/renewals/${id}`);
    if (res.ok) { notify.success('Renewal deleted'); fetchRows(); }
    else notify.error(res.error || 'Error deleting renewal.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {showForm && (
        <div className={`${cardClass} p-6 md:p-8 h-fit border-gray-100 dark:border-gray-800/60`}>
          <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
            {editingId ? 'Edit Renewal' : 'New Renewal'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Service</label>
                <select name="service" value={form.service} onChange={handleChange} className={inputClass}>
                  {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount (Optional)</label>
                <input type="number" min="0" step="0.01" name="amount" value={form.amount} onChange={handleChange} placeholder="15000" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input type="text" name="label" required value={form.label} onChange={handleChange}
                placeholder="e.g. clientname.com domain" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Renewal Date</label>
                <input type="date" name="renewal_date" required value={form.renewal_date} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
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
            <div>
              <label className={labelClass}>Notes (Optional)</label>
              <textarea name="notes" rows="2" value={form.notes} onChange={handleChange} placeholder="Registrar, plan, where it's billed..." className={inputClass} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                {editingId ? 'Update Renewal' : 'Add Renewal'}
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
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors font-body ${
                filter === f.id
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}>
              {f.label}
            </button>
          ))}
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((s) => !s); }}
            className="ml-auto bg-accent hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
            {showForm ? 'Close' : '+ Renewal'}
          </button>
        </div>

        <div className={cardClass}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 font-body">Loading renewals...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-body">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center font-body">
              <p className="text-gray-500 dark:text-gray-400">No renewals tracked yet. Add domains and hosting here so nothing lapses.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className={thClass}>Service / Label</th>
                    <th className={thClass}>Client</th>
                    <th className={thClass + ' text-center'}>Renews</th>
                    <th className={thClass + ' text-center'}>Amount</th>
                    <th className={thClass + ' text-center'}>Status</th>
                    <th className={thClass + ' text-right'}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Badge tone={SERVICE_TONES[r.service] || 'gray'}>{r.service}</Badge>
                          <span className="font-bold text-gray-900 dark:text-white font-body">{r.label}</span>
                        </div>
                        {r.notes && <p className="text-[11px] text-gray-400 font-body mt-1 max-w-xs truncate">{r.notes}</p>}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300 font-body">{r.client_name || r.project_name || '—'}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 font-body">{fmtDate(r.renewal_date)}</span>
                        {r.days_remaining != null && (
                          <span className="block mt-1"><Badge tone={daysTone(r.days_remaining)}>
                            {r.days_remaining < 0 ? `${Math.abs(r.days_remaining)}d overdue` : `${r.days_remaining}d`}
                          </Badge></span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-gray-600 dark:text-gray-300 font-body">{fmtMoney(r.amount, r.currency)}</td>
                      <td className="py-4 px-4 text-center"><Badge tone={r.status === 'ACTIVE' ? 'green' : r.status === 'RENEWED' ? 'blue' : 'gray'}>{r.status}</Badge></td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => renew(r)} className="text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Renew</button>
                        <button onClick={() => startEdit(r)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Edit</button>
                        <button onClick={() => remove(r.id)} className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RenewalsTab;
