import React from 'react';

const CheckIcon = ({ className = '' }) => (
  <svg
    className={`w-5 h-5 text-accent ${className}`}
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 12a9 9 0 1118 0 9 9 0 01-18 0z"
    />
  </svg>
);

export default CheckIcon;
