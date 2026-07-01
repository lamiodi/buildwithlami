import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
const ECOMMERCE_PRESET = {
  name: "E-Commerce Website Intake",
  description: "Please fill out this comprehensive questionnaire so we can structure your online store perfectly.",
  schema: [
    { id: "e1", type: "text", label: "Business/Store Name", required: true },
    { id: "e2", type: "select", label: "Primary Industry", required: true, options: ["Fashion & Apparel", "Electronics", "Health & Beauty", "Food & Grocery", "Digital Products", "Other"] },
    { id: "e3", type: "textarea", label: "Describe your target audience", required: true },
    { id: "e4", type: "select", label: "Estimated Number of Products", required: true, options: ["1-50", "51-500", "501-2000", "2000+"] },
    { id: "e5", type: "checkbox", label: "Required Payment Gateways", required: false, options: ["Paystack", "Flutterwave", "Stripe", "PayPal", "Apple Pay / Google Pay", "Crypto"] },
    { id: "e6", type: "checkbox", label: "Required Features", required: false, options: ["Customer Accounts", "Wishlists", "Subscription Billing", "Multi-currency", "Multi-language", "Abandoned Cart Recovery"] },
    { id: "e7", type: "text", label: "Competitor URLs (comma separated)", required: false },
    { id: "e8", type: "textarea", label: "Brand Guidelines (Colors, Vibe, Fonts)", required: false }
  ]
};

const ERP_PRESET = {
  name: "ERP System Requirements",
  description: "Detailed requirements gathering for your custom Enterprise Resource Planning system.",
  schema: [
    { id: "er1", type: "text", label: "Company Name", required: true },
    { id: "er2", type: "select", label: "Current System / Software", required: true, options: ["Excel/Spreadsheets", "QuickBooks", "Legacy On-Premise ERP", "Odoo", "Other"] },
    { id: "er3", type: "checkbox", label: "Core Modules Required", required: true, options: ["Accounting & Finance", "Human Resources (HR)", "Inventory Management", "CRM / Sales", "Supply Chain", "Manufacturing"] },
    { id: "er4", type: "text", label: "Estimated Number of Users", required: true },
    { id: "er5", type: "textarea", label: "Biggest Pain Points in Current Process", required: true },
    { id: "er6", type: "select", label: "Deployment Preference", required: true, options: ["Cloud-based (SaaS)", "On-Premise (Local Server)"] },
    { id: "er7", type: "checkbox", label: "Third-Party Integrations Needed", required: false, options: ["Shopify/WooCommerce", "Banking APIs", "Shipping Providers (FedEx, UPS)", "Slack/Teams", "Custom APIs"] },
    { id: "er8", type: "textarea", label: "Data Migration Requirements", required: false }
  ]
};

const PORTFOLIO_PRESET = {
  name: "Portfolio / Personal Brand Intake",
  description: "Let's capture the essence of your personal brand to create a stunning portfolio.",
  schema: [
    { id: "p1", type: "text", label: "Full Name", required: true },
    { id: "p2", type: "text", label: "Professional Title / Headline", required: true },
    { id: "p3", type: "textarea", label: "Short Bio (About Me)", required: true },
    { id: "p4", type: "checkbox", label: "Sections to Include", required: false, options: ["About", "Services", "Projects/Case Studies", "Testimonials", "Blog", "Contact"] },
    { id: "p5", type: "text", label: "Primary Social Links (LinkedIn, GitHub, etc.)", required: false },
    { id: "p6", type: "textarea", label: "List 3 websites whose design you admire", required: true }
  ]
};

