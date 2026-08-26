import React from 'react';

/**
 * High-taste geometric check icon for feature lists, deliverable matrices, and scope guarantees.
 */
const CheckIcon = ({ className = '' }) => (
  <svg
    className={`w-4 h-4 shrink-0 text-accent ${className}`}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M13.25 4.75L6 12L2.75 8.75"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CheckIcon;
