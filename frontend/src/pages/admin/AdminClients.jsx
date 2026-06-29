import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '', primary_contact_email: '', billing_email: '', paystack_customer_code: '', notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = async () => {
    const res = await api.get('/clients');
    if (res.ok && res.data) setClients(res.data);
    else if (!res.ok) setError(res.error || 'Failed to fetch clients.');
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
      paystack_customer_code: client.paystack_customer_code || '',
      notes: client.notes || ''
    });
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        name: '', primary_contact_email: '', billing_email: '', paystack_customer_code: '', notes: ''
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
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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
                      setFormData({ name: '', primary_contact_email: '', billing_email: '', paystack_customer_code: '', notes: '' });
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
                          <td colSpan="4" className="py-12 text-center text-gray-500 font-body">No clients found matching your search.</td>
                        </tr>
                      ) : clients.filter(c => 
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        c.primary_contact_email.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map(client => (
                        <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                          <td className="py-4 px-6">
                            <p className="font-bold text-gray-900 dark:text-white font-heading">{client.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-body">{client.primary_contact_email}</p>
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
