// ─── src/pages/admin/AdminPortfolio.jsx ─────────────────
// Workspace-aware portfolio editor.
//
//   <AdminPortfolio lockedDivision="SOFTWARE" />  → /admin/portfolio
//   <AdminPortfolio lockedDivision="SURVEY" />    → /admin/survey/portfolio
//   <AdminPortfolio lockedDivision="DRONE" />     → /admin/drone/portfolio
//
// Every workspace is locked to its own division. There is no
// cross-division view. Each workspace manages only its own
// portfolio items.
//
// v28 — extends the form with the case-study fields consumed
// by the public detail pages (tagline, year, industry, gallery,
// challenge, solution, results, flow, ...). The basic fields
// stay top-level; richer JSONB fields are exposed via
// collapsible "Case Study Content" + "Division Meta" sections
// to keep the form approachable while still letting editors
// ship the full layout.
// ──────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

// Only use a relative VITE_API_URL or a localhost absolute URL.
// Cross-origin production URLs (e.g. onrender.com) are rejected
// because they break the HttpOnly cookie — see services/api.js.
const API_BASE = (() => {
    const env = import.meta.env.VITE_API_URL;
    if (!env) return '/api';
    if (env.startsWith('/')) return env;
    try {
        const u = new URL(env);
        if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') return env;
    } catch {
        // fall through
    }
    return '/api';
})();

const DIVISION_META = {
    SOFTWARE: { label: 'Software', tone: 'blue' },
    SURVEY:   { label: 'Survey',   tone: 'amber' },
    DRONE:    { label: 'Drone',    tone: 'indigo' },
};

// JSONB columns that should be edited as raw JSON in the
// admin form. Mirrors the backend's V28_JSONB_FIELDS set.
const JSONB_FIELDS = [
    { key: 'challenge',            label: 'Challenge',     placeholder: '{ "problem": "...", "constraints": ["..."], "goals": ["..."] }' },
    { key: 'solution',             label: 'Solution',      placeholder: '{ "architecture": "...", "ui": "...", "backend": "...", "performance": "...", "security": "...", "accessibility": "..." }' },
    { key: 'results',              label: 'Results',       placeholder: '[ { "value": "+42%", "label": "Conversion lift", "description": "..." } ]' },
    { key: 'feature_categories',   label: 'Feature Categories', placeholder: '[ { "name": "Auth", "icon": "shield", "items": [ { "title": "...", "description": "..." } ] } ]' },
    { key: 'flow',                 label: 'Application Flow',   placeholder: '[ { "step": "Login", "detail": "..." } ]' },
    { key: 'tech_categories',      label: 'Tech Categories',    placeholder: '[ { "name": "Frontend", "icon": "monitor", "items": ["React", "Vite"] } ]' },
    { key: 'architecture',         label: 'System Architecture', placeholder: '[ { "layer": "Client", "detail": "..." } ]' },
    { key: 'timeline',             label: 'Timeline',            placeholder: '[ { "phase": "Discovery", "detail": "..." } ]' },
    { key: 'responsibilities',     label: 'Responsibilities',    placeholder: '["UX Research", "Frontend Development", ...]' },
    { key: 'metrics',              label: 'Metrics',             placeholder: '{ "lighthouse": 98, "performance": 97, "accessibility": 100, "seo": 100, "bestPractices": 98, "apiResponse": "120ms", "bundle": "184 KB" }' },
    { key: 'stats',                label: 'Stats',               placeholder: '{ "screens": 28, "endpoints": 42, "tables": 17 }' },
    { key: 'related_slugs',        label: 'Related Slugs',       placeholder: '["other-project-slug", "another-slug"]' },
];

// Try to parse a JSONB textarea value. Empty strings and
// placeholders become `null` so the backend stores an empty
// array / object rather than corrupted data.
const safeParseJson = (raw) => {
    if (raw == null || raw === '') return null;
    const trimmed = String(raw).trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
    try {
        return JSON.parse(trimmed);
    } catch {
        // Return a sentinel string so the backend's Zod
        // schema can reject the request with a clear error
        // rather than silently dropping the field.
        throw new Error(`Invalid JSON in one of the case-study fields. Please fix the syntax.`);
    }
};

