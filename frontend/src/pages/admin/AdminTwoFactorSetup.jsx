import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import { useAuth } from '../../contexts/AuthContext';

/**
 * /admin/security/2fa — Email-OTP Two-Factor Setup & Management.
 *
 * Simpler and more convenient than authenticator apps:
 * - When enabled, every sign-in dispatches a 6-digit one-time code to the user's email.
 * - Setup: sends an initial verification code to the registered email to prove access.
 * - Confirm: entering the code activates 2FA.
 * - Disable: requires current account password.
 */
const AdminTwoFactorSetup = () => {
    const { refresh, user } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState('status'); // 'status' | 'verify'
    const [verifyCode, setVerifyCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);

    // Disable 2FA modal state
    const [disableModalOpen, setDisableModalOpen] = useState(false);
    const [disablePassword, setDisablePassword] = useState('');
    const [disableError, setDisableError] = useState('');
    const [disabling, setDisabling] = useState(false);

    const loadStatus = useCallback(async () => {
        const res = await api.get('/auth/2fa/status');
        if (res.ok) {
            setStatus(res.data);
        } else {
            notify.error(res.error || 'Failed to load 2FA status.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    // ── Send/resend setup code ───────────────────────────────
    const handleStartSetup = async () => {
        setSendingCode(true);
        const res = await api.post('/auth/2fa/setup');
        setSendingCode(false);
        if (res.ok) {
            notify.success(res.data?.message || 'Verification code sent to your email.');
            setStep('verify');
        } else {
            notify.error(res.error || 'Failed to send setup verification code.');
        }
    };

    // ── Confirm setup code and enable 2FA ───────────────────
    const handleConfirm = async (e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(verifyCode)) {
            notify.error('Code must be exactly 6 digits.');
            return;
        }
        setVerifying(true);
        const res = await api.post('/auth/2fa/confirm', { code: verifyCode });
        setVerifying(false);
        if (res.ok) {
            notify.success('Two-factor authentication is now active!');
            setStep('status');
            setVerifyCode('');
            await loadStatus();
            refresh();
        } else {
            notify.error(res.error || 'Invalid or expired code. Please try again.');
            setVerifyCode('');
        }
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Loading security settings…</div>
            </div>
        );
    }

    if (!status) {
        return (
            <div className="text-center py-20 text-red-500 text-sm">Failed to load 2FA status.</div>
        );
    }

    const email = user?.email || 'your registered email';

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Two-Factor Authentication</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-body">
                    Secure your admin account using email-based one-time verification codes (OTP).
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
                            <span className={`w-3.5 h-3.5 rounded-full ${status.enabled ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {status.enabled ? 'Enabled (Email OTP)' : 'Not Enabled'}
                            </h2>
                        </div>

                        {status.enabled ? (
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 font-body">
                                    <p>
                                        Status: <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                                    </p>
                                    <p>
                                        Delivery address: <span className="font-mono font-bold text-gray-900 dark:text-white">{email}</span>
                                    </p>
                                    <p>
                                        Activated on: <span className="font-semibold text-gray-900 dark:text-white">{status.confirmedAt ? new Date(status.confirmedAt).toLocaleString() : '—'}</span>
                                    </p>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-body">
                                    Whenever you log in with your password, a fresh 6-digit code will be emailed to your inbox.
                                </p>
                                <div className="pt-2">
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
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-body leading-relaxed">
                                    Two-factor authentication adds an essential second layer of protection to your portal.
                                    When enabled, a temporary 6-digit security code will be sent to <span className="font-semibold text-gray-900 dark:text-white font-mono">{email}</span> every time you sign in.
                                </p>
                                <div className="pt-2">
                                    <button
                                        onClick={handleStartSetup}
                                        disabled={sendingCode}
                                        className="cursor-pointer text-sm font-bold px-5 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 disabled:opacity-50 transition-all font-body"
                                    >
                                        {sendingCode ? 'Sending verification code…' : 'Enable Email 2FA'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── VERIFICATION STEP ─────────────────────────────── */}
                {step === 'verify' && (
                    <motion.div
                        key="verify"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Verify Your Email Address</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-body">
                            We've sent a 6-digit confirmation code to <span className="font-semibold font-mono text-gray-800 dark:text-gray-200">{email}</span>.
                            Enter the code below to complete setup.
                        </p>

                        <form onSubmit={handleConfirm} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 font-body">
                                    6-digit verification code
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="123456"
                                    className="w-full p-4 text-center text-2xl font-mono tracking-[0.5em] border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={verifying || verifyCode.length !== 6}
                                    className="cursor-pointer flex-1 text-sm font-bold px-5 py-3 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 disabled:opacity-50 transition-all font-body"
                                >
                                    {verifying ? 'Verifying…' : 'Confirm & Activate 2FA'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleStartSetup}
                                    disabled={sendingCode}
                                    className="cursor-pointer text-sm font-bold px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors font-body"
                                >
                                    {sendingCode ? 'Sending…' : 'Resend Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setStep('status'); setVerifyCode(''); }}
                                    className="cursor-pointer text-sm font-bold px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300 transition-colors font-body"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── DISABLE 2FA MODAL ─────────────────────────────── */}
            <AnimatePresence>
                {disableModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Disable Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-body">
                                To confirm this action, please enter your current account password.
                            </p>

                            <form onSubmit={handleDisable} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 font-body">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        autoFocus
                                        value={disablePassword}
                                        onChange={(e) => setDisablePassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                                    />
                                </div>

                                {disableError && (
                                    <div className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-800 font-body">
                                        {disableError}
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setDisableModalOpen(false); setDisablePassword(''); setDisableError(''); }}
                                        className="cursor-pointer text-sm font-bold px-4 py-2 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 transition-colors font-body"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={disabling || !disablePassword}
                                        className="cursor-pointer text-sm font-bold px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:shadow-rose-600/30 disabled:opacity-50 transition-all font-body"
                                    >
                                        {disabling ? 'Disabling…' : 'Disable 2FA'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTwoFactorSetup;
