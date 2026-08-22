import React from 'react';

/**
 * Wraps React.lazy() with automatic page reload retry on dynamic import failure.
 * This resolves the common SPA issue where a new deployment invalidates old chunk hashes,
 * causing "Failed to fetch dynamically imported module" errors for users on stale sessions.
 */
export function lazyWithRetry(componentImport) {
  return React.lazy(async () => {
    const sessionKey = `retry_import_${componentImport.toString().slice(0, 40)}`;
    const hasRetried = sessionStorage.getItem(sessionKey);

    try {
      const module = await componentImport();
      sessionStorage.removeItem(sessionKey);
      return module;
    } catch (error) {
      if (!hasRetried) {
        sessionStorage.setItem(sessionKey, 'true');
        // Force refresh to get latest index.html and fresh chunk assets
        window.location.reload();
        return new Promise(() => {}); // Pause while reloading
      }
      sessionStorage.removeItem(sessionKey);
      throw error;
    }
  });
}
