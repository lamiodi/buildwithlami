import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const AdminProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [templates, setTemplates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [secrets, setSecrets] = useState([]);
  const [showSecretForm, setShowSecretForm] = useState(false);
  const [secretForm, setSecretForm] = useState({ keyName: '', value: '' });
  const [invoices, setInvoices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({ amount: '', dueDate: '' });
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState({});

  const fetchProjectData = async () => {
    const res = await api.get(`/client-projects/${id}/dashboard`);
    if (res.ok && res.data) {
      setProject(res.data.project);
      setSecrets(res.data.secrets || []);
      setTemplates(res.data.templates || []);
      setSubmissions(res.data.submissions || []);
      setInvoices(res.data.invoices || []);
      setFeedback(res.data.feedback || []);
    } else if (!res.ok) {
      notify.error(res.error || 'Failed to load project');
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  const handleAssignTemplate = async (e) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const res = await api.patch(`/client-projects/${id}`, { intake_form_id: templateId });
    if (res.ok) { notify.success('Template assigned!'); fetchProjectData(); }
    else notify.error(res.error || 'Failed to assign template');
  };

  const handleAddSecret = async (e) => {
    e.preventDefault();
    if (!project?.client_id) return;
    const res = await api.post('/secrets', { clientId: project.client_id, keyName: secretForm.keyName, value: secretForm.value });
    if (res.ok) {
      setSecretForm({ keyName: '', value: '' });
      setShowSecretForm(false);
      fetchProjectData();
      notify.success('Credential saved securely.');
    } else { notify.error(res.error || 'Failed to add secret'); }
  };

  const handleRegenerateLink = async () => {
    if (!window.confirm('Regenerate tracking link? This will invalidate the previous one.')) return;
    const res = await api.post(`/client-projects/${id}/regenerate-tracking`);
    if (res.ok && res.data?.tracking_id) { notify.success('Magic Link Regenerated!'); fetchProjectData(); }
    else notify.error(res.error || 'Failed to regenerate link');
  };

  const toggleReveal = (secretId) => {
    setRevealedSecrets(prev => ({ ...prev, [secretId]: !prev[secretId] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notify.success('Copied to clipboard');
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!project?.client_id || !invoiceForm.amount) return;
    setInvoiceSubmitting(true);
    const res = await api.post('/invoices', {
      clientId: project.client_id, projectId: id,
      amount: Number(invoiceForm.amount), dueDate: invoiceForm.dueDate || undefined
    });
    if (res.ok) { setInvoiceForm({ amount: '', dueDate: '' }); fetchProjectData(); notify.success('Invoice generated!'); }
    else notify.error(res.error || 'Failed to create invoice');
    setInvoiceSubmitting(false);
  };

  const handleReplyFeedback = async (feedbackId, adminReply) => {
    const res = await api.put(`/feedback/${feedbackId}/reply`, { adminReply, status: 'RESOLVED' });
    if (res.ok) fetchProjectData();
    else notify.error(res.error || 'Failed to reply to feedback');
  };

  if (!project) return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="animate-pulse text-gray-400 font-body">Loading project…</div>
    </div>
  );

  const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
  const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

  const tabs = ['overview', 'intake', 'credentials', 'invoices', 'feedback'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link to="/admin/projects" className="text-sm text-accent hover:text-orange-600 mb-2 inline-flex items-center gap-1 font-body">
                ← Back to Projects
              </Link>
              <h1 className="text-3xl font-extrabold font-heading text-gray-900 dark:text-white">{project.project_name}</h1>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                project.status === 'LAUNCHED' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-accent/10 text-accent'
              }`}>
                {project.status}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto mb-6">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-bold capitalize rounded-lg transition-all whitespace-nowrap font-body ${
                  activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                }`}>
                {tab === 'intake' ? 'Intake & Onboarding' : tab === 'credentials' ? 'Credentials & Access' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Client Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">Client Name</p>
                    <p className="font-medium font-body text-gray-900 dark:text-white">{project.client_name}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">Domain Name</p>
                    <p className="font-medium font-body text-gray-900 dark:text-white">{project.domain_name || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">Progress</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="h-2 rounded-full bg-accent" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="font-bold text-accent">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="bg-accent/5 dark:bg-accent/10 p-4 rounded-xl border border-accent/20">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-accent mb-1">Tracking Link</p>
                    <div className="flex items-center gap-2">
                      <a href={`/track/${project.tracking_id}`} target="_blank" rel="noreferrer"
                        className="text-accent hover:underline text-sm font-mono break-all">
                        {window.location.origin}/track/{project.tracking_id}
                      </a>
                      <button onClick={handleRegenerateLink}
                        className="text-xs text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg font-bold">
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* INTAKE TAB */}
            {activeTab === 'intake' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Flexible Intake System</h2>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 font-body">Assign Template:</label>
                    <select value={project.intake_form_id || ''} onChange={handleAssignTemplate}
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:bg-gray-900 font-body">
                      <option value="">-- Select Template --</option>
                      {templates.map(t => <option key={t.id} value={t.id}>{t.name || t.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-bold font-heading mb-4 text-gray-900 dark:text-white">Client Submissions</h3>
                  {submissions.length === 0 ? (
                    <p className="text-gray-500 text-sm font-body">No submissions yet. Status: <span className="text-amber-600 font-bold">Awaiting Client Response</span></p>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map(sub => (
                        <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-3">Submitted: {new Date(sub.submitted_at).toLocaleString()}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(sub.responses).map(([key, val]) => (
                              <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{key}</p>
                                <p className="text-sm font-body text-gray-900 dark:text-white break-words">{val.toString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CREDENTIALS TAB */}
            {activeTab === 'credentials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Infrastructure Access Vault</h2>
                  <button onClick={() => setShowSecretForm(!showSecretForm)}
                    className="bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-lg hover:shadow-accent/30">
                    {showSecretForm ? 'Cancel' : '+ Add Credential'}
                  </button>
                </div>
                {showSecretForm && (
                  <form onSubmit={handleAddSecret} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Service Name / Identifier</label>
                        <input type="text" value={secretForm.keyName} onChange={e => setSecretForm({...secretForm, keyName: e.target.value})} placeholder="e.g. Google Workspace Admin" required className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Password / Secret Key</label>
                        <input type="password" value={secretForm.value} onChange={e => setSecretForm({...secretForm, value: e.target.value})} required className={inputClass} />
                      </div>
                    </div>
                    <button type="submit" className="bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
                      Securely Save
                    </button>
                  </form>
                )}
                <div className="mt-6">
                  {secrets.length === 0 ? (
                    <p className="text-gray-500 text-sm font-body">No credentials stored for this project.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                            <th className="py-3 px-4 font-bold font-body">Service</th>
                            <th className="py-3 px-4 font-bold font-body">Secret</th>
                            <th className="py-3 px-4 font-bold text-right font-body">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {secrets.map(sec => (
                            <tr key={sec.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="py-3 px-4 font-medium text-sm font-body text-gray-900 dark:text-white">{sec.key_name}</td>
                              <td className="py-3 px-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                                {revealedSecrets[sec.id] ? sec.value : '••••••••••••'}
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button onClick={() => copyToClipboard(sec.value)}
                                  className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-1 rounded-lg transition font-bold">
                                  Copy
                                </button>
                                <button onClick={() => toggleReveal(sec.id)}
                                  className="text-xs bg-accent/10 text-accent hover:bg-accent/20 px-2 py-1 rounded-lg transition font-bold">
                                  {revealedSecrets[sec.id] ? 'Hide' : 'Reveal'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-4 font-body">
                  * Credentials are encrypted using AES-256-CBC at rest.
                </p>
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Project Invoices (Paystack)</h2>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold font-heading mb-4 text-gray-900 dark:text-white">Generate New Invoice</h3>
                  <form onSubmit={handleCreateInvoice} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className={labelClass}>Amount (₦)</label>
                      <input type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} placeholder="e.g. 50000" required className={inputClass} />
                    </div>
                    <div className="flex-1 w-full">
                      <label className={labelClass}>Due Date (Optional)</label>
                      <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} className={inputClass} />
                    </div>
                    <button type="submit" disabled={invoiceSubmitting}
                      className="bg-accent hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold w-full md:w-auto transition-colors shadow-lg hover:shadow-accent/30 disabled:opacity-50">
                      {invoiceSubmitting ? 'Creating...' : 'Create Invoice'}
                    </button>
                  </form>
                </div>
                <div className="mt-6">
                  {invoices.length === 0 ? (
                    <p className="text-gray-500 text-sm font-body">No invoices generated for this project.</p>
                  ) : (
                    <div className="space-y-4">
                      {invoices.map(inv => (
                        <div key={inv.id} className="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="font-bold text-lg font-heading text-gray-900 dark:text-white">₦{Number(inv.amount).toLocaleString()}</p>
                            <p className="text-[10px] text-gray-500 font-body">Created: {new Date(inv.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                            {inv.payment_url && (
                              <a href={inv.payment_url} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline font-bold">
                                View Link →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Client Feedback & Approvals</h2>
                {feedback.length === 0 ? (
                  <p className="text-gray-500 text-sm font-body">No feedback submitted by the client yet.</p>
                ) : (
                  <div className="space-y-6">
                    {feedback.map(f => (
                      <div key={f.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="text-[10px] font-extrabold text-accent uppercase tracking-wider">Stage {f.stage_index + 1}</span>
                            <p className="text-xs text-gray-500 font-body">{new Date(f.created_at).toLocaleString()}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                            f.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {f.status}
                          </span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-4 font-body italic">"{f.client_comment}"</p>
                        {f.admin_reply ? (
                          <div className="bg-accent/5 dark:bg-accent/10 p-3 rounded-xl border border-accent/20">
                            <p className="text-[10px] font-extrabold text-accent mb-1">Your Reply:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-body">{f.admin_reply}</p>
                          </div>
                        ) : (
                          <form onSubmit={(e) => { e.preventDefault(); const reply = e.target.reply.value; if(reply) handleReplyFeedback(f.id, reply); }}
                            className="mt-4 flex gap-2">
                            <input name="reply" type="text" placeholder="Type a reply and resolve..." className={inputClass} />
                            <button type="submit" className="bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap">
                              Reply & Resolve
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProjectDetail;
