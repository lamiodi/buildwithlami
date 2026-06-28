import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Skeleton, SkeletonTransition } from '../components/Skeleton';
import { buttonHover, buttonTap } from '../utils/motion';
import { api } from '../services/api';
import { notify } from '../services/notify';

const DRAFT_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const draftKey = (formId, trackingId) => `intake_draft_${formId}_${trackingId}`;

const fieldKey = (field) => field.id || field.key || field.label || `field_${field.name || 'unknown'}`;

const FormSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-8 bg-slate-900 space-y-4">
        <Skeleton variant="text" width="120px" height="20px" className="mx-auto" />
        <Skeleton variant="text" width="60%" height="40px" className="mx-auto" />
        <Skeleton variant="text" width="40%" height="20px" className="mx-auto" />
      </div>
      <div className="p-8 space-y-6">
        {[1, 2, 3].map(n => (
          <div key={n} className="space-y-2">
            <Skeleton variant="text" width="100px" height="20px" />
            <Skeleton variant="rectangular" width="100%" height="48px" />
          </div>
        ))}
        <Skeleton variant="rectangular" width="100%" height="56px" />
      </div>
    </div>
  );
};

const ClientIntakeForm = () => {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('track');
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();

  const [formConfig, setFormConfig] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dynamic responses mapping field label -> value
  const [responses, setResponses] = useState({});

  // Load drafted responses from localStorage (with 30-day expiry).
  useEffect(() => {
    if (formId && trackingId) {
      const savedDraft = localStorage.getItem(draftKey(formId, trackingId));
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === 'object' && parsed._ts) {
            if (Date.now() - parsed._ts < DRAFT_MAX_AGE_MS) {
              setResponses(parsed.responses || {});
            } else {
              // Expired — drop it.
              localStorage.removeItem(draftKey(formId, trackingId));
            }
          } else {
            // Legacy draft without _ts — upgrade it.
            setResponses(parsed);
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }
    }
  }, [formId, trackingId]);

  const handleResponseChange = (label, value) => {
    setResponses(prev => {
      const newResponses = { ...prev, [label]: value };
      if (formId && trackingId) {
        localStorage.setItem(
          draftKey(formId, trackingId),
          JSON.stringify({ responses: newResponses, _ts: Date.now() })
        );
      }
      return newResponses;
    });
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch template (public endpoint)
        const templateRes = await api.get(`/templates/${formId}`, { signal: controller.signal });
        if (!templateRes.ok) throw new Error(templateRes.error || 'Intake form template not found');
        setFormConfig(templateRes.data);

        if (trackingId) {
          // Public endpoint — returns project metadata only (no billing).
          const projectRes = await api.get(`/client-projects/track/${trackingId}`, { signal: controller.signal });
          if (projectRes.ok && projectRes.data) {
            setProject(projectRes.data);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => controller.abort();
  }, [formId, trackingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project) {
      notify.error('Project session missing. Please open this form using the start button inside your tracking portal.');
      return;
    }
    setSubmitting(true);
    // Backend requires a CLIENT JWT for /submit-intake. The portal stores the
    // token in sessionStorage under "clientToken" after successful auth.
    const token = sessionStorage.getItem('clientToken');
    const res = await api.post(
      '/submit-intake',
      { projectId: project.id, responses },
      token ? { token } : {}
    );
    if (res.ok) {
      setSubmitted(true);
      if (formId && trackingId) {
        localStorage.removeItem(draftKey(formId, trackingId));
      }
    } else {
      notify.error(res.error || 'Failed to submit form. Please verify your fields and try again.');
    }
    setSubmitting(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 text-red-500 font-bold">
        {error}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center pt-20 px-6 transition-colors duration-300">
        <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl text-center border border-gray-100 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner font-bold">✓</div>
          <h2 className="text-3xl font-extrabold mb-3 text-black dark:text-white">Intake Completed!</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8 leading-relaxed font-medium">
            Your intake details have been securely submitted and encrypted. I will review them and begin setting up your staging environment.
          </p>
          {trackingId && (
            <motion.button 
              onClick={() => navigate(`/track/${trackingId}`)}
              whileHover={shouldReduce ? {} : buttonHover}
              whileTap={shouldReduce ? {} : buttonTap}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg"
            >
              Go to Project Tracker
            </motion.button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background pt-24 pb-12 px-6 transition-colors duration-300">
      <SkeletonTransition isLoading={loading} skeleton={<FormSkeleton />}>
        {formConfig && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            
            <div className="border-b border-gray-100 dark:border-gray-700 p-8 text-center bg-slate-900 text-white">
              <span className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Project Onboarding Intake</span>
              <h1 className="text-3xl font-bold mb-2">{formConfig.name || formConfig.title}</h1>
              {project && <p className="text-slate-300 mt-2 text-sm font-medium">Project: <strong className="text-white">{project.project_name}</strong> &middot; Client: <strong className="text-white">{project.client_name}</strong></p>}
              {formConfig.description && <p className="text-slate-200 mt-3 text-xs leading-relaxed max-w-lg mx-auto font-medium">{formConfig.description}</p>}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-6">
                {(formConfig.schema || formConfig.fields || []).map((field, idx) => (
                  <div key={field.id || idx}>
                    <label className="block font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200 cursor-pointer">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input 
                        type="text" 
                        required={field.required}
                        value={responses[fieldKey(field)] || ''}
                        onChange={(e) => handleResponseChange(fieldKey(field), e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-black dark:text-white" 
                      />
                    )}
                    
                    {field.type === 'email' && (
                      <input 
                        type="email" 
                        required={field.required}
                        value={responses[fieldKey(field)] || ''}
                        onChange={(e) => handleResponseChange(fieldKey(field), e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-black dark:text-white" 
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea 
                        required={field.required}
                        rows={4}
                        value={responses[fieldKey(field)] || ''}
                        onChange={(e) => handleResponseChange(fieldKey(field), e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-black dark:text-white resize-y min-h-[100px]" 
                      />
                    )}

                    {field.type === 'select' && (
                      <select 
                        required={field.required}
                        value={responses[fieldKey(field)] || ''}
                        onChange={(e) => handleResponseChange(fieldKey(field), e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-black dark:text-white" 
                      >
                        <option value="" disabled>Select an option...</option>
                        {field.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {field.type === 'checkbox' && (
                      <div className="space-y-2 mt-2">
                        {field.options?.map((opt, i) => (
                          <label key={i} className="flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200 cursor-pointer">
                            <input 
                              type="checkbox"
                              name={field.label}
                              value={opt}
                              checked={responses[field.label]?.includes(opt) || false}
                              onChange={(e) => {
                                const currentVals = responses[field.label] || [];
                                if (e.target.checked) {
                                  handleResponseChange(field.label, [...currentVals, opt]);
                                } else {
                                  handleResponseChange(field.label, currentVals.filter(v => v !== opt));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 cursor-pointer"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <motion.button 
                type="submit" 
                disabled={submitting}
                whileHover={shouldReduce || submitting ? {} : buttonHover}
                whileTap={shouldReduce || submitting ? {} : buttonTap}
                className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-blue-500/20 disabled:opacity-50"
              >
                {submitting ? 'Submitting Responses...' : 'Submit Answers'}
              </motion.button>
            </form>
          </div>
        )}
      </SkeletonTransition>
    </div>
  );
};

export default ClientIntakeForm;
