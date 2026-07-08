import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const AdminPortfolio = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '', slug: '', summary: '', content: '', image_url: '', live_url: '', repo_url: '', status: 'DRAFT'
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects');
            if (!res.ok) throw new Error(res.error || 'Failed to fetch projects');
            setProjects(res.data);
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
                status: project.status || 'DRAFT'
            });
        } else {
            setEditingProject(null);
            setFormData({
                title: '', slug: '', summary: '', content: '', image_url: '', live_url: '', repo_url: '', status: 'DRAFT'
            });
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
            const res = editingProject 
                ? await api.put(url, formData)
                : await api.post(url, formData);

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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Portfolio Projects</h1>
                <button 
                    onClick={() => handleOpenEdit()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                    + New Project
                </button>
            </div>

            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(p => (
                    <div key={p.id} className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl bg-white dark:bg-[#111] flex flex-col gap-3">
                        {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover rounded-lg" />}
                        <h3 className="text-lg font-bold">{p.title}</h3>
                        <p className="text-sm text-gray-500">{p.slug}</p>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded w-fit">{p.status}</span>
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

                                <div>
                                    <label className="block text-sm font-bold mb-1">Summary</label>
                                    <textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent" rows={2} />
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

                                <div>
                                    <label className="block text-sm font-bold mb-1">Status</label>
                                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 rounded-lg border dark:border-gray-800 bg-transparent">
                                        <option value="DRAFT">DRAFT</option>
                                        <option value="PUBLISHED">PUBLISHED</option>
                                        <option value="ARCHIVED">ARCHIVED</option>
                                    </select>
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
