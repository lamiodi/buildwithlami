// ─── src/pages/PricingPage.jsx ───────────────────────────
// Phase 4 — public /pricing page.
//
// Reads from CMS (`pages` table, slug='pricing'). Falls back to
// a hardcoded 3-tier card layout so the site is never broken
// before the admin publishes a CMS row.
// ──────────────────────────────────────────────────────────

import React from 'react';
import { motion } from 'framer-motion';
import CMSPage from '../components/CMSPage';

const FALLBACK_TIERS = [
    {
        name: 'Starter',
        price: '₦350k',
        cadence: 'one-time',
        description: 'For solo founders who need a clean landing page and a working contact form.',
        features: ['1-page responsive site', 'Contact form + email', 'Cloudinary image hosting', '1 round of revisions'],
        highlight: false,
    },
    {
        name: 'Growth',
        price: '₦1.2M',
        cadence: 'one-time',
        description: 'For SMEs that need CRM, a dashboard, and integrations with Paystack / Stripe.',
        features: ['Multi-page site (up to 6)', 'CRM with leads + clients', 'Paystack / Stripe payments', 'Admin dashboard', '3 rounds of revisions'],
        highlight: true,
    },
    {
        name: 'Custom',
        price: 'Let’s talk',
        cadence: 'engagement',
        description: 'For full SaaS products, drone pipelines, and ongoing engineering partnerships.',
        features: ['Bespoke architecture', 'Unlimited pages & roles', 'Drone / GIS pipelines', 'Maintenance retainer', 'Dedicated PM'],
        highlight: false,
    },
];

const Fallback = () => (
    <section className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4 text-center">Pricing</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 text-center font-body max-w-2xl mx-auto">
            Transparent, milestone-based pricing. Every project ships with source code, deployment, and a 30-day post-launch warranty.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
            {FALLBACK_TIERS.map((t, i) => (
                <motion.div
                    key={t.name}
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
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 font-body">{t.description}</p>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200 font-body">
                        {t.features.map(f => (
                            <li key={f} className="flex items-start gap-2">
                                <span className="text-accent mt-0.5">✓</span> {f}
                            </li>
                        ))}
                    </ul>
                </motion.div>
            ))}
        </div>
        <p className="text-xs text-gray-400 mt-12 italic text-center">
            Showing default content — sign in as admin and publish a <code>pricing</code> page in the CMS to replace this.
        </p>
    </section>
);

const PricingPage = () => <CMSPage slug="pricing" title="Pricing — BuildWithLami" fallback={<Fallback />} />;

export default PricingPage;
