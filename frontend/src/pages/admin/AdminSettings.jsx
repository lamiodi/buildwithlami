import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { notify } from '../../services/notify';

const Icon = {
    User: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Link: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7-7l-1.41 1.41" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7 7l1.41-1.41" />
        </svg>
    ),
    Save: (p) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 7 9 7" /><polyline points="7 10 12 15 17 10" />
        </svg>
    ),
};

const PasswordSection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changing, setChanging] = useState(false);
    const [pwError, setPwError] = useState('');

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwError('');
        if (newPassword !== confirmPassword) {
            setPwError('New passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setPwError('Password must be at least 6 characters.');
            return;
        }
        setChanging(true);
        const res = await api.put('/auth/password', {
            currentPassword,
            newPassword,
        });
        if (res.ok) {
            notify.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setPwError(res.error || 'Failed to change password.');
        }
        setChanging(false);
    };

    return (
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
            </div>
            <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
            </div>
            <div>
                <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
                />
            </div>
            {pwError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 font-body">
                    {pwError}
                </div>
            )}
            <button
                type="submit"
                disabled={changing}
                className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 font-body inline-flex items-center gap-2"
            >
                {changing ? 'Changing…' : 'Change Password'}
            </button>
        </form>
    );
};

const AdminSettings = () => {
    const [profile, setProfile] = useState({
        full_name: '',
        headline: '',
        bio: '',
        resume_url: '',
        avatar_url: '',
        social_links: { github: '', linkedin: '', twitter: '' }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchProfile = async () => {
        const res = await api.get('/profile');
        if (res.ok && res.data) {
            setProfile({ ...res.data, social_links: res.data.social_links || { github: '', linkedin: '', twitter: '' } });
        }
        setLoading(false);
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            social_links: { ...prev.social_links, [name]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await api.put('/profile', profile);
        if (res.ok) {
            notify.success('Profile updated successfully!');
        } else {
            notify.error(res.error || 'Failed to update profile.');
        }
        setSaving(false);
    };

    const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
    const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2";

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="animate-pulse text-gray-400 text-sm font-medium">Loading settings…</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <div className="max-w-4xl mx-auto w-full">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-accent to-orange-500 bg-clip-text text-transparent font-heading">
                            Admin Settings
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-body">Manage your public profile and social links.</p>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type="text" name="full_name" value={profile.full_name || ''} onChange={handleChange} required className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Professional Headline</label>
                                <input type="text" name="headline" value={profile.headline || ''} onChange={handleChange} placeholder="e.g. Full-Stack Developer" className={inputClass} />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Bio (Markdown supported)</label>
                            <textarea name="bio" rows="4" value={profile.bio || ''} onChange={handleChange} placeholder="Tell visitors about yourself..." className={inputClass} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Avatar URL</label>
                                <input type="url" name="avatar_url" value={profile.avatar_url || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Resume / CV URL</label>
                                <input type="url" name="resume_url" value={profile.resume_url || ''} onChange={handleChange} placeholder="https://..." className={inputClass} />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-4">Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>GitHub</label>
                                    <input type="url" name="github" value={profile.social_links?.github || ''} onChange={handleSocialChange} placeholder="https://github.com/..." className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>LinkedIn</label>
                                    <input type="url" name="linkedin" value={profile.social_links?.linkedin || ''} onChange={handleSocialChange} placeholder="https://linkedin.com/in/..." className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Twitter / X</label>
                                    <input type="url" name="twitter" value={profile.social_links?.twitter || ''} onChange={handleSocialChange} placeholder="https://twitter.com/..." className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                            <h3 className="font-bold font-heading text-gray-900 dark:text-white mb-4">Change Password</h3>
                            <PasswordSection />
                        </div>

                        <button type="submit" disabled={saving}
                            className="bg-accent hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 font-body inline-flex items-center gap-2"
                        >
                            <Icon.Save className="w-4 h-4" />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminSettings;