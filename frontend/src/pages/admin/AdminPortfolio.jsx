// ─── src/pages/admin/AdminPortfolio.jsx ─────────────────
// Workspace-aware portfolio editor with advanced image management.
//
//   <AdminPortfolio lockedDivision="SOFTWARE" />  → /admin/portfolio
//   <AdminPortfolio lockedDivision="SURVEY" />    → /admin/survey/portfolio
//   <AdminPortfolio lockedDivision="DRONE" />     → /admin/drone/portfolio
//
// ──────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, ChevronRight, X, Loader2, Image as ImageIcon, 
    UploadCloud, Plus, Trash2, ExternalLink, Search, Check, 
    Copy, Monitor, Smartphone, Tablet, ArrowUp, ArrowDown, Eye, Edit3
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

const DIVISION_META = {
    SOFTWARE: { label: 'Software', tone: 'blue', accent: '#3b82f6' },
    SURVEY:   { label: 'Survey',   tone: 'amber', accent: '#f59e0b' },
    DRONE:    { label: 'Drone',    tone: 'indigo', accent: '#6366f1' },
};

const CATEGORY_PRESETS = {
    SOFTWARE: ['Web Platforms', 'Business Systems', 'E-Commerce', 'SaaS', 'Mobile Apps', 'Full-Stack'],
    SURVEY:   ['Boundary Survey', 'Topographical Survey', 'Cadastral Survey', 'Route Survey', 'Bathymetric Survey'],
    DRONE:    ['Aerial Mapping', 'Site Inspection', 'Orthomosaic', 'Volumetric Analysis', 'Thermal Inspection'],
};

// JSONB columns that can be edited in the admin form.
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

const safeParseJson = (raw) => {
    if (raw == null || raw === '') return null;
    const trimmed = String(raw).trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return null;
    try {
        return JSON.parse(trimmed);
    } catch {
        throw new Error(`Invalid JSON syntax in one of the case study fields.`);
    }
};

const jsonToText = (val) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
};

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

const uploadImageFile = async (file) => {
    const res = await api.upload('/upload', file);
    if (!res.ok) throw new Error(res.error || 'Upload failed');
    return res.data?.url || res.data;
};

const blankFormData = (division) => ({
    title: '', slug: '', summary: '', content: '',
    image_url: '', live_url: '', repo_url: '',
    division, status: 'PUBLISHED',
    location: '', client_name: '', category: 'Web Platforms',
    display_order: 0, tags: [], tech_stack: [], features: [],
    featured: false,
    tagline: '', year: new Date().getFullYear().toString(), industry: '', status_label: 'Live', duration: '', role: '',
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
    meta: {},
});

const AdminPortfolio = ({ lockedDivision }) => {
    const activeDivision = lockedDivision || 'SOFTWARE';
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
    
    // Direct URL input for gallery
    const [newGalleryUrl, setNewGalleryUrl] = useState('');
    const [newGalleryAlt, setNewGalleryAlt] = useState('');
    const [newGalleryDevice, setNewGalleryDevice] = useState('desktop');
    const [showAddUrlInput, setShowAddUrlInput] = useState(false);

    const primaryFileInputRef = useRef(null);
    const galleryInputRef = useRef(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const triggerToast = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 4000);
    };

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true);
            const params = { division: activeDivision };
            const res = await api.get('/projects', { params });
            if (!res.ok) throw new Error(res.error || 'Failed to fetch projects');
            const dataRows = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            setApiProjects(dataRows);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [activeDivision]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const openEditFor = (project) => {
        setEditingProject(project.id);
        setFormData({
            ...blankFormData(activeDivision),
            ...project,
            division: activeDivision,
        });
        setTagsInput((project.tags || []).join(', '));
        setTechStackInput((project.tech_stack || []).join(', '));
        setFeaturesInput((Array.isArray(project.features) ? project.features : []).join(', '));

        const drafts = {};
        JSONB_FIELDS.forEach(({ key }) => {
            drafts[key] = jsonToText(project[key]);
        });
        setJsonbDrafts(drafts);
        setJsonbErrors({});
        setShowAddUrlInput(false);
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
        setShowAddUrlInput(false);
        setIsEditModalOpen(true);
    };

    const updateField = useCallback((key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Primary Image upload handler
    const handlePrimaryImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImageFile(file);
            updateField('image_url', url);
            triggerToast('Primary image uploaded successfully!');
        } catch (err) {
            alert('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
            if (primaryFileInputRef.current) primaryFileInputRef.current.value = '';
        }
    };

    // Multi-image gallery uploader
    const handleGalleryUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setGalleryUploading(true);
        const successes = [];
        const failures = [];
        for (const file of files) {
            try {
                const url = await uploadImageFile(file);
                successes.push({ src: url, alt: file.name.replace(/\.[^/.]+$/, ""), device: 'desktop' });
            } catch (err) {
                failures.push(file.name);
            }
        }
        if (successes.length > 0) {
            setFormData((prev) => ({
                ...prev,
                gallery: [...(prev.gallery || []), ...successes],
            }));
            triggerToast(`Added ${successes.length} image(s) to gallery!`);
        }
        if (failures.length > 0) {
            alert(`Failed to upload ${failures.length} file(s): ${failures.join(', ')}`);
        }
        setGalleryUploading(false);
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const addGalleryUrl = () => {
        if (!newGalleryUrl.trim()) return;
        setFormData((prev) => ({
            ...prev,
            gallery: [
                ...(prev.gallery || []),
                {
                    src: newGalleryUrl.trim(),
                    alt: newGalleryAlt.trim() || `${prev.title || 'Project'} Preview`,
                    device: newGalleryDevice || 'desktop',
                }
            ],
        }));
        setNewGalleryUrl('');
        setNewGalleryAlt('');
        setShowAddUrlInput(false);
        triggerToast('Image added to gallery!');
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

    const setGalleryAsPrimary = (item) => {
        if (!item?.src) return;
        updateField('image_url', item.src);
        triggerToast('Set as primary project image!');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) {
            alert('Title and slug fields are required');
            return;
        }

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
                tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
                tech_stack: techStackInput.split(',').map((t) => t.trim()).filter(Boolean),
                features: featuresInput.split(',').map((t) => t.trim()).filter(Boolean),
                image_url: formData.image_url || null,
                live_url: formData.live_url || null,
                repo_url: formData.repo_url || null,
                location: formData.location || null,
                client_name: formData.client_name || null,
                category: formData.category || null,
                tagline: formData.tagline || null,
                year: formData.year || null,
                industry: formData.industry || null,
                status_label: formData.status_label || null,
                duration: formData.duration || null,
                role: formData.role || null,
                gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
                ...parsed,
                display_order: Number(formData.display_order) || 0,
                division: activeDivision,
            };

            const url = editingProject ? `/projects/${editingProject}` : '/projects';
            const res = editingProject
                ? await api.put(url, payload)
                : await api.post(url, payload);

            if (!res.ok) throw new Error(res.error || 'Failed to save project');
            await fetchProjects();
            setIsEditModalOpen(false);
            triggerToast(editingProject ? 'Project updated successfully!' : 'Project created successfully!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete "${title || 'this project'}"?`)) return;
        try {
            const res = await api.delete(`/projects/${id}`);
            if (!res.ok) throw new Error(res.error || 'Failed to delete project');
            setApiProjects((prev) => prev.filter((p) => p.id !== id));
            triggerToast('Project deleted.');
        } catch (err) {
            alert(err.message);
        }
    };

    const projectList = useMemo(() => {
        return apiProjects.filter((p) => {
            const matchesDiv = p.division === activeDivision || (activeDivision === 'SOFTWARE' && p.division === 'Technology');
            if (!matchesDiv) return false;

            if (selectedCategoryFilter !== 'All') {
                if (selectedCategoryFilter === 'Drafts') {
                    if (p.status !== 'DRAFT') return false;
                } else if (p.category !== selectedCategoryFilter) {
                    return false;
                }
            }

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = (p.title || '').toLowerCase().includes(q);
                const matchSlug = (p.slug || '').toLowerCase().includes(q);
                const matchCategory = (p.category || '').toLowerCase().includes(q);
                const matchTech = (p.tech_stack || []).some(t => t.toLowerCase().includes(q));
                return matchTitle || matchSlug || matchCategory || matchTech;
            }

            return true;
        });
    }, [apiProjects, activeDivision, selectedCategoryFilter, searchQuery]);

    // Categories available for filter tabs
    const availableCategories = useMemo(() => {
        const presets = CATEGORY_PRESETS[activeDivision] || [];
        const existing = Array.from(new Set(apiProjects.map(p => p.category).filter(Boolean)));
        return ['All', ...Array.from(new Set([...presets, ...existing]))];
    }, [activeDivision, apiProjects]);

    // Deep-link support
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (!editId || loading || isEditModalOpen) return;
        const target = apiProjects.find((p) => String(p.id) === String(editId));
        if (!target) return;
        openEditFor(target);
        const next = new URLSearchParams(searchParams);
        next.delete('edit');
        setSearchParams(next, { replace: true });
    }, [searchParams, loading, apiProjects, isEditModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    const headerTitle = `${DIVISION_META[activeDivision]?.label || activeDivision} Portfolio`;
    const headerSubtitle = `Manage showcase projects, upload images, and edit live case studies for the ${DIVISION_META[activeDivision]?.label || activeDivision} division.`;

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
            {/* Header & New Project CTA */}
            <div className="flex justify-between items-center gap-4 flex-wrap pb-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${
                            activeDivision === 'SURVEY' ? 'bg-amber-500' :
                            activeDivision === 'DRONE' ? 'bg-indigo-500' : 'bg-blue-500'
                        }`} />
                        {headerTitle}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-mono font-medium">
                            {apiProjects.filter(p => p.division === activeDivision || (activeDivision === 'SOFTWARE' && p.division === 'Technology')).length} items
                        </span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{headerSubtitle}</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={openNew}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        {successMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Controls: Search & Category Filter Pills */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                    {availableCategories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategoryFilter(cat)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                                selectedCategoryFilter === cat
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-sm">Loading projects...</span>
                </div>
            ) : projectList.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl p-8">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">No projects found</h3>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        {searchQuery ? `No projects matching "${searchQuery}".` : `No projects found in this category.`}
                    </p>
                    <button
                        onClick={openNew}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Create New Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {projectList.map((p) => (
                        <div 
                            key={p.id} 
                            className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#111] overflow-hidden flex flex-col group hover:border-gray-400 dark:hover:border-gray-700 transition-all hover:shadow-lg"
                        >
                            {/* Card Hero Image */}
                            <div className="relative w-full h-44 bg-gray-100 dark:bg-gray-900 overflow-hidden">
                                {p.image_url ? (
                                    <img 
                                        src={p.image_url} 
                                        alt={p.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                                        <span className="text-[11px]">No cover image</span>
                                    </div>
                                )}
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm ${
                                        p.status === 'PUBLISHED' 
                                            ? 'bg-emerald-500 text-white' 
                                            : 'bg-amber-500 text-white'
                                    }`}>
                                        {p.status}
                                    </span>
                                    {p.category && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white">
                                            {p.category}
                                        </span>
                                    )}
                                </div>
                                {p.gallery && Array.isArray(p.gallery) && p.gallery.length > 0 && (
                                    <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <ImageIcon className="w-3 h-3" />
                                        {p.gallery.length} images
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-4 flex-1 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                        {p.title}
                                    </h3>
                                    {p.year && (
                                        <span className="text-xs text-gray-400 shrink-0 font-mono">
                                            {p.year}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                    /{p.slug}
                                </p>

                                {p.tagline && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-0.5">
                                        {p.tagline}
                                    </p>
                                )}

                                {p.tech_stack && Array.isArray(p.tech_stack) && p.tech_stack.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mt-1">
                                        {p.tech_stack.slice(0, 4).map((tech, i) => (
                                            <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {p.tech_stack.length > 4 && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
                                                +{p.tech_stack.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                                    <button 
                                        onClick={() => openEditFor(p)} 
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-lg font-bold text-xs transition-colors"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        Edit / Upload
                                    </button>
                                    
                                    {p.slug && (
                                        <Link 
                                            to={`/work/${p.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            title="View Public Case Study"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    )}

                                    <button 
                                        onClick={() => handleDelete(p.id, p.title)} 
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Project"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit / Create Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 16 }}
                            className="bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl my-6 max-h-[calc(100vh-3rem)] flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#161616]">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${
                                            activeDivision === 'SURVEY' ? 'bg-amber-500' :
                                            activeDivision === 'DRONE' ? 'bg-indigo-500' : 'bg-blue-500'
                                        }`} />
                                        {editingProject ? `Edit Project: ${formData.title || 'Untitled'}` : 'Create New Project'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Division locked to <span className="font-bold text-gray-700 dark:text-gray-300">{activeDivision}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
                                
                                {/* ─── 1. Primary Image & Media (Top Priority) ─── */}
                                <section className="space-y-4 p-5 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-200/60 dark:border-blue-900/40 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                                                1. Project Cover Image
                                            </h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Primary hero visual for the portfolio showcase and case study hero.
                                            </p>
                                        </div>
                                        {formData.image_url && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">
                                                Image Configured
                                            </span>
                                        )}
                                    </div>

                                    {/* Primary Image Preview Card */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                                        <div className="md:col-span-1">
                                            {formData.image_url ? (
                                                <div className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-900 aspect-video md:aspect-[4/3] shadow-md">
                                                    <img 
                                                        src={formData.image_url} 
                                                        alt="Cover Preview" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                                        <a 
                                                            href={formData.image_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="px-2.5 py-1 bg-white/90 text-gray-900 rounded-md text-xs font-bold inline-flex items-center gap-1 shadow"
                                                        >
                                                            <Eye className="w-3 h-3" /> View Original
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateField('image_url', '')}
                                                            className="px-2.5 py-1 bg-red-600 text-white rounded-md text-xs font-bold inline-flex items-center gap-1 shadow"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 aspect-video md:aspect-[4/3] flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                                    <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                                                    <span className="text-xs font-medium">No cover image</span>
                                                    <span className="text-[10px] text-gray-500">Upload a file or paste URL</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Direct URL input & File Upload Button */}
                                        <div className="md:col-span-2 space-y-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                                                    Image URL
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={formData.image_url || ''}
                                                        onChange={(e) => updateField('image_url', e.target.value)}
                                                        placeholder="https://res.cloudinary.com/... or paste image URL"
                                                        className="w-full p-2 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#161616] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    />
                                                    {formData.image_url && (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateField('image_url', '')}
                                                            className="px-2.5 text-xs text-gray-500 hover:text-red-500 border border-gray-200 dark:border-gray-700 rounded-lg"
                                                            title="Clear input"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Styled File Upload Dropzone / Button */}
                                            <div>
                                                <input
                                                    ref={primaryFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePrimaryImageUpload}
                                                    className="hidden"
                                                    id="primary-image-file-input"
                                                />
                                                <label
                                                    htmlFor="primary-image-file-input"
                                                    className={`w-full cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-blue-400 dark:border-blue-700 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-xs font-bold text-blue-600 dark:text-blue-400 ${
                                                        uploading ? 'opacity-60 pointer-events-none' : ''
                                                    }`}
                                                >
                                                    {uploading ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Uploading to Cloudinary...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <UploadCloud className="w-4 h-4" />
                                                            Upload New File from Device (PNG, JPG, WebP)
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* ─── 2. Basic Info ─────────────────────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>2. Project Details</SectionTitle>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Title *</label>
                                            <input
                                                required
                                                value={formData.title}
                                                onChange={(e) => updateField('title', e.target.value)}
                                                placeholder="e.g. Wodibenuah Fair Exhibition Website"
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Slug *</label>
                                            <input
                                                required
                                                value={formData.slug}
                                                onChange={(e) => updateField('slug', e.target.value)}
                                                placeholder="e.g. wodibenuah-fair"
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold mb-1">
                                            Tagline <span className="text-gray-400 font-normal text-[11px]">(One-line value proposition)</span>
                                        </label>
                                        <input
                                            value={formData.tagline || ''}
                                            onChange={(e) => updateField('tagline', e.target.value)}
                                            placeholder="A modern digital platform for international craft fairs."
                                            className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold mb-1">
                                            Summary <span className="text-gray-400 font-normal text-[11px]">(1-2 paragraph overview)</span>
                                        </label>
                                        <textarea
                                            value={formData.summary || ''}
                                            onChange={(e) => updateField('summary', e.target.value)}
                                            rows={2}
                                            placeholder="A brief executive overview of the project and impact."
                                            className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                        />
                                    </div>
                                </section>

                                {/* ─── 3. Classification & Category Presets ─── */}
                                <section className="space-y-4">
                                    <SectionTitle>3. Classification & Category</SectionTitle>
                                    
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-xs font-bold">Category</label>
                                            <span className="text-[11px] text-gray-400">Click preset or enter custom</span>
                                        </div>
                                        
                                        {/* Quick-select chips */}
                                        <div className="flex gap-1.5 flex-wrap mb-2">
                                            {(CATEGORY_PRESETS[activeDivision] || []).map((cat) => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => updateField('category', cat)}
                                                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                                                        formData.category === cat
                                                            ? 'bg-blue-600 text-white font-bold'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>

                                        <input
                                            value={formData.category || ''}
                                            onChange={(e) => updateField('category', e.target.value)}
                                            className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                            placeholder="e.g. Web Platforms, E-Commerce, SaaS, Business Systems"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Industry</label>
                                            <input
                                                value={formData.industry || ''}
                                                onChange={(e) => updateField('industry', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                                placeholder="e.g. Exhibitions & Trade"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Year</label>
                                            <input
                                                value={formData.year || ''}
                                                onChange={(e) => updateField('year', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm font-mono"
                                                placeholder="2024"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Duration</label>
                                            <input
                                                value={formData.duration || ''}
                                                onChange={(e) => updateField('duration', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                                placeholder="e.g. 6 weeks"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Role</label>
                                            <input
                                                value={formData.role || ''}
                                                onChange={(e) => updateField('role', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                                placeholder="Lead Engineer"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Workflow Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => updateField('status', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                            >
                                                <option value="PUBLISHED">PUBLISHED (Public)</option>
                                                <option value="DRAFT">DRAFT (Hidden)</option>
                                                <option value="ARCHIVED">ARCHIVED</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Status Badge Label</label>
                                            <input
                                                value={formData.status_label || ''}
                                                onChange={(e) => updateField('status_label', e.target.value)}
                                                placeholder="e.g. Live, In Production"
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Display Order</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.display_order}
                                                onChange={(e) => updateField('display_order', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm font-mono"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ─── 4. Multi-Image Gallery ────────────────── */}
                                <section className="space-y-4 p-5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-900/20">
                                    <div className="flex justify-between items-center flex-wrap gap-2">
                                        <div>
                                            <SectionTitle>4. Case Study Gallery ({formData.gallery?.length || 0} Frames)</SectionTitle>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Additional showcase frames rendered inside the project's case study gallery.
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddUrlInput((v) => !v)}
                                                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add URL
                                            </button>
                                            
                                            <input
                                                ref={galleryInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleGalleryUpload}
                                                className="hidden"
                                                id="gallery-file-input"
                                            />
                                            <label
                                                htmlFor="gallery-file-input"
                                                className={`px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${
                                                    galleryUploading ? 'opacity-50 pointer-events-none' : ''
                                                }`}
                                            >
                                                {galleryUploading ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <UploadCloud className="w-3.5 h-3.5" />
                                                )}
                                                Upload Images
                                            </label>
                                        </div>
                                    </div>

                                    {/* Add Image by URL Panel */}
                                    <AnimatePresence>
                                        {showAddUrlInput && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-3 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-xl space-y-2"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <input
                                                        type="url"
                                                        value={newGalleryUrl}
                                                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                                                        placeholder="Image URL (https://...)"
                                                        className="p-2 text-xs rounded-lg border dark:border-gray-700 bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={newGalleryAlt}
                                                        onChange={(e) => setNewGalleryAlt(e.target.value)}
                                                        placeholder="Caption / Description"
                                                        className="p-2 text-xs rounded-lg border dark:border-gray-700 bg-transparent"
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={newGalleryDevice}
                                                            onChange={(e) => setNewGalleryDevice(e.target.value)}
                                                            className="p-2 text-xs rounded-lg border dark:border-gray-700 bg-transparent flex-1"
                                                        >
                                                            <option value="desktop">Desktop</option>
                                                            <option value="mobile">Mobile</option>
                                                            <option value="tablet">Tablet</option>
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={addGalleryUrl}
                                                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold shrink-0"
                                                        >
                                                            Add Frame
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Gallery Frames List */}
                                    {formData.gallery && formData.gallery.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                                            {formData.gallery.map((g, i) => (
                                                <div 
                                                    key={i} 
                                                    className="group relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-900 shadow-sm flex flex-col"
                                                >
                                                    <div className="relative h-28 w-full bg-black/40 overflow-hidden">
                                                        <img 
                                                            src={g.src} 
                                                            alt={g.alt || `Frame ${i + 1}`} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                        <div className="absolute top-1 left-1 bg-black/75 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                            #{i + 1}
                                                        </div>
                                                        <div className="absolute top-1 right-1 bg-black/75 backdrop-blur-sm text-white text-[9px] uppercase px-1.5 py-0.5 rounded">
                                                            {g.device || 'desktop'}
                                                        </div>
                                                    </div>

                                                    <div className="p-2 bg-white dark:bg-[#161616] flex-1 flex flex-col justify-between gap-1.5">
                                                        <input
                                                            type="text"
                                                            value={g.alt || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormData(prev => {
                                                                    const copy = [...(prev.gallery || [])];
                                                                    copy[i] = { ...copy[i], alt: val };
                                                                    return { ...prev, gallery: copy };
                                                                });
                                                            }}
                                                            placeholder="Caption..."
                                                            className="w-full text-[11px] p-1 border border-gray-200 dark:border-gray-800 rounded bg-transparent"
                                                        />
                                                        
                                                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-gray-100 dark:border-gray-800">
                                                            <div className="flex gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveGalleryItem(i, -1)}
                                                                    disabled={i === 0}
                                                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30 text-xs"
                                                                    title="Move backward"
                                                                >
                                                                    <ArrowUp className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => moveGalleryItem(i, 1)}
                                                                    disabled={i === formData.gallery.length - 1}
                                                                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 disabled:opacity-30 text-xs"
                                                                    title="Move forward"
                                                                >
                                                                    <ArrowDown className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => setGalleryAsPrimary(g)}
                                                                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                                                                title="Set as main cover image"
                                                            >
                                                                Make Cover
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeGalleryItem(i)}
                                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                                                title="Delete image"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic py-2">
                                            No additional gallery frames added yet. Click "Upload Images" or "Add URL" above.
                                        </p>
                                    )}
                                </section>

                                {/* ─── 5. Tech Stack & Features ──────────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>5. Tech Stack & Key Features</SectionTitle>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-1">
                                                Tech Stack <span className="text-gray-400 font-normal text-[11px]">(comma separated)</span>
                                            </label>
                                            <input
                                                value={techStackInput}
                                                onChange={(e) => setTechStackInput(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm font-mono"
                                                placeholder="React, Tailwind CSS, PostgreSQL, Supabase"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">
                                                Features <span className="text-gray-400 font-normal text-[11px]">(comma separated)</span>
                                            </label>
                                            <input
                                                value={featuresInput}
                                                onChange={(e) => setFeaturesInput(e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                                placeholder="Real-time syncing, Interactive maps, Role-based auth"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Live URL (Demo / Production)</label>
                                            <input
                                                value={formData.live_url || ''}
                                                onChange={(e) => updateField('live_url', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold mb-1">Repo URL</label>
                                            <input
                                                value={formData.repo_url || ''}
                                                onChange={(e) => updateField('repo_url', e.target.value)}
                                                className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm font-mono"
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* ─── 6. Full Write-Up / Markdown ──────────── */}
                                <section className="space-y-4">
                                    <SectionTitle>6. Detailed Case Study Write-Up</SectionTitle>
                                    <div>
                                        <label className="block text-xs font-bold mb-1">
                                            Content (Markdown / HTML supported)
                                        </label>
                                        <textarea
                                            value={formData.content || ''}
                                            onChange={(e) => updateField('content', e.target.value)}
                                            className="w-full p-3 rounded-lg border dark:border-gray-800 bg-transparent text-sm font-mono"
                                            rows={6}
                                            placeholder="Write comprehensive case study details, technical decisions, and architecture overview."
                                        />
                                    </div>
                                </section>

                                {/* ─── 7. Division-Specific Meta ─────────────── */}
                                {metaFields.length > 0 && (
                                    <section className="space-y-4">
                                        <SectionTitle>
                                            {activeDivision === 'SURVEY' ? 'Survey Specifics' : 'Drone Specifics'}
                                        </SectionTitle>
                                        <div className="grid grid-cols-2 gap-4">
                                            {metaFields.map((m) => (
                                                <div key={m.key}>
                                                    <label className="block text-xs font-bold mb-1">{m.label}</label>
                                                    <input
                                                        value={formData.meta?.[m.key] ?? ''}
                                                        onChange={(e) => updateField('meta', {
                                                            ...(formData.meta || {}),
                                                            [m.key]: e.target.value,
                                                        })}
                                                        className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent text-sm"
                                                        placeholder={m.placeholder}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* ─── 8. Structured JSONB Sections (Collapsible) ─── */}
                                <section className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setJsonbOpen((v) => !v)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 text-left">
                                            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                                                Advanced Case Study Fields (JSON)
                                            </span>
                                            {Object.keys(jsonbErrors).length > 0 && (
                                                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                                                    Syntax error in JSON
                                                </span>
                                            )}
                                        </div>
                                        {jsonbOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
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
                                                <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-800">
                                                    <p className="text-xs text-gray-500">
                                                        Edit structured data blocks (Challenge, Solution, Results, System Flow, Architecture, Metrics).
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

                                {/* Modal Footer with Save Actions */}
                                <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-[#111] -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-xs border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || galleryUploading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
                                    >
                                        {uploading || galleryUploading ? 'Uploading Media...' : (editingProject ? 'Save Project Changes' : 'Create Project')}
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

const SectionTitle = ({ children }) => (
    <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-2">
        {children}
    </h3>
);

export default AdminPortfolio;
