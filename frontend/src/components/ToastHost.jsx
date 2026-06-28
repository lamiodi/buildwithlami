import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { subscribeToasts, notify } from '../services/notify.js';

const COLORS = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-slate-800 text-white',
    warn:    'bg-amber-500 text-white',
};

const ToastHost = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        return subscribeToasts((evt) => {
            if (evt.type === 'dismiss') {
                setToasts((prev) => prev.filter((t) => t.id !== evt.id));
            } else {
                setToasts((prev) => [...prev, evt]);
                if (evt.durationMs && evt.durationMs > 0) {
                    setTimeout(() => notify.dismiss(evt.id), evt.durationMs);
                }
            }
        });
    }, []);

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm ${COLORS[t.type] || COLORS.info}`}
                        role="status"
                        onClick={() => notify.dismiss(t.id)}
                    >
                        {t.message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ToastHost;
