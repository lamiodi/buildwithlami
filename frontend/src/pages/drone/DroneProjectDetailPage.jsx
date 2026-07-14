// ─── src/pages/drone/DroneProjectDetailPage.jsx ─────────
// Public detail page for a Drone-division portfolio project.
//
// Follows the dark, soft, two-pane treatment from /drone:
// light background, white rounded cards, soft shadow on
// hover, "Geomini" body + "Michroma" headings, generous
// rounded-2rem corners. The data is fetched from
//   GET /api/projects/division/DRONE   (list for related)
//   GET /api/projects/:id              (this single item)
//
// The route is /drone/projects/:id. The two divisions feel
// distinctly different at every touchpoint (Survey is
// brutalist black-on-cream; Drone is soft black-on-white
// with rounded cards), so we keep that separation here too.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { renderSafeMarkdownSync } from '../../utils/markdown';
import { dronePlaceholder } from '../../utils/placeholders';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Geomini:wght@200..800&family=Michroma&display=swap';

const useFontsEffect = () => {
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const created = [];
        const add = (node) => { document.head.appendChild(node); created.push(node); };

        const preconnect1 = document.createElement('link');
        preconnect1.rel = 'preconnect';
        preconnect1.href = 'https://fonts.googleapis.com';
        add(preconnect1);

        const preconnect2 = document.createElement('link');
        preconnect2.rel = 'preconnect';
        preconnect2.href = 'https://fonts.gstatic.com';
        preconnect2.crossOrigin = 'anonymous';
        add(preconnect2);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = FONT_HREF;
        add(link);

        const style = document.createElement('style');
        style.setAttribute('data-drone-detail-fonts', '');
        style.textContent = `
            .drone-heading { font-family: "Michroma", sans-serif; font-weight: 400; font-style: normal; letter-spacing: 0.02em; }
            .drone-body    { font-family: "Geomini",  sans-serif;  font-optical-sizing: auto; font-style: normal; }
        `;
        add(style);

        return () => {
            created.forEach((n) => n.parentNode && n.parentNode.removeChild(n));
        };
    }, []);
};

const formatDate = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
    } catch {
        return iso;
    }
};

const DroneProjectDetailPage = () => {
    useFontsEffect();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleElements, setVisibleElements] = useState(new Set());
    const sectionsRef = useRef({});

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            const res = await api.get(`/projects/${id}`);
            if (!res.ok) {
                setError(res.error || 'Project not found.');
                setLoading(false);
                return;
            }
            setProject(res.data);

            const list = await api.get('/projects/division/DRONE');
            if (list.ok) {
                setRelated(
                    (list.data || [])
                        .filter((p) => p.id !== id)
                        .slice(0, 3)
                );
            }
            setLoading(false);

            document.title = `${res.data?.title || 'Mission'} | Lami Drone`;
        };
        load();
    }, [id]);

    useEffect(() => {
        if (!project) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisibleElements((prev) => new Set([...prev, entry.target.dataset.id]));
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll('.observe').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [project]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center drone-body">
                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 drone-body">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— 404</p>
                <h1 className="drone-heading text-4xl md:text-6xl font-black text-gray-900 leading-[0.95] mb-6">Mission<br />Not Found</h1>
                <p className="text-sm text-gray-500 mb-10 max-w-md">{error || "We couldn't find that mission. It may have been archived."}</p>
                <Link to="/drone" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors">
                    ← Back to Drone
                </Link>
            </div>
        );
    }

    const heroImage = project.image_url || dronePlaceholder({ width: 1200, height: 675, label: project.title });

    return (
        <div className="bg-white text-gray-900 drone-body min-h-screen">

            {/* ── Slim top bar ── */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                    <Link to="/drone" className="flex items-center gap-2 text-sm font-semibold hover:text-gray-500 transition-colors">
                        ← Drone
                    </Link>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                        Drone / Mission
                    </div>
                </div>
            </div>

            {/* ── TWO-PANE HERO ── */}
            <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left pane — image (rounded card) */}
                    <div className="relative h-[60vh] md:h-[640px] rounded-[2rem] overflow-hidden bg-gray-100 group">
                        <img
                            src={heroImage}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {project.tags?.[0] && (
                            <div className="absolute top-6 left-6 bg-white text-gray-900 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                {project.tags[0]}
                            </div>
                        )}
                    </div>

                    {/* Right pane — title + summary + meta */}
                    <div className="flex flex-col justify-between p-2 md:pl-6">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-6">
                                — Mission Brief
                            </p>
                            <h1 className="drone-heading text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-[1] mb-6">
                                {project.title}
                            </h1>
                            {project.summary && (
                                <p className="text-gray-500 leading-relaxed text-base max-w-md mb-10">
                                    {project.summary}
                                </p>
                            )}
                        </div>

                        <dl className="space-y-3 mb-8">
                            {project.client_name && (
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Client</dt>
                                    <dd className="text-sm font-extrabold text-gray-900">{project.client_name}</dd>
                                </div>
                            )}
                            {project.location && (
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</dt>
                                    <dd className="text-sm font-extrabold text-gray-900">{project.location}</dd>
                                </div>
                            )}
                            {project.published_at && (
                                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Delivered</dt>
                                    <dd className="text-sm font-extrabold text-gray-900">{formatDate(project.published_at)}</dd>
                                </div>
                            )}
                            {project.tags?.length > 1 && (
                                <div className="pt-2">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Tags</dt>
                                    <dd className="flex flex-wrap gap-1.5">
                                        {project.tags.map((t) => (
                                            <span key={t} className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{t}</span>
                                        ))}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div className="flex flex-col gap-3">
                            {project.live_url && (
                                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-gray-900 text-white px-5 py-4 rounded-full text-sm font-bold hover:bg-gray-700 transition-colors">
                                    View Live <ArrowUpRight className="w-4 h-4" />
                                </a>
                            )}
                            <Link to="/drone#contact" className="flex items-center justify-between bg-white text-gray-900 px-5 py-4 rounded-full text-sm font-bold border border-gray-200 hover:border-gray-900 transition-colors">
                                Book Similar Mission <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── MISSION REPORT (write-up) ── */}
            {project.content && (
                <section
                    ref={(el) => (sectionsRef.current['writeup'] = el)}
                    className="px-6 md:px-12 py-16 max-w-4xl mx-auto"
                >
                    <div
                        className={`observe ${visibleElements.has('writeup-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                        data-id="writeup-header"
                    >
                        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4 text-center">— Mission Report</p>
                        <h2 className="drone-heading text-3xl md:text-4xl font-black text-gray-900 leading-[1] mb-12 text-center">
                            Field<br />Log
                        </h2>
                    </div>
                    <div
                        className={`observe ${visibleElements.has('writeup-body') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 bg-gray-50 rounded-[2rem] p-8 md:p-12`}
                        data-id="writeup-body"
                    >
                        <div
                            className="prose prose-lg max-w-none prose-headings:drone-heading prose-headings:uppercase prose-headings:tracking-tight prose-p:leading-loose prose-p:text-gray-700"
                            dangerouslySetInnerHTML={{ __html: renderSafeMarkdownSync(project.content) }}
                        />
                    </div>
                </section>
            )}

            {/* ── RELATED MISSIONS ── */}
            {related.length > 0 && (
                <section
                    ref={(el) => (sectionsRef.current['related'] = el)}
                    className="px-6 md:px-12 py-16 max-w-7xl mx-auto"
                >
                    <div
                        className={`observe ${visibleElements.has('related-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                        data-id="related-header"
                    >
                        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-4">— More Missions</p>
                        <h2 className="drone-heading text-3xl md:text-4xl font-black text-gray-900 leading-[1] mb-12">
                            Continue<br />Exploring
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {related.map((p, idx) => (
                            <Link
                                key={p.id}
                                to={`/drone/projects/${p.id}`}
                                className={`observe ${visibleElements.has(`rel-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-gray-200 transition-all duration-500`}
                                data-id={`rel-${idx}`}
                                style={{ transitionDelay: `${idx * 100}ms` }}
                            >
                                <div className="h-56 overflow-hidden">
                                    <img
                                        src={p.image_url || dronePlaceholder({ width: 600, height: 450, label: p.title })}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="drone-heading text-base font-black text-gray-900 leading-tight mb-2">{p.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{p.location || 'Nigeria'}</p>
                                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── FOOTER CTA ── */}
            <section className="px-6 md:px-12 py-12 max-w-7xl mx-auto text-center border-t border-gray-100">
                <Link
                    to="/drone"
                    className="inline-flex items-center gap-2 text-sm font-bold underline decoration-2 underline-offset-4 hover:text-gray-500 transition-colors"
                >
                    ← All Drone Missions
                </Link>
            </section>
        </div>
    );
};

export default DroneProjectDetailPage;
