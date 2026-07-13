// ─── src/pages/PortfolioPage.jsx ─────────────────────────
// public /portfolio page.
//
// A single combined showcase for software, survey and drone
// work. Pulls from the unified `projects` table (all
// divisions). Admin manages entries from /admin/portfolio.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const DIVISION_LABEL = {
    SOFTWARE: 'Software',
    SURVEY: 'Survey',
    DRONE: 'Drone',
};

const PortfolioPage = () => {
    const [projects, setProjects] = useState([]);
    const [activeDivision, setActiveDivision] = useState('ALL');

    useEffect(() => {
        // Public listing — admin-only writes are scoped in
        // the controller, not the route. Filter on the client
        // to avoid an extra round-trip when toggling tabs.
        api.get('/projects')
            .then(res => { if (res.ok && Array.isArray(res.data)) setProjects(res.data); })
            .catch(() => setProjects([]));
    }, []);

    const visible = activeDivision === 'ALL'
        ? projects
        : projects.filter(p => p.division === activeDivision);

    return (
        <section className="pt-24 pb-20 max-w-6xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">Portfolio</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 font-body">
                Software products, GIS deliverables, and drone missions we have shipped.
            </p>

            {/* ── Division filter ── */}
            <div className="flex flex-wrap gap-2 mb-8">
                {['ALL', 'SOFTWARE', 'SURVEY', 'DRONE'].map((d) => (
                    <button
                        key={d}
                        onClick={() => setActiveDivision(d)}
                        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full border transition-all duration-300 ${
                            activeDivision === d
                                ? 'bg-accent text-white border-accent'
                                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-accent hover:text-accent'
                        }`}
                    >
                        {d === 'ALL' ? 'All' : DIVISION_LABEL[d]}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No published projects in this view yet — add some from /admin/portfolio.</p>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {visible.map((p) => {
                        // Per-division detail path so each card
                        // lands on the matching themed page.
                        const detailPath = p.division === 'SURVEY'
                            ? `/survey/projects/${p.id}`
                            : p.division === 'DRONE'
                                ? `/drone/projects/${p.id}`
                                : `/projects/${p.id}`;

                        return (
                            <motion.div key={p.id || p.slug || p.title} whileHover={{ y: -4 }} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-accent transition-colors">
                                {p.image_url && (
                                    <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover" />
                                )}
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-lg font-extrabold font-heading">{p.title}</h2>
                                        {p.division && (
                                            <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10 text-accent">
                                                {DIVISION_LABEL[p.division]}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-body line-clamp-2">{p.summary}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(p.tags || p.tech_stack || []).slice(0, 3).map(t => (
                                            <span key={t} className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                    <Link to={detailPath} className="block mt-4 text-xs font-bold text-accent hover:underline">
                                        View case study →
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default PortfolioPage;
