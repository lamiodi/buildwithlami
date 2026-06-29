import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { setAuthToken, getAuthToken } from '../services/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getAuthToken()) {
      const from = location.state?.from || '/admin';
      navigate(from, { replace: true });
    }
  }, [navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await api.post('/auth/login', { email, password });
    if (res.ok && res.data && res.data.token) {
      setAuthToken(res.data.token, res.data.user);
      const from = location.state?.from || '/admin';
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center px-6 pt-20 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent to-orange-600 text-white flex items-center justify-center font-bold text-xl font-heading shadow-lg shadow-accent/30">
            Ob
          </div>
          <h1 className="text-2xl font-extrabold font-heading text-gray-900 dark:text-white">Admin Sign In</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-body">
            Sign in to access the agency dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 font-body">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
            />
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 font-body">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-accent/30 disabled:opacity-50 font-body"
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          <Link to="/" className="hover:text-accent transition-colors font-body">
            ← Back to homepage
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
