import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { notify } from '../../../services/notify';
import { inputClass, labelClass, fmtDate, fmtMoney, Badge, cardClass, thClass } from './shared.jsx';

// ─── ReferralsTab (§55) ───────────────────────────────────
// Each client can get a /ref/:code link. The public page thanks
// the visitor in the referrer's name and routes to /contact —
// hits are counted here. When a referred lead becomes a project,
// mark it WON and record revenue + reward state.

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST'];
const REWARD_STATUSES = ['NONE', 'PENDING', 'AWARDED', 'PAID'];
const CURRENCIES = ['NGN', 'GBP', 'USD', 'EUR'];

const STATUS_TONES = { NEW: 'blue', CONTACTED: 'amber', QUALIFIED: 'purple', WON: 'green', LOST: 'gray' };

const emptyForm = {
  referrer_client_id: '', code: '', referred_name: '', referred_business: '',
  referred_email: '', status: 'NEW', revenue: '', currency: 'NGN',
  reward_description: '', reward_status: 'NONE', notes: '',
};

const ReferralsTab = ({ clients }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRows = useCallback(async () => {
    setError(null);
    const res = await api.get('/aftercare/referrals');
    if (res.ok && Array.isArray(res.data)) setRows(res.data);
    else if (!res.ok) setError(res.error || 'Failed to load referrals.');
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setShowForm(true);
    setForm({
      referrer_client_id: r.referrer_client_id || '',
      code: r.code || '',
      referred_name: r.referred_name || '',
      referred_business: r.referred_business || '',
      referred_email: r.referred_email || '',
      status: r.status || 'NEW',
      revenue: r.revenue ?? '',
      currency: r.currency || 'NGN',
      reward_description: r.reward_description || '',
      reward_status: r.reward_status || 'NONE',
      notes: r.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyLink = async (r) => {
    const link = `${window.location.origin}/ref/${r.code}`;
    try {
      await navigator.clipboard.writeText(link);
      notify.success('Referral link copied');
    } catch {
      notify.error('Could not copy — ' + link);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      referrer_client_id: form.referrer_client_id || null,
      revenue: form.revenue === '' ? null : Number(form.revenue),
      referred_name: form.referred_name || null,
      referred_business: form.referred_business || null,
      referred_email: form.referred_email || null,
      reward_description: form.reward_description || null,
      notes: form.notes || null,
    };
    const res = editingId
      ? await api.patch(`/aftercare/referrals/${editingId}`, payload)
      : await api.post('/aftercare/referrals', payload);
    if (res.ok) {
      notify.success(editingId ? 'Referral updated' : `Referral created — code ${res.data?.code}`);
      setForm(emptyForm); setEditingId(null); setShowForm(false); fetchRows();
    } else {
      notify.error(res.error || 'Error saving referral.');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this referral?')) return;
    const res = await api.delete(`/aftercare/referrals/${id}`);
    if (res.ok) { notify.success('Referral deleted'); fetchRows(); }
    else notify.error(res.error || 'Error deleting referral.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {showForm && (
        <div className={`${cardClass} p-6 md:p-8 h-fit border-gray-100 dark:border-gray-800/60`}>
          <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
            {editingId ? 'Edit Referral' : 'New Referral'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Referring Client</label>
              <select name="referrer_client_id" value={form.referrer_client_id} onChange={handleChange} className={inputClass}>
                <option value="">— None —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Code (blank = auto-generate)</label>
              <input type="text" name="code" value={form.code} onChange={handleChange}
                placeholder="e.g. STYLESSENCE" maxLength={24} className={`${inputClass} uppercase`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Referred Name</label>
                <input type="text" name="referred_name" value={form.referred_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Referred Business</label>
                <input type="text" name="referred_business" value={form.referred_business} onChange={handleChange} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Referred Email</label>
              <input type="email" name="referred_email" value={form.referred_email} onChange={handleChange} className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Revenue</label>
                <input type="number" min="0" step="0.01" name="revenue" value={form.revenue} onChange={handleChange} className={inputClass} />
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
                <label className={labelClass}>Reward</label>
                <input type="text" name="reward_description" value={form.reward_description} onChange={handleChange}
                  placeholder="e.g. 1 month free maintenance" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Reward Status</label>
                <select name="reward_status" value={form.reward_status} onChange={handleChange} className={inputClass}>
                  {REWARD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Notes (Optional)</label>
              <textarea name="notes" rows="2" value={form.notes} onChange={handleChange} className={inputClass} />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                {editingId ? 'Update Referral' : 'Create Referral'}
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
            Share <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/ref/&lt;code&gt;</code> links — visits are counted automatically.
          </p>
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((s) => !s); }}
            className="bg-accent hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body shrink-0 ml-4">
            {showForm ? 'Close' : '+ Referral'}
          </button>
        </div>

        <div className={cardClass}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 font-body">Loading referrals...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-body">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center font-body">
              <p className="text-gray-500 dark:text-gray-400">No referrals yet. The post-launch task "Request a referral" will remind you to ask.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className={thClass}>Code</th>
                    <th className={thClass}>Referrer → Referred</th>
                    <th className={thClass + ' text-center'}>Status</th>
                    <th className={thClass + ' text-center'}>Value</th>
                    <th className={thClass + ' text-center'}>Reward</th>
                    <th className={thClass + ' text-right'}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4">
                        <button onClick={() => copyLink(r)} title="Copy referral link"
                          className="font-mono font-bold text-accent hover:text-orange-600 text-sm">{r.code} ⧉</button>
                        <p className="text-[11px] text-gray-400 font-body mt-1">{r.hits} hit{r.hits === 1 ? '' : 's'}{r.last_hit_at ? ` · last ${fmtDate(r.last_hit_at)}` : ''}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm font-bold text-gray-900 dark:text-white font-body">{r.referrer_name || '—'}</p>
                        <p className="text-[11px] text-gray-400 font-body">{[r.referred_name, r.referred_business].filter(Boolean).join(' · ') || '—'}</p>
                      </td>
                      <td className="py-4 px-4 text-center"><Badge tone={STATUS_TONES[r.status] || 'gray'}>{r.status}</Badge></td>
                      <td className="py-4 px-4 text-center text-sm text-gray-600 dark:text-gray-300 font-body">{fmtMoney(r.revenue, r.currency)}</td>
                      <td className="py-4 px-4 text-center">
                        {r.reward_description
                          ? <span title={r.reward_description}><Badge tone={r.reward_status === 'PAID' ? 'green' : r.reward_status === 'NONE' ? 'gray' : 'amber'}>{r.reward_status}</Badge></span>
                          : <Badge tone="gray">—</Badge>}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
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

export default ReferralsTab;
