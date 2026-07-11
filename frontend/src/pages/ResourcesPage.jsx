// ─── src/pages/ResourcesPage.jsx ─────────────────────────
// Phase 4 — public /resources page.
//
// Reads from CMS (`pages` table, slug='resources'). Falls back
// to a hardcoded knowledge-base list so the site works even
// before the admin publishes a CMS row.
// ──────────────────────────────────────────────────────────

import React from 'react';
import CMSPage from '../components/CMSPage';

const FALLBACK_RESOURCES = [
    {
        title: 'How to choose between a custom web app and SaaS',
        excerpt: 'A 5-minute framework for deciding when to build vs buy.',
        category: 'Strategy',
        date: '2026-05-10',
    },
    {
        title: 'Why your drone data should land in PostGIS, not a folder',
        excerpt: 'GIS-native storage pays off the second you need to query by location.',
        category: 'Drone',
        date: '2026-04-22',
    },
    {
        title: '5 onboarding mistakes that kill SaaS retention',
        excerpt: 'A checklist of what to fix before your first 1,000 users.',
        category: 'Software',
        date: '2026-04-02',
    },
    {
        title: 'Survey plan vs. deed of assignment: what you actually need',
        excerpt: 'Documents you need for a land survey in Nigeria, demystified.',
        category: 'Survey',
        date: '2026-03-15',
    },
];

const Fallback = () => (
    <section className="pt-24 pb-20 max-w-5xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">Resources</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 font-body">
            Field notes, how-tos, and industry research from the BuildWithLami team.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
            {FALLBACK_RESOURCES.map((r) => (
                <article key={r.title} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:border-accent transition-colors">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">{r.category}</span>
                    <h2 className="text-xl font-extrabold mt-2 mb-2 font-heading">{r.title}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-body">{r.excerpt}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                </article>
            ))}
        </div>
        <p className="text-xs text-gray-400 mt-12 italic">
            Showing default content — sign in as admin and publish a <code>resources</code> page in the CMS to replace this.
        </p>
    </section>
);

const ResourcesPage = () => <CMSPage slug="resources" title="Resources — BuildWithLami" fallback={<Fallback />} />;

export default ResourcesPage;
