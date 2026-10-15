// ─── components/admin/aftercare/shared.js ─────────────────
// Admin OS Phase 5 — tiny shared bits for the Aftercare tabs
// (styles lifted from AdminTasks so the pages feel identical).
// ──────────────────────────────────────────────────────────
import { formatNaira } from '../../../utils/currency';

export const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
export const labelClass = "block text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

export const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  : '—';

export const fmtDateTime = (d) => d
  ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—';

// Per-currency money (blueprint §42 — never combined across FX).
export const fmtMoney = (amount, currency) => {
  if (amount == null) return '—';
  return currency === 'NGN'
    ? formatNaira(amount)
    : `${currency} ${Number(amount).toLocaleString()}`;
};

// Days-remaining colouring shared by renewals + monitors.
export const daysTone = (days) => {
  if (days == null) return 'gray';
  if (days < 0) return 'red';
  if (days <= 7) return 'red';
  if (days <= 30) return 'amber';
  return 'green';
};

export const cardClass = "bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-gray-800/60 shadow-sm overflow-hidden";
export const thClass = "py-4 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-body";


export { default as Badge } from './Badge.jsx';
