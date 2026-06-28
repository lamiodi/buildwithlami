import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton, SkeletonTransition } from '../components/Skeleton';
import { staggerContainer, fadeUpItem, cardHover, cardHoverTransition, buttonHover, buttonTap, reducedMotionVariants } from '../utils/motion';
import { api } from '../services/api';
import { notify } from '../services/notify';

const TrackerSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-slate-900 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <Skeleton variant="text" width="150px" height="16px" />
            <Skeleton variant="text" width="60%" height="32px" />
            <Skeleton variant="text" width="40%" height="16px" />
          </div>
          <div>
            <Skeleton variant="rectangular" width="140px" height="60px" className="rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main stages */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-6">
          <Skeleton variant="text" width="200px" height="24px" />
          {[1, 2, 3].map(n => (
            <div key={n} className="flex gap-4">
              <Skeleton variant="circular" width="20px" height="20px" className="shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" width="150px" height="20px" />
                <Skeleton variant="text" width="80px" height="15px" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-4">
            <Skeleton variant="text" width="100px" height="15px" />
            {[1, 2, 3].map(n => (
              <div key={n} className="space-y-2">
                <Skeleton variant="text" width="80px" height="12px" />
                <Skeleton variant="text" width="140px" height="18px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientProjectTracker = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!sessionStorage.getItem(`clientToken_${trackingId}`));
  const [clientToken, setClientToken] = useState(() => sessionStorage.getItem(`clientToken_${trackingId}`));
  const [authEmail, setAuthEmail] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Secret & feedback state — moved up here for readability (previously declared
  // after the handlers that used them).
  const [secretKeyName, setSecretKeyName] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [secretSubmitting, setSecretSubmitting] = useState(false);
  const [secretSuccess, setSecretSuccess] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [feedback, setFeedback] = useState([]);

  const tokenRef = useRef(clientToken);
  tokenRef.current = clientToken;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError('');

    const res = await api.post(`/client-projects/track/${trackingId}/auth`, { email: authEmail });
    if (res.ok && res.data && res.data.token) {
      sessionStorage.setItem(`clientToken_${trackingId}`, res.data.token);
      sessionStorage.setItem('clientToken', res.data.token); // Also store a generic key for the intake form
      setClientToken(res.data.token);
      setIsAuthenticated(true);
    } else {
      setAuthError(res.error || 'Authentication failed. Please check your email.');
    }
    setAuthSubmitting(false);
  };

  const handleFeedbackSubmit = async (e, stageIndex) => {
    e.preventDefault();
    const comment = e.target.comment.value;
    if (!comment) return;
    const res = await api.post('/feedback/submit', { projectId: project.id, stageIndex, clientComment: comment }, { token: tokenRef.current });
    if (res.ok && res.data) {
      setFeedback((prev) => [...prev, res.data]);
      e.target.reset();
    } else {
      notify.error(res.error || 'Failed to submit feedback.');
    }
  };

  const handleSecretSubmit = async (e) => {
    e.preventDefault();
    if (!secretKeyName || !secretValue) return;
    setSecretSubmitting(true);
    const res = await api.post(`/secrets/track/${trackingId}/submit`, { keyName: secretKeyName, value: secretValue }, { token: tokenRef.current });
    if (res.ok) {
      setSecretSuccess(true);
      setSecretKeyName('');
      setSecretValue('');
      setTimeout(() => setSecretSuccess(false), 5000);
    } else {
      notify.error(res.error || 'Failed to submit credential. Please try again.');
    }
    setSecretSubmitting(false);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchProject = async () => {
      try {
        const res = await api.get(`/client-projects/track/${trackingId}`, { signal: controller.signal });
        if (!res.ok) throw new Error(res.error || 'Project not found or invalid link');
        setProject(res.data);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();

    return () => controller.abort();
  }, [trackingId]);

  useEffect(() => {
    if (!isAuthenticated || !project?.id || !tokenRef.current) return;

    const controller = new AbortController();

    const fetchSecureData = async () => {
      const opts = { token: tokenRef.current, signal: controller.signal };
      const [invRes, fbRes] = await Promise.all([
        api.get(`/invoices/project/${project.id}`, opts),
        api.get(`/feedback/project/${project.id}`, opts),
      ]);
      if (invRes.ok && invRes.data) setInvoices(invRes.data);
      if (fbRes.ok && fbRes.data) setFeedback(fbRes.data);
    };
    fetchSecureData();

    return () => controller.abort();
  }, [isAuthenticated, project?.id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 text-red-500 font-bold">
        {error}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6">
        <TrackerSkeleton />
      </div>
    );
  }

  if (!project) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6 flex items-center justify-center transition-colors duration-300">
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700"
        >
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">Secure Client Portal</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-sm font-medium">
            Please enter your primary contact email address to access your project tracker and secure vault.
          </p>
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <input 
                type="email" 
                required
                placeholder="Enter your email"
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            {authError && <p className="text-red-500 text-xs font-semibold">{authError}</p>}
            <motion.button 
              type="submit" 
              disabled={authSubmitting}
              whileHover={shouldReduce || authSubmitting ? {} : buttonHover}
              whileTap={shouldReduce || authSubmitting ? {} : buttonTap}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 disabled:opacity-50"
            >
              {authSubmitting ? 'Verifying...' : 'Access Portal'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ONBOARDING: Force Intake Form if not completed
  if (project.intake_form_id && !project.intake_completed) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6 flex items-center justify-center transition-colors duration-300">
        <motion.div 
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700"
        >
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">Welcome, {project.client_name}!</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium">
            I'm excited to start working on <strong>{project.project_name}</strong>. Before we dive into the creative process, I need a few details from you.
          </p>
          <motion.button 
            onClick={() => navigate(`/form/${project.intake_form_id}?track=${trackingId}`)}
            whileHover={shouldReduce ? {} : buttonHover}
            whileTap={shouldReduce ? {} : buttonTap}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30"
          >
            Start Project Intake →
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // OFFBOARDING: Launch & Handoff Dashboard
  if (project.status === 'LAUNCHED' || project.status === 'MAINTENANCE' || project.status === 'ARCHIVED') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-background pt-24 pb-12 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Celebration Header */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl shadow-lg overflow-hidden text-white relative">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="p-10 md:p-14 text-center relative z-10">
              <span className="inline-block bg-purple-500/30 text-purple-200 px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-6">
                Project Launched 🚀
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{project.project_name} is Live!</h1>
              <p className="text-purple-200 text-lg max-w-2xl mx-auto font-medium">
                Congratulations! Your project has been successfully deployed. Below you will find your final assets, training materials, and support options.
              </p>
              {project.domain_name && (
                <motion.a 
                  href={`https://${project.domain_name}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  whileHover={shouldReduce ? {} : buttonHover}
                  whileTap={shouldReduce ? {} : buttonTap}
                  className="inline-block mt-8 bg-white text-purple-900 font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform shadow-xl"
                >
                  Visit Live Website
                </motion.a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Vault */}
            {project.assets_url && (
              <motion.a 
                href={project.assets_url} 
                target="_blank" 
                rel="noreferrer" 
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className="block bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">Asset Vault</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Download your final logo files, brand guidelines, and high-res imagery.</p>
              </motion.a>
            )}

            {/* Video Training */}
            {project.training_video_url && (
              <motion.a 
                href={project.training_video_url} 
                target="_blank" 
                rel="noreferrer" 
                whileHover={shouldReduce ? {} : cardHover}
                transition={cardHoverTransition}
                className="block bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-black dark:text-white">Video Training</h3>
                <p className="text-gray-700 dark:text-gray-300 font-medium">Watch the recorded tutorials on how to edit and manage your new website.</p>
              </motion.a>
            )}
            
            {/* Maintenance Upsell */}
            {project.maintenance_plan_url && project.payment_type !== 'MONTHLY' && (
              <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl shadow-lg p-1 text-white">
                <div className="bg-white dark:bg-gray-900 rounded-[22px] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Maintenance & Support Package 🛡️</h3>
                    <p className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">Includes 4 Months Free After Launch</p>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 font-medium">
                      Every project includes <strong className="font-bold text-gray-900 dark:text-white">4 months of free maintenance immediately after launch</strong> to cover early fixes, stability checks, and support. 
                      After that, this recommended annual package covers <strong className="font-bold text-gray-900 dark:text-white">Premium Hosting</strong>, <strong className="font-bold text-gray-900 dark:text-white">Domain Renewal</strong>, <strong className="font-bold text-gray-900 dark:text-white">Security Updates</strong>, and <strong className="font-bold text-gray-900 dark:text-white">Technical Support</strong> so your site stays reliable, secure, and current long-term.
                    </p>
                    <p className="text-gray-900 dark:text-white font-bold">₦99,000 <span className="text-gray-700 dark:text-gray-400 font-bold text-xs uppercase tracking-widest">/ Per Year All-inclusive</span></p>
                  </div>
                  <motion.a 
                    href={project.maintenance_plan_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                    className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-blue-500/30 whitespace-nowrap"
                  >
                    Secure My Site →
                  </motion.a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE PROJECT: Tracking Pipeline
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6 transition-colors duration-300">
      <SkeletonTransition isLoading={loading} skeleton={<TrackerSkeleton />}>
        {project && (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
          >
            
            {/* Header */}
            <motion.div variants={item} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="bg-slate-900 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-slate-300 uppercase tracking-widest text-sm font-bold mb-2">Active Project Tracker</p>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.project_name}</h1>
                  <p className="text-slate-200 font-medium">Welcome back, {project.client_name}</p>
                </div>
                <div className="text-center">
                  <div className="inline-block bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white px-6 py-3 rounded-2xl font-extrabold text-2xl">
                    {project.progress}% Done
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Main Column: Stages Pipeline */}
              <motion.div variants={item} className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-black dark:text-white">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </span>
                    Development Pipeline
                  </h2>
                  
                  {/* Async Comm CTA instead of Booking */}
                  <motion.a 
                    href={`https://wa.me/2348012345678?text=Hi%20Eugene,%20I%20have%20some%20feedback%20regarding%20the%20${project.project_name}%20project.`} 
                    target="_blank" 
                    rel="noreferrer"
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                    className="flex items-center gap-2 bg-[#25D366]/10 text-[#075E54] dark:text-[#25D366] hover:bg-[#25D366]/20 py-2 px-4 rounded-xl text-sm font-bold transition-colors border border-[#25D366]/20"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.405-.883-.733-1.479-1.639-1.653-1.937-.173-.298-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                    Drop a Voice Note
                  </motion.a>
                </div>
                
                <div className="relative border-l-2 border-gray-100 dark:border-gray-700 ml-4 space-y-8 pb-4">
                  {project.stages && project.stages.map((stage, idx) => {
                    const isCompleted = stage.status === 'COMPLETED';
                    const isInProgress = stage.status === 'IN_PROGRESS';
                    return (
                      <div key={idx} className="relative pl-10">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 ${isCompleted ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : isInProgress ? 'bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        
                        <div>
                          <h3 className={`font-bold text-lg ${isCompleted ? 'text-gray-900 dark:text-white' : isInProgress ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {stage.name}
                          </h3>
                          <p className={`text-xs mt-1 uppercase font-bold tracking-wider ${isCompleted ? 'text-green-600' : isInProgress ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                            {stage.status.replace('_', ' ')}
                          </p>

                          {/* Feedback UI for this stage */}
                          {(isCompleted || isInProgress) && (
                            <div className="mt-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">Stage Feedback</h4>
                              
                              {/* List existing feedback for this stage */}
                              <div className="space-y-3 mb-3">
                                {feedback.filter(f => f.stage_index === idx).map(f => (
                                  <div key={f.id} className="text-sm">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">"{f.client_comment}"</p>
                                    {f.admin_reply && (
                                      <div className="mt-2 ml-4 pl-3 border-l-2 border-blue-500 text-blue-800 dark:text-blue-300">
                                        <span className="text-xs font-bold block mb-1">Agency Reply:</span>
                                        {f.admin_reply}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <form onSubmit={(e) => handleFeedbackSubmit(e, idx)} className="flex gap-2">
                                <input 
                                  name="comment" 
                                  type="text" 
                                  placeholder="Request revision or leave comment..." 
                                  className="flex-1 text-sm p-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 text-black dark:text-white"
                                />
                                <motion.button 
                                  type="submit" 
                                  whileHover={shouldReduce ? {} : buttonHover}
                                  whileTap={shouldReduce ? {} : buttonTap}
                                  className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                                >
                                  Send
                                </motion.button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Sidebar: Details & Billing */}
              <div className="space-y-6">
                
                {/* Domain & Billing */}
                <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-700 dark:text-gray-300">Account Summary</h3>
                  <ul className="space-y-5">
                    {project.domain_name && (
                      <li>
                        <span className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Domain Name</span>
                        <a href={`https://${project.domain_name}`} target="_blank" rel="noreferrer" className="text-gray-900 dark:text-white font-medium hover:text-blue-600">{project.domain_name}</a>
                      </li>
                    )}
                    {project.domain_expiration && (
                      <li>
                        <span className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Domain Expiration</span>
                        <span className="font-medium text-gray-900 dark:text-white">{new Date(project.domain_expiration).toLocaleDateString()}</span>
                      </li>
                    )}
                    <li className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Billing Status</span>
                      {project.payment_status === 'PAID' ? (
                        <span className="font-bold text-green-600 text-xl flex items-center gap-1">Paid ✓</span>
                      ) : (
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-red-600 text-xl">${parseFloat(project.amount_due || 0).toFixed(2)}</span>
                          {project.payment_status && (
                            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-2 py-0.5 rounded">
                              {project.payment_status}
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                    {project.payment_type === 'MONTHLY' && (
                      <li>
                        <span className="block text-xs text-gray-700 dark:text-gray-300 mb-1">Monthly Retainer</span>
                        <span className="font-bold text-green-600">${parseFloat(project.monthly_fee).toFixed(2)} / mo</span>
                      </li>
                    )}
                  </ul>
                </motion.div>

                {/* Invoices List */}
                {invoices.length > 0 && (
                  <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-700 dark:text-gray-300">Invoices & Payments</h3>
                    <div className="space-y-4">
                      {invoices.map(inv => (
                        <div key={inv.id} className="border border-gray-100 dark:border-gray-700 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg text-black dark:text-white">${Number(inv.amount).toLocaleString()}</span>
                            <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${
                              inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          {inv.due_date && (
                            <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                          )}
                          {inv.status === 'PENDING' && inv.payment_url && (
                            <motion.a 
                              href={inv.payment_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              whileHover={shouldReduce ? {} : buttonHover}
                              whileTap={shouldReduce ? {} : buttonTap}
                              className="block text-center w-full bg-black text-white dark:bg-white dark:text-black py-2 rounded-lg text-sm font-bold shadow-md transition-transform"
                            >
                              Pay Now via Paystack
                            </motion.a>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Staging Credentials Vault Link */}
                <motion.div variants={item} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-sm uppercase tracking-wider">Secret Vault</h3>
                  <p className="text-xs text-blue-800/70 dark:text-blue-200/70 mb-5 leading-relaxed font-medium">
                    Securely provide your domain or hosting credentials using AES-256-CBC encryption.
                  </p>
                  
                  {secretSuccess ? (
                    <div className="bg-green-100 text-green-800 p-3 rounded-xl text-xs font-bold text-center border border-green-200">
                      ✓ Credential Secured
                    </div>
                  ) : (
                    <form onSubmit={handleSecretSubmit} className="space-y-3">
                      <input 
                        type="text" 
                        placeholder="Identifier (e.g. GoDaddy)" 
                        value={secretKeyName}
                        onChange={e => setSecretKeyName(e.target.value)}
                        required
                        className="w-full p-2.5 text-sm border border-blue-200 dark:border-blue-700/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                      />
                      <input 
                        type="password" 
                        placeholder="Password / API Key" 
                        value={secretValue}
                        onChange={e => setSecretValue(e.target.value)}
                        required
                        className="w-full p-2.5 text-sm border border-blue-200 dark:border-blue-700/50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-black dark:text-white"
                      />
                      <motion.button 
                        type="submit" 
                        disabled={secretSubmitting}
                        whileHover={shouldReduce || secretSubmitting ? {} : buttonHover}
                        whileTap={shouldReduce || secretSubmitting ? {} : buttonTap}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md hover:shadow-blue-500/30 text-sm disabled:opacity-50"
                      >
                        {secretSubmitting ? 'Encrypting...' : 'Secure Submit'}
                      </motion.button>
                    </form>
                  )}
                </motion.div>

                {/* Intake Form Resubmission */}
                {project.intake_form_id && project.intake_completed && (
                  <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm text-center">
                    <h3 className="font-bold text-gray-950 dark:text-white mb-2 text-sm uppercase tracking-wider">Project Intake</h3>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-4 leading-relaxed font-medium">
                      Need to update your requirements or fix a typo in your submission?
                    </p>
                    <motion.button 
                      onClick={() => navigate(`/form/${project.intake_form_id}?track=${trackingId}`)}
                      whileHover={shouldReduce ? {} : buttonHover}
                      whileTap={shouldReduce ? {} : buttonTap}
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2.5 rounded-xl transition-all shadow-sm text-sm"
                    >
                      Edit Submission
                    </motion.button>
                  </motion.div>
                )}

                {/* Secure Credentials Submission Vault */}
                <motion.div variants={item} className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h3 className="font-bold text-gray-950 dark:text-white mb-2 flex items-center gap-2">
                    <span className="text-blue-600">🔐</span> Secure Credentials Vault
                  </h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mb-4 leading-relaxed font-medium">
                    Need to securely share database keys, API tokens, or client log-ins? Upload them to our industry-standard **AES-256-CBC** encrypted server vault. Write-only for maximum safety.
                  </p>

                  {secretSuccess ? (
                    <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-xl text-center text-xs font-semibold animate-pulse border border-green-200 dark:border-green-800/30">
                      ✓ Encrypted and uploaded successfully!
                    </div>
                  ) : (
                    <form onSubmit={handleSecretSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Service Name / Identifier</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Paystack Secret Key, AWS, DNS Login"
                          value={secretKeyName}
                          onChange={e => setSecretKeyName(e.target.value)}
                          className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Credential Value</label>
                        <input 
                          type="password" 
                          required
                          placeholder="••••••••••••"
                          value={secretValue}
                          onChange={e => setSecretValue(e.target.value)}
                          className="w-full p-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 text-black dark:text-white"
                        />
                      </div>
                      <motion.button 
                        type="submit" 
                        disabled={secretSubmitting}
                        whileHover={shouldReduce || secretSubmitting ? {} : buttonHover}
                        whileTap={shouldReduce || secretSubmitting ? {} : buttonTap}
                        className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md text-sm disabled:opacity-50"
                      >
                        {secretSubmitting ? 'Encrypting...' : 'Securely Send Key'}
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </SkeletonTransition>
    </div>
  );
};

export default ClientProjectTracker;
