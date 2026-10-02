import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { notify } from '../../../services/notify';
import { inputClass, labelClass, fmtDate, Badge, cardClass, thClass } from './shared';

// ─── TestimonialsTab (§54) ────────────────────────────────
// Consented client quotes. Publishing to the public homepage is
// blocked server-side until `permission_to_publish` is true —
// the same guard lives in the UI (toggle stays disabled).

const emptyForm = {
  client_name: '', company: '', role: '', rating: '',
  testimonial: '', permission_to_publish: false,
  client_id: '', project_id: '',
};

const Stars = ({ rating }) => rating
  ? <span className="text-amber-400 text-sm tracking-tight" title={`${rating}/5`}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
  : <span className="text-gray-300 dark:text-gray-600 text-sm">—</span>;

const TestimonialsTab = ({ clients, projects }) => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRows = useCallback(async () => {
    setError(null);
    const res = await api.get('/aftercare/testimonials');
    if (res.ok && Array.isArray(res.data)) setRows(res.data);
    else if (!res.ok) setError(res.error || 'Failed to load testimonials.');
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setShowForm(true);
    setForm({
      client_name: t.client_name || '',
      company: t.company || '',
      role: t.role || '',
      rating: t.rating ?? '',
      testimonial: t.testimonial || '',
      permission_to_publish: !!t.permission_to_publish,
      client_id: t.client_id || '',
      project_id: t.project_id || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name.trim() || !form.testimonial.trim()) {
      notify.error('Name and testimonial text are required');
      return;
    }
    const payload = {
      ...form,
      rating: form.rating === '' ? null : Number(form.rating),
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      company: form.company || null,
      role: form.role || null,
    };
    const res = editingId
      ? await api.patch(`/aftercare/testimonials/${editingId}`, payload)
      : await api.post('/aftercare/testimonials', payload);
    if (res.ok) {
      notify.success(editingId ? 'Testimonial updated' : 'Testimonial saved');
      setForm(emptyForm); setEditingId(null); setShowForm(false); fetchRows();
    } else {
      notify.error(res.error || 'Error saving testimonial.');
    }
  };

  const togglePublish = async (t) => {
    if (!t.published && !t.permission_to_publish) {
      notify.error('Needs the client\'s permission to publish first');
      return;
    }
    const res = await api.patch(`/aftercare/testimonials/${t.id}`, { published: !t.published });
    if (res.ok) {
      notify.success(t.published ? 'Unpublished' : 'Published to the homepage 🎉');
      fetchRows();
    } else {
      notify.error(res.error || 'Error updating publish state.');
    }
  };

  const togglePermission = async (t) => {
    const res = await api.patch(`/aftercare/testimonials/${t.id}`, {
      permission_to_publish: !t.permission_to_publish,
      ...(t.published && !t.permission_to_publish ? { published: false } : {}),
    });
    if (res.ok) { notify.success('Permission updated'); fetchRows(); }
    else notify.error(res.error || 'Error updating permission.');
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    const res = await api.delete(`/aftercare/testimonials/${id}`);
    if (res.ok) { notify.success('Testimonial deleted'); fetchRows(); }
    else notify.error(res.error || 'Error deleting testimonial.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {showForm && (
        <div className={`${cardClass} p-6 md:p-8 h-fit border-gray-100 dark:border-gray-800/60`}>
          <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
            {editingId ? 'Edit Testimonial' : 'New Testimonial'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Client Name *</label>
                <input type="text" name="client_name" required value={form.client_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Rating</label>
                <select name="rating" value={form.rating} onChange={handleChange} className={inputClass}>
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Company</label>
                <input type="text" name="company" value={form.company} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input type="text" name="role" value={form.role} onChange={handleChange} placeholder="Founder, PM..." className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Testimonial *</label>
              <textarea name="testimonial" rows="4" required value={form.testimonial} onChange={handleChange}
                placeholder="Paste the quote (clean up typos, keep their voice)..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Linked Client (Optional)</label>
              <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass}>
                <option value="">— None —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Linked Project (Optional)</label>
              <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                <option value="">— None —</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="t-permission" name="permission_to_publish" checked={form.permission_to_publish} onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
              <label htmlFor="t-permission" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-body">
                Client gave permission to publish
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                {editingId ? 'Update' : 'Save Testimonial'}
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
            Published quotes appear on the public homepage automatically. No permission → no publish.
          </p>
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm((s) => !s); }}
            className="bg-accent hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body shrink-0 ml-4">
            {showForm ? 'Close' : '+ Testimonial'}
          </button>
        </div>

        <div className={cardClass}>
          {loading ? (
            <div className="p-8 text-center text-gray-400 font-body">Loading testimonials...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-body">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center font-body">
              <p className="text-gray-500 dark:text-gray-400">No testimonials yet. The post-launch task "Request a testimonial" will remind you to ask.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className={thClass}>Client</th>
                    <th className={thClass}>Quote</th>
                    <th className={thClass + ' text-center'}>Rating</th>
                    <th className={thClass + ' text-center'}>Permission</th>
                    <th className={thClass + ' text-center'}>Live</th>
                    <th className={thClass + ' text-right'}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {rows.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-900 dark:text-white font-body">{t.client_name}</p>
                        <p className="text-[11px] text-gray-400 font-body">{[t.role, t.company].filter(Boolean).join(' · ') || '—'}</p>
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-body line-clamp-2">{t.testimonial}</p>
                      </td>
                      <td className="py-4 px-4 text-center"><Stars rating={t.rating} /></td>
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => togglePermission(t)} title="Toggle permission to publish">
                          <Badge tone={t.permission_to_publish ? 'green' : 'gray'}>{t.permission_to_publish ? 'Granted' : 'Not yet'}</Badge>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button onClick={() => togglePublish(t)} disabled={!t.permission_to_publish}
                          title={t.permission_to_publish ? (t.published ? 'Click to unpublish' : 'Click to publish') : 'Permission required'}
                          className={t.permission_to_publish ? '' : 'opacity-40 cursor-not-allowed'}>
                          <Badge tone={t.published ? 'green' : 'gray'}>{t.published ? `Live ${t.published_at ? fmtDate(t.published_at) : ''}` : 'Draft'}</Badge>
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => startEdit(t)} className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Edit</button>
                        <button onClick={() => remove(t.id)} className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body">Delete</button>
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

export default TestimonialsTab;