const SAAS_PRESET = {
  name: "SaaS Application Intake",
  description: "Requirements gathering for your Software as a Service product.",
  schema: [
    { id: "s1", type: "text", label: "Product Name", required: true },
    { id: "s2", type: "textarea", label: "Elevator Pitch (What does it do?)", required: true },
    { id: "s3", type: "select", label: "Pricing Model", required: true, options: ["Freemium", "Free Trial", "Tiered Monthly/Annual", "Pay per usage"] },
    { id: "s4", type: "checkbox", label: "User Roles Required", required: false, options: ["Super Admin", "Account Owner", "Team Member", "Viewer/Read-Only"] },
    { id: "s5", type: "textarea", label: "Describe the core 'Aha!' moment for the user", required: true },
    { id: "s6", type: "checkbox", label: "Tech Preferences (if any)", required: false, options: ["React/Next.js", "Vue/Nuxt", "Node.js", "Python/Django", "PostgreSQL", "MongoDB"] }
  ]
};

const LOCAL_BUSINESS_PRESET = {
  name: "Local Business Website Intake",
  description: "Basic info needed to set up a site for your local business or agency.",
  schema: [
    { id: "l1", type: "text", label: "Business Name", required: true },
    { id: "l2", type: "text", label: "Physical Address (or Service Area)", required: true },
    { id: "l3", type: "text", label: "Contact Phone Number", required: true },
    { id: "l4", type: "textarea", label: "What are your core services?", required: true },
    { id: "l5", type: "select", label: "Primary Goal of Website", required: true, options: ["Get Phone Calls", "Generate Lead Forms", "Book Appointments/Consultations", "Informational Only"] },
    { id: "l6", type: "text", label: "Google My Business Link", required: false }
  ]
};

const Icon = {
    Edit: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 13.5 9 14 9.5 11.5 17.5 3.5z" />
        </svg>
    ),
    Trash: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    External: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    ),
};

const AdminIntakeTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', schema: [] });
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    const res = await api.get('/templates');
    if (res.ok && res.data) setTemplates(res.data);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const loadPreset = (preset) => {
    setFormData({ name: preset.name, description: preset.description, schema: JSON.parse(JSON.stringify(preset.schema)) });
    setEditingId(null);
  };

  const addField = (type) => {
    const newField = { id: Date.now().toString(), type, label: '', required: false };
    if (type === 'select' || type === 'checkbox') newField.options = ['Option 1', 'Option 2'];
    setFormData(prev => ({ ...prev, schema: [...prev.schema, newField] }));
  };

  const updateField = (id, key, value) => {
    setFormData(prev => ({ ...prev, schema: prev.schema.map(f => f.id === id ? { ...f, [key]: value } : f) }));
  };

  const removeField = (id) => {
    setFormData(prev => ({ ...prev, schema: prev.schema.filter(f => f.id !== id) }));
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', schema: [] });
    setEditingId(null);
  };

  const editTemplate = (template) => {
    setEditingId(template.id);
    setFormData({
      name: template.name || '',
      description: template.description || '',
      schema: template.schema ? JSON.parse(JSON.stringify(template.schema)) : []
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.schema.length === 0) { notify.error('Add at least one field'); return; }
    setSubmitting(true);

    let res;
    if (editingId) {
      res = await api.put(`/templates/${editingId}`, formData);
    } else {
      res = await api.post('/templates', formData);
    }

    if (res.ok) {
      notify.success(editingId ? 'Template updated!' : 'Template created successfully!');
      fetchTemplates();
      resetForm();
    } else {
      notify.error(res.error || 'Failed to save template');
    }
    setSubmitting(false);
  };

  const deleteTemplate = async (id) => {
    if (!window.confirm('Delete this template? Projects using it will lose their intake form reference.')) return;
    const res = await api.delete(`/templates/${id}`);
    if (res.ok) {
      notify.success('Template deleted');
      fetchTemplates();
    } else {
      notify.error(res.error || 'Failed to delete template');
    }
  };

  const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                Intake Templates
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Build dynamic forms for client onboarding.</p>
            </div>
            {editingId && (
              <button onClick={resetForm} className="text-sm font-bold text-accent hover:underline">
                Cancel Edit
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BUILDER PANEL */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                {editingId ? 'Edit Template' : 'Create New Template'}
              </h2>
              <div className="flex flex-wrap gap-2 justify-end">
                {[
                  { preset: ECOMMERCE_PRESET, label: 'E-Commerce', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
                  { preset: ERP_PRESET, label: 'ERP', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
                  { preset: PORTFOLIO_PRESET, label: 'Portfolio', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
                  { preset: SAAS_PRESET, label: 'SaaS', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
                  { preset: LOCAL_BUSINESS_PRESET, label: 'Local Biz', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
                ].map(({ preset, label, color }) => (
                  <button key={label} onClick={() => loadPreset(preset)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${color} hover:opacity-80`}
                    title={`Load ${label} preset`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Template Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Standard Website Intake" className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Instructions for the client..." rows={2} className={inputClass} />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <h3 className="font-bold font-heading mb-4 text-gray-800 dark:text-gray-200">Form Fields ({formData.schema.length})</h3>
                <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto pr-2">
                  {formData.schema.map((field, idx) => (
                    <div key={field.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-accent">
                          {idx + 1}. {field.type} Field
                        </span>
                        <button type="button" onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">
                          Remove
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input type="text" placeholder="Question / Label" value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} required className={inputClass} />
                        {(field.type === 'select' || field.type === 'checkbox') && (
                          <div>
                            <label className="text-[10px] text-gray-500 font-bold mb-1 block">Options (Comma separated)</label>
                            <input type="text" placeholder="Option 1, Option 2, Option 3" value={(field.options || []).join(', ')}
                              onChange={e => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className={inputClass} />
                          </div>
                        )}
                        <label className="flex items-center text-sm gap-2 font-medium text-gray-700 dark:text-gray-300">
                          <input type="checkbox" checked={field.required} onChange={e => updateField(field.id, 'required', e.target.checked)} className="accent-accent rounded" />
                          <span className="font-body">Required Field</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  {formData.schema.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 font-body">
                      No fields added yet. Use presets above or add fields below.
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    { type: 'text', label: '+ Short Text', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
                    { type: 'textarea', label: '+ Long Text', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
                    { type: 'email', label: '+ Email', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
                    { type: 'select', label: '+ Dropdown', color: 'bg-accent/10 text-accent' },
                    { type: 'checkbox', label: '+ Checkboxes', color: 'bg-accent/10 text-accent' },
                  ].map(({ type, label, color }) => (
                    <button key={type} type="button" onClick={() => addField(type)}
                      className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${color} hover:opacity-80`}
                      title={`Add ${type} field`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={submitting || formData.schema.length === 0}
                className="w-full mt-6 bg-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed font-body"
              >
                {submitting ? 'Saving...' : editingId ? 'Update Template' : 'Save Intake Template'}
              </button>
            </form>
          </motion.div>

          {/* PREVIEW PANEL */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-4">
            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">Saved Templates</h2>
            <div className="grid gap-4">
              {templates.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl text-center text-gray-400 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <p className="font-body mb-4">No templates saved yet.</p>
                  <p className="text-xs text-gray-500">Use presets above to quickly create templates for different project types.</p>
                </div>
              ) : (
                templates.map(t => (
                  <div key={t.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm group hover:border-accent/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-white group-hover:text-accent transition-colors">{t.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editTemplate(t)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-2 py-1 rounded-lg transition-colors"
                          title="Edit template"
                        >
                          <Icon.Edit className="w-3.5 h-3.5 inline-block" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-2 py-1 rounded-lg transition-colors"
                          title="Delete template"
                        >
                          <Icon.Trash className="w-3.5 h-3.5 inline-block" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 font-body">{t.description}</p>
                    <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 font-body">
                        {t.schema?.length || 0} fields
                      </span>
                      <a href={`/form/${t.id}`} target="_blank" rel="noreferrer"
                        className="text-accent text-sm font-bold hover:underline flex items-center gap-1 font-body">
                        Preview Form <Icon.External className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminIntakeTemplates;