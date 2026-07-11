import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { useAuth } from '../../contexts/AuthContext';

/**
 * /admin/security/2fa — TOTP two-factor setup & management page.
 *
 * Steps (when 2FA is currently DISABLED):
 *   1. "Set up 2FA" button → call /api/auth/2fa/setup
 *   2. Show QR + secret + a 6-digit code input
 *   3. User scans the QR, enters a code from their authenticator
 *   4. /api/auth/2fa/confirm with the code → server returns
 *      `recoveryCodes` (one-time display)
 *   5. User clicks "I've saved them" → page returns to status
 *
 * Steps (when 2FA is currently ENABLED):
 *   - Show confirmedAt + remaining recovery-code count
 *   - Buttons: Regenerate recovery codes, Disable 2FA (asks for password)
 */
const AdminTwoFactorSetup = () => {
    const { refresh } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('status'); // 'status' | 'qr' | 'recovery'
    const [setup, setSetup] = useState(null); // { secret, otpauth, qrDataUrl }
    const [verifyCode, setVerifyCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState(null);
    const [recoverySaved, setRecoverySaved] = useState(false);

    // Disable 2FA modal state
    const [disableModalOpen, setDisableModalOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableError, setDisableError] = useState('');
    const [disabling, setDisabling] = useState(false);

    // Regenerate recovery codes modal state
    const [regenModalOpen, setRegenModalOpen] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const loadStatus = useCallback(async () => {
        const res = await api.get('/auth/2fa/status');
        if (res.ok) {
            setStatus(res.data);
        } else {
            notify.error(res.error || 'Failed to load 2FA status.');
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadStatus(); }, [loadStatus]);

    // ── Step: begin setup ───────────────────────────────────
    const handleStartSetup = async () => {
        const res = await api.post('/auth/2fa/setup');
        if (res.ok && res.data) {
            setSetup(res.data);
            setStep('qr');
        } else {
            notify.error(res.error || 'Failed to start 2FA setup.');
        }
    };

    // ── Step: confirm the secret with a real TOTP code ──────
    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(verifyCode)) {
            notify.error('Code must be 6 digits.');
            return;
        }
        setVerifying(true);
        const res = await api.post('/auth/2fa/confirm', { code: verifyCode });
        setVerifying(false);
        if (res.ok && res.data?.recoveryCodes) {
            setRecoveryCodes(res.data.recoveryCodes);
            setStep('recovery');
            setRecoverySaved(false);
        } else {
            notify.error(res.error || 'Invalid code. Please try again.');
            setVerifyCode('');
        }
    };

    // ── Step: user has saved their recovery codes ───────────
    const handleDoneWithRecovery = async () => {
        if (!recoverySaved) {
            notify.error('Please confirm you have saved your recovery codes before continuing.');
            return;
        }
        setStep('status');
        setSetup(null);
        setVerifyCode('');
        setRecoveryCodes(null);
        setRecoverySaved(false);
        await loadStatus();
        refresh();
    };

    // ── Disable 2FA ─────────────────────────────────────────
    const handleDisable = async (e) => {
        e.preventDefault();
        setDisableError('');
        setDisabling(true);
        const res = await api.post('/auth/2fa/disable', { password: disablePassword });
        setDisabling(false);
        if (res.ok) {
            notify.success('2FA has been disabled.');
            setDisableModalOpen(false);
            setDisablePassword('');
            await loadStatus();
            refresh();
        } else {
            setDisableError(res.error || 'Failed to disable 2FA.');
        }
    };

    // ── Regenerate recovery codes ───────────────────────────
    const handleRegenerate = async () => {
        setRegenerating(true);
        const res = await api.post('/auth/2fa/recovery-codes/regenerate');
        setRegenerating(false);
        if (res.ok && res.data?.recoveryCodes) {
            setRecoveryCodes(res.data.recoveryCodes);
            setRegenModalOpen(false);
            setRecoverySaved(false);
            setStep('recovery');
        } else {
            notify.error(res.error || 'Failed to regenerate recovery codes.');
        }
    };

    // ── Copy the secret or otpauth URI to clipboard ─────────
    const copy = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            notify.success(`${label} copied to clipboard.`);
        } catch {
            notify.error('Copy failed — please select and copy manually.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Loading…</div>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="text-center py-20 text-red-500 text-sm">Failed to load 2FA status.</div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Two-Factor Authentication</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Add a second factor to your admin login using an authenticator app (Google Authenticator, Authy, 1Password, etc.).
                </p>
            </div>

            <AnimatePresence mode="wait">
                {/* ── STATUS VIEW ───────────────────────────────────── */}
                {step === 'status' && (
                    <motion.div
                        key="status"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`w-3 h-3 rounded-full ${status.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {status.enabled ? 'Enabled' : 'Not enabled'}
                            </h2>
                        </div>

                        {status.enabled ? (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                    <p>Confirmed on: <span className="font-bold text-gray-900 dark:text-white">{status.confirmedAt ? new Date(status.confirmedAt).toLocaleString() : '—'}</span></p>
                                    <p>Recovery codes remaining: <span className="font-bold text-gray-900 dark:text-white">{status.recoveryCodesRemaining}</span></p>
                                </div>
                                <div className="flex flex-wrap gap-2 pt-2">
                                    <button
                                        onClick={() => setRegenModalOpen(true)}
                                        className="cursor-pointer text-sm font-bold px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-500 text-gray-800 dark:text-white transition-colors"
                                    >
                                        Regenerate recovery codes
                                    </button>
                                    <button
                                        onClick={() => setDisableModalOpen(true)}
                                        className="cursor-pointer text-sm font-bold px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-rose-200 dark:border-rose-700 hover:border-rose-500 text-rose-600 dark:text-rose-400 transition-colors"
                                    >
                                        Disable 2FA
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Two-factor authentication is not yet enabled for your account. Enable it to add an extra layer of security to your admin login.
                                </p>
                                <button
                                    onClick={handleStartSetup}
                                    className="cursor-pointer text-sm font-bold px-5 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 transition-all"
                                >
                                    Set up 2FA
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── QR / SCAN VIEW ─────────────────────────────────── */}
                {step === 'qr' && setup && (
                    <motion.div
                        key="qr"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Step 1 of 2 — Scan QR code</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                            Open your authenticator app and scan the QR code below. Then enter the 6-digit code it shows you.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start mb-6">
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <img src={setup.qrDataUrl} alt="2FA QR code" className="w-48 h-48" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Or enter this key manually</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 font-mono text-xs bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg break-all">{setup.secret}</code>
                                    <button
                                        onClick={() => copy(setup.secret, 'Secret key')}
                                        className="cursor-pointer text-[10px] font-bold px-2 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-500 text-gray-700 dark:text-white transition-colors"
                                    >
                                        Copy
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                    Account: <span className="font-mono">buildwithlami</span>
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleConfirm} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                                    6-digit code
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    required
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className="w-full p-3 text-center text-xl font-mono tracking-[0.5em] border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={verifying || verifyCode.length !== 6}
                                    className="cursor-pointer flex-1 text-sm font-bold px-5 py-3 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 disabled:opacity-50 transition-all"
                                >
                                    {verifying ? 'Verifying…' : 'Verify & Enable'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStep('status'); setSetup(null); setVerifyCode(''); }}
                                    className="cursor-pointer text-sm font-bold px-5 py-3 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-gray-400 text-gray-800 dark:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* ── RECOVERY CODES VIEW (one-time) ───────────────── */}
                {step === 'recovery' && recoveryCodes && (
                    <motion.div
                        key="recovery"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-amber-200 dark:border-amber-700 shadow-sm"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Save your recovery codes</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    These one-time codes let you sign in if you lose your authenticator device. Each code works once. We will not show them again.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 my-5">
                            {recoveryCodes.map((c) => (
                                <code key={c} className="font-mono text-sm bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded-lg text-center select-all">
                                    {c}
                                </code>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <button
                                onClick={() => copy(recoveryCodes.join('\n'), 'Recovery codes')}
                                className="cursor-pointer text-xs font-bold px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-500 text-gray-700 dark:text-white transition-colors"
                            >
                                Copy all
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="cursor-pointer text-xs font-bold px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:border-blue-500 text-gray-700 dark:text-white transition-colors"
                            >
                                Print
                            </button>
                        </div>

                        <label className="flex items-start gap-2 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={recoverySaved}
                                onChange={(e) => setRecoverySaved(e.target.checked)}
                                className="mt-0.5 w-4 h-4 accent-accent"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                I have saved these recovery codes in a safe place.
                            </span>
                        </label>

                        <button
                            onClick={handleDoneWithRecovery}
                            disabled={!recoverySaved}
                            className="cursor-pointer w-full text-sm font-bold px-5 py-3 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 disabled:opacity-50 transition-all"
                        >
                            Continue
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── DISABLE 2FA MODAL ─────────────────────────────────── */}
            {disableModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Disable 2FA?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Enter your password to confirm. This will remove 2FA from your account.
                        </p>
                        <form onSubmit={handleDisable} className="space-y-4">
                            <input
                                type="password"
                                required
                                autoFocus
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                placeholder="Your password"
                                className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                            />
                            {disableError && (
                                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800">
                                    {disableError}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={disabling}
                                    className="cursor-pointer flex-1 text-sm font-bold px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50"
                                >
                                    {disabling ? 'Disabling…' : 'Disable 2FA'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setDisableModalOpen(false); setDisablePassword(''); setDisableError(''); }}
                                    className="cursor-pointer text-sm font-bold px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ── REGENERATE RECOVERY CODES MODAL ───────────────────── */}
            {regenModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Regenerate recovery codes?</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            This will invalidate all existing recovery codes. The new set will be shown to you once.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleRegenerate}
                                disabled={regenerating}
                                className="cursor-pointer flex-1 text-sm font-bold px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                            >
                                {regenerating ? 'Regenerating…' : 'Regenerate'}
                            </button>
                            <button
                                onClick={() => setRegenModalOpen(false)}
                                className="cursor-pointer text-sm font-bold px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminTwoFactorSetup;
