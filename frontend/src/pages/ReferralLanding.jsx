import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../services/api';

// ─── ReferralLanding (/ref/:code — §55) ───────────────────
// Public landing for a client's referral link. Thanks the
// visitor in the referrer's name, records the hit, and routes
// them to the contact page. No personal data — just the name.

const ReferralLanding = () => {
  const { code } = useParams();
  const [referrer, setReferrer] = useState(null);
  const [state, setState] = useState('loading'); // loading | ready | invalid

  useEffect(() => {
    let alive = true;
    (async () => {
      const lookup = await api.get(`/aftercare/public/referrals/${code}`);
      if (!alive) return;
      if (!lookup.ok) { setState('invalid'); return; }
      setReferrer(lookup.data.referrer_name);
      setState('ready');
      // Fire-and-forget hit counter.
      api.post(`/aftercare/public/referrals/${code}/hit`, {}).catch(() => {});
    })();
    return () => { alive = false; };
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-24 bg-gray-50 dark:bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-lg w-full text-center bg-white dark:bg-[#141414] rounded-3xl border border-gray-100 dark:border-gray-800/60 shadow-sm p-10 md:p-14"
      >
        {state === 'loading' && (
          <p className="text-sm text-gray-400 font-body animate-pulse">Checking your referral…</p>
        )}

        {state === 'invalid' && (
          <>
            <p className="text-4xl mb-4">🤝</p>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white mb-3">
              This referral link isn't active
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body leading-relaxed mb-8">
              No worries — you can still reach BuildWithLami directly.
            </p>
            <Link to="/contact" className="inline-block bg-accent hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
              Get in touch
            </Link>
          </>
        )}

        {state === 'ready' && (
          <>
            <p className="text-4xl mb-4">🤝</p>
            <div className="bwl-eyebrow mb-3 justify-center">
              <span className="w-2 h-2 bg-accent inline-block" />
              <span>Friend of BuildWithLami</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-gray-900 dark:text-white leading-snug mb-3">
              {referrer} thinks we should talk.
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body leading-relaxed mb-8">
              You've been referred by one of our clients. Tell us what you're building and get the same care they did — web, software, surveying and drone work under one roof.
            </p>
            <Link to="/contact" className="inline-block bg-accent hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-accent/30 text-sm font-body">
              Start the conversation
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ReferralLanding;
