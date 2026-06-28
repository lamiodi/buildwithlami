import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const AdminProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, intake, credentials
  
  // Intake State
  const [templates, setTemplates] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Credentials State
  const [secrets, setSecrets] = useState([]);
  const [showSecretForm, setShowSecretForm] = useState(false);
  const [secretForm, setSecretForm] = useState({ keyName: '', value: '' });

  // Invoices & Feedback State
  const [invoices, setInvoices] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({ amount: '', dueDate: '' });
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

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

  useEffect(() => {
    fetchProjectData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssignTemplate = async (e) => {
    const templateId = e.target.value;
    if (!templateId) return;
    const res = await api.patch(`/client-projects/${id}`, { intake_form_id: templateId });
    if (res.ok) {
      notify.success('Template assigned!');
      fetchProjectData();
    } else {
      notify.error(res.error || 'Failed to assign template');
    }
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
    } else {
      notify.error(res.error || 'Failed to add secret');
    }
  };

  const handleRegenerateLink = async () => {
    if (!window.confirm('Are you sure? This will invalidate the previous tracking link for the client.')) return;
    const res = await api.post(`/client-projects/${id}/regenerate-tracking`);
    if (res.ok && res.data && res.data.tracking_id) {
      notify.success('Magic Link Regenerated!');
      fetchProjectData();
    } else {
      notify.error(res.error || 'Failed to regenerate link');
    }
  };

  const [revealedSecrets, setRevealedSecrets] = useState({});

  const toggleReveal = (secretId) => {
    setRevealedSecrets(prev => ({
      ...prev,
      [secretId]: !prev[secretId]
    }));
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
      clientId: project.client_id,
      projectId: id,
      amount: Number(invoiceForm.amount),
      dueDate: invoiceForm.dueDate || undefined
    });
    if (res.ok) {
      setInvoiceForm({ amount: '', dueDate: '' });
      fetchProjectData();
      notify.success('Invoice generated & Paystack link created!');
    } else {
      notify.error(res.error || 'Failed to create invoice');
    }
    setInvoiceSubmitting(false);
  };

  const handleReplyFeedback = async (feedbackId, adminReply) => {
    const res = await api.put(`/feedback/${feedbackId}/reply`, { adminReply, status: 'RESOLVED' });
    if (res.ok) {
      fetchProjectData();
    } else {
      notify.error(res.error || 'Failed to reply to feedback');
    }
  };

  if (!project) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/admin/projects" className="text-sm text-gray-500 hover:text-accent mb-2 inline-block">&larr; Back to Projects</Link>
          <h1 className="text-3xl font-bold">{project.project_name}</h1>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
            project.status === 'LAUNCHED' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto mb-6">
        {['overview', 'intake', 'credentials', 'invoices', 'feedback'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold capitalize rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-accent' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {tab === 'intake' ? 'Intake & Onboarding' : tab === 'credentials' ? 'Credentials & Access' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Client Name</p>
                <p className="font-medium">{project.client_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Domain Name</p>
                <p className="font-medium">{project.domain_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Progress</p>
                <p className="font-medium">{project.progress}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tracking Link</p>
                <div className="flex items-center gap-2">
                  <a href={`/track/${project.tracking_id}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm font-medium">
                    View Tracker &rarr;
                  </a>
                  <button 
                    onClick={handleRegenerateLink}
                    className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded"
                  >
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
              <h2 className="text-xl font-semibold">Flexible Intake System</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Assign Template:</label>
                <select 
                  value={project.intake_form_id || ''} 
                  onChange={handleAssignTemplate}
                  className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                >
                  <option value="">-- Select Template --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name || t.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Client Submissions</h3>
              {submissions.length === 0 ? (
                <p className="text-gray-500 text-sm">No submissions yet. Status: <span className="text-yellow-600 font-bold">Awaiting Client Response</span></p>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => (
                    <div key={sub.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-3">Submitted on: {new Date(sub.submitted_at).toLocaleString()}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(sub.responses).map(([key, val]) => (
                          <div key={key} className="bg-gray-50 dark:bg-gray-900 p-3 rounded">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">{key}</p>
                            <p className="text-sm break-words">{val.toString()}</p>
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
              <h2 className="text-xl font-semibold">Infrastructure Access Vault</h2>
              <button 
                onClick={() => setShowSecretForm(!showSecretForm)}
                className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition"
              >
                {showSecretForm ? 'Cancel' : '+ Add Credential'}
              </button>
            </div>

            {showSecretForm && (
              <form onSubmit={handleAddSecret} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Service Name / Identifier</label>
                    <input 
                      type="text" 
                      value={secretForm.keyName} 
                      onChange={e => setSecretForm({...secretForm, keyName: e.target.value})} 
                      placeholder="e.g. Google Workspace Admin"
                      required
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Password / Secret Key</label>
                    <input 
                      type="password" 
                      value={secretForm.value} 
                      onChange={e => setSecretForm({...secretForm, value: e.target.value})} 
                      required
                      className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                    />
                  </div>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                  Securely Save
                </button>
              </form>
            )}

            <div className="mt-6">
              {secrets.length === 0 ? (
                <p className="text-gray-500 text-sm">No credentials stored for this project.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                        <th className="py-3 px-4 font-medium">Service</th>
                        <th className="py-3 px-4 font-medium">Secret</th>
                        <th className="py-3 px-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {secrets.map(sec => (
                        <tr key={sec.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="py-3 px-4 font-medium text-sm">{sec.key_name}</td>
                          <td className="py-3 px-4 font-mono text-sm">
                            {revealedSecrets[sec.id] ? sec.value : '••••••••••••'}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button 
                              onClick={() => copyToClipboard(sec.value)}
                              className="text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-2 py-1 rounded transition"
                            >
                              Copy
                            </button>
                            <button 
                              onClick={() => toggleReveal(sec.id)}
                              className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 px-2 py-1 rounded transition"
                            >
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
            <p className="text-xs text-gray-400 mt-4">
              * Note: Credentials are encrypted using AES-256-CBC at rest. They are only decrypted when requested by an authorized admin.
            </p>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Invoices (Paystack)</h2>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold mb-4">Generate New Invoice</h3>
              <form onSubmit={handleCreateInvoice} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium mb-1">Amount</label>
                  <input 
                    type="number" 
                    value={invoiceForm.amount} 
                    onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})} 
                    placeholder="e.g. 50000"
                    required
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium mb-1">Due Date (Optional)</label>
                  <input 
                    type="date" 
                    value={invoiceForm.dueDate} 
                    onChange={e => setInvoiceForm({...invoiceForm, dueDate: e.target.value})} 
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600"
                  />
                </div>
                <button type="submit" disabled={invoiceSubmitting} className="bg-green-600 text-white px-6 py-2 rounded font-medium hover:bg-green-700 w-full md:w-auto h-[42px]">
                  {invoiceSubmitting ? 'Creating...' : 'Create Invoice'}
                </button>
              </form>
            </div>
            
            <div className="mt-6">
              {invoices.length === 0 ? (
                <p className="text-gray-500 text-sm">No invoices have been generated for this project.</p>
              ) : (
                <div className="space-y-4">
                  {invoices.map(inv => (
                    <div key={inv.id} className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div>
                        <p className="font-bold text-lg">${Number(inv.amount).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Created: {new Date(inv.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {inv.status}
                        </span>
                        {inv.payment_url && (
                          <a href={inv.payment_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                            View Link &rarr;
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
            <h2 className="text-xl font-semibold">Client Feedback & Approvals</h2>
            {feedback.length === 0 ? (
              <p className="text-gray-500 text-sm">No feedback submitted by the client yet.</p>
            ) : (
              <div className="space-y-6">
                {feedback.map(f => (
                  <div key={f.id} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Stage {f.stage_index + 1}</span>
                        <p className="text-sm text-gray-500">{new Date(f.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        f.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {f.status}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">"{f.client_comment}"</p>
                    
                    {f.admin_reply ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">Your Reply:</p>
                        <p className="text-sm text-blue-900 dark:text-blue-100">{f.admin_reply}</p>
                      </div>
                    ) : (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const reply = e.target.reply.value;
                        if(reply) handleReplyFeedback(f.id, reply);
                      }} className="mt-4 flex gap-2">
                        <input 
                          name="reply"
                          type="text" 
                          placeholder="Type a reply and resolve..." 
                          className="flex-1 p-2 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"
                        />
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
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
    </div>
  );
};

export default AdminProjectDetail;