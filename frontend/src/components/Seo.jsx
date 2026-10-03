import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applySeo, getSeo, isProjectPath } from '../seo.js';

export default function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Detail pages own their metadata once their asynchronous data is available.
    if (!isProjectPath(pathname)) applySeo(getSeo(pathname));
  }, [pathname]);
  return null;
}
