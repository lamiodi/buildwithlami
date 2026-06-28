import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import AdminSubNav from '../../components/AdminSubNav';

const AdminClients = () => {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    name: '', primary_contact_email: '', billing_email: '', paystack_customer_code: '', notes: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <AdminSubNav />
        <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          CRM Client Directory
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl h-fit">
            <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
              {editingId ? 'Update Client Details' : 'Add New Client'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company / Client Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Lami Studios"
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Contact Email</label>
                <input
                  type="email"
                  name="primary_contact_email"
                  required
                  value={formData.primary_contact_email}
                  onChange={handleChange}
                  placeholder="name@client.com"
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billing Email (Optional)</label>
                <input
                  type="email"
                  name="billing_email"
                  value={formData.billing_email}
                  onChange={handleChange}
                  placeholder="billing@client.com"
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Paystack Customer Code (Optional)</label>
                <input
                  type="text"
                  name="paystack_customer_code"
                  value={formData.paystack_customer_code}
                  onChange={handleChange}
                  placeholder="CUS_xxxxxxxxxx"
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Internal Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Internal details, billing cycle notes, background info..."
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 text-sm"
                >
                  {editingId ? 'Update Client' : 'Add Client'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', primary_contact_email: '', billing_email: '', stripe_customer_id: '', notes: '' });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-xl transition-all text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Directory List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center text-gray-400">
                Loading client directory...
              </div>
            ) : error ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 text-center text-red-500">
                {error}
              </div>
            ) : clients.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl border border-gray-100 dark:border-gray-700 text-center text-gray-400">
                No clients created yet. Fill out the form to add your first client.
              </div>
            ) : (
              clients.map(client => (
                <div key={client.id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg hover:border-blue-500 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">{client.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {client.primary_contact_email}
                      </span>
                      {client.billing_email && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {client.billing_email} (Billing)
                        </span>
                      )}
                    </div>
                    {client.paystack_customer_code && (
                      <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 dark:bg-gray-900 px-2.5 py-1 rounded-md w-fit">
                        Paystack Code: {client.paystack_customer_code}
                      </p>
                    )}
                    {client.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700/50 mt-4 leading-relaxed italic">
                        "{client.notes}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => editClient(client)}
                      className="flex-1 md:flex-none bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteClient(client.id)}
                      className="flex-1 md:flex-none bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold px-4 py-2.5 rounded-xl transition-all text-sm"
                    >
                      Delete
                    </button>
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

export default AdminClients;
