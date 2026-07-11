import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    User: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Link: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7-7l-1.41 1.41" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7 7l1.41-1.41" />
        </svg>
    ),
    Save: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 7 9 7" /><polyline points="7 10 12 15 17 10" />
        </svg>
    ),
};

const PasswordSection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changing, setChanging] = useState(false);
    const [pwError, setPwError] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwError('');
        if (newPassword !== confirmPassword) {
            setPwError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setPwError('Password must be at least 6 characters.');
            return;
        }
        setChanging(true);
        const res = await api.put('/auth/password', {
            currentPassword,
            newPassword,
        });
        if (res.ok) {
            notify.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPwError(res.error || 'Failed to change password.');
        }
        setChanging(false);
    };

    return (
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
            </div>
            <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
            </div>
            <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
            </div>
            {pwError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 font-body">
                    {pwError}
                </div>
            )}
            <button
                type="submit"
                disabled={changing}
                className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 font-body inline-flex items-center gap-2"
            >
                {changing ? 'Changing…' : 'Change Password'}
            </button>
        </form>
    );
};

const AdminSettings = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        headline: '',
        bio: '',
        resume_url: '',
        avatar_url: '',
        social_links: { github: '', linkedin: '', twitter: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = async () => {
        const res = await api.get('/profile');
        if (res.ok && res.data) {
            setProfile({ ...res.data, social_links: res.data.social_links || { github: '', linkedin: '', twitter: '' } });
        }
        setLoading(false);
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            social_links: { ...prev.social_links, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await api.put('/profile', profile);
        if (res.ok) {
            notify.success('Profile updated successfully!');
        } else {
            notify.error(res.error || 'Failed to update profile.');
        }
        setSaving(false);
    };

    const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
    const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Loading settings…</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="max-w-4xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent font-heading">
                            Admin Settings
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Manage your public profile and social links.</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type="text" name="full_name" value={profile.full_name || ''} onChange={handleChange} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Professional Headline</label>
                                <input type="text" name="headline" value={profile.headline || ''} onChange={handleChange} placeholder="e.g. Full-Stack Developer" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Bio (Markdown supported)</label>
                            <textarea name="bio" rows="4" value={profile.bio || ''} onChange={handleChange} placeholder="Tell visitors about yourself..." className={inputClass} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Avatar URL</label>
                                <input type="url" name="avatar_url" value={profile.avatar_url || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Resume / CV URL</label>
                                <input type="url" name="resume_url" value={profile.resume_url || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-4">Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>GitHub</label>
                                    <input type="url" name="github" value={profile.social_links?.github || ''} onChange={handleSocialChange} placeholder="https://github.com/..." className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>LinkedIn</label>
                                    <input type="url" name="linkedin" value={profile.social_links?.linkedin || ''} onChange={handleSocialChange} placeholder="https://linkedin.com/in/..." className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Twitter / X</label>
                                    <input type="url" name="twitter" value={profile.social_links?.twitter || ''} onChange={handleSocialChange} placeholder="https://twitter.com/..." className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-4">Change Password</h3>
                            <PasswordSection />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-1">Database Backup</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-body">
                                Quick liveness check + per-table row counts. Full backup procedure lives in <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 rounded">docs/BACKUP.md</code>.
                            </p>
                            <BackupStatusWidget />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-1">FX Rates (Multi-Currency)</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-body">
                                Static exchange rates used to convert invoice amounts to NGN for reporting. Update these when rates move. 1 NGN = X foreign.
                            </p>
                            <FxRatesSection onSaved={fetchProfile} />
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-1">Bank Accounts (Grey · International Payments)</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-body">
                                USD and GBP settlement accounts shown on the public payment page after the client picks a currency. Never publish these on the public website. Edit and deactivate rows here.
                            </p>
                            <BankAccountsSection />
                        </div>

                        <button type="submit" disabled={saving}
                            className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 font-body inline-flex items-center gap-2"
                        >
                            <Icon.Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

// ── FxRatesSection — edit static FX rates used by invoices ──
// Phase 11 — Now supports both manual edit (PUT) and live
// refresh from open.er-api.com (POST /refresh). The live
// refresh overwrites existing rates with `source='LIVE'` and
// sets `fetched_at`. A daily cron at 5am UTC does this for
// you in the background, but the button is here for an
// on-demand pull.
const FxRatesSection = () => {
    const [rates, setRates] = useState({});
    const [baseCurrency, setBaseCurrency] = useState('NGN');
    const [supported, setSupported] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    const load = async () => {
        setLoading(true);
        const res = await api.get('/fx-rates');
        if (res.ok && res.data) {
            setBaseCurrency(res.data.base_currency);
            setSupported(res.data.supported);
            setRates(res.data.rates || {});
            const all = Object.values(res.data.rates || {});
            const fetchedList = all.map(r => r.fetched_at).filter(Boolean).sort();
            const updatedList = all.map(r => r.updated_at).filter(Boolean).sort();
            setLastFetched(fetchedList.length ? fetchedList[fetchedList.length - 1] : null);
            setLastUpdated(updatedList.length ? updatedList[updatedList.length - 1] : null);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleChange = (code, value) => {
        setRates(prev => ({
            ...prev,
            [code]: { ...(prev[code] || {}), rate: value },
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        const payload = {};
        for (const [code, info] of Object.entries(rates)) {
            if (code === baseCurrency) continue;
            const num = parseFloat(info.rate);
            if (!isNaN(num) && num > 0) payload[code] = num;
        }
        const res = await api.put('/fx-rates', { rates: payload });
        if (res.ok) {
            notify.success('FX rates updated (manual)');
            await load();
        } else {
            notify.error(res.error || 'Failed to update FX rates');
        }
        setSaving(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        const res = await api.post('/fx-rates/refresh', {});
        if (res.ok) {
            const r = res.data?.refresh;
            notify.success(
                `Live rates updated from open.er-api.com (${r?.applied_count} currencies)`
            );
            await load();
        } else {
            notify.error(res.error || 'Live refresh failed — your rates are unchanged');
        }
        setRefreshing(false);
    };

    const formatRelative = (iso) => {
        if (!iso) return '—';
        const diffMs = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diffMs / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    const sourceBadge = (info) => {
        if (!info) return null;
        if (info.source === 'LIVE') {
            return <span className="text-[9px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full uppercase tracking-widest" title={`Live from API · ${formatRelative(info.fetched_at)}`}>● LIVE</span>;
        }
        if (info.source === 'SEED') {
            return <span className="text-[9px] font-extrabold text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-full uppercase tracking-widest">SEED</span>;
        }
        return <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-widest" title={`Manual edit · ${formatRelative(info.updated_at)}`}>MANUAL</span>;
    };

    if (loading) {
        return <div className="text-xs text-gray-400">Loading FX rates…</div>;
    }

    const liveCount = Object.values(rates).filter(r => r.source === 'LIVE').length;
    const manualCount = Object.values(rates).filter(r => r.source === 'MANUAL' || !r.source).length;

    return (
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <p className="text-[10px] text-gray-500 font-body">
                    {lastFetched
                        ? <>Last live fetch: <strong>{formatRelative(lastFetched)}</strong> · {liveCount} LIVE · {manualCount} MANUAL</>
                        : <>No live fetch yet · {manualCount} MANUAL</>}
                </p>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="text-[10px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                    title="Fetch latest rates from open.er-api.com"
                >
                    <svg className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {refreshing ? 'Fetching…' : 'Refresh from open.er-api.com'}
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supported.map(code => {
                    const info = rates[code] || {};
                    const isBase = code === baseCurrency;
                    return (
                        <div key={code} className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex flex-col items-start min-w-[3rem]">
                                <label className="text-xs font-extrabold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                                    {code}
                                </label>
                                {sourceBadge(info)}
                            </div>
                            <input
                                type="number"
                                step="0.00000001"
                                min="0"
                                value={isBase ? '1' : (info.rate ?? '')}
                                onChange={e => handleChange(code, e.target.value)}
                                disabled={isBase}
                                className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent font-mono disabled:opacity-60"
                                placeholder="rate"
                            />
                            <span className="text-[10px] text-gray-400 font-mono w-20 text-right">
                                1 {baseCurrency} = {isBase ? '1' : (info.rate || '?')} {code}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center justify-between pt-2">
                <p className="text-[10px] text-gray-400 font-body">
                    {lastUpdated ? `Last update: ${new Date(lastUpdated).toLocaleString()}` : 'Never updated'}
                </p>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-accent hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                    <Icon.Save className="w-3.5 h-3.5" />
                    {saving ? 'Saving…' : 'Save Manual Rates'}
                </button>
            </div>
        </div>
    );
};

// ── BankAccountsSection — edit Grey / Paystack settlement accounts ──
// Saves via POST /api/payments/bank-accounts (Owner / Administrator / Finance).
// Only the user's actual Grey accounts live here. NEVER publish these.
const BankAccountsSection = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        const res = await api.get('/payments/bank-accounts');
        if (res.ok) setAccounts(res.data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (data) => {
        setSaving(true);
        const res = await api.post('/payments/bank-accounts', data);
        if (res.ok) {
            notify.success('Bank account saved');
            setEditing(null);
            await load();
        } else {
            notify.error(res.error || 'Failed to save');
        }
        setSaving(false);
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm('Deactivate this bank account? Clients will no longer see it on the payment page.')) return;
        const res = await api.delete(`/payments/bank-accounts/${id}`);
        if (res.ok) {
            notify.success('Deactivated');
            await load();
        } else {
            notify.error(res.error || 'Failed');
        }
    };

    if (loading) return <div className="text-xs text-gray-400">Loading bank accounts…</div>;

    return (
        <div className="space-y-3">
            {accounts.length === 0 && (
                <p className="text-xs text-gray-500 italic">No bank accounts configured. Add USD and GBP settlement accounts for international clients.</p>
            )}

            {accounts.map(acc => (
                <div key={acc.id} className={`p-4 rounded-xl border ${acc.is_active ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/40 opacity-60'}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-extrabold text-sm">{acc.currency}</span>
                                <span className="text-[10px] uppercase tracking-widest text-gray-500">{acc.provider}</span>
                                {!acc.is_active && <span className="text-[10px] font-bold text-red-500">INACTIVE</span>}
                            </div>
                            <p className="text-sm font-bold">{acc.bank_name} · {acc.account_name}</p>
                            <p className="text-xs text-gray-500 font-mono">
                                {acc.account_number}
                                {acc.sort_code && ` · ${acc.sort_code}`}
                                {acc.iban && ` · ${acc.iban}`}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => setEditing(acc)} className="text-xs font-bold text-accent hover:underline">Edit</button>
                            {acc.is_active && (
                                <button onClick={() => handleDeactivate(acc.id)} className="text-xs font-bold text-red-500 hover:underline">Deactivate</button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={() => setEditing({ currency: 'USD', provider: 'GREY', account_name: '', bank_name: '', account_number: '', reference_hint: 'Use your invoice number as the payment reference.', is_active: true })}
                className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-accent rounded-xl p-3 text-xs font-bold text-gray-500 hover:text-accent transition-colors"
            >
                + Add Bank Account
            </button>

            {editing && (
                <BankAccountForm
                    initial={editing}
                    saving={saving}
                    onCancel={() => setEditing(null)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

const BankAccountForm = ({ initial, saving, onCancel, onSave }) => {
    const [form, setForm] = useState({
        currency: initial.currency,
        provider: initial.provider,
        account_name: initial.account_name || '',
        bank_name: initial.bank_name || '',
        account_number: initial.account_number || '',
        routing_code: initial.routing_code || '',
        sort_code: initial.sort_code || '',
        swift_code: initial.swift_code || '',
        iban: initial.iban || '',
        reference_hint: initial.reference_hint || '',
        is_active: initial.is_active ?? true,
    });

    const inputClass = "w-full p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-accent focus:border-accent font-mono";

    return (
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className={inputClass}>
                    <option value="NGN">NGN</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                </select>
                <select value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} className={inputClass}>
                    <option value="GREY">GREY</option>
                    <option value="PAYSTACK">PAYSTACK</option>
                    <option value="LOCAL">LOCAL</option>
                </select>
            </div>
            <input type="text" placeholder="Account Name" value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Bank Name" value={form.bank_name} onChange={e => setForm({ ...form, bank_name: e.target.value })} className={inputClass} />
            <input type="text" placeholder="Account Number" value={form.account_number} onChange={e => setForm({ ...form, account_number: e.target.value })} className={inputClass} />
            <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Routing (US)" value={form.routing_code} onChange={e => setForm({ ...form, routing_code: e.target.value })} className={inputClass} />
                <input type="text" placeholder="Sort Code (UK)" value={form.sort_code} onChange={e => setForm({ ...form, sort_code: e.target.value })} className={inputClass} />
                <input type="text" placeholder="SWIFT/BIC" value={form.swift_code} onChange={e => setForm({ ...form, swift_code: e.target.value })} className={inputClass} />
                <input type="text" placeholder="IBAN" value={form.iban} onChange={e => setForm({ ...form, iban: e.target.value })} className={inputClass} />
            </div>
            <input type="text" placeholder="Reference hint (shown to clients)" value={form.reference_hint} onChange={e => setForm({ ...form, reference_hint: e.target.value })} className={inputClass} />
            <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                    Active
                </label>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900">Cancel</button>
                    <button onClick={() => onSave(form)} disabled={saving} className="bg-accent hover:bg-[#d43d1a] text-white px-4 py-1.5 text-xs font-bold rounded-lg disabled:opacity-50">
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── BackupStatusWidget ────────────────────────────────────
// Reusable: shows a per-table row count + total + last-checked
// timestamp. "Refresh" hits /api/admin/backup-status.
const BackupStatusWidget = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        const res = await api.get('/admin/backup-status');
        if (res.ok && res.data) {
            setData(res.data);
        } else {
            setError(res.error || 'Could not reach the database.');
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {data ? `${data.totalRows.toLocaleString()} rows · last checked ${new Date(data.timestamp).toLocaleString()}` : error || 'Press Refresh to check'}
                </p>
                <button
                    onClick={load}
                    disabled={loading}
                    className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-accent text-gray-800 dark:text-white disabled:opacity-50"
                >
                    {loading ? 'Checking…' : 'Refresh'}
                </button>
            </div>
            {data && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {Object.entries(data.counts).map(([table, n]) => (
                        <div key={table} className="flex items-center justify-between gap-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5">
                            <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400 truncate">{table}</span>
                            <span className="font-extrabold tabular-nums text-gray-900 dark:text-white">{Number(n).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
        </div>
    );
};

export default AdminSettings;