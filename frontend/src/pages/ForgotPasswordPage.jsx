import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.ok) {
        setSuccessMessage(
          res.data?.message || 'If an account exists with this email, a password reset link has been dispatched.'
        );
      } else {
        setError(res.data?.error || res.error || 'Failed to send reset link. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center px-6 pt-20 pb-12 font-body">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-[#141414] p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-bold text-xl font-heading shadow-lg shadow-accent/30">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white">
            Reset Your Password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Enter your email address and we'll send you a secure link to choose a new password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-bold text-sm">Check your inbox</p>
                <p className="mt-1 leading-relaxed text-gray-700 dark:text-gray-300">{successMessage}</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="btn-primary w-full inline-flex items-center justify-center"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-accent text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Dispatching link...' : 'Send Reset Link →'}
            </button>

            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <Link to="/login" className="hover:text-accent flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Admin Login
              </Link>
              <Link to="/portal/login" className="hover:text-accent transition-colors">
                Client Portal
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
