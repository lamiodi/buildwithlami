import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { ActionIcon } from '../../data/adminIcons.jsx';

export default function AdminExpenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [formData, setFormData] = useState({
        expenseDate: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        division: 'SOFTWARE',
        paymentMethod: 'BANK_TRANSFER',
        receiptUrl: ''
    });

    const fetchExpenses = async () => {
        setLoading(true);
        const res = await api.get('/expenses');
        if (res.ok && res.data) {
            setExpenses(res.data);
        } else {
            notify.error('Failed to load expenses: ' + (res.error || 'Unknown error'));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenModal = (expense = null) => {
        if (expense) {
            setEditingExpense(expense);
            setFormData({
                expenseDate: expense.expense_date ? expense.expense_date.split('T')[0] : '',
                category: expense.category || '',
                description: expense.description || '',
                amount: expense.amount || '',
                division: expense.division || 'SOFTWARE',
                paymentMethod: expense.payment_method || 'BANK_TRANSFER',
                receiptUrl: expense.receipt_url || ''
            });
        } else {
            setEditingExpense(null);
            setFormData({
                expenseDate: new Date().toISOString().split('T')[0],
                category: '',
                description: '',
                amount: '',
                division: 'SOFTWARE',
                paymentMethod: 'BANK_TRANSFER',
                receiptUrl: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            amount: parseFloat(formData.amount)
        };
        
        const res = editingExpense
            ? await api.put(`/expenses/${editingExpense.id}`, payload)
            : await api.post('/expenses', payload);
        
        if (res.ok) {
            notify.success(editingExpense ? 'Expense updated.' : 'Expense added.');
            setIsModalOpen(false);
            fetchExpenses();
        } else {
            notify.error(res.error || 'Failed to save expense.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        const res = await api.delete(`/expenses/${id}`);
        if (res.ok) {
            notify.success('Expense deleted.');
            fetchExpenses();
        } else {
            notify.error(res.error || 'Failed to delete expense.');
        }
    };

    const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
    const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="flex flex-col max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                            Expenses
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Track company expenses across software, survey, and drone divisions.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-1.5 bg-accent hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
                    >
                        <ActionIcon.Plus className="w-4 h-4" /> Add Expense
                    </button>
                </div>
            </motion.div>

            {loading ? (
                <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-100 dark:border-gray-700 text-center text-gray-400 font-body">
                    Loading expenses…
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 uppercase tracking-wider font-body">
                                    <th className="py-4 px-6">Date</th>
                                    <th className="py-4 px-6">Category</th>
                                    <th className="py-4 px-6">Description</th>
                                    <th className="py-4 px-6 text-right">Amount (NGN)</th>
                                    <th className="py-4 px-6 text-center">Division</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 px-6 text-center text-sm text-gray-400 font-body">
                                            No expenses recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    expenses.map(ex => (
                                        <tr key={ex.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="py-4 px-6 text-sm text-gray-700 dark:text-gray-300 font-mono">
                                                {ex.expense_date ? new Date(ex.expense_date).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">
                                                {ex.category}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                                                {ex.description}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold font-mono text-right text-gray-900 dark:text-white">
                                                ₦{Number(ex.amount || 0).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${
                                                    ex.division === 'SURVEY' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                    ex.division === 'DRONE' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' :
                                                    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                                }`}>
                                                    {ex.division}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right space-x-3">
                                                <button onClick={() => handleOpenModal(ex)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                                                <button onClick={() => handleDelete(ex.id)} className="text-xs font-bold text-red-500 hover:text-red-600">Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 max-w-lg w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold font-heading text-gray-900 dark:text-white">
                                {editingExpense ? 'Edit Expense' : 'Add Expense'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                                <ActionIcon.X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Date</label>
                                    <input type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange} required className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Amount (NGN)</label>
                                    <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required placeholder="0.00" className={inputClass} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} required className={inputClass}>
                                        <option value="">Select category…</option>
                                        <option value="Fuel">Fuel</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Equipment Maintenance">Equipment Maintenance</option>
                                        <option value="Office Supplies">Office Supplies</option>
                                        <option value="Internet">Internet</option>
                                        <option value="Transport">Transport</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Miscellaneous">Miscellaneous</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Division</label>
                                    <select name="division" value={formData.division} onChange={handleChange} required className={inputClass}>
                                        <option value="SOFTWARE">Software</option>
                                        <option value="SURVEY">Survey</option>
                                        <option value="DRONE">Drone</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Payment Method</label>
                                <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required className={inputClass}>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CARD">Card</option>
                                    <option value="CASH">Cash</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <input type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="Brief detail..." className={inputClass} />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-sm font-bold text-white shadow-md">{editingExpense ? 'Update' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
