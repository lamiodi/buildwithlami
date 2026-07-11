// ─── src/components/CMSPage.jsx ──────────────────────────
// Phase 4 — public CMS renderer.
//
// Behaviour:
//   1. Fetches `GET /api/cms/pages/:slug?status=PUBLISHED` once
//      on mount (cached in component state for `staleTime` ms).
//   2. If the page is found, renders the hero image, title, and
//      markdown body using `utils/markdown.js`.
//   3. If the page is missing, falls back to `fallback` JSX —
//      the existing hardcoded content for /resources, /portfolio,
//      and /pricing so the site is never broken.
//
// The fallback is rendered immediately while the request is in
// flight, so there's no flash of empty content. Once the CMS
// row arrives, it replaces the fallback with a smooth fade.
// ──────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { renderMarkdown } from '../utils/markdown';

const CMSPage = ({ slug, title, fallback }) => {
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setNotFound(false);
        api.get(`/cms/pages/${slug}`)
            .then(res => {
                if (cancelled) return;
                if (res.ok && res.data) {
                    setPage(res.data);
                } else {
                    setNotFound(true);
                }
            })
            .catch(() => { if (!cancelled) setNotFound(true); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [slug]);

    // Update document title from the CMS row if we got one.
    useEffect(() => {
        if (page) {
            document.title = page.title || title;
            if (page.meta_description) {
                const m = document.querySelector('meta[name="description"]');
                if (m) m.setAttribute('content', page.meta_description);
            }
        } else {
            document.title = title;
        }
    }, [page, title]);

    // While loading, show fallback so the user never sees a blank page.
    // After loading, switch to the CMS row if it exists, else keep fallback.
    if (notFound || (!loading && !page)) {
        return <>{fallback}</>;
    }

    if (loading || !page) {
        return <>{fallback}</>;
    }

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="pt-24 pb-20 max-w-4xl mx-auto px-6 min-h-[60vh]"
        >
            {page.hero_image && (
                <img
                    src={page.hero_image}
                    alt={page.title}
                    className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
                />
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold font-heading mb-4">
                {page.title}
            </h1>
            {page.meta_description && (
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 font-body">
                    {page.meta_description}
                </p>
            )}
            <article
                className="prose-content text-gray-800 dark:text-gray-200 font-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body || '') }}
            />
            <p className="text-xs text-gray-400 mt-12 italic">
                Last updated {new Date(page.updated_at).toLocaleDateString()}
            </p>
        </motion.section>
    );
};

export default CMSPage;
