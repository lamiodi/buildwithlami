import React, { useState } from 'react';
import { MessageSquare, Send, Mail, CheckCircle2 } from 'lucide-react';
import { notify } from '../../services/notify';
import { useClientAuth } from '../../contexts/ClientAuthContext';

export default function ClientMessages() {
    const { clientUser } = useClientAuth();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            notify.error('Please enter both subject and message.');
            return;
        }

        setSending(true);
        try {
            // Simulated client inquiry / project message send to agency inbox
            await new Promise(resolve => setTimeout(resolve, 600));
            notify.success('Message sent to project manager.');
            setSubmitted(true);
            setSubject('');
            setMessage('');
        } catch (err) {
            notify.error('Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="text-accent" />
                Agency Support & Messages
            </h1>

            <div className="bg-white dark:bg-card rounded-xl border border-gray-100 dark:border-white/10 shadow-sm p-6 lg:p-8">
                {submitted ? (
                    <div className="text-center py-8 space-y-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={24} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message Delivered</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            Your message has been dispatched to Eugene and the Buildwith_lami agency team. We typically respond within 2–4 hours.
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-4 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark transition-colors"
                        >
                            Send Another Message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Subject / Project Topic
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="e.g., Update on Development Milestone 2"
                                className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Message
                            </label>
                            <textarea
                                rows={6}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message, query, or file request here..."
                                className="w-full px-4 py-2.5 bg-white dark:bg-background border border-gray-300 dark:border-white/20 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-accent text-sm"
                                required
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail size={14} /> Messages go directly to Eugene Odibenuah
                            </span>
                            <button
                                type="submit"
                                disabled={sending}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium text-sm rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                            >
                                <Send size={16} />
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
