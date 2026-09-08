import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * FilePreviewModal
 * Lightweight in-app preview for an image or PDF asset.
 *
 * Props:
 *  - file: { src, type: 'image' | 'pdf', title } | null
 *  - onClose: () => void
 */
const FilePreviewModal = ({ file, onClose }) => {
  const shouldReduce = useReducedMotion();

  // ESC key support + body scroll lock while open
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!file) return undefined;
    document.addEventListener('keydown', handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [file, handleKey]);

  const isOpen = Boolean(file);
  const isImage = file?.type === 'image';
  const isPdf = file?.type === 'pdf';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="file-preview-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={file?.title || 'File preview'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduce ? 0 : 0.2 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: shouldReduce ? 1 : 0.96, y: shouldReduce ? 0 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduce ? 1 : 0.96, y: shouldReduce ? 0 : 10 }}
            transition={{ duration: shouldReduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent font-bold block">
                  File Preview
                </span>
                <h3 className="text-sm sm:text-base font-heading font-bold text-black dark:text-white truncate">
                  {file?.title || 'Preview'}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={file?.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-md border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  Open
                </a>
                <a
                  href={file?.src}
                  download
                  className="text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-md bg-accent text-white hover:opacity-90 transition-opacity"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close preview"
                  className="w-9 h-9 inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto bg-gray-100 dark:bg-[#0c0c0c] flex items-center justify-center p-3 sm:p-6">
              {isImage && (
                <img
                  src={file.src}
                  alt={file.title || 'Preview'}
                  className="max-w-full max-h-[75vh] object-contain rounded-md shadow-lg"
                  loading="lazy"
                  decoding="async"
                />
              )}
              {isPdf && (
                <iframe
                  title={file.title || 'PDF Preview'}
                  src={`${file.src}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-[75vh] rounded-md border border-gray-200 dark:border-white/10 bg-white"
                />
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 sm:px-6 py-2 text-[10px] font-mono uppercase tracking-widest text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-white/10 text-center">
              Press ESC or click outside to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FilePreviewModal;