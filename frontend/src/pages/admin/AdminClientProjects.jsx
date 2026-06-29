import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { FRONTEND_URL } from '../../config/frontend.js';
const DEFAULT_STAGES = [
  { name: 'Discovery & Planning', status: 'PENDING' },
  { name: 'Design & Mockups', status: 'PENDING' },
  { name: 'Development', status: 'PENDING' },
  { name: 'Testing & Revisions', status: 'PENDING' },
  { name: 'Launch', status: 'PENDING' }
];

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
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkClientId, setBulkClientId] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'list' or 'kanban'
  const [draggedProject, setDraggedProject] = useState(null);

  const handleDragStart = (e, project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedProject || draggedProject.status === newStatus) return;

    const oldStatus = draggedProject.status;
    setProjects(prev => prev.map(p => p.id === draggedProject.id ? { ...p, status: newStatus } : p));

    // Send only the changed field — avoids shipping stale/read-only fields.
    const res = await api.patch(`/client-projects/${draggedProject.id}`, { status: newStatus });
    if (!res.ok) {
      notify.error('Failed to update status');
      setProjects(prev => prev.map(p => p.id === draggedProject.id ? { ...p, status: oldStatus } : p));
    } else {
      notify.success('Project moved to ' + newStatus);
    }
    setDraggedProject(null);
  };

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
      if (projects.every((p) => prev.has(p.id))) return new Set();
      return new Set(projects.map((p) => p.id));
    });
  };

  const runBulkUpdate = async (payload) => {
    if (selected.size === 0) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    const results = await Promise.all(ids.map((id) => api.patch(`/client-projects/${id}`, payload)));
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
    if (!window.confirm(`Archive ${selected.size} project${selected.size === 1 ? '' : 's'}?`)) return;
    runBulkUpdate({ status: 'ARCHIVED' });
  };

  const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
  const selectClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
  const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                Agency Projects
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Manage client projects, billing, and onboarding.</p>
            </div>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 shadow-sm text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              >
                Kanban
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
              >
                List
              </button>
            </div>
          </div>
        </motion.div>

        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form Column */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            className="xl:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                {editingId ? 'Edit Project' : 'New Project'}
              </h2>
              {editingId && (
                <button type="button" onClick={() => setEditingId(null)} className="text-sm text-accent font-bold hover:underline">
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Client</label>
                <select name="client_id" value={formData.client_id} onChange={handleChange} required className={selectClass}>
                  <option value="">Select a Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Project Name</label>
                <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required className={inputClass} />
              </div>

              <h3 className="font-bold font-heading pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white">Onboarding & Intake</h3>
              <div>
                <label className={labelClass}>Require Intake Form</label>
                <select name="intake_form_id" value={formData.intake_form_id} onChange={handleChange} className={selectClass}>
                  <option value="">None (Bypass Intake)</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {formData.intake_form_id && (
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-body">
                  <input type="checkbox" name="intake_completed" checked={formData.intake_completed} onChange={handleChange} className="accent-accent" />
                  Mark Intake as Completed
                </label>
              )}

              <h3 className="font-bold font-heading pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white">Project Stages</h3>
              <div className="space-y-2">
                {formData.stages.map((stage, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{stage.name}</span>
                    <select value={stage.status} onChange={(e) => handleStageChange(idx, e.target.value)}
                      className="text-xs p-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 font-body">
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Progress: {formData.progress}%</label>
                <select name="status" value={formData.status} onChange={handleChange} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm dark:bg-gray-900 font-body font-bold text-accent">
                  <option value="ONBOARDING">Intake / Onboarding</option>
                  <option value="PLANNING">Planning & Scope</option>
                  <option value="DESIGN">Design & Figma</option>
                  <option value="DEVELOPMENT">Development</option>
                  <option value="REVIEW">Client Review</option>
                  <option value="LAUNCHED">LAUNCHED (Offboarding)</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="ARCHIVED">Archived (Read-Only)</option>
                </select>
              </div>

              {(formData.status === 'LAUNCHED' || formData.status === 'MAINTENANCE') && (
                <>
                  <h3 className="font-bold font-heading pt-4 border-t border-gray-100 dark:border-gray-700 text-accent">Launch & Handoff Vault</h3>
                  <div className="bg-accent/5 dark:bg-accent/10 p-4 rounded-xl border border-accent/20 dark:border-accent/30 space-y-3">
                    <h4 className="text-sm font-bold text-accent">Offboarding Checklist</h4>
                    {[
                      { key: 'final_payment', label: 'Final invoice sent and paid' },
                      { key: 'credentials_documented', label: 'All credentials documented in vault' },
                      { key: 'assets_delivered', label: 'Domain transferred / DNS documented' },
                      { key: 'client_feedback', label: 'Client feedback collected' },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-body">
                        <input type="checkbox" className="accent-accent rounded"
                          checked={!!(formData.offboarding_status || DEFAULT_OFFBOARDING)[key]}
                          onChange={() => handleOffboardingToggle(key)} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div>
                    <label className={labelClass}>Final Assets URL (Zip/Drive)</label>
                    <input type="url" name="assets_url" value={formData.assets_url} onChange={handleChange} placeholder="https://drive.google.com/..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Video Training URL (Loom)</label>
                    <input type="url" name="training_video_url" value={formData.training_video_url} onChange={handleChange} placeholder="https://www.loom.com/..." className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Maintenance Paystack Link (Upsell)</label>
                    <input type="url" name="maintenance_plan_url" value={formData.maintenance_plan_url} onChange={handleChange} placeholder="https://paystack.com/pay/..." className={inputClass} />
                  </div>
                </>
              )}

              <h3 className="font-bold font-heading pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white">Domain & Billing</h3>
              <div>
                <label className={labelClass}>Live Domain Name</label>
                <input type="text" name="domain_name" value={formData.domain_name} onChange={handleChange} className={inputClass} placeholder="e.g. client.com" />
              </div>
              <div>
                <label className={labelClass}>Domain Expiration</label>
                <input type="date" name="domain_expiration" value={formData.domain_expiration} onChange={handleChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Amount Due (₦)</label>
                  <input type="number" name="amount_due" value={formData.amount_due} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Payment Type</label>
                  <select name="payment_type" value={formData.payment_type} onChange={handleChange} className={selectClass}>
                    <option value="ONE_TIME">One Time</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Monthly Fee (₦)</label>
                  <input type="number" name="monthly_fee" value={formData.monthly_fee} onChange={handleChange} disabled={formData.payment_type !== 'MONTHLY'} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Payment Status</label>
                  <select name="payment_status" value={formData.payment_status || 'PENDING'} onChange={handleChange} className={selectClass}>
                    <option value="PENDING">Pending</option>
                    <option value="PARTIAL">Partial</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full mt-6 bg-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-accent/30 font-body">
                {editingId ? 'Update Project' : 'Save Project'}
              </button>
            </form>
          </motion.div>

          {/* List Column */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Manage Projects</h2>
                {selected.size > 0 && (
                  <p className="text-xs text-accent font-bold mt-0.5">{selected.size} selected</p>
                )}
              </div>
              {projects.length > 0 && (
                <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none font-body">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="accent-accent rounded" />
                  {allOnPageSelected ? 'Deselect all' : 'Select all'}
                </label>
              )}
            </div>

            {selected.size > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="sticky top-32 z-20 bg-white dark:bg-gray-800 border border-accent/30 dark:border-accent/40 shadow-lg rounded-2xl p-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-accent uppercase tracking-wider font-body">
                  Bulk ({selected.size})
                </span>
                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} disabled={bulkBusy}
                  className="text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-body">
                  <option value="">Set status…</option>
                  {['ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button type="button" onClick={applyBulkStatus} disabled={bulkBusy || !bulkStatus}
                  className="cursor-pointer text-xs font-bold bg-accent hover:bg-orange-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors">
                  Apply
                </button>
                <select value={bulkClientId} onChange={(e) => setBulkClientId(e.target.value)} disabled={bulkBusy}
                  className="text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 font-body">
                  <option value="">Assign client…</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button type="button" onClick={applyBulkClient} disabled={bulkBusy || !bulkClientId}
                  className="cursor-pointer text-xs font-bold bg-accent hover:bg-orange-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors">
                  Assign
                </button>
                <button type="button" onClick={archiveSelected} disabled={bulkBusy}
                  className="cursor-pointer text-xs font-bold bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 px-3 py-2 rounded-lg transition-colors">
                  Archive
                </button>
                <button type="button" onClick={clearSelection} disabled={bulkBusy}
                  className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg transition-colors ml-auto">
                  Clear
                </button>
              </motion.div>
            )}

            {projects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-400 font-body">No client projects found.</p>
              </div>
            ) : (
              projects.map((p, i) => {
                const isOverdue = p.domain_expiration && new Date(p.domain_expiration) < new Date();
                const isSelected = selected.has(p.id);
                return (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className={`bg-white dark:bg-gray-800 p-5 rounded-2xl border shadow-sm transition-all ${isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-gray-100 dark:border-gray-700 hover:border-accent/40'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelected(p.id)}
                          className="mt-1 w-4 h-4 rounded accent-accent cursor-pointer" />
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                            {p.project_name}
                            {p.payment_type === 'MONTHLY' && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Monthly</span>}
                            {p.status === 'LAUNCHED' && <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-bold">Launched</span>}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-body">{p.client_name}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => editProject(p)} className="text-accent hover:text-orange-600 text-sm font-bold">Edit</button>
                        <button onClick={() => deleteProject(p.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1 font-body">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{p.status}</span>
                        <span className="font-bold text-gray-600 dark:text-gray-400">{p.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all ${p.status === 'LAUNCHED' ? 'bg-purple-500' : 'bg-accent'}`}
                          style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    <div className="bg-accent/5 dark:bg-accent/10 p-3 rounded-xl text-sm mb-3 border border-accent/20">
                      <p className="font-bold text-accent text-[10px] uppercase tracking-wider mb-1">Client Magic Link:</p>
                      <a href={`/track/${p.tracking_id}`} target="_blank" rel="noreferrer"
                        className="text-accent hover:underline break-all font-mono text-xs">
                        {FRONTEND_URL}/track/{p.tracking_id}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      {p.domain_name && (
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                          <span className="block text-gray-500 text-[10px] uppercase tracking-wider font-bold mb-1">Domain</span>
                          <span className="font-medium text-gray-900 dark:text-white truncate block font-body" title={p.domain_name}>{p.domain_name}</span>
                        </div>
                      )}
                      {p.domain_expiration && (
                        <div className={`p-3 rounded-xl ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-gray-50 dark:bg-gray-900'}`}>
                          <span className="block text-[10px] uppercase tracking-wider font-bold mb-1">Expires</span>
                          <span className="font-medium font-body">{new Date(p.domain_expiration).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                        <span className="block text-[10px] uppercase tracking-wider font-bold mb-1">Amount Due</span>
                        <span className="font-bold font-mono text-red-600 dark:text-red-400">₦{Number(p.amount_due || 0).toLocaleString()}</span>
                      </div>
                      {p.intake_form_id && (
                        <div className={`p-3 rounded-xl ${p.intake_completed ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          <span className="block text-[10px] uppercase tracking-wider font-bold mb-1">Intake Form</span>
                          <span className="font-bold font-body">{p.intake_completed ? 'Completed' : 'Pending'}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
        ) : (
          /* KANBAN VIEW */
          <div className="flex overflow-x-auto pb-8 gap-6 snap-x">
            {['ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW', 'LAUNCHED', 'MAINTENANCE', 'ARCHIVED'].map((status) => (
              <div 
                key={status} 
                className="flex-shrink-0 w-80 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 snap-center h-[calc(100vh-250px)]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 rounded-t-2xl">
                  <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-wide">{status}</h3>
                  <p className="text-xs text-gray-500 mt-1 font-bold">{projects.filter(p => p.status === status).length} projects</p>
                </div>
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  {projects.filter(p => p.status === status).map((p) => (
                    <div 
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p)}
                      className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-accent/50 cursor-grab active:cursor-grabbing transition-all"
                    >
                      <h4 className="font-bold text-gray-900 dark:text-white font-heading text-sm mb-1">{p.project_name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-body mb-3 truncate">{p.client_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-600 dark:text-gray-400 text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">{p.progress}%</span>
                        <div className="flex gap-2">
                          <button onClick={() => { setViewMode('list'); editProject(p); }} className="text-xs text-accent hover:underline font-bold">Edit</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projects.filter(p => p.status === status).length === 0 && (
                    <div className="text-center py-6 text-gray-400 text-xs font-bold border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClientProjects;
