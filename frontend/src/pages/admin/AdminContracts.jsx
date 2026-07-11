import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

const AdminContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    template_id: '',
    signatory_email: '',
    signatory_name: ''
  });
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchContracts();
    fetchClients();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contracts');
      if (res.ok) setContracts(res.data || []);
    } catch (error) {
      console.error('Failed to fetch contracts', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      if (res.ok) setClients(res.data || []);
    } catch (error) {
      console.error('Failed to fetch clients', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/contracts', formData);
      if (res.ok) {
        fetchContracts();
        setShowModal(false);
        setFormData({ client_id: '', project_id: '', template_id: '', signatory_email: '', signatory_name: '' });
      } else {
        alert('Failed to create contract');
      }
    } catch (error) {
      console.error(error);
      alert('Error creating contract');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SIGNED': return 'bg-green-100 text-green-800 border-green-200';
      case 'SENT': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'VOID': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = async (id) => {
    try {
      const res = await api.get(`/contracts/${id}/pdf`, { responseType: 'blob' });
      // In a real app we'd construct a blob and download it.
      // E.g., window.open(...)
      alert('PDF download triggered (mock)');
    } catch (err) {
      alert('Error downloading PDF');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Contracts</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-[#d43d1a] text-white px-4 py-2 text-sm font-bold transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Create Contract
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400 uppercase font-bold text-xs">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Signatory Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading contracts...</td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No contracts found.</td>
                </tr>
              ) : (
                contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {contract.client_name || 'Unknown Client'}
                    </td>
                    <td className="px-6 py-4">{contract.project_name || '-'}</td>
                    <td className="px-6 py-4">{contract.signatory_email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {contract.status === 'SIGNED' ? (
                        <button onClick={() => handleDownload(contract.id)} className="text-accent hover:underline font-bold text-xs uppercase tracking-wider">
                          Download PDF
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Awaiting Signature</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-sm shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Send New Contract</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Client</label>
                <select
                  required
                  value={formData.client_id}
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-accent"
                >
                  <option value="">Select a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Template ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 123456789"
                  value={formData.template_id}
                  onChange={(e) => setFormData({...formData, template_id: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Signatory Name</label>
                <input
                  required
                  type="text"
                  value={formData.signatory_name}
                  onChange={(e) => setFormData({...formData, signatory_name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Signatory Email</label>
                <input
                  required
                  type="email"
                  value={formData.signatory_email}
                  onChange={(e) => setFormData({...formData, signatory_email: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-sm px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-accent"
                />
              </div>
              
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-accent hover:bg-[#d43d1a] text-white px-6 py-2 text-sm font-bold transition-colors">
                  Send Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminContracts;
