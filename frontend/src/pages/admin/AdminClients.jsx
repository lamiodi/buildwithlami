import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { HighlightedText } from '../../utils/csv.jsx';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '', primary_contact_email: '', billing_email: '', phone: '', paystack_customer_code: '', notes: '', division: 'SOFTWARE'
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');

  const fetchClients = async () => {
    const params = {};
    if (divisionFilter !== 'all') {
      params.division = divisionFilter;
    }
    const res = await api.get('/clients', { params });
    if (res.ok && res.data) setClients(res.data);
    else if (!res.ok) setError(res.error || 'Failed to fetch clients.');
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [divisionFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const editClient = (client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name || '',
      primary_contact_email: client.primary_contact_email || '',
      billing_email: client.billing_email || '',
      phone: client.phone || '',
      paystack_customer_code: client.paystack_customer_code || '',
      notes: client.notes || '',
      division: client.division || 'SOFTWARE'
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    
    if (!formData.primary_contact_email.trim()) {
      alert('Primary contact email is required');
      return;
    }
    
    let res;
    if (editingId) {
      res = await api.put(`/clients/${editingId}`, formData);
    } else {
      res = await api.post('/clients', formData);
    }

    if (res.ok && res.data && res.data.id) {
      notify.success(editingId ? 'Client updated!' : 'Client created successfully!');
      fetchClients();
      setEditingId(null);
      setFormData({
        name: '', primary_contact_email: '', billing_email: '', phone: '', paystack_customer_code: '', notes: '', division: 'SOFTWARE'
      });
    } else {
      notify.error(res.error || 'Error saving client. Check logs.');
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client? This will delete all their associated projects.')) return;
    const res = await api.delete(`/clients/${id}`);
    if (res.ok) {
      notify.success('Client deleted');
      fetchClients();
    } else {
      notify.error(res.error || 'Error deleting client.');
    }
  };

  return (
    <div className="flex flex-col">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent font-heading">
            Client Directory
          </h1>
          <div className="flex gap-2 items-center w-full md:w-auto">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body font-bold"
            >
              <option value="all">All Divisions</option>
              <option value="SOFTWARE">Software</option>
              <option value="SURVEY">Survey</option>
              <option value="DRONE">Drone</option>
            </select>
            <div className="relative flex-1 md:w-72 md:flex-none">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 1114 0z" /></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-6 font-heading text-gray-900 dark:text-white">
              {editingId ? 'Update Client Details' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Company / Client Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Lami Studios"
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Primary Contact Email</label>
                <input
                  type="email"
                  name="primary_contact_email"
                  required
                  value={formData.primary_contact_email}
                  onChange={handleChange}
                  placeholder="name@client.com"
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Billing Email (Optional)</label>
                <input
                  type="email"
                  name="billing_email"
                  value={formData.billing_email}
                  onChange={handleChange}
                  placeholder="billing@client.com"
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Paystack Code (Optional)</label>
                <input
                  type="text"
                  name="paystack_customer_code"
                  value={formData.paystack_customer_code}
                  onChange={handleChange}
                  placeholder="CUS_xxxxxxxxxx"
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Internal Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Internal details, background info..."
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Division</label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                >
                  <option value="SOFTWARE">Software</option>
                  <option value="SURVEY">Survey</option>
                  <option value="DRONE">Drone</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body"
                >
                  {editingId ? 'Update Client' : 'Add Client'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', primary_contact_email: '', billing_email: '', phone: '', paystack_customer_code: '', notes: '', division: 'SOFTWARE' });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl transition-all text-sm font-bold font-body"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Directory Table */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-gray-400 font-body">
                Loading client directory...
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-red-500 font-body">
                {error}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                        <th className="py-4 px-6">Client Name & Email</th>
                        <th className="py-4 px-6 text-center">Division</th>
                        <th className="py-4 px-6 text-center">Projects</th>
                        <th className="py-4 px-6 text-right">Total Billed</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {clients.filter(c => 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.primary_contact_email.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-gray-500 font-body">No clients found matching your search.</td>
                        </tr>
                      ) : clients.filter(c => 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.primary_contact_email.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-gray-900 dark:text-white font-heading">
                              <HighlightedText text={client.name} search={searchQuery} />
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
                              <HighlightedText text={client.primary_contact_email} search={searchQuery} />
                            </p>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {client.division && (
                              <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                client.division === 'SURVEY' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                client.division === 'DRONE' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' :
                                'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                              }`}>
                                {client.division}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-body">
                              {client.projects_count || 0}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="font-bold text-gray-900 dark:text-white font-body">₦{Number(client.total_billed || 0).toLocaleString()}</span>
                          </td>
                          <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                            {client.phone && (() => {
                              // Sanitize the phone number before building the wa.me link.
                              // Strip everything except digits and the leading + so the
                              // URL can never be poisoned with whitespace or non-dial
                              // characters. Then verify the result is a plausible
                              // international number (7-15 digits) — if not, hide the
                              // WhatsApp link entirely rather than handing the user
                              // a broken wa.me URL.
                              const digits = String(client.phone).replace(/[^\d]/g, '');
                              const isValid = digits.length >= 7 && digits.length <= 15;
                              if (!isValid) return null;
                              return (
                                <a
                                  href={`https://wa.me/${digits}?text=${encodeURIComponent(`Hi ${client.name}, this is Lami Odi from BuildWithLami — following up on your project.`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={`Chat with ${client.name} on WhatsApp`}
                                  aria-label={`Chat with ${client.name} on WhatsApp`}
                                  className="inline-flex items-center gap-1 text-xs bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body"
                                >
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/>
                                  </svg>
                                  WhatsApp
                                </a>
                              );
                            })()}
                            <button
                              onClick={() => editClient(client)}
                              className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold px-3 py-1.5 rounded-lg transition-colors font-body"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteClient(client.id)}
                              className="text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 font-bold px-3 py-1.5 rounded-lg transition-colors font-body"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClients;