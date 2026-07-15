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
// ──────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const DIVISION_META = {
    SOFTWARE: { label: 'Software', tone: 'blue' },
    SURVEY:   { label: 'Survey',   tone: 'amber' },
    DRONE:    { label: 'Drone',    tone: 'indigo' },
};

const AdminPortfolio = ({ lockedDivision }) => {
    const activeDivision = lockedDivision || 'SOFTWARE';
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '', slug: '', summary: '', content: '',
        image_url: '', live_url: '', repo_url: '',
        division: activeDivision, status: 'DRAFT',
        location: '', client_name: '', category: '',
        display_order: 0, tags: [], tech_stack: [], features: [],
    });
    const [tagsInput, setTagsInput] = useState('');
    const [techStackInput, setTechStackInput] = useState('');
    const [featuresInput, setFeaturesInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [apiProjects, setApiProjects] = useState([]);

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

    const handleOpenEdit = (project = null) => {
        if (project) {
            setEditingProject(project.id);
            setFormData({
                title: project.title,
                slug: project.slug,
                summary: project.summary || '',
                content: project.content || '',
                image_url: project.image_url || '',
                live_url: project.live_url || '',
                repo_url: project.repo_url || '',
                division: activeDivision,
                status: project.status || 'DRAFT',
                location: project.location || '',
                client_name: project.client_name || '',
                category: project.category || '',
                display_order: project.display_order || 0,
                tags: project.tags || [],
                tech_stack: project.tech_stack || [],
                features: project.features || [],
            });
            setTagsInput((project.tags || []).join(', '));
            setTechStackInput((project.tech_stack || []).join(', '));
            setFeaturesInput((project.features || []).join(', '));
        } else {
            setEditingProject(null);
            setFormData({
                title: '', slug: '', summary: '', content: '',
                image_url: '', live_url: '', repo_url: '',
                division: activeDivision, status: 'DRAFT',
                location: '', client_name: '', category: '',
                display_order: 0, tags: [], tech_stack: [], features: [],
            });
            setTagsInput('');
            setTechStackInput('');
            setFeaturesInput('');
        }
        setIsEditModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            setFormData(prev => ({ ...prev, image_url: data.url }));
        } catch (err) {
            alert('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const url = editingProject ? `/projects/${editingProject}` : '/projects';
            const payload = {
                ...formData,
                // Convert comma-separated tags input into the
                // array the API expects. Trim + drop empties so
                // accidental double-spaces don't create blanks.
                tags: tagsInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                tech_stack: techStackInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                features: featuresInput
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean),
                category: formData.category || null,
                // Empty string → null so the URL validator
                // doesn't reject the empty form.
                image_url: formData.image_url || null,
                live_url: formData.live_url || null,
                repo_url: formData.repo_url || null,
                location: formData.location || null,
                client_name: formData.client_name || null,
                display_order: Number(formData.display_order) || 0,
                // Force the division to the workspace lock.
                division: activeDivision,
            };
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
            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const projectList = useMemo(() => {
        return apiProjects.filter((p) => p.division === activeDivision);
    }, [apiProjects, activeDivision]);

    if (loading) return <div>Loading...</div>;

    const headerTitle = `${DIVISION_META[activeDivision]?.label || activeDivision} Portfolio`;
    const headerSubtitle = `Manage the showcase items visible on the public ${DIVISION_META[activeDivision]?.label || activeDivision} homepage.`;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold">{headerTitle}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{headerSubtitle}</p>
                </div>
                <div className="flex gap-2 items-center">

                    <button
                        onClick={() => handleOpenEdit()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"
                    >
                        + New Project
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectList.map(p => (
                    <div key={p.id} className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl bg-white dark:bg-[#111] flex flex-col gap-3">
                        {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover rounded-lg" />}
                        <h3 className="text-lg font-bold">{p.title}</h3>
                        <p className="text-sm text-gray-500">{p.slug}</p>
                        <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded w-fit">{p.status}</span>
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
                            <button onClick={() => handleOpenEdit(p)} className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded font-bold text-sm text-center">Edit</button>
                            <button onClick={() => handleDelete(p.id)} className="flex-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-bold text-sm">Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">{editingProject ? 'Edit Project' : 'New Project'}</h2>
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-gray-500">✕</button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Title</label>
                                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Slug</label>
                                        <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
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
                                        <label className="block text-sm font-bold mb-1">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent">
                                            <option value="DRAFT">DRAFT</option>
                                            <option value="PUBLISHED">PUBLISHED</option>
                                            <option value="ARCHIVED">ARCHIVED</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Summary</label>
                                    <textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" rows={2} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Location <span className="text-gray-400 font-normal text-xs">(Survey / Drone)</span></label>
                                        <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" placeholder="e.g. Lagos, Nigeria" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Client / Site Name</label>
                                        <input value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Tags <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                                        <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" placeholder="e.g. aerial-survey, lidar, ncaa" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Category</label>
                                        <input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" placeholder="e.g. Full-Stack, E-Commerce" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Tech Stack <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                                        <input value={techStackInput} onChange={e => setTechStackInput(e.target.value)} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" placeholder="e.g. React, Node.js, PostgreSQL" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Features <span className="text-gray-400 font-normal text-xs">(comma separated)</span></label>
                                        <input value={featuresInput} onChange={e => setFeaturesInput(e.target.value)} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" placeholder="e.g. Real-time chat, GPS tracking" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Display Order</label>
                                        <input type="number" min="0" value={formData.display_order} onChange={e => setFormData({...formData, display_order: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" />
                                    </div>
                                    <div></div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">Write Up / Content (Markdown/HTML)</label>
                                    <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" rows={10} placeholder="Write your full project case study or details here..." />
                                </div>

                                <div className="space-y-2 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                                    <label className="block text-sm font-bold">Primary Project Image</label>
                                    <p className="text-xs text-gray-500 mb-2">This is the main image shown on the portfolio grid.</p>
                                    {formData.image_url && (
                                        <div className="relative w-fit">
                                            <img src={formData.image_url} alt="Primary Preview" className="h-40 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                                            <button type="button" onClick={() => setFormData({...formData, image_url: ''})} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md">✕</button>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    {uploading && <span className="text-xs text-blue-500 font-bold">Uploading to Cloudinary...</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Live URL</label>
                                        <input value={formData.live_url} onChange={e => setFormData({...formData, live_url: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Repo URL</label>
                                        <input value={formData.repo_url} onChange={e => setFormData({...formData, repo_url: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" />
                                    </div>
                                </div>



                                <div className="pt-4 flex gap-3">
                                    <button type="submit" disabled={uploading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold disabled:opacity-50">
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

export default AdminPortfolio;
