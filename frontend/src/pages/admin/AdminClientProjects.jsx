import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import AdminSubNav from '../../components/AdminSubNav';

const DEFAULT_STAGES = [
  { name: 'Discovery & Planning', status: 'PENDING' },
  { name: 'Design & Mockups', status: 'PENDING' },
  { name: 'Development', status: 'PENDING' },
  { name: 'Testing & Revisions', status: 'PENDING' },
  { name: 'Launch', status: 'PENDING' }
];

// Mirrors the v5_offboarding_schema.sql default JSONB.
const DEFAULT_OFFBOARDING = {
  assets_delivered: false,
  training_completed: false,
  credentials_documented: false,
  support_handoff: false,
  final_payment: false,
  client_feedback: false,
};

const AdminClientProjects = () => {
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '', project_name: '', progress: 0, status: 'PLANNING',
    notes: '',
    domain_name: '', domain_expiration: '', amount_due: 0,
    payment_type: 'ONE_TIME', monthly_fee: 0, payment_status: 'PENDING', stages: DEFAULT_STAGES,
    intake_form_id: '', intake_completed: false,
    assets_url: '', training_video_url: '', maintenance_plan_url: '',
    offboarding_status: { ...DEFAULT_OFFBOARDING },
  });
  const [editingId, setEditingId] = useState(null);

  // Bulk-actions state. Keep the selection in a Set for O(1) toggles.
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkClientId, setBulkClientId] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);

  const handleOffboardingToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      offboarding_status: {
        ...(prev.offboarding_status || DEFAULT_OFFBOARDING),
        [key]: !((prev.offboarding_status || DEFAULT_OFFBOARDING)[key]),
      },
    }));
  };

  const resetForm = () => ({
    client_id: '', project_name: '', progress: 0, status: 'PLANNING',
    notes: '',
    domain_name: '', domain_expiration: '', amount_due: 0,
    payment_type: 'ONE_TIME', monthly_fee: 0, payment_status: 'PENDING', stages: DEFAULT_STAGES,
    intake_form_id: '', intake_completed: false,
    assets_url: '', training_video_url: '', maintenance_plan_url: '',
    offboarding_status: { ...DEFAULT_OFFBOARDING },
  });

  const fetchProjects = async () => {
    const res = await api.get('/client-projects');
    if (res.ok && res.data) setProjects(res.data);
  };

  const fetchTemplates = async () => {
    const res = await api.get('/templates');
    if (res.ok && res.data) setTemplates(res.data);
  };

  const fetchClients = async () => {
    const res = await api.get('/clients');
    if (res.ok && res.data) setClients(res.data);
  };

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
    fetchClients();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleStageChange = (index, status) => {
    const newStages = [...formData.stages];
    newStages[index].status = status;
    
    const completed = newStages.filter(s => s.status === 'COMPLETED').length;
    const progress = Math.round((completed / newStages.length) * 100);
    
    setFormData(prev => ({ ...prev, stages: newStages, progress }));
  };

  const editProject = (p) => {
    setEditingId(p.id);
    setFormData({
      client_id: p.client_id || '', project_name: p.project_name, progress: p.progress, status: p.status,
      notes: p.notes || '',
      domain_name: p.domain_name || '', domain_expiration: p.domain_expiration ? p.domain_expiration.split('T')[0] : '',
      amount_due: p.amount_due || 0, payment_type: p.payment_type || 'ONE_TIME',
      monthly_fee: p.monthly_fee || 0, payment_status: p.payment_status || 'PENDING', stages: p.stages || DEFAULT_STAGES,
      intake_form_id: p.intake_form_id || '', intake_completed: p.intake_completed || false,
      assets_url: p.assets_url || '', training_video_url: p.training_video_url || '', maintenance_plan_url: p.maintenance_plan_url || '',
      offboarding_status: { ...DEFAULT_OFFBOARDING, ...(p.offboarding_status || {}) },
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, intake_form_id: formData.intake_form_id || null };
    let res;
    if (editingId) {
      res = await api.put(`/client-projects/${editingId}`, payload);
    } else {
      res = await api.post('/client-projects', payload);
    }

    if (res.ok && res.data && res.data.id) {
      notify.success(editingId ? 'Project updated!' : 'Project saved!');
      fetchProjects();
      setEditingId(null);
      setFormData(resetForm());
    } else {
      notify.error(res.error || 'Failed to save project. Ensure database is connected.');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    const res = await api.delete(`/client-projects/${id}`);
    if (res.ok) fetchProjects();
    else notify.error(res.error || 'Failed to delete project.');
  };

  // ── Bulk action helpers ──────────────────────────────────────
  // Toggles a single project in/out of the selection set. Cheap, runs on
  // every checkbox click without re-fetching the list.
  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const allOnPageSelected = projects.length > 0 && projects.every((p) => selected.has(p.id));
  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (projects.every((p) => prev.has(p.id))) {
        return new Set();
      }
      return new Set(projects.map((p) => p.id));
    });
  };

  // Apply one PATCH per selected project in parallel. Failures are surfaced
  // via a single toast with the success/fail count — the admin shouldn't have
  // to babysit each individual request.
  const runBulkUpdate = async (payload) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const results = await Promise.all(
      ids.map((id) => api.patch(`/client-projects/${id}`, payload))
    );
    const ok = results.filter((r) => r.ok).length;
    const fail = results.length - ok;
    setBulkBusy(false);
    if (ok > 0) {
      notify.success(`Updated ${ok} project${ok === 1 ? '' : 's'}${fail > 0 ? ` (${fail} failed)` : ''}`);
      fetchProjects();
      clearSelection();
    } else {
      notify.error('Bulk update failed for all selected projects.');
    }
  };

  const applyBulkStatus = () => {
    if (!bulkStatus) { notify.error('Pick a status first.'); return; }
    runBulkUpdate({ status: bulkStatus });
    setBulkStatus('');
  };
  const applyBulkClient = () => {
    if (!bulkClientId) { notify.error('Pick a client first.'); return; }
    runBulkUpdate({ client_id: bulkClientId });
    setBulkClientId('');
  };
  const archiveSelected = () => {
    if (!window.confirm(`Archive ${selected.size} project${selected.size === 1 ? '' : 's'}? They'll become read-only.`)) return;
    runBulkUpdate({ status: 'ARCHIVED' });
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24">
      <AdminSubNav />
      <h1 className="text-3xl font-bold mb-8">Admin: Agency Projects & Billing</h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="xl:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Project' : 'New Project'}</h2>
            {editingId && <button type="button" onClick={() => setEditingId(null)} className="text-sm text-blue-500">Cancel Edit</button>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium mb-1">Client</label>
              <select name="client_id" value={formData.client_id} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                <option value="">Select a Client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>
            
            {/* Onboarding */}
            <h3 className="font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">Onboarding & Intake</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Require Intake Form</label>
              <select name="intake_form_id" value={formData.intake_form_id} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                <option value="">None (Bypass Intake)</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {formData.intake_form_id && (
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="intake_completed" checked={formData.intake_completed} onChange={handleChange} />
                Mark Intake as Completed
              </label>
            )}

            {/* Stages */}
            <h3 className="font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">Project Stages</h3>
            <div className="space-y-2">
              {formData.stages.map((stage, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium">{stage.name}</span>
                  <select 
                    value={stage.status} 
                    onChange={(e) => handleStageChange(idx, e.target.value)}
                    className="text-xs p-1 rounded border dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <label className="block text-sm font-medium">Auto Progress: {formData.progress}%</label>
              <select name="status" value={formData.status} onChange={handleChange} className="p-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 font-bold text-blue-600">
                <option value="ONBOARDING">Intake / Onboarding</option>
                <option value="PLANNING">Planning & Scope</option>
                <option value="DESIGN">Design & Figma</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="REVIEW">Client Review</option>
                <option value="LAUNCHED">🚀 LAUNCHED (Offboarding)</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="ARCHIVED">Archived (Read-Only)</option>
              </select>
            </div>
            
            {/* Offboarding / Handover */}
            {(formData.status === 'LAUNCHED' || formData.status === 'MAINTENANCE') && (
              <>
                <h3 className="font-semibold pt-4 border-t border-gray-200 dark:border-gray-700 text-green-600">Launch & Handoff Vault</h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 space-y-3 mb-4">
                  <h4 className="text-sm font-bold text-green-800 dark:text-green-300">Offboarding Checklist</h4>
                  {[
                    { key: 'final_payment', label: 'Final invoice sent and paid' },
                    { key: 'credentials_documented', label: 'All credentials documented in vault' },
                    { key: 'assets_delivered', label: 'Domain transferred / DNS documented' },
                    { key: 'client_feedback', label: 'Client feedback collected' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-600 rounded"
                        checked={!!(formData.offboarding_status || DEFAULT_OFFBOARDING)[key]}
                        onChange={() => handleOffboardingToggle(key)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Final Assets URL (Zip/Drive)</label>
                  <input type="url" name="assets_url" value={formData.assets_url} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Video Training URL (Loom)</label>
                  <input type="url" name="training_video_url" value={formData.training_video_url} onChange={handleChange} placeholder="https://www.loom.com/..." className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Maintenance Paystack Link (Upsell)</label>
                  <input type="url" name="maintenance_plan_url" value={formData.maintenance_plan_url} onChange={handleChange} placeholder="https://paystack.com/pay/..." className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                </div>
              </>
            )}

            {/* Domain & Billing */}
            <h3 className="font-semibold pt-4 border-t border-gray-200 dark:border-gray-700">Domain & Billing</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Live Domain Name</label>
              <input type="text" name="domain_name" value={formData.domain_name} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. client.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain Expiration</label>
              <input type="date" name="domain_expiration" value={formData.domain_expiration} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Amount Due ($)</label>
                <input type="number" name="amount_due" value={formData.amount_due} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Type</label>
                <select name="payment_type" value={formData.payment_type} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                  <option value="ONE_TIME">One Time</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Fee ($)</label>
                <input type="number" name="monthly_fee" value={formData.monthly_fee} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" disabled={formData.payment_type !== 'MONTHLY'} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Status</label>
                <select name="payment_status" value={formData.payment_status || 'PENDING'} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                  <option value="PENDING">Pending</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
            </div>
            
            <button type="submit" className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors shadow-sm">
              {editingId ? 'Update Project' : 'Save Project'}
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold">Manage Projects</h2>
              {selected.size > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                  {selected.size} selected
                </p>
              )}
            </div>
            {projects.length > 0 && (
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {allOnPageSelected ? 'Deselect all' : 'Select all'}
              </label>
            )}
          </div>

          {/* ── Bulk action toolbar (visible only when something is selected) ── */}
          {selected.size > 0 && (
            <div className="sticky top-32 z-20 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800/60 shadow-lg rounded-xl p-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                Bulk ({selected.size})
              </span>
              <div className="flex items-center gap-1.5">
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  disabled={bulkBusy}
                  className="text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Set status…</option>
                  {['ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={applyBulkStatus}
                  disabled={bulkBusy || !bulkStatus}
                  className="cursor-pointer text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <select
                  value={bulkClientId}
                  onChange={(e) => setBulkClientId(e.target.value)}
                  disabled={bulkBusy}
                  className="text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="">Assign client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={applyBulkClient}
                  disabled={bulkBusy || !bulkClientId}
                  className="cursor-pointer text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Assign
                </button>
              </div>
              <button
                type="button"
                onClick={archiveSelected}
                disabled={bulkBusy}
                className="cursor-pointer text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Archive
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={bulkBusy}
                className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg transition-colors ml-auto"
              >
                Clear
              </button>
            </div>
          )}

          {projects.length === 0 ? (
            <p className="text-gray-500">No client projects found.</p>
          ) : (
            projects.map(p => {
              const isOverdue = p.domain_expiration && new Date(p.domain_expiration) < new Date();
              const isSelected = selected.has(p.id);
              return (
                <div
                  key={p.id}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border transition-colors ${isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100 dark:border-gray-700'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelected(p.id)}
                        className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label={`Select ${p.project_name}`}
                      />
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                          {p.project_name}
                          {p.payment_type === 'MONTHLY' && <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Monthly</span>}
                          {p.status === 'LAUNCHED' && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Launched</span>}
                        </h3>
                        <p className="text-sm text-gray-500">{p.client_name}</p>
                      </div>
                    </div>
                    <div className="space-x-3 flex-shrink-0">
                      <button onClick={() => editProject(p)} className="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                      <button onClick={() => deleteProject(p.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{p.status}</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className={`h-2.5 rounded-full ${p.status === 'LAUNCHED' ? 'bg-purple-600' : 'bg-blue-600'}`} style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm mb-4 border border-blue-100 dark:border-blue-800">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Client Magic Link:</p>
                    <a href={`/track/${p.tracking_id}`} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline break-all">
                      {window.location.origin}/track/{p.tracking_id}
                    </a>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {p.domain_name && (
                      <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        <span className="block text-gray-500 text-xs uppercase">Domain</span>
                        <span className="font-medium truncate block" title={p.domain_name}>{p.domain_name}</span>
                      </div>
                    )}
                    {p.domain_expiration && (
                      <div className={`p-2 rounded ${isOverdue ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-900'}`}>
                        <span className="block text-gray-500 text-xs uppercase">Expires</span>
                        <span className="font-medium">{new Date(p.domain_expiration).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      <span className="block text-gray-500 text-xs uppercase">Amount Due</span>
                      <span className="font-medium font-mono text-red-600 dark:text-red-400">${Number(p.amount_due || 0).toFixed(2)}</span>
                    </div>
                    {p.intake_form_id && (
                       <div className={`p-2 rounded ${p.intake_completed ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                       <span className="block text-xs uppercase">Intake Form</span>
                       <span className="font-medium">{p.intake_completed ? 'Completed' : 'Pending'}</span>
                     </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminClientProjects;
