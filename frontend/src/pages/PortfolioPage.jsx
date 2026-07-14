// ─── src/pages/PortfolioPage.jsx ─────────────────────────
// public /portfolio page.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';

const PortfolioPage = () => {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        // Pull from the public projects table too; fall back to the
        // hardcoded list if the table is empty.
        api.get('/projects')
            .then(res => { if (res.ok && Array.isArray(res.data) && res.data.length > 0) setProjects(res.data); else setProjects(fallbackProjects); })
            .catch(() => setProjects(fallbackProjects));
    }, []);

    return (
        <section className="pt-24 pb-20 max-w-6xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">Portfolio</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 font-body">
                Software products, GIS deliverables, and drone missions we have shipped.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((p) => (
                    <motion.div key={p.id || p.slug || p.title} whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-accent transition-colors">
                        {p.image_url && (
                            <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover" />
                        )}
                        <div className="p-5">
                            <h2 className="text-lg font-extrabold mb-1 font-heading">{p.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-body line-clamp-2">{p.summary}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {(p.tech_stack || []).slice(0, 3).map(t => (
                                    <span key={t} className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                                ))}
                            </div>
                            {p.slug && (
                                <Link to={`/projects/${p.slug}`} className="block mt-4 text-xs font-bold text-accent hover:underline">
                                    View case study →
                                </Link>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default PortfolioPage;
