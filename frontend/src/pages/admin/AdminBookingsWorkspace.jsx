import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, X, User, Send, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import Skeleton from '../../components/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared bookings workspace ─────────────────────────────
// One component behind both the Survey and Drone bookings pages.
// The two routes previously carried ~320 identical lines each and had
// already started drifting (different status-toast wording); they now
// differ only by the config object their route file passes in.
export default function AdminBookingsWorkspace({ config }) {
    const { accent, labels, endpoint, Icon } = config;
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get(endpoint);
            if (res.ok && res.data) {
                setBookings(Array.isArray(res.data) ? res.data : (res.data.data || []));
            } else {
                notify.error(res.error || labels.loadError);
            }
        } catch {
            notify.error(labels.networkError);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const res = await api.patch(`/bookings/${id}/status`, { status: newStatus });
            if (res.ok) {
                notify.success(labels.statusSuccess(newStatus));
                setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus } : b));
                if (selectedBooking && selectedBooking.id === id) {
                    setSelectedBooking({ ...selectedBooking, status: newStatus });
                }
            } else {
                notify.error(res.error || 'Failed to update status');
            }
        } catch {
            notify.error(labels.statusError);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
        const q = search.toLowerCase();
        const matchesSearch = !search ||
            (b.full_name || '').toLowerCase().includes(q) ||
            (b.email || '').toLowerCase().includes(q) ||
            (b.service || '').toLowerCase().includes(q) ||
            (b.location || '').toLowerCase().includes(q) ||
            (b.notes || '').toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-6">
                <Skeleton className="h-12 w-64 rounded-xl" />
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <span className={`p-2.5 rounded-xl ${accent.softBg} ${accent.softText}`}>
                            <Icon className="w-6 h-6" />
                        </span>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-gray-900 dark:text-white">
                                {labels.title}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {labels.subtitle}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 ${accent.chipBg} ${accent.chipText} text-xs font-extrabold uppercase tracking-widest rounded-lg`}>
                        {labels.divisionTag}
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder={labels.searchPlaceholder}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 ${accent.ring}`}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(st => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
                                statusFilter === st
                                    ? accent.activeButton
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {filteredBookings.length === 0 ? (
                    <div className="p-16 text-center text-gray-500 dark:text-gray-400">
                        <Icon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{labels.emptyTitle}</h3>
                        <p className="text-sm mt-1">{labels.emptyBody}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-extrabold">
                                    <th className="p-4">Client / Contact</th>
                                    <th className="p-4">{labels.serviceCol}</th>
                                    <th className="p-4">{labels.locationCol}</th>
                                    <th className="p-4">{labels.dateCol}</th>
                                    <th className="p-4 text-center">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-sm">
                                {filteredBookings.map(b => (
                                    <tr key={b.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{b.full_name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{b.email}</div>
                                            {b.phone && <div className={`text-xs ${accent.text} font-mono`}>{b.phone}</div>}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold text-gray-800 dark:text-gray-200">{b.service || labels.serviceDefault}</span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-600 dark:text-gray-400">
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className={`w-3.5 h-3.5 ${accent.softText} shrink-0`} />
                                                {b.location || labels.locationDefault}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-600 dark:text-gray-400">
                                            {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : 'Flexible'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider inline-block ${
                                                b.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' :
                                                b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' :
                                                b.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' :
                                                accent.pillPending
                                            }`}>
                                                {b.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => setSelectedBooking(b)}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── BOOKING DETAIL DRAWER / MODAL ── */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6"
                        >
                            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <span className={`p-2 rounded-xl ${accent.softBg} ${accent.softText}`}>
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{labels.modalTitle}</h3>
                                        <p className="text-xs text-gray-400 font-mono">ID: {selectedBooking.id}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl">
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Client Name</div>
                                        <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedBooking.full_name}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{labels.serviceLabel}</div>
                                        <div className={`font-bold ${accent.text} mt-0.5`}>{selectedBooking.service}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Email</div>
                                        <a href={`mailto:${selectedBooking.email}`} className="text-xs text-blue-500 hover:underline mt-0.5 block truncate">
                                            {selectedBooking.email}
                                        </a>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">Phone</div>
                                        <div className="font-mono text-xs text-gray-800 dark:text-gray-200 mt-0.5">
                                            {selectedBooking.phone || '—'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{labels.locationLabel}</div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl font-medium text-gray-800 dark:text-gray-200 text-xs">
                                        {selectedBooking.location || labels.locationFallback}
                                    </div>
                                </div>

                                {selectedBooking.notes && (
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{labels.notesLabel}</div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-gray-700 dark:text-gray-300 text-xs whitespace-pre-line">
                                            {selectedBooking.notes}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">{labels.statusLabel}</div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                                                className={`py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all ${
                                                    selectedBooking.status === st
                                                        ? accent.activeButton
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Link
                                    to={`/admin/crm?search=${encodeURIComponent(selectedBooking.email || '')}`}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-1.5"
                                >
                                    <User className="w-3.5 h-3.5" /> View in CRM Pipeline
                                </Link>
                                <a
                                    href={`mailto:${selectedBooking.email}?subject=${encodeURIComponent(labels.mailSubject)}`}
                                    className={`px-4 py-2.5 ${accent.solidButton} text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-md`}
                                >
                                    <Send className="w-3.5 h-3.5" /> Email Client
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
