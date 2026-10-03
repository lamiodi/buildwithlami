import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo, getSeo } from '../seo.js';

export function useProjectSeo(project, loading, error) {
  const { pathname } = useLocation();
  useEffect(() => {
    applySeo(getSeo(pathname, { project, loading, missing: Boolean(error) || (!loading && !project?.title) }));
  }, [pathname, project, loading, error]);
}
