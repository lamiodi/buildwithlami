import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

// ── AdminPaymentQueue — Review queue for client-submitted payment proofs ──
// Phase 10. Admins see pending proofs at the top, then history. Click
// a row to open the review drawer with the proof file + decision controls.
const AdminPaymentQueue = () => {
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [reviewing, setReviewing] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchProofs = async () => {
        setLoading(true);
        const qs = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
        const res = await api.get(`/payments/proofs${qs}`);
        if (res.ok) setProofs(res.data || []);
        setLoading(false);
    };

    useEffect(() => { fetchProofs(); }, [statusFilter]);

    const stats = useMemo(() => {
        const pending = proofs.filter(p => p.status === 'PENDING').length;
        const confirmed = proofs.filter(p => p.status === 'CONFIRMED').length;
        const rejected = proofs.filter(p => p.status === 'REJECTED').length;
        return { pending, confirmed, rejected, total: proofs.length };
    }, [proofs]);

    const handleReview = async (decision) => {
        if (!reviewing) return;
        setSubmitting(true);
        const res = await api.post(`/payments/proofs/${reviewing.id}/review`, {
            decision,
            admin_notes: adminNotes || undefined,
        });
        if (res.ok) {
            notify.success(decision === 'CONFIRM' ? 'Payment confirmed — invoice marked PAID' : 'Proof rejected');
            setReviewing(null);
            setAdminNotes('');
            await fetchProofs();
        } else {
            notify.error(res.error || 'Failed to review proof');
        }
        setSubmitting(false);
    };

    const StatusPill = ({ status }) => {
        const colors = {
            PENDING:   'bg-amber-100 text-amber-800 border-amber-200',
            CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED:  'bg-red-100 text-red-800 border-red-200',
        };
        return <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${colors[status]}`}>{status}</span>;
    };

    return (
        <React.Fragment>
            <div className="max-w-7xl mx-auto w-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold font-heading bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent">
                        Payment Proofs
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-body">
                        Review bank-transfer payments from international clients. Confirm to mark the invoice PAID.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatBox label="Pending" value={stats.pending} accent="amber" />
                    <StatBox label="Confirmed" value={stats.confirmed} accent="green" />
                    <StatBox label="Rejected" value={stats.rejected} accent="red" />
                    <StatBox label="Total Shown" value={stats.total} accent="gray" />
                </div>

                {/* Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 mb-4 flex items-center gap-2">
                    {['PENDING', 'CONFIRMED', 'REJECTED', 'all'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                                statusFilter === s
                                    ? 'bg-accent text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                            }`}
                        >
                            {s === 'all' ? 'All' : s}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400 text-sm">Loading proofs…</div>
                    ) : proofs.length === 0 ? (
                        <div className="p-12 text-center text-gray-400 text-sm">
                            {statusFilter === 'PENDING' ? '🎉 No proofs to review.' : 'No proofs match this filter.'}
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-400 uppercase font-extrabold text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Submitted</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Invoice</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Reference</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {proofs.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                                            {new Date(p.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-white">{p.client_name || '—'}</p>
                                            <p className="text-xs text-gray-500">{p.submitted_email || p.primary_contact_email || ''}</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {p.project_name || '—'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            {p.currency === 'NGN' ? '₦' : p.currency === 'USD' ? '$' : p.currency === 'GBP' ? '£' : ''}
                                            {Number(p.amount_paid).toLocaleString()}
                                            <span className="text-[10px] text-gray-500 ml-1">{p.currency}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                                            {p.transaction_reference}
                                            {p.proof_file_url && <span className="ml-2 text-accent" title="Has attached proof">📎</span>}
                                        </td>
                                        <td className="px-6 py-4"><StatusPill status={p.status} /></td>
                                        <td className="px-6 py-4 text-right">
                                            {p.status === 'PENDING' ? (
                                                <button
                                                    onClick={() => setReviewing(p)}
                                                    className="bg-accent hover:bg-[#d43d1a] text-white px-4 py-2 text-xs font-bold rounded-lg transition-colors"
                                                >
                                                    Review
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">
                                                    {p.admin_notes ? `Note: ${p.admin_notes.slice(0, 30)}${p.admin_notes.length > 30 ? '…' : ''}` : '—'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Review drawer */}
            {reviewing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Review Payment Proof</h3>
                                <p className="text-xs text-gray-500 font-mono mt-1">Invoice: {reviewing.invoice_id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <button onClick={() => { setReviewing(null); setAdminNotes(''); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        </div>

                        <div className="p-6 flex-1 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <DetailBlock label="Client" value={reviewing.client_name} />
                                <DetailBlock label="Email" value={reviewing.submitted_email || reviewing.primary_contact_email} />
                                <DetailBlock label="Amount" value={`${reviewing.currency} ${Number(reviewing.amount_paid).toLocaleString()}`} />
                                <DetailBlock label="Reference" value={reviewing.transaction_reference} mono />
                                <DetailBlock label="Project" value={reviewing.project_name} />
                                <DetailBlock label="Submitted" value={new Date(reviewing.created_at).toLocaleString()} />
                            </div>

                            {reviewing.proof_file_url && (
                                <div>
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Attached Proof</p>
                                    {reviewing.proof_file_url.startsWith('data:') ? (
                                        <a href={reviewing.proof_file_url} download={reviewing.proof_file_filename || 'proof'} className="inline-block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold">
                                            📎 Download {reviewing.proof_file_filename || 'proof'}
                                        </a>
                                    ) : (
                                        <a href={reviewing.proof_file_url} target="_blank" rel="noreferrer" className="inline-block bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-bold">
                                            📎 Open in new tab
                                        </a>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">Admin notes (optional)</label>
                                <textarea
                                    rows={3}
                                    value={adminNotes}
                                    onChange={e => setAdminNotes(e.target.value)}
                                    placeholder="e.g. 'Funds received in Grey USD account on 2026-07-11'"
                                    className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => { setReviewing(null); setAdminNotes(''); }}
                                className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReview('REJECT')}
                                disabled={submitting}
                                className="bg-red-100 hover:bg-red-200 text-red-800 px-6 py-2 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => handleReview('CONFIRM')}
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Confirming…' : '✓ Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

const StatBox = ({ label, value, accent }) => {
    const colors = {
        amber: 'bg-amber-50 text-amber-900 border-amber-200',
        green: 'bg-green-50 text-green-900 border-green-200',
        red: 'bg-red-50 text-red-900 border-red-200',
        gray: 'bg-gray-50 text-gray-900 border-gray-200',
    };
    return (
        <div className={`p-4 rounded-2xl border ${colors[accent]}`}>
            <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70">{label}</p>
            <p className="text-2xl font-extrabold mt-1">{value}</p>
        </div>
    );
};

const DetailBlock = ({ label, value, mono }) => (
    <div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
        <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : 'font-bold'}`}>{value || '—'}</p>
    </div>
);

export default AdminPaymentQueue;
