// ─── components/admin/aftercare/shared.js ─────────────────
// Admin OS Phase 5 — tiny shared bits for the Aftercare tabs
// (styles lifted from AdminTasks so the pages feel identical).
// ──────────────────────────────────────────────────────────
import { formatNaira } from '../../../utils/currency';

export const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
export const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

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

export const Badge = ({ children, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
    green: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    red: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  };
  return (
    <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
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
