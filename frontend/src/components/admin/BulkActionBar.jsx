import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    Check: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>,
    X: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    Download: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    Chevron: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9" /></svg>,
};

// Default action set per resource. The host page can override
// the `actions` prop for custom actions (e.g. projects have
// "reassign" but invoices don't).
const DEFAULT_ACTIONS = {
    invoices: [
        { id: 'markPaid',  label: 'Mark as paid',     tone: 'emerald' },
        { id: 'refund',    label: 'Refund',           tone: 'rose' },
        { id: 'exportCsv', label: 'Export selected',  tone: 'slate',  clientOnly: true },
    ],
    clients: [
        { id: 'archive',   label: 'Archive',          tone: 'amber' },
        { id: 'reassign',  label: 'Reassign…',        tone: 'blue' },
        { id: 'exportCsv', label: 'Export selected',  tone: 'slate',  clientOnly: true },
    ],
    projects: [
        { id: 'archive',   label: 'Archive',          tone: 'amber' },
        { id: 'reassign',  label: 'Reassign owner…',  tone: 'blue' },
        { id: 'exportCsv', label: 'Export selected',  tone: 'slate',  clientOnly: true },
    ],
};

const TONES = {
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    rose:    'bg-rose-600 hover:bg-rose-700 text-white',
    amber:   'bg-amber-600 hover:bg-amber-700 text-white',
    blue:    'bg-blue-600 hover:bg-blue-700 text-white',
    slate:   'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-accent text-gray-800 dark:text-white',
};

/**
 * BulkActionBar — a sticky bottom bar that appears when the
 * user has selected one or more rows in a list view. Renders
 * a count + the actions configured for the resource.
 *
 * Usage in a list page:
 *   <BulkActionBar
 *      resource="invoices"
 *      selectedIds={selected}
 *      onClear={() => setSelected([])}
 *      onSuccess={() => reload()}
 *   />
 */
const BulkActionBar = ({ resource = 'invoices', selectedIds = [], onClear, onSuccess }) => {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [reassignTo, setReassignTo] = useState('');
    const [clients, setClients] = useState([]);
    const dropdownRef = useRef(null);

    const actions = DEFAULT_ACTIONS[resource] || DEFAULT_ACTIONS.invoices;
    const visible = Array.isArray(selectedIds) && selectedIds.length > 0;

    useEffect(() => {
        if (!open || resource !== 'clients') return;
        const onClick = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open, resource]);

    // Load client list for "Reassign" picker
    useEffect(() => {
        if (resource === 'clients' && clients.length === 0) {
            api.get('/clients?limit=200').then((res) => {
                if (res.ok) setClients(res.data || []);
            });
        }
    }, [resource, clients.length]);

    const runAction = async (actionId) => {
        if (actionId === 'exportCsv') {
            // Client-side CSV export — no round-trip needed.
            exportSelected();
            return;
        }
        if (actionId === 'reassign') {
            setOpen((o) => !o);
            return;
        }
        setBusy(true);
        const res = await api.post(`/admin/bulk/${resource}`, {
            ids: selectedIds,
            action: actionId,
        });
        setBusy(false);
        if (res.ok) {
            notify.success(`Bulk ${actionId} complete — ${res.data?.affected || selectedIds.length} item(s).`);
            onSuccess?.();
            onClear?.();
        } else {
            notify.error(res.error || 'Bulk action failed.');
        }
    };

    const exportSelected = () => {
        // The host page is expected to provide its own exportSelected
        // by listening to the `onExport` event. Fallback: alert.
        notify.info(`Export ${selectedIds.length} row(s) — wire the host page's exporter.`);
    };

    const runReassign = async () => {
        if (!reassignTo) {
            notify.error('Pick a client to reassign to.');
            return;
        }
        setBusy(true);
        const res = await api.post(`/admin/${resource}`, {
            ids: selectedIds,
            action: 'reassign',
            assignTo: reassignTo,
        });
        setBusy(false);
        setOpen(false);
        if (res.ok) {
            notify.success(`Reassigned ${res.data?.affected || selectedIds.length} item(s).`);
            onSuccess?.();
            onClear?.();
        } else {
            notify.error(res.error || 'Reassign failed.');
        }
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4"
                >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-accent text-white text-xs font-extrabold flex items-center justify-center">
                                {selectedIds.length}
                            </span>
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                                {selectedIds.length} selected
                            </span>
                        </div>

                        <div className="flex-1" />

                        <div className="flex flex-wrap gap-2" ref={dropdownRef}>
                            {actions.map((a) => (
                                <div key={a.id} className="relative">
                                    <button
                                        onClick={() => runAction(a.id)}
                                        disabled={busy}
                                        className={`cursor-pointer text-xs font-extrabold px-3 py-2 rounded-xl disabled:opacity-50 ${TONES[a.tone] || TONES.slate}`}
                                    >
                                        {a.label}
                                    </button>
                                    {a.id === 'reassign' && open && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute bottom-full mb-2 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 z-50"
                                        >
                                            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
                                                Reassign to client
                                            </label>
                                            <select
                                                value={reassignTo}
                                                onChange={(e) => setReassignTo(e.target.value)}
                                                className="w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
                                            >
                                                <option value="">Select…</option>
                                                {clients.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={runReassign}
                                                    disabled={busy}
                                                    className="cursor-pointer flex-1 text-xs font-extrabold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                                                >
                                                    Reassign
                                                </button>
                                                <button
                                                    onClick={() => setOpen(false)}
                                                    className="cursor-pointer text-xs font-extrabold px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClear}
                            className="cursor-pointer text-xs font-extrabold text-gray-500 hover:text-rose-600 transition-colors px-2"
                        >
                            Clear
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BulkActionBar;
