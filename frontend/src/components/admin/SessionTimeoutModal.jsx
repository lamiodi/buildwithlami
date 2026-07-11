import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../../services/notify';

/**
 * SessionTimeoutModal — surfaces a "session is about to expire"
 * warning at 5 minutes before the JWT's `exp` claim. Per
 * ROADMAP.md Phase 1 task #3:
 *
 *   - JWT `exp` is 30 minutes (default; override via JWT_EXPIRES_IN)
 *   - The modal appears at the 25-minute mark
 *   - "Extend session" calls /api/auth/refresh and resets the timer
 *   - "Log out" clears the token and bounces to /login
 *
 * It only mounts inside /admin, so non-admin routes never see
 * the modal.
 */

const WARNING_LEAD_MS = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_TICK_MS = 1000;

function formatTimeLeft(ms) {
    if (ms <= 0) return '0:00';
    const totalSec = Math.ceil(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
}

const SessionTimeoutModal = () => {
    const { tokenExpiresAt, extendSession, logout, user } = useAuth();
    const [now, setNow] = useState(Date.now());
    const [extending, setExtending] = useState(false);
    const lastTokenRef = useRef(tokenExpiresAt);

    // Tick once per second so the countdown stays live.
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), COUNTDOWN_TICK_MS);
        return () => clearInterval(id);
    }, []);

    // Compute time-to-expiry and the open/close state.
    const msUntilExpiry = tokenExpiresAt ? tokenExpiresAt - now : Infinity;
    const showWarning =
        !!user &&                       // only when actually logged in
        Number.isFinite(msUntilExpiry) && // token has a real exp claim
        msUntilExpiry <= WARNING_LEAD_MS &&
        msUntilExpiry > 0;              // hide once expired (logout handles that)

    const handleExtend = useCallback(async () => {
        setExtending(true);
        const res = await extendSession();
        setExtending(false);
        if (res.ok) {
            notify.success('Session extended.');
        } else {
            notify.error(res.error || 'Failed to extend session. Please log in again.');
        }
    }, [extendSession]);

    const handleLogout = useCallback(() => {
        logout();
    }, [logout]);

    return (
        <AnimatePresence>
            {showWarning && (
                <motion.div
                    key="session-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 240 }}
                        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-700 p-6"
                    >
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Session expiring soon</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    For your security, admin sessions end after 30 minutes. You will be signed out in:
                                </p>
                            </div>
                        </div>

                        <div className="text-center my-6">
                            <div className="text-5xl font-extrabold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                                {formatTimeLeft(msUntilExpiry)}
                            </div>
                            <p className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-2">
                                Until automatic sign-out
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleExtend}
                                disabled={extending}
                                className="cursor-pointer flex-1 text-sm font-bold px-4 py-2.5 rounded-xl bg-accent hover:bg-orange-600 text-white shadow-lg hover:shadow-accent/30 disabled:opacity-50 transition-all"
                            >
                                {extending ? 'Extending…' : 'Extend session'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="cursor-pointer text-sm font-bold px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white transition-colors"
                            >
                                Log out
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SessionTimeoutModal;
