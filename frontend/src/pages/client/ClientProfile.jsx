import React, { useState } from 'react';
import { api } from '../../services/api';
import { useClientAuth } from '../../contexts/ClientAuthContext';
import { User, Lock, Save } from 'lucide-react';
import { notify } from '../../services/notify';

export default function ClientProfile() {
    const { clientUser, checkSession } = useClientAuth();
    const [name, setName] = useState(clientUser?.name || '');
    const [phone, setPhone] = useState(clientUser?.phone || '');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.put('/api/client-portal/profile', {
                name: name || undefined,
                phone: phone || undefined,
                password: password || undefined
            });

            if (res.ok) {
                notify.success('Profile updated successfully');
                setPassword(''); // clear password field
                await checkSession(); // refresh context
            } else {
                const err = await res.json();
                notify.error(err.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Profile update error:', err);
            notify.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="text-accent" />
                Profile Settings
            </h1>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update your contact information or change your password.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            disabled
                            value={clientUser?.email || ''}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-md text-gray-500 cursor-not-allowed sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:ring-accent focus:border-accent text-gray-900 dark:text-white sm:text-sm transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:ring-accent focus:border-accent text-gray-900 dark:text-white sm:text-sm transition-colors"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-white/10">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <Lock size={14} /> New Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-300 dark:border-white/20 rounded-md shadow-sm focus:ring-accent focus:border-accent text-gray-900 dark:text-white sm:text-sm transition-colors"
                            placeholder="Leave blank to keep current"
                            minLength={6}
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 transition-colors"
                        >
                            <Save size={16} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
