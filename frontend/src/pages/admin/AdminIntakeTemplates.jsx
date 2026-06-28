import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import AdminSubNav from '../../components/AdminSubNav';

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

const AdminIntakeTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '', schema: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplates = async () => {
    const res = await api.get('/templates');
    if (res.ok && res.data) setTemplates(res.data);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const loadPreset = (preset) => {
    setFormData({
      name: preset.name,
      description: preset.description,
      // Deep copy to prevent mutating the presets
      schema: JSON.parse(JSON.stringify(preset.schema))
    });
  };

  const addField = (type) => {
    const newField = { 
      id: Date.now().toString(), 
      type, 
      label: '', 
      required: false 
    };
    
    // Add default options for choice-based fields
    if (type === 'select' || type === 'checkbox') {
      newField.options = ['Option 1', 'Option 2'];
    }

    setFormData(prev => ({
      ...prev,
      schema: [...prev.schema, newField]
    }));
  };

  const updateField = (id, key, value) => {
    setFormData(prev => ({
      ...prev,
      schema: prev.schema.map(f => f.id === id ? { ...f, [key]: value } : f)
    }));
  };

  const removeField = (id) => {
    setFormData(prev => ({
      ...prev,
      schema: prev.schema.filter(f => f.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.schema.length === 0) {
      notify.error('Add at least one field');
      return;
    }

    setSubmitting(true);
    const res = await api.post('/templates', formData);
    if (res.ok) {
      notify.success('Template created successfully!');
      fetchTemplates();
      setFormData({ name: '', description: '', schema: [] });
    } else {
      notify.error(res.error || 'Failed to create template');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24 min-h-screen">
      <AdminSubNav />
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin: Intake Templates</h1>
          <p className="text-gray-500 mt-2">Build dynamic forms for client onboarding.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* BUILDER PANEL */}
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Create New Template</h2>
            
            <div className="flex flex-wrap gap-2 justify-end">
              <button 
                onClick={() => loadPreset(ECOMMERCE_PRESET)}
                className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-200 font-semibold transition-colors"
              >
                E-Commerce
              </button>
              <button 
                onClick={() => loadPreset(ERP_PRESET)}
                className="text-xs bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 px-3 py-1.5 rounded-lg hover:bg-cyan-200 font-semibold transition-colors"
              >
                ERP
              </button>
              <button 
                onClick={() => loadPreset(PORTFOLIO_PRESET)}
                className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 px-3 py-1.5 rounded-lg hover:bg-pink-200 font-semibold transition-colors"
              >
                Portfolio
              </button>
              <button 
                onClick={() => loadPreset(SAAS_PRESET)}
                className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-indigo-200 font-semibold transition-colors"
              >
                SaaS
              </button>
              <button 
                onClick={() => loadPreset(LOCAL_BUSINESS_PRESET)}
                className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 px-3 py-1.5 rounded-lg hover:bg-emerald-200 font-semibold transition-colors"
              >
                Local Biz
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Template Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                placeholder="e.g. Standard Website Intake"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="Instructions for the client..."
                rows={2}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-900" 
              />
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Form Fields ({formData.schema.length})</h3>
              
              <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.schema.map((field, idx) => (
                  <div key={field.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {idx + 1}. {field.type} Field
                      </span>
                      <button type="button" onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Question / Label (e.g. What is your company name?)" 
                        value={field.label} 
                        onChange={e => updateField(field.id, 'label', e.target.value)}
                        required
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
                      />
                      
                      {(field.type === 'select' || field.type === 'checkbox') && (
                        <div>
                          <label className="text-xs text-gray-500 font-semibold mb-1 block">Options (Comma separated)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Option 1, Option 2, Option 3" 
                            value={(field.options || []).join(', ')} 
                            onChange={e => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
                          />
                        </div>
                      )}

                      <label className="flex items-center text-sm gap-2 font-medium text-gray-700 dark:text-gray-300">
                        <input 
                          type="checkbox" 
                          checked={field.required} 
                          onChange={e => updateField(field.id, 'required', e.target.checked)} 
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        Required Field
                      </label>
                    </div>
                  </div>
                ))}
                
                {formData.schema.length === 0 && (
                  <div className="text-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400">
                    No fields added yet. Click below to add your first field.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => addField('text')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">+ Short Text</button>
                <button type="button" onClick={() => addField('textarea')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">+ Long Text</button>
                <button type="button" onClick={() => addField('email')} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">+ Email</button>
                <button type="button" onClick={() => addField('select')} className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors">+ Dropdown</button>
                <button type="button" onClick={() => addField('checkbox')} className="px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors">+ Checkboxes</button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={submitting || formData.schema.length === 0}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? 'Saving Template...' : 'Save Intake Template'}
            </button>
          </form>
        </div>

        {/* PREVIEW PANEL */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Saved Templates</h2>
          
          <div className="grid gap-4">
            {templates.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center text-gray-500 border border-gray-100 dark:border-gray-700 shadow-sm">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                No templates saved yet.
              </div>
            ) : (
              templates.map(t => (
                <div key={t.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">{t.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{t.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-md">
                        {t.schema?.length || 0} fields
                      </span>
                    </div>
                    
                    <a 
                      href={`/form/${t.id}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline flex items-center gap-1"
                    >
                      Preview Form
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIntakeTemplates;