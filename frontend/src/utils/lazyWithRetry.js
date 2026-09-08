import React from 'react';

/**
 * Wraps React.lazy() with resilient dynamic import failure handling.
 * Resolves SPA chunk-hash invalidation on new deployments without hanging Suspense.
 */
export function lazyWithRetry(componentImport) {
  return React.lazy(async () => {
    const fnStr = componentImport.toString();
    const match = fnStr.match(/['"]([^'"]+)['"]/);
    const identifier = match ? match[1].replace(/[^a-zA-Z0-9_-]/g, '_') : fnStr.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const sessionKey = `retry_import_${identifier}`;
    const hasRetried = sessionStorage.getItem(sessionKey);

    try {
      const module = await componentImport();
      sessionStorage.removeItem(sessionKey);
      return module;
    } catch (error) {
      if (!hasRetried) {
        sessionStorage.setItem(sessionKey, 'true');
        window.location.reload();
        throw new Error(`Reloading application for updated chunk: ${identifier}`);
      }
      sessionStorage.removeItem(sessionKey);
      throw error;
    }
  });
}
