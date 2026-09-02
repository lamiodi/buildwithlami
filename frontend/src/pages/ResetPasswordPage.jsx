import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        password,
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(res.data?.error || res.error || 'Failed to reset password. The link may have expired.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white">
            Choose New Password
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            Enter your new password below. It must be at least 8 characters long.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-bold text-sm">Password reset complete</p>
                <p className="mt-1 leading-relaxed text-gray-700 dark:text-gray-300">
                  Your new credentials have been safely encrypted and saved. You can now log in to your account.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/login"
                className="btn-primary flex-1 inline-flex items-center justify-center"
              >
                Admin Login
              </Link>
              <Link
                to="/portal/login"
                className="btn-secondary flex-1 inline-flex items-center justify-center"
              >
                Client Portal
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="pwd" className="block text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="pwd"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-accent text-sm transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPwd" className="block text-xs uppercase font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPwd"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white focus:outline-none focus:border-accent text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Updating password...' : 'Save New Password →'}
            </button>

            <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-center text-xs text-gray-500 dark:text-gray-400">
              <Link to="/login" className="hover:text-accent transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
