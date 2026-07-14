// ─── src/pages/survey/SurveyProjectDetailPage.jsx ───────
// Public detail page for a Survey-division portfolio project.
//
// Follows the same brutalist / editorial design language as
// /survey: Manrope headings on a light `#f2f2f2` canvas,
// uppercase tracking-tighter type, hairline borders, and an
// oversized 3-column hero. The data comes from
//   GET /api/projects/division/SURVEY       (list)
//   GET /api/projects/:id                  (this single item)
//
// The route is /survey/projects/:id. The same layout is used
// by Drone (with the dark two-pane treatment) so the two
// divisions feel distinctly different at every touchpoint.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin, Ruler, Calendar, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { renderSafeMarkdownSync } from '../../utils/markdown';
import { surveyPlaceholder, projectPlaceholder } from '../../utils/placeholders';

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap';

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
        style.setAttribute('data-survey-detail-fonts', '');
        style.textContent = `
            .survey-heading { font-family: "Manrope", sans-serif; font-optical-sizing: auto; font-weight: 700; font-style: normal; letter-spacing: -0.01em; }
            .survey-body    { font-family: "Mulish",  sans-serif; font-optical-sizing: auto; font-style: normal; }
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

const SurveyProjectDetailPage = () => {
    useFontsEffect();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleElements, setVisibleElements] = useState(new Set());
    const sectionsRef = useRef({});

    // Scroll-to-top + title update on mount.
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Fetch the project + a couple of related siblings.
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

            // Related: same division, exclude self, take 3.
            const list = await api.get('/projects/division/SURVEY');
            if (list.ok) {
                setRelated(
                    (list.data || [])
                        .filter((p) => p.id !== id)
                        .slice(0, 3)
                );
            }
            setLoading(false);

            document.title = `${res.data?.title || 'Project'} | Lami Survey`;
        };
        load();
    }, [id]);

    // Scroll-fade-in for content blocks.
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
            <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center survey-body">
                <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center text-center px-6 survey-body">
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— 404</p>
                <h1 className="survey-heading text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">Project<br />Not Found</h1>
                <p className="text-sm text-gray-600 mb-10 max-w-md">{error || "We couldn't find that project. It may have been archived."}</p>
                <Link to="/survey" className="text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
                    ← Back to Survey
                </Link>
            </div>
        );
    }

    const heroImage = project.image_url || surveyPlaceholder({ width: 1200, height: 800, label: project.title });

    return (
        <div className="bg-[#f2f2f2] text-black survey-body min-h-screen">

            {/* ── Slim top bar with back link ── */}
            <div className="border-b border-gray-300 bg-[#f2f2f2] sticky top-0 z-10">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                    <Link to="/survey" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Survey
                    </Link>
                    <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                        Survey / Case Study
                    </div>
                </div>
            </div>

            {/* ── 3-COLUMN HERO (matches the home page) ── */}
            <section className="px-4 md:px-8 py-6">
                <div className="bg-[#f2f2f2] w-full max-w-[1400px] mx-auto flex flex-col md:flex-row border border-gray-200 overflow-hidden">

                    {/* Left col — index + title */}
                    <div className="w-full md:w-[35%] flex flex-col justify-between p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-300 min-h-[420px]">
                        <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-12">
                            — Case Study / {project.tags?.[0] || 'Survey'}
                        </div>
                        <div className="relative flex-1 flex flex-col justify-center mb-12">
                            <h1 className="survey-heading text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tighter uppercase">
                                {project.title.split(' ').slice(0, 3).join(' ')}
                                {project.title.split(' ').length > 3 && (<><br />{project.title.split(' ').slice(3).join(' ')}</>)}
                            </h1>
                        </div>
                        {project.summary && (
                            <p className="text-xs font-semibold leading-loose text-gray-800 max-w-[320px] uppercase tracking-wider">
                                {project.summary}
                            </p>
                        )}
                    </div>

                    {/* Center col — image */}
                    <div className="w-full md:w-[35%] border-b md:border-b-0 md:border-r border-gray-300">
                        <div className="w-full h-[50vh] md:h-[600px] bg-[#e6e6e6] overflow-hidden">
                            <img
                                src={heroImage}
                                alt={project.title}
                                className="w-full h-full object-cover grayscale-[20%] contrast-125"
                            />
                        </div>
                    </div>

                    {/* Right col — metadata */}
                    <div className="w-full md:w-[30%] p-8 md:p-12 flex flex-col">
                        <h2 className="survey-heading text-xl font-bold uppercase tracking-wider mb-6">Project Data</h2>
                        <dl className="divide-y divide-gray-300 border-t border-b border-gray-300">
                            {project.client_name && (
                                <div className="flex justify-between py-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Client</dt>
                                    <dd className="text-sm font-extrabold uppercase tracking-widest">{project.client_name}</dd>
                                </div>
                            )}
                            {project.location && (
                                <div className="flex justify-between py-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Location</dt>
                                    <dd className="text-sm font-extrabold uppercase tracking-widest">{project.location}</dd>
                                </div>
                            )}
                            {project.published_at && (
                                <div className="flex justify-between py-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivered</dt>
                                    <dd className="text-sm font-extrabold uppercase tracking-widest">{formatDate(project.published_at)}</dd>
                                </div>
                            )}
                            {project.tags?.length > 0 && (
                                <div className="py-3">
                                    <dt className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Scope</dt>
                                    <dd className="flex flex-wrap gap-1.5">
                                        {project.tags.map((t) => (
                                            <span key={t} className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1">{t}</span>
                                        ))}
                                    </dd>
                                </div>
                            )}
                        </dl>

                        <div className="mt-8 flex flex-col gap-3">
                            {project.live_url && (
                                <a href={project.live_url} target="_blank" rel="noreferrer" className="flex items-center justify-between border border-black px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                    View Live <ArrowUpRight className="w-4 h-4" />
                                </a>
                            )}
                            <Link to="/survey#contact" className="flex items-center justify-between border border-black px-4 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
                                Start Similar Project <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── WRITE-UP / CASE STUDY ── */}
            {project.content && (
                <section
                    ref={(el) => (sectionsRef.current['writeup'] = el)}
                    className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
                >
                    <div
                        className={`observe ${visibleElements.has('writeup-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                        data-id="writeup-header"
                    >
                        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— The Brief</p>
                        <h2 className="survey-heading text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-16">
                            Field<br />Notes
                        </h2>
                    </div>
                    <div
                        className={`observe ${visibleElements.has('writeup-body') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                        data-id="writeup-body"
                    >
                        <div
                            className="prose prose-lg max-w-3xl prose-headings:survey-heading prose-headings:uppercase prose-headings:tracking-tight prose-p:leading-loose prose-p:text-gray-800"
                            dangerouslySetInnerHTML={{ __html: renderSafeMarkdownSync(project.content) }}
                        />
                    </div>
                </section>
            )}

            {/* ── RELATED PROJECTS ── */}
            {related.length > 0 && (
                <section
                    ref={(el) => (sectionsRef.current['related'] = el)}
                    className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-gray-300"
                >
                    <div
                        className={`observe ${visibleElements.has('related-header') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000`}
                        data-id="related-header"
                    >
                        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-4">— More Works</p>
                        <h2 className="survey-heading text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-16">
                            Continue<br />Reading
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {related.map((p, idx) => (
                            <Link
                                key={p.id}
                                to={`/survey/projects/${p.id}`}
                                className={`observe ${visibleElements.has(`rel-${idx}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 group`}
                                data-id={`rel-${idx}`}
                            >
                                <div className="bg-[#e6e6e6] aspect-[4/3] mb-4 overflow-hidden">
                                    <img
                                        src={p.image_url || projectPlaceholder({ width: 600, height: 450, label: p.title })}
                                        alt={p.title}
                                        className="w-full h-full object-cover grayscale-[20%] contrast-125 group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="flex justify-between items-start border-b border-gray-300 pb-3">
                                    <div>
                                        <h3 className="survey-heading text-base font-black uppercase tracking-tight mb-1">{p.title}</h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{p.location || 'Nigeria'}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-black transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* ── FOOTER CTA ── */}
            <section className="py-16 px-6 md:px-12 border-t border-gray-300 text-center">
                <Link
                    to="/survey"
                    className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> All Survey Projects
                </Link>
            </section>
        </div>
    );
};

export default SurveyProjectDetailPage;
