// ─── src/pages/PricingPage.jsx ───────────────────────────
// public /pricing page — engineering engagement tiers.
//
// Driven by the `pricing` table (see v28 migration). Admin
// manages tiers from /admin/pricing. Tier order is whatever
// the API returns, which is display_order ASC then
// created_at ASC.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const PricingPage = () => {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await api.get('/pricing');
            if (res.ok && Array.isArray(res.data)) setTiers(res.data);
            setLoading(false);
        };
        load();
    }, []);

    return (
        <section className="pt-24 pb-20 max-w-6xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4 text-center">Pricing</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 text-center font-body max-w-2xl mx-auto">
                Transparent, milestone-based pricing. Every project ships with source code, deployment, and a 30-day post-launch warranty.
            </p>

            {!loading && tiers.length === 0 ? (
                <p className="text-sm text-gray-400 italic text-center">No published pricing tiers yet — add some from /admin/pricing.</p>
            ) : (
                <div className="grid md:grid-cols-3 gap-5">
                    {tiers.map((t, i) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`rounded-2xl p-6 border ${
                                t.highlight
                                    ? 'border-accent bg-accent/5 dark:bg-accent/10 shadow-xl shadow-accent/10'
                                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                            }`}
                        >
                            {t.highlight && (
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">Most popular</span>
                            )}
                            <h2 className="text-2xl font-extrabold font-heading mt-1">{t.name}</h2>
                            <p className="text-3xl font-extrabold mt-3 mb-1">{t.price}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{t.cadence}</p>
                            {t.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 font-body">{t.description}</p>
                            )}
                            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200 font-body">
                                {(t.features || []).map((f, idx) => (
                                    <li key={`${t.id}-${idx}`} className="flex items-start gap-2">
                                        <span className="text-accent mt-0.5">✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default PricingPage;