// Convert a JS value (object / array / string / null) to the
// string the JSONB textarea expects. Used when loading an
// existing project into the form.
const jsonToText = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
};

// ── Reusable JSONB textarea ──────────────────────────────
// Renders a labelled textarea that holds a JSON value. The
// textarea is editable so the form can hold a partial draft
// (string while typing, valid JSON on save).
const JsonField = ({ label, value, onChange, placeholder, error }) => (
    <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1.5">
            {label}
        </label>
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={5}
            className={`w-full p-2.5 rounded-lg border bg-transparent font-mono text-xs ${
                error
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-800'
            }`}
        />
        {error && (
            <p className="text-[11px] text-red-500 mt-1">{error}</p>
        )}
    </div>
);

// ── Image upload helper (also reused for gallery items) ───
const uploadImageFile = async (file) => {
    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
};

// Default form state per division. Centralised so creating
// a new project never inherits stale fields from a previous
// edit and so the case-study JSONB fields have a consistent
// starting shape.
const blankFormData = (division) => ({
    title: '', slug: '', summary: '', content: '',
    image_url: '', live_url: '', repo_url: '',
    division, status: 'DRAFT',
    location: '', client_name: '', category: '',
    display_order: 0, tags: [], tech_stack: [], features: [],
    featured: false,
    // v28 scalars
    tagline: '', year: '', industry: '', status_label: '', duration: '', role: '',
    // v28 JSONB
    gallery: [],
    challenge: { problem: '', constraints: [], goals: [] },
    solution: { architecture: '', ui: '', backend: '', performance: '', security: '', accessibility: '' },
    results: [],
    feature_categories: [],
    flow: [],
    tech_categories: [],
    architecture: [],
    timeline: [],
    responsibilities: [],
    metrics: {},
    stats: {},
    related_slugs: [],
    // Division-specific structured data — uses the v28 `meta` JSONB.
    meta: {},
});

const AdminPortfolio = ({ lockedDivision }) => {
    const activeDivision = lockedDivision || 'SOFTWARE';
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState(() => blankFormData(activeDivision));
    const [tagsInput, setTagsInput] = useState('');
    const [techStackInput, setTechStackInput] = useState('');
    const [featuresInput, setFeaturesInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [apiProjects, setApiProjects] = useState([]);
    const [jsonbErrors, setJsonbErrors] = useState({});
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [jsonbOpen, setJsonbOpen] = useState(false);
    const [jsonbDrafts, setJsonbDrafts] = useState({});
    const galleryInputRef = useRef(null);

    useEffect(() => {
        fetchProjects();
    }, [activeDivision]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            // We always send `?division=` so the backend never has
            // to guess. The UI is strictly bound to activeDivision.
            const params = { division: activeDivision };
            const res = await api.get('/projects', { params });
            if (!res.ok) throw new Error(res.error || 'Failed to fetch projects');
            // /api/projects returns { data: rows, pagination: {...} },
            // so unwrap before storing. Fall back to [] on any shape
            // mismatch (e.g. older backend) so .filter() below is safe.
            setApiProjects(res.data?.data ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Convert an existing project row into the form state.
    // Always uses division-locked values, so the backend can
    // never be tricked into writing a row to the wrong
    // division.
    const openEditFor = (project) => {
        setEditingProject(project.id);
        setFormData({
            ...blankFormData(activeDivision),
            ...project,
            // Always lock the division; ignore whatever the row
            // currently stores.
            division: activeDivision,
        });
        setTagsInput((project.tags || []).join(', '));
        setTechStackInput((project.tech_stack || []).join(', '));
        setFeaturesInput((project.features || []).join(', '));

        // Initialise JSONB textareas with the project's existing
        // values. We use string drafts so partial edits are
        // preserved as the user types.
        const drafts = {};
        JSONB_FIELDS.forEach(({ key }) => {
            drafts[key] = jsonToText(project[key]);
        });
        setJsonbDrafts(drafts);
        setJsonbErrors({});
        setIsEditModalOpen(true);
    };

    const openNew = () => {
        setEditingProject(null);
        setFormData(blankFormData(activeDivision));
        setTagsInput('');
        setTechStackInput('');
        setFeaturesInput('');
        const drafts = {};
        JSONB_FIELDS.forEach(({ key }) => {
            drafts[key] = '';
        });
        setJsonbDrafts(drafts);
        setJsonbErrors({});
        setIsEditModalOpen(true);
    };

    // Generic field setter — keeps the call sites small.
    const updateField = useCallback((key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImageFile(file);
            updateField('image_url', url);
        } catch (err) {
            alert('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    // Multi-image gallery uploader. Each file is uploaded
    // separately so a single failure doesn't discard the rest.
    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setGalleryUploading(true);
        const successes = [];
        const failures = [];
        for (const file of files) {
            try {
                const url = await uploadImageFile(file);
                successes.push({ src: url, alt: file.name, device: 'desktop' });
            } catch (err) {
                failures.push(file.name);
            }
        }
        if (successes.length > 0) {
            setFormData((prev) => ({
                ...prev,
                gallery: [...(prev.gallery || []), ...successes],
            }));
        }
        if (failures.length > 0) {
            alert(`Failed to upload ${failures.length} file(s): ${failures.join(', ')}`);
        }
        setGalleryUploading(false);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const removeGalleryItem = (idx) => {
        setFormData((prev) => ({
            ...prev,
            gallery: (prev.gallery || []).filter((_, i) => i !== idx),
        }));
    };

    const moveGalleryItem = (idx, direction) => {
        setFormData((prev) => {
            const list = [...(prev.gallery || [])];
            const next = idx + direction;
            if (next < 0 || next >= list.length) return prev;
            [list[idx], list[next]] = [list[next], list[idx]];
            return { ...prev, gallery: list };
        });
    };

    // Save handler. Validates JSONB fields locally before
    // posting so the user gets an immediate error rather than
    // a backend 400.
    const handleSave = async (e) => {
        e.preventDefault();
        // Validate JSONB drafts.
        const errors = {};
        const parsed = {};
        for (const { key } of JSONB_FIELDS) {
            try {
                parsed[key] = safeParseJson(jsonbDrafts[key]);
            } catch (err) {
                errors[key] = err.message;
            }
        }
        if (Object.keys(errors).length > 0) {
            setJsonbErrors(errors);
            setJsonbOpen(true);
            return;
        }
        setJsonbErrors({});

        try {
            const payload = {
                ...formData,
                // Convert comma-separated tags input into the
                // array the API expects. Trim + drop empties so
                // accidental double-spaces don't create blanks.
                tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                tech_stack: techStackInput.split(',').map((t) => t.trim()).filter(Boolean),
                features: featuresInput.split(',').map((t) => t.trim()).filter(Boolean),
                // Empty string → null so the URL validator
                // doesn't reject the empty form.
                image_url: formData.image_url || null,
                live_url: formData.live_url || null,
                repo_url: formData.repo_url || null,
                location: formData.location || null,
                client_name: formData.client_name || null,
                category: formData.category || null,
                // v28 scalars — empty strings → null.
                tagline: formData.tagline || null,
                year: formData.year || null,
                industry: formData.industry || null,
                status_label: formData.status_label || null,
                duration: formData.duration || null,
                role: formData.role || null,
                // v28 JSONB — already validated, may be null.
                ...parsed,
                display_order: Number(formData.display_order) || 0,
                // Force the division to the workspace lock.
                division: activeDivision,
            };
            const url = editingProject ? `/projects/${editingProject}` : '/projects';
            const res = editingProject
                ? await api.put(url, payload)
                : await api.post(url, payload);

            if (!res.ok) throw new Error(res.error || 'Failed to save project');
            await fetchProjects();
            setIsEditModalOpen(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            const res = await api.delete(`/projects/${id}`);
            if (!res.ok) throw new Error(res.error || 'Failed to delete project');
            setProjects(projects.filter((p) => p.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const projectList = useMemo(() => {
        return apiProjects.filter((p) => p.division === activeDivision);
    }, [apiProjects, activeDivision]);

    if (loading) return <div className="p-6">Loading...</div>;

    const headerTitle = `${DIVISION_META[activeDivision]?.label || activeDivision} Portfolio`;
    const headerSubtitle = `Manage the showcase items visible on the public ${DIVISION_META[activeDivision]?.label || activeDivision} homepage.`;

    // Division-specific meta fields surface in a dedicated
    // section so editors don't have to edit raw JSON. The
    // `meta` column is JSONB on the backend; we serialise on
    // submit.
    const META_FIELDS_BY_DIVISION = {
        SURVEY: [
            { key: 'site_area',         label: 'Project Area',         placeholder: '12.4 ha' },
            { key: 'state',             label: 'State',                placeholder: 'Lagos' },
            { key: 'lga',               label: 'Local Government',     placeholder: 'Ibeju-Lekki' },
            { key: 'terrain',           label: 'Terrain Type',         placeholder: 'Low-lying coastal plain' },
            { key: 'accuracy_label',    label: 'Survey Accuracy',      placeholder: '±0.02 m horizontal' },
            { key: 'coords',            label: 'Coordinate System',    placeholder: 'WGS 84 / UTM 32N' },
            { key: 'elevation_range',   label: 'Elevation Range',      placeholder: '2.1 m – 16.3 m' },
            { key: 'boundary_points',   label: 'Boundary Points',      placeholder: '28' },
        ],
        DRONE: [
            { key: 'weather',     label: 'Weather',    placeholder: 'Clear · 28°C · light wind' },
            { key: 'team_size',   label: 'Team Size',  placeholder: '1 pilot / 1 visual observer' },
            { key: 'industry',    label: 'Industry',   placeholder: 'Aerial Photography' },
        ],
    };
    const metaFields = META_FIELDS_BY_DIVISION[activeDivision] || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">{headerTitle}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{headerSubtitle}</p>
                </div>
                <div className="flex gap-2 items-center">
                    <button
                        onClick={openNew}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"
                    >
                        + New Project
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectList.map((p) => (
                    <div key={p.id} className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl bg-white dark:bg-[#111] flex flex-col gap-3">
                        {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover rounded-lg" />}
                        <h3 className="text-lg font-bold">{p.title}</h3>
                        <p className="text-sm text-gray-500">{p.slug}</p>
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded w-fit">{p.status}</span>
                            {p.status_label && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded w-fit">
                                    {p.status_label}
                                </span>
                            )}
                            {p.year && (
                                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded w-fit">
                                    {p.year}
                                </span>
                            )}
                            {p.division && (
                                <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                    p.division === 'SURVEY' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                    p.division === 'DRONE' ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' :
                                    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                }`}>
                                    {p.division}
                                </span>
                            )}
                        </div>
                        <div className="mt-auto flex justify-between gap-2 pt-4">
                            <button onClick={() => openEditFor(p)} className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded font-bold text-sm text-center">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="flex-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-bold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-4xl my-8 max-h-[calc(100vh-4rem)] overflow-y-auto"
                        >
                            <form onSubmit={handleSave} className="p-6 space-y-6">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-xl font-bold">
                                        {editingProject ? 'Edit Project' : 'New Project'}
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                                        aria-label="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* ─── 1. Basic ─────────────────────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>Basic</SectionTitle>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Title</label>
                                            <input
                                                required
                                                value={formData.title}
                                                onChange={(e) => updateField('title', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Slug</label>
                                            <input
                                                required
                                                value={formData.slug}
                                                onChange={(e) => updateField('slug', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Division</label>
                                            <div className={`w-full p-2 rounded-lg border dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm font-bold flex items-center gap-2`}>
                                                <span className={`w-2 h-2 rounded-full ${
                                                    activeDivision === 'SURVEY' ? 'bg-amber-500' :
                                                    activeDivision === 'DRONE'  ? 'bg-indigo-500' :
                                                                                 'bg-blue-500'
                                                }`} />
                                                {DIVISION_META[activeDivision]?.label || activeDivision}
                                                <span className="ml-auto text-[10px] uppercase tracking-widest text-gray-400">locked</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Workflow Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => updateField('status', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            >
                                                <option value="DRAFT">DRAFT</option>
                                                <option value="PUBLISHED">PUBLISHED</option>
                                                <option value="ARCHIVED">ARCHIVED</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Display Status</label>
                                            <input
                                                value={formData.status_label || ''}
                                                onChange={(e) => updateField('status_label', e.target.value)}
                                                placeholder="e.g. Live, In Progress"
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Summary</label>
                                        <textarea
                                            value={formData.summary}
                                            onChange={(e) => updateField('summary', e.target.value)}
                                            className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Tagline <span className="text-gray-400 font-normal text-xs">(one-line value proposition)</span></label>
                                        <input
                                            value={formData.tagline || ''}
                                            onChange={(e) => updateField('tagline', e.target.value)}
                                            placeholder="A premium storefront engineered for international buyers."
                                            className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                        />
                                    </div>
                                </section>

                                {/* ─── 2. Classification ───────────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>Classification</SectionTitle>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Category</label>
                                            <input
                                                value={formData.category}
                                                onChange={(e) => updateField('category', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="e.g. Full-Stack, E-Commerce"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Industry</label>
                                            <input
                                                value={formData.industry || ''}
                                                onChange={(e) => updateField('industry', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="e.g. Healthcare, Fashion, Geoinformatics"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Year</label>
                                            <input
                                                value={formData.year || ''}
                                                onChange={(e) => updateField('year', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="2024"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Duration</label>
                                            <input
                                                value={formData.duration || ''}
                                                onChange={(e) => updateField('duration', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="5 months"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Role</label>
                                            <input
                                                value={formData.role || ''}
                                                onChange={(e) => updateField('role', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="Lead Engineer / Architect"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Location <span className="text-gray-400 font-normal text-xs">(Survey / Drone)</span></label>
                                            <input
                                                value={formData.location}
                                                onChange={(e) => updateField('location', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="e.g. Lagos, Nigeria"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Client / Site Name</label>
                                            <input
                                                value={formData.client_name}
                                                onChange={(e) => updateField('client_name', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Tags <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                                            <input
                                                value={tagsInput}
                                                onChange={(e) => setTagsInput(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="e.g. aerial-survey, ncaa"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Display Order</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.display_order}
                                                onChange={(e) => updateField('display_order', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ─── 3. Media (image + gallery) ──────── */}
                                <section className="space-y-4">
                                    <SectionTitle>Media</SectionTitle>

                                    <div className="space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                                        <label className="block text-sm font-bold">Primary Project Image</label>
                                        <p className="text-xs text-gray-500 mb-2">The hero image shown on the portfolio grid and the case-study hero.</p>
                                        {formData.image_url && (
                                            <div className="relative w-fit">
                                                <img src={formData.image_url} alt="Primary Preview" className="h-40 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('image_url', '')}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
                                                    aria-label="Remove primary image"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="block w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                                        />
                                        {uploading && (
                                            <span className="text-xs text-blue-500 font-bold inline-flex items-center gap-1.5">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Uploading to Cloudinary...
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                                        <label className="block text-sm font-bold">Gallery</label>
                                        <p className="text-xs text-gray-500 mb-2">
                                            Multi-image gallery shown on the case-study detail page (featured + grid). First image is the featured frame.
                                        </p>
                                        {formData.gallery && formData.gallery.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {formData.gallery.map((g, i) => (
                                                    <div key={i} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                        <img src={g.src} alt={g.alt || `Frame ${i + 1}`} className="w-full h-24 object-cover" />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors" />
                                                        <div className="absolute top-1 left-1 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded">
                                                            #{i + 1}
                                                        </div>
                                                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button"
                                                                onClick={() => moveGalleryItem(i, -1)}
                                                                disabled={i === 0}
                                                                className="w-6 h-6 rounded bg-white/90 text-black text-xs font-bold disabled:opacity-40"
                                                                aria-label="Move up"
                                                            >
                                                                ↑
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => moveGalleryItem(i, 1)}
                                                                disabled={i === formData.gallery.length - 1}
                                                                className="w-6 h-6 rounded bg-white/90 text-black text-xs font-bold disabled:opacity-40"
                                                                aria-label="Move down"
                                                            >
                                                                ↓
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryItem(i)}
                                                                className="w-6 h-6 rounded bg-red-500 text-white text-xs font-bold"
                                                                aria-label="Remove"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <input
                                            ref={galleryInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleGalleryUpload}
                                            className="block w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
                                        />
                                        {galleryUploading && (
                                            <span className="text-xs text-blue-500 font-bold inline-flex items-center gap-1.5">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Uploading gallery images...
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Live URL</label>
                                            <input
                                                value={formData.live_url}
                                                onChange={(e) => updateField('live_url', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Repo URL</label>
                                            <input
                                                value={formData.repo_url}
                                                onChange={(e) => updateField('repo_url', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ─── 4. Tech / Features ────────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>Tech & Features</SectionTitle>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Tech Stack <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                                            <input
                                                value={techStackInput}
                                                onChange={(e) => setTechStackInput(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="e.g. React, Node.js, PostgreSQL"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Features <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                                            <input
                                                value={featuresInput}
                                                onChange={(e) => setFeaturesInput(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                placeholder="e.g. Real-time chat, GPS tracking"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ─── 5. Write-up ───────────────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>Write-up</SectionTitle>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Content (Markdown / HTML)</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => updateField('content', e.target.value)}
                                            className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                            rows={8}
                                            placeholder="Full project write-up — supports Markdown."
                                        />
                                    </div>
                                </section>

                                {/* ─── 6. Division-specific Meta ─────── */}
                                {metaFields.length > 0 && (
                                    <section className="space-y-4">
                                        <SectionTitle>
                                            {activeDivision === 'SURVEY' ? 'Survey' : 'Drone'} Meta
                                        </SectionTitle>
                                        <p className="text-xs text-gray-500 -mt-2">
                                            Division-specific structured fields, saved into the <code>meta</code> JSONB column.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4">
                                            {metaFields.map((m) => (
                                                <div key={m.key}>
                                                    <label className="block text-sm font-bold mb-1">{m.label}</label>
                                                    <input
                                                        value={formData.meta?.[m.key] ?? ''}
                                                        onChange={(e) => updateField('meta', {
                                                            ...(formData.meta || {}),
                                                            [m.key]: e.target.value,
                                                        })}
                                                        className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent"
                                                        placeholder={m.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* ─── 7. Advanced (collapsible) ─────── */}
                                <section className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setAdvancedOpen((v) => !v)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                                            Advanced
                                        </span>
                                        {advancedOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {advancedOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-800">
                                                    <label className="flex items-center gap-2 text-sm font-bold">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!formData.featured}
                                                            onChange={(e) => updateField('featured', e.target.checked)}
                                                        />
                                                        Feature on public homepage
                                                    </label>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>

                                {/* ─── 8. Case-study JSONB (collapsible) */}
                                <section className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setJsonbOpen((v) => !v)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <span className="text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                                            Case Study Content (JSON)
                                        </span>
                                        <span className="flex items-center gap-2">
                                            {Object.keys(jsonbErrors).length > 0 && (
                                                <span className="text-[10px] text-red-500 font-bold">errors</span>
                                            )}
                                            {jsonbOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </span>
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {jsonbOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-4 pt-0 space-y-4 border-t border-gray-200 dark:border-gray-800">
                                                    <p className="text-xs text-gray-500">
                                                        Optional structured content consumed by the public case-study detail page. Leave empty to use the write-up above as the source.
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {JSONB_FIELDS.map((f) => (
                                                            <JsonField
                                                                key={f.key}
                                                                label={f.label}
                                                                value={jsonbDrafts[f.key] ?? ''}
                                                                onChange={(v) => setJsonbDrafts((prev) => ({ ...prev, [f.key]: v }))}
                                                                placeholder={f.placeholder}
                                                                error={jsonbErrors[f.key]}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </section>

                                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-[#111] -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 rounded-lg font-bold border border-gray-200 dark:border-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || galleryUploading}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50"
                                    >
                                        Save Project
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Small section title used inside the modal.
const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">
        {children}
    </h3>
);

export default AdminPortfolio;
