import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import Skeleton from '../../components/Skeleton';

const ACTION_TYPES = ['UPLOAD', 'APPROVAL', 'PAYMENT', 'INFO', 'REVIEW'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const PROJECT_TYPES = ['BUSINESS', 'ECOMMERCE', 'BOOKING', 'LANDING', 'PORTFOLIO', 'CUSTOM'];

const ONBOARDING_STATUS_STYLES = {
  NOT_STARTED: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  SUBMITTED: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  NEEDS_CHANGES: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  APPROVED: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

const PRIORITY_STYLES = {
  URGENT: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  HIGH: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  MEDIUM: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  LOW: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const SECTION_LABELS = {
  contact: 'Contact Details', business: 'Business', social: 'Social Media',
  website: 'Website & Domain', brand: 'Brand', goals: 'Project Goals',
  content: 'Content', ecommerce: 'E-commerce', booking: 'Booking & Services',
  marketing: 'Marketing & SEO', policies: 'Policies & Legal',
};

const fieldLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const AdminClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');

  const [client, setClient] = useState(null);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [onboarding, setOnboarding] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Overview edit form
  const [form, setForm] = useState(null);
  const [savingClient, setSavingClient] = useState(false);

  // Onboarding tab state
  const [creatingOnboarding, setCreatingOnboarding] = useState(false);
  const [newOnboarding, setNewOnboarding] = useState({ project_type: 'BUSINESS', send_invite: true });
  const [changesText, setChangesText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Actions tab state
  const [actionForm, setActionForm] = useState({ title: '', type: 'INFO', priority: 'MEDIUM', due_at: '', description: '' });

  // Client summary (Admin OS Phase 6, §78)
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [summaryEditing, setSummaryEditing] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');

  const fetchAll = useCallback(async () => {
    setError(null);
    const [clientRes, projectsRes, invoicesRes, onboardingRes, actionsRes] = await Promise.all([
      api.get(`/clients/${id}`),
      api.get('/client-projects'),
      api.get('/invoices', { params: { client_id: id } }),
      api.get('/onboarding'),
      api.get('/client-actions', { params: { client_id: id, scope: 'all' } }),
    ]);

    if (!clientRes.ok || !clientRes.data) {
      setError(clientRes.error || 'Client not found.');
      setLoading(false);
      return;
    }
    const c = clientRes.data;
    setClient(c);
    setForm({
      name: c.name || '',
      primary_contact_email: c.primary_contact_email || '',
      billing_email: c.billing_email || '',
      phone: c.phone || '',
      whatsapp_number: c.whatsapp_number || '',
      instagram: c.instagram || '',
      country: c.country || '',
      city: c.city || '',
      preferred_contact_method: c.preferred_contact_method || '',
      status: c.status || 'ACTIVE',
      division: c.division || 'SOFTWARE',
      notes: c.notes || '',
      next_action: c.next_action || '',
      next_action_due_at: c.next_action_due_at ? new Date(c.next_action_due_at).toISOString().slice(0, 10) : '',
    });
    if (projectsRes.ok && Array.isArray(projectsRes.data)) {
      setProjects(projectsRes.data.filter((p) => p.client_id === id));
    }
    if (invoicesRes.ok && Array.isArray(invoicesRes.data)) setInvoices(invoicesRes.data);
    if (onboardingRes.ok && Array.isArray(onboardingRes.data)) {
      // Most recent first per the API ordering.
      setOnboarding(onboardingRes.data.find((o) => o.client_id === id) || null);
    }
    if (actionsRes.ok && Array.isArray(actionsRes.data)) setActions(actionsRes.data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const saveClient = async (e) => {
    e.preventDefault();
    setSavingClient(true);
    const res = await api.put(`/clients/${id}`, form);
    setSavingClient(false);
    if (res.ok && res.data) {
      notify.success('Client updated!');
      setClient(res.data);
    } else {
      notify.error(res.error || 'Error updating client.');
    }
  };

  // ── Client summary (Phase 6, §78) ────────────────────────
  const generateSummary = async () => {
    setSummaryBusy(true);
    const res = await api.post(`/intelligence/clients/${id}/summary`);
    setSummaryBusy(false);
    if (res.ok && res.data) {
      setClient((c) => ({ ...c, summary: res.data.summary, summary_source: res.data.source }));
      notify.success(res.data.source === 'ai'
        ? 'AI summary generated.'
        : 'Summary generated from the onboarding answers.');
    } else {
      notify.error(res.error || 'Could not generate a summary.');
    }
  };

  const saveSummary = async () => {
    const res = await api.put(`/intelligence/clients/${id}/summary`, { summary: summaryDraft });
    if (res.ok && res.data) {
      setClient((c) => ({ ...c, summary: res.data.summary, summary_source: res.data.summary_source }));
      setSummaryEditing(false);
      notify.success('Summary saved.');
    } else {
      notify.error(res.error || 'Could not save the summary.');
    }
  };

  const createOnboarding = async (e) => {
    e.preventDefault();
    const res = await api.post('/onboarding', { client_id: id, ...newOnboarding });
    if (res.ok && res.data) {
      notify.success(res.data.emailStatus === 'failed'
        ? 'Onboarding created — but the invite email failed to send. Check SMTP logs.'
        : 'Onboarding created — invite sent to the client.');
      setCreatingOnboarding(false);
      setOnboarding(res.data);
      fetchAll();
    } else if (res.status === 409) {
      notify.error('This client already has an active onboarding.');
    } else {
      notify.error(res.error || 'Error creating onboarding.');
    }
  };

  const setOnboardingStatus = async (status, requestedChanges) => {
    setReviewLoading(true);
    const res = await api.patch(`/onboarding/${onboarding.id}/status`, {
      status,
      ...(requestedChanges !== undefined ? { requested_changes: requestedChanges } : {}),
    });
    setReviewLoading(false);
    if (res.ok && res.data) {
      notify.success(
        status === 'APPROVED' ? 'Onboarding approved ✅' :
        status === 'NEEDS_CHANGES' ? 'Changes requested — client notified by email.' :
        'Onboarding reopened for editing.'
      );
      setChangesText('');
      fetchAll();
    } else {
      notify.error(res.error || 'Error updating onboarding.');
    }
  };

  const resendInvite = async () => {
    const res = await api.post(`/onboarding/${onboarding.id}/invite`);
    if (res.ok) notify.success('Invite email sent.');
    else notify.error(res.error || 'Failed to send invite.');
  };

  const createAction = async (e) => {
    e.preventDefault();
    if (!actionForm.title.trim()) {
      notify.error('Title is required');
      return;
    }
    const res = await api.post('/client-actions', {
      ...actionForm,
      client_id: id,
      project_id: projects.length === 1 ? projects[0].id : null,
      due_at: actionForm.due_at || null,
    });
    if (res.ok && res.data) {
      notify.success('Client action created — visible in their portal.');
      setActionForm({ title: '', type: 'INFO', priority: 'MEDIUM', due_at: '', description: '' });
      fetchAll();
    } else {
      notify.error(res.error || 'Error creating action.');
    }
  };

  const updateActionStatus = async (actionId, status) => {
    const res = await api.patch(`/client-actions/${actionId}`, { status });
    if (res.ok) {
      notify.success(status === 'COMPLETED' ? 'Marked complete' : 'Action cancelled');
      fetchAll();
    } else {
      notify.error(res.error || 'Error updating action.');
    }
  };

  const deleteAction = async (actionId) => {
    if (!window.confirm('Delete this client action?')) return;
    const res = await api.delete(`/client-actions/${actionId}`);
    if (res.ok) {
      notify.success('Action deleted');
      fetchAll();
    } else {
      notify.error(res.error || 'Error deleting action.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 font-body">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/admin/clients')}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-bold">
          Back to Clients
        </button>
      </div>
    );
  }

  const pendingActions = actions.filter((a) => a.status === 'PENDING');
  const totalBilled = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const openOnboarding = onboarding && onboarding.status !== 'APPROVED' ? onboarding : null;

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: `Projects (${projects.length})` },
    { id: 'onboarding', label: 'Onboarding', badge: openOnboarding ? openOnboarding.status : null },
    { id: 'actions', label: `Actions (${pendingActions.length})`, badge: pendingActions.length > 0 ? String(pendingActions.length) : null },
    { id: 'invoices', label: `Invoices (${invoices.length})` },
  ];

  const waDigits = form?.whatsapp_number?.replace(/[^\d]/g, '') || form?.phone?.replace(/[^\d]/g, '') || '';

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link to="/admin/clients" className="text-xs font-bold text-gray-400 hover:text-accent uppercase tracking-widest font-body">← Clients</Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white font-heading mt-1">
            {client.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {client.division && (
              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                client.division === 'SURVEY' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                client.division === 'DRONE' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' :
                'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'}`}>
                {client.division}
              </span>
            )}
            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${ONBOARDING_STATUS_STYLES[client.status === 'ONBOARDING' ? 'IN_PROGRESS' : 'APPROVED']}`}>
              {client.status || 'ACTIVE'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-body">{client.primary_contact_email}</span>
            {waDigits && waDigits.length >= 7 && (
              <a href={`https://wa.me/${waDigits}`} target="_blank" rel="noopener noreferrer"
                className="text-xs bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1 rounded-lg transition-colors font-body">
                WhatsApp
              </a>
            )}
            {client.instagram && (
              <a href={`https://instagram.com/${client.instagram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer"
                className="text-xs bg-pink-100 hover:bg-pink-200 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 font-bold px-3 py-1 rounded-lg transition-colors font-body">
                @{client.instagram.replace(/^@/, '')}
              </a>
            )}
          </div>
        </div>
        {client.next_action && (
          <div className="bg-accent/5 border border-accent/20 rounded-xl px-4 py-3 max-w-sm">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-accent mb-1">Next Action</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white font-body">{client.next_action}</p>
            {client.next_action_due_at && (
              <p className={`text-xs mt-1 font-body font-bold ${new Date(client.next_action_due_at) < new Date() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                Due {fmtDate(client.next_action_due_at)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-gray-200 dark:border-gray-700 mb-6 pb-px">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors rounded-t-xl font-body border-b-2 -mb-px ${
              tab === t.id
                ? 'text-accent border-accent bg-accent/5'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-gray-200'
            }`}>
            {t.label}
            {t.badge && (
              <span className="ml-2 text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent text-white">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ─────────────────────────────────────── */}
      {tab === 'overview' && form && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-[#1c1c1c] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
            <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">Client Profile</h2>
            <form onSubmit={saveClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Client / Business Name</label>
                  <input type="text" name="name" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Primary Email</label>
                  <input type="email" name="primary_contact_email" required value={form.primary_contact_email}
                    onChange={(e) => setForm({ ...form, primary_contact_email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Billing Email</label>
                  <input type="email" value={form.billing_email}
                    onChange={(e) => setForm({ ...form, billing_email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="text" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>WhatsApp Number</label>
                  <input type="text" value={form.whatsapp_number} placeholder="+234 801 234 5678"
                    onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Instagram Username</label>
                  <input type="text" value={form.instagram} placeholder="@brandname"
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>City / State</label>
                  <input type="text" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Contact</label>
                  <select value={form.preferred_contact_method}
                    onChange={(e) => setForm({ ...form, preferred_contact_method: e.target.value })} className={inputClass}>
                    <option value="">— Not set —</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    <option value="ACTIVE">Active</option>
                    <option value="ONBOARDING">Onboarding</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Division</label>
                  <select value={form.division}
                    onChange={(e) => setForm({ ...form, division: e.target.value })} className={inputClass}>
                    <option value="SOFTWARE">Software</option>
                    <option value="SURVEY">Survey</option>
                    <option value="DRONE">Drone</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Next Action</label>
                  <input type="text" value={form.next_action} placeholder="Send revision link..."
                    onChange={(e) => setForm({ ...form, next_action: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Next Action Due</label>
                  <input type="date" value={form.next_action_due_at}
                    onChange={(e) => setForm({ ...form, next_action_due_at: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Internal Notes</label>
                <textarea rows="3" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} />
              </div>
              <button type="submit" disabled={savingClient}
                className="bg-accent hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
                {savingClient ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
              <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Snapshot</h3>
              <dl className="space-y-3 text-sm font-body">
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Projects</dt><dd className="font-bold text-gray-900 dark:text-white">{projects.length}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Invoices paid</dt><dd className="font-bold text-gray-900 dark:text-white">₦{totalBilled.toLocaleString()}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Pending actions</dt><dd className="font-bold text-accent">{pendingActions.length}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500 dark:text-gray-400">Client since</dt><dd className="font-bold text-gray-900 dark:text-white">{fmtDate(client.created_at)}</dd></div>
              </dl>
            </div>

            {/* ── Client Summary (Phase 6, §78) — generated from the
                onboarding answers; AI when configured, rules always.
                Editable — a manual save pins it as the source. ── */}
            <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Client Summary</h3>
                {client.summary_source && !summaryEditing && (
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                    client.summary_source === 'ai'
                      ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                      : client.summary_source === 'manual'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {client.summary_source === 'ai' ? 'AI' : client.summary_source === 'manual' ? 'Manual' : 'Auto'}
                  </span>
                )}
              </div>
              {summaryEditing ? (
                <div>
                  <textarea rows="8" value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                    className={inputClass} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveSummary}
                      className="bg-accent hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                      Save
                    </button>
                    <button onClick={() => { setSummaryEditing(false); setSummaryDraft(''); }}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold px-3 py-2 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-body whitespace-pre-wrap leading-relaxed">
                    {client.summary || 'No summary yet — generate one from the onboarding answers.'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={generateSummary} disabled={summaryBusy}
                      className="bg-accent hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                      {summaryBusy ? 'Generating…' : '✦ Generate'}
                    </button>
                    {client.summary && (
                      <button onClick={() => { setSummaryDraft(client.summary || ''); setSummaryEditing(true); }}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold px-3 py-2 transition-colors">
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {onboarding && (
              <button onClick={() => setTab('onboarding')}
                className="w-full text-left bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm hover:border-accent/40 transition-colors">
                <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Onboarding</h3>
                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${ONBOARDING_STATUS_STYLES[onboarding.status]}`}>
                  {onboarding.status.replace('_', ' ')}
                </span>
                <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${onboarding.completion_percent || 0}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-body">{onboarding.completion_percent || 0}% complete</p>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Projects ─────────────────────────────────────── */}
      {tab === 'projects' && (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
          {projects.length === 0 ? (
            <p className="p-12 text-center text-gray-500 font-body">No projects for this client yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Progress</th>
                  <th className="py-4 px-6 text-center">Payment</th>
                  <th className="py-4 px-6 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-4 px-6">
                      <Link to={`/admin/projects/${p.id}`} className="font-bold text-blue-600 dark:text-blue-400 hover:underline font-body">
                        {p.project_name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-body">
                        {(p.status || '—').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${p.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 font-body">{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold font-body">
                      <span className={`px-2 py-0.5 rounded ${
                        p.payment_status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                        p.payment_status === 'PARTIAL' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {p.payment_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-500 font-body">{fmtDate(p.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Onboarding ───────────────────────────────────── */}
      {tab === 'onboarding' && (
        <div className="space-y-6">
          {!onboarding && !creatingOnboarding && (
            <div className="bg-white dark:bg-[#1c1c1c] p-12 rounded-2xl border border-gray-100 dark:border-gray-800/60 text-center font-body">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No onboarding yet for this client.</p>
              <button onClick={() => setCreatingOnboarding(true)}
                className="bg-accent hover:bg-orange-600 text-white font-bold py-2.5 px-5 rounded-xl transition-all text-sm">
                Start Onboarding
              </button>
            </div>
          )}

          {creatingOnboarding && (
            <form onSubmit={createOnboarding} className="bg-white dark:bg-[#1c1c1c] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm max-w-xl space-y-4">
              <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">New Onboarding</h2>
              <div>
                <label className={labelClass}>Project Type</label>
                <select value={newOnboarding.project_type}
                  onChange={(e) => setNewOnboarding({ ...newOnboarding, project_type: e.target.value })} className={inputClass}>
                  {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1.5 font-body">E-commerce / Booking sections appear conditionally in the client wizard.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="send_invite" checked={newOnboarding.send_invite}
                  onChange={(e) => setNewOnboarding({ ...newOnboarding, send_invite: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent" />
                <label htmlFor="send_invite" className="text-sm font-bold text-gray-700 dark:text-gray-300 font-body">
                  Email the onboarding link to the client
                </label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all text-sm font-body">
                  Create & Send
                </button>
                <button type="button" onClick={() => setCreatingOnboarding(false)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl text-sm font-bold font-body">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {onboarding && !creatingOnboarding && (
            <>
              <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-1 rounded ${ONBOARDING_STATUS_STYLES[onboarding.status]}`}>
                        {onboarding.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 font-body">{onboarding.project_type}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2.5 w-48 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${onboarding.completion_percent || 0}%` }} />
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white font-body">{onboarding.completion_percent || 0}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {onboarding.status === 'SUBMITTED' && (
                      <>
                        <button disabled={reviewLoading} onClick={() => setOnboardingStatus('APPROVED')}
                          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-xl text-xs font-body">
                          Approve
                        </button>
                        <button disabled={reviewLoading} onClick={() => {
                          if (!changesText.trim()) {
                            notify.error('Describe the changes you need first.');
                            return;
                          }
                          setOnboardingStatus('NEEDS_CHANGES', changesText.trim());
                        }}
                          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-xl text-xs font-body">
                          Request Changes
                        </button>
                      </>
                    )}
                    {(onboarding.status === 'SUBMITTED' || onboarding.status === 'NEEDS_CHANGES') && (
                      <button disabled={reviewLoading} onClick={() => setOnboardingStatus('IN_PROGRESS')}
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-xl text-xs font-body">
                        Reopen
                      </button>
                    )}
                    <button onClick={resendInvite}
                      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-2 px-4 rounded-xl text-xs font-body">
                      Resend Invite
                    </button>
                  </div>
                </div>
                {onboarding.status === 'SUBMITTED' && (
                  <textarea value={changesText} onChange={(e) => setChangesText(e.target.value)} rows="2"
                    placeholder="If requesting changes — describe what needs updating (included in the client email)…"
                    className={`${inputClass} mt-4`} />
                )}
                {onboarding.status === 'NEEDS_CHANGES' && onboarding.requested_changes && (
                  <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/40 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-200 font-body">
                    <strong>Changes requested:</strong> {onboarding.requested_changes}
                  </div>
                )}
              </div>

              {/* Responses, section by section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(onboarding.responses || {}).map(([sectionKey, data]) => (
                  <div key={sectionKey} className="bg-white dark:bg-[#1c1c1c] p-6 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm">
                    <h3 className="text-[10px] font-extrabold text-accent uppercase tracking-widest mb-4">
                      {SECTION_LABELS[sectionKey] || fieldLabel(sectionKey)}
                    </h3>
                    <dl className="space-y-2 text-sm font-body">
                      {Object.entries(data || {}).filter(([, v]) => v !== null && v !== undefined && v !== '').map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <dt className="text-gray-400 shrink-0">{fieldLabel(k)}</dt>
                          <dd className="font-bold text-gray-900 dark:text-white text-right break-words">
                            {Array.isArray(v) ? v.join(', ') : String(v)}
                          </dd>
                        </div>
                      ))}
                      {Object.values(data || {}).every((v) => v === null || v === undefined || v === '') && (
                        <p className="text-gray-400 italic">No answers in this section.</p>
                      )}
                    </dl>
                  </div>
                ))}
                {Object.keys(onboarding.responses || {}).length === 0 && (
                  <p className="text-gray-500 font-body md:col-span-2 p-6 text-center">The client hasn't filled anything in yet.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────── */}
      {tab === 'actions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={createAction} className="bg-white dark:bg-[#1c1c1c] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm h-fit space-y-4">
            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Request Client Action</h2>
            <p className="text-xs text-gray-400 font-body">Appears instantly in the client's portal "Action Required" panel.</p>
            <div>
              <label className={labelClass}>What do you need?</label>
              <input type="text" value={actionForm.title} required
                onChange={(e) => setActionForm({ ...actionForm, title: e.target.value })}
                placeholder="Upload product spreadsheet" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Details (Optional)</label>
              <textarea rows="2" value={actionForm.description}
                onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                placeholder="CSV preferred; include prices and SKUs…" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Type</label>
                <select value={actionForm.type}
                  onChange={(e) => setActionForm({ ...actionForm, type: e.target.value })} className={inputClass}>
                  {ACTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select value={actionForm.priority}
                  onChange={(e) => setActionForm({ ...actionForm, priority: e.target.value })} className={inputClass}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Due Date (Optional)</label>
              <input type="date" value={actionForm.due_at}
                onChange={(e) => setActionForm({ ...actionForm, due_at: e.target.value })} className={inputClass} />
            </div>
            <button type="submit"
              className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
              Create Action
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {actions.length === 0 ? (
              <div className="bg-white dark:bg-[#1c1c1c] p-12 rounded-2xl border border-gray-100 dark:border-gray-800/60 text-center text-gray-500 font-body">
                No client actions yet.
              </div>
            ) : actions.map((a) => {
              const overdue = a.due_at && new Date(a.due_at) < new Date() && a.status === 'PENDING';
              return (
                <div key={a.id} className={`bg-white dark:bg-[#1c1c1c] p-5 rounded-2xl border shadow-sm ${a.status === 'PENDING' ? (overdue ? 'border-red-200 dark:border-red-900/50' : 'border-gray-100 dark:border-gray-800/60') : 'border-gray-100 dark:border-gray-800/60 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className={`font-bold text-gray-900 dark:text-white font-body ${a.status === 'COMPLETED' ? 'line-through' : ''}`}>
                        {a.title}
                      </p>
                      {a.description && <p className="text-sm text-gray-500 dark:text-gray-400 font-body mt-0.5">{a.description}</p>}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{a.type}</span>
                        <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${PRIORITY_STYLES[a.priority]}`}>{a.priority}</span>
                        {a.due_at && (
                          <span className={`text-xs font-bold font-body ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                            Due {fmtDate(a.due_at)}{overdue ? ' · OVERDUE' : ''}
                          </span>
                        )}
                        {a.completion_note && (
                          <span className="text-xs text-gray-400 font-body">Client note: {a.completion_note}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {a.status === 'PENDING' && (
                        <>
                          <button onClick={() => updateActionStatus(a.id, 'COMPLETED')}
                            className="text-xs bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 font-bold px-3 py-1.5 rounded-lg font-body">
                            Complete
                          </button>
                          <button onClick={() => updateActionStatus(a.id, 'CANCELLED')}
                            className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg font-body">
                            Cancel
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteAction(a.id)}
                        className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 font-bold px-3 py-1.5 rounded-lg font-body">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Invoices ─────────────────────────────────────── */}
      {tab === 'invoices' && (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <p className="p-12 text-center text-gray-500 font-body">No invoices for this client yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                  <th className="py-4 px-6">Invoice</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Amount</th>
                  <th className="py-4 px-6 text-center">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white font-body">
                      {inv.invoice_number || inv.id.slice(0, 8)}
                      {inv.project_name && <span className="block text-xs font-normal text-gray-400">{inv.project_name}</span>}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded font-body ${
                        inv.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                        inv.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                        'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white font-body">
                      {inv.currency} {Number(inv.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center text-sm text-gray-500 font-body">{fmtDate(inv.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminClientDetail;
