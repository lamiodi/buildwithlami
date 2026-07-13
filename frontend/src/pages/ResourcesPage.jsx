// ─── src/pages/ResourcesPage.jsx ─────────────────────────
// public /resources page — knowledge-base articles.
//
// Driven by the `resources` table (see v12 + v28 migrations).
// Admin manages entries from /admin/resources. The list
// rendering does a small client-side filter on the visible
// cards (category chips at the top).
// ──────────────────────────────────────────────────────────

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const formatDate = (iso) => {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
        return iso;
    }
};

const ResourcesPage = () => {
    const [resources, setResources] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const res = await api.get('/resources');
            if (res.ok && Array.isArray(res.data)) setResources(res.data);
            setLoading(false);
        };
        load();
    }, []);

    const categories = useMemo(() => {
        const set = new Set(resources.map(r => r.category).filter(Boolean));
        return ['All', ...Array.from(set)];
    }, [resources]);

    const visible = activeCategory === 'All'
        ? resources
        : resources.filter(r => r.category === activeCategory);

    return (
        <section className="pt-24 pb-20 max-w-5xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">Resources</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 font-body">
                Field notes, how-tos, and industry research from the BuildWithLami team.
            </p>

            {categories.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border transition-all duration-300 ${
                                activeCategory === cat
                                    ? 'bg-accent text-white border-accent'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-accent hover:text-accent'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {!loading && visible.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No published articles in this view yet — add some from /admin/resources.</p>
            ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                    {visible.map((r) => (
                        <motion.article
                            key={r.id}
                            whileHover={{ y: -4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:border-accent transition-colors"
                        >
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">{r.category || 'Resource'}</span>
                            <h2 className="text-xl font-extrabold mt-2 mb-2 font-heading">{r.title}</h2>
                            {r.excerpt && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-body">{r.excerpt}</p>
                            )}
                            <p className="text-xs text-gray-400">
                                {formatDate(r.published_at)}
                                {r.reading_time ? ` · ${r.reading_time}` : ''}
                            </p>
                        </motion.article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ResourcesPage;
