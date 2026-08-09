import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Clock, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Skeleton from '../../components/Skeleton';
import { Link } from 'react-router-dom';

export default function ClientTimeline() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/client-portal/projects');
            if (res.ok && res.data) {
                const data = res.data;
                const processed = data.map(p => {
                    let parsedMilestones = [];
                    if (typeof p.milestones === 'string') {
                        try { parsedMilestones = JSON.parse(p.milestones); } catch (e) { /* ignore */ }
                    } else if (Array.isArray(p.milestones)) {
                        parsedMilestones = p.milestones;
                    }

                    if (!parsedMilestones.length) {
                        parsedMilestones = [
                            { title: "Discovery & Planning", status: "PENDING" },
                            { title: "Design & Prototyping", status: "PENDING" },
                            { title: "Development", status: "PENDING" },
                            { title: "Testing & QA", status: "PENDING" },
                            { title: "Deployment", status: "PENDING" }
                        ];
                    }
                    return { ...p, milestones: parsedMilestones };
                });
                setProjects(processed);
            }
        } catch (err) {
            console.error('Failed to fetch projects for timeline', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48 rounded-lg" />
                <Skeleton className="h-64 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="text-accent" />
                Project Timeline
            </h1>

            {projects.length === 0 ? (
                <div className="bg-white dark:bg-card p-12 rounded-xl border border-gray-100 dark:border-white/10 text-center shadow-sm">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active timelines</h3>
                    <p className="text-gray-500 dark:text-gray-400">You don't have any projects with active milestones yet.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {projects.map(project => (
                        <div key={project.id} className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden p-6 lg:p-8">
                            <div className="flex justify-between items-start mb-8 border-b border-gray-100 dark:border-white/10 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {project.project_name}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Started on {new Date(project.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                    project.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                    project.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
                                    'bg-accent/10 text-accent'
                                }`}>
                                    {project.status}
                                </span>
                            </div>

                            <div className="relative">
                                {/* Desktop horizontal view */}
                                <div className="hidden lg:flex items-center justify-between relative">
                                    {/* Connecting Line */}
                                    <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-white/10 -z-10 transform translate-y-1/2"></div>
                                    
                                    {project.milestones.map((milestone, idx) => {
                                        const isCompleted = milestone.status === 'COMPLETED';
                                        const isInProgress = milestone.status === 'IN_PROGRESS';
                                        const isPending = milestone.status === 'PENDING';

                                        return (
                                            <div key={idx} className="flex flex-col items-center relative z-10 w-32">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-card border-2 ${
                                                    isCompleted ? 'border-green-500 text-green-500' :
                                                    isInProgress ? 'border-accent text-accent shadow-[0_0_15px_rgba(var(--color-accent),0.3)]' :
                                                    'border-gray-300 dark:border-gray-700 text-gray-300 dark:text-gray-700'
                                                }`}>
                                                    {isCompleted ? <CheckCircle2 size={24} /> : <Circle size={16} className={isInProgress ? "fill-accent" : ""} />}
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <p className={`text-sm font-semibold ${
                                                        isCompleted ? 'text-gray-900 dark:text-white' :
                                                        isInProgress ? 'text-accent' :
                                                        'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        {milestone.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                                                        {milestone.status.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Mobile vertical view */}
                                <div className="lg:hidden space-y-6 relative border-l-2 border-gray-200 dark:border-white/10 ml-4">
                                    {project.milestones.map((milestone, idx) => {
                                        const isCompleted = milestone.status === 'COMPLETED';
                                        const isInProgress = milestone.status === 'IN_PROGRESS';

                                        return (
                                            <div key={idx} className="relative pl-8">
                                                <div className={`absolute -left-[17px] top-0 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-card border-2 ${
                                                    isCompleted ? 'border-green-500 text-green-500' :
                                                    isInProgress ? 'border-accent text-accent shadow-sm' :
                                                    'border-gray-300 dark:border-gray-700 text-gray-300 dark:text-gray-700'
                                                }`}>
                                                    {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={12} className={isInProgress ? "fill-accent" : ""} />}
                                                </div>
                                                <div>
                                                    <p className={`text-base font-semibold ${
                                                        isCompleted ? 'text-gray-900 dark:text-white' :
                                                        isInProgress ? 'text-accent' :
                                                        'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                        {milestone.title}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                                                        {milestone.status.replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
