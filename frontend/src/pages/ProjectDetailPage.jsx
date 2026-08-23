import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SecurityPopup from '../components/SecurityPopup';
import { api } from '../services/api';
import fallbackProjects from '../data/fallbackProjects';
import { Skeleton, SkeletonTransition } from '../components/Skeleton';
import {
  staggerContainer as centralStaggerContainer,
  fadeUpItem,
  cardHover,
  cardHoverTransition,
  buttonHover,
  buttonTap,
  sectionViewport,
  reducedMotionVariants,
} from '../utils/motion';
import { CONTACT } from '../config/contact';

// ─────────────────────────────────────────────────────────────────────────────
// Inline icon set
// Stroke-based, 1.5px line, 24x24 viewbox. Kept local to avoid pulling an
// icon dependency. Used across hero, features, flow, stack, architecture, and
// CTA sections. Decorative use is aria-hidden; meaningful use is labelled.
// ─────────────────────────────────────────────────────────────────────────────
const Icon = ({ name, className = 'w-5 h-5' }) => {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: 'false',
  };
  switch (name) {
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v3M16 3v3" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.25" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M21 19c0-2.3-1.7-4.2-4-4.5" />
        </svg>
      );
    case 'tag':
      return (
        <svg {...common}>
          <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9z" />
          <circle cx="7.5" cy="7.5" r="1.25" />
        </svg>
      );
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        </svg>
      );
    case 'monitor':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      );
    case 'server':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <path d="M7 7h.01M7 17h.01" />
        </svg>
      );
    case 'database':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="8" ry="3" />
          <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.4 8.5-8 9-4.6-.5-8-4-8-9V6l8-3z" />
        </svg>
      );
    case 'cloud':
      return (
        <svg {...common}>
          <path d="M7 18a4 4 0 0 1-.5-7.97A6 6 0 0 1 18 9.5 4.5 4.5 0 0 1 17.5 18H7z" />
        </svg>
      );
    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h3" />
        </svg>
      );
    case 'image':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.75" />
          <path d="M21 17l-5-5-9 8" />
        </svg>
      );
    case 'ticket':
      return (
        <svg {...common}>
          <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-2V8z" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'briefcase':
      return (
        <svg {...common}>
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'cpu':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
        </svg>
      );
    case 'terminal':
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'code':
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'zap':
      return (
        <svg {...common}>
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'external':
      return (
        <svg {...common}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'tablet':
      return (
        <svg {...common}>
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...common}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'camera':
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      );
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    case 'plane':
      return (
        <svg {...common}>
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
        </svg>
      );
    case 'box':
      return (
        <svg {...common}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case 'sliders':
      return (
        <svg {...common}>
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      );
    case 'award':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      );
    case 'printer':
      return (
        <svg {...common}>
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );
    case 'key':
      return (
        <svg {...common}>
          <path d="M21 2l-2 2m-1.5 1.5L16 4l-2 2 1.5 1.5L14 9l-1.5-1.5L11 9l-1.5-1.5L8 9" />
          <circle cx="7.5" cy="16.5" r="4.5" />
        </svg>
      );
    case 'help-circle':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'shopping-bag':
      return (
        <svg {...common}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      );
    case 'pie-chart':
      return (
        <svg {...common}>
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common}>
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg {...common}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      );
    case 'rss':
      return (
        <svg {...common}>
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1" />
        </svg>
      );
    case 'share':
      return (
        <svg {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      );
    case 'git-branch':
      return (
        <svg {...common}>
          <line x1="6" y1="3" x2="6" y2="15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M18 9a9 9 0 0 1-9 9" />
        </svg>
      );
    case 'git-commit':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
      );
    case 'git-pull-request':
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
      );
    case 'alert-circle':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'info':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'radio':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'tool':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'bar-chart-2':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'activity':
      return (
        <svg {...common}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'maximize':
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case 'minimize':
      return (
        <svg {...common}>
          <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
        </svg>
      );
    case 'download':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'upload':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'hash':
      return (
        <svg {...common}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'sliders-v':
      return (
        <svg {...common}>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
          <line x1="6" y1="12" x2="6" y2="4" />
          <line x1="18" y1="20" x2="18" y2="14" />
          <line x1="18" y1="10" x2="18" y2="4" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case 'database-alt':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'cpu-alt':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'smartphone-alt':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'globe-alt':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'feather':
      return (
        <svg {...common}>
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      );
    case 'grid-alt':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'layers-alt':
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'folder':
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'terminal-alt':
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'code-alt':
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'git-commit-alt':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
      );
    case 'git-pull-request-alt':
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
      );
    case 'alert-circle-alt':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'check-circle-alt':
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'info-alt':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'radio-alt':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'tool-alt':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'settings-alt':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'refresh-alt':
      return (
        <svg {...common}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'bar-chart-2-alt':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'activity-alt':
      return (
        <svg {...common}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'maximize-alt':
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case 'minimize-alt':
      return (
        <svg {...common}>
          <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
        </svg>
      );
    case 'download-alt':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'upload-alt':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'hash-alt':
      return (
        <svg {...common}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'sliders-v-alt':
      return (
        <svg {...common}>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
          <line x1="6" y1="12" x2="6" y2="4" />
          <line x1="18" y1="20" x2="18" y2="14" />
          <line x1="18" y1="10" x2="18" y2="4" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case 'database-alt-2':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'cpu-alt-2':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'smartphone-alt-2':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'globe-alt-2':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'feather-alt':
      return (
        <svg {...common}>
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      );
    case 'grid-alt-2':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'layers-alt-2':
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'folder-alt':
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'terminal-alt-2':
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'code-alt-2':
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'git-commit-alt-2':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
      );
    case 'git-pull-request-alt-2':
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
      );
    case 'alert-circle-alt-2':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'check-circle-alt-2':
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'info-alt-2':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'radio-alt-2':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'tool-alt-2':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'settings-alt-2':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'refresh-alt-2':
      return (
        <svg {...common}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'bar-chart-2-alt-2':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'activity-alt-2':
      return (
        <svg {...common}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'maximize-alt-2':
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case 'minimize-alt-2':
      return (
        <svg {...common}>
          <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
        </svg>
      );
    case 'download-alt-2':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'upload-alt-2':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'hash-alt-2':
      return (
        <svg {...common}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'sliders-v-alt-2':
      return (
        <svg {...common}>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
          <line x1="6" y1="12" x2="6" y2="4" />
          <line x1="18" y1="20" x2="18" y2="14" />
          <line x1="18" y1="10" x2="18" y2="4" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case 'database-alt-3':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'cpu-alt-3':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'smartphone-alt-3':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'globe-alt-3':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'feather-alt-2':
      return (
        <svg {...common}>
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      );
    case 'grid-alt-3':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'layers-alt-3':
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'folder-alt-2':
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'terminal-alt-3':
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'code-alt-3':
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'git-commit-alt-3':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
      );
    case 'git-pull-request-alt-3':
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
      );
    case 'alert-circle-alt-3':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'check-circle-alt-3':
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'info-alt-3':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'radio-alt-3':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'tool-alt-3':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'settings-alt-3':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'refresh-alt-3':
      return (
        <svg {...common}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'bar-chart-2-alt-3':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'activity-alt-3':
      return (
        <svg {...common}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'maximize-alt-3':
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case 'minimize-alt-3':
      return (
        <svg {...common}>
          <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
        </svg>
      );
    case 'download-alt-3':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'upload-alt-3':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'hash-alt-3':
      return (
        <svg {...common}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'sliders-v-alt-3':
      return (
        <svg {...common}>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
          <line x1="6" y1="12" x2="6" y2="4" />
          <line x1="18" y1="20" x2="18" y2="14" />
          <line x1="18" y1="10" x2="18" y2="4" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case 'database-alt-4':
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      );
    case 'cpu-alt-4':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <line x1="9" y1="1" x2="9" y2="4" />
          <line x1="15" y1="1" x2="15" y2="4" />
          <line x1="9" y1="20" x2="9" y2="23" />
          <line x1="15" y1="20" x2="15" y2="23" />
          <line x1="20" y1="9" x2="23" y2="9" />
          <line x1="20" y1="14" x2="23" y2="14" />
          <line x1="1" y1="9" x2="4" y2="9" />
          <line x1="1" y1="14" x2="4" y2="14" />
        </svg>
      );
    case 'smartphone-alt-4':
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      );
    case 'globe-alt-4':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'feather-alt-3':
      return (
        <svg {...common}>
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      );
    case 'grid-alt-4':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'layers-alt-4':
      return (
        <svg {...common}>
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case 'folder-alt-3':
      return (
        <svg {...common}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'terminal-alt-4':
      return (
        <svg {...common}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case 'code-alt-4':
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case 'git-commit-alt-4':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
      );
    case 'git-pull-request-alt-4':
      return (
        <svg {...common}>
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" y1="9" x2="6" y2="21" />
        </svg>
      );
    case 'alert-circle-alt-4':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case 'check-circle-alt-4':
      return (
        <svg {...common}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'info-alt-4':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
    case 'radio-alt-4':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2" />
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
        </svg>
      );
    case 'tool-alt-4':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'settings-alt-4':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'refresh-alt-4':
      return (
        <svg {...common}>
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'bar-chart-2-alt-4':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'activity-alt-4':
      return (
        <svg {...common}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'maximize-alt-4':
      return (
        <svg {...common}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    case 'minimize-alt-4':
      return (
        <svg {...common}>
          <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7" />
        </svg>
      );
    case 'download-alt-4':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case 'upload-alt-4':
      return (
        <svg {...common}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case 'hash-alt-4':
      return (
        <svg {...common}>
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </svg>
      );
    case 'sliders-v-alt-4':
      return (
        <svg {...common}>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="12" y1="6" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
          <line x1="6" y1="12" x2="6" y2="4" />
          <line x1="18" y1="20" x2="18" y2="14" />
          <line x1="18" y1="10" x2="18" y2="4" />
          <circle cx="12" cy="8" r="2" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg {...common}>
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      );
    case 'arrow-down':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 13l7 7 7-7" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'sparkle':
      return (
        <svg {...common}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5L8 16M16 8l2.5-2.5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common}>
          <path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'lightbox':
      return (
        <svg {...common}>
          <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
        </svg>
      );
    default:
      return null;
  }
};

// Helper to map technology names to high-quality SVG icons (SimpleIcons CDN).
// Used by the Tech Stack section. Falls back to a neutral code mark.
const getTechIcon = (tech) => {
  const t = String(tech).toLowerCase();
  if (t.includes('react')) return 'https://cdn.simpleicons.org/react/61DAFB';
  if (t.includes('node')) return 'https://cdn.simpleicons.org/nodedotjs/339933';
  if (t.includes('postgres')) return 'https://cdn.simpleicons.org/postgresql/4169E1';
  if (t.includes('supabase')) return 'https://cdn.simpleicons.org/supabase/3ECF8E';
  if (t.includes('socket')) return 'https://cdn.simpleicons.org/socketdotio/ffffff';
  if (t.includes('vite')) return 'https://cdn.simpleicons.org/vite/646CFF';
  if (t.includes('tailwind')) return 'https://cdn.simpleicons.org/tailwindcss/06B6D4';
  if (t.includes('paystack')) return 'https://cdn.simpleicons.org/paystack/09A5DB';
  if (t.includes('pwa')) return 'https://cdn.simpleicons.org/pwa/5A0FC8';
  if (t.includes('indexeddb')) return 'https://cdn.simpleicons.org/databricks/ffffff';
  if (t.includes('rxdb')) return 'https://cdn.simpleicons.org/rxdb/8D1F89';
  if (t.includes('termii')) return 'https://cdn.simpleicons.org/twilio/ffffff';
  if (t.includes('redis')) return 'https://cdn.simpleicons.org/redis/DC382D';
  if (t.includes('cloudinary')) return 'https://cdn.simpleicons.org/cloudinary/3448C5';
  if (t.includes('jwt')) return 'https://cdn.simpleicons.org/jsonwebtokens/000000';
  if (t.includes('express')) return 'https://cdn.simpleicons.org/express/ffffff';
  if (t.includes('oauth')) return 'https://cdn.simpleicons.org/oauth/ffffff';
  if (t.includes('render')) return 'https://cdn.simpleicons.org/render/46E3B7';
  if (t.includes('vercel')) return 'https://cdn.simpleicons.org/vercel/ffffff';
  return 'https://cdn.simpleicons.org/codeigniter/ffffff';
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — high-fidelity placeholder for the case-study layout
// ─────────────────────────────────────────────────────────────────────────────
const ProjectDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6">
      <Skeleton variant="text" width="140px" height="20px" className="mx-auto" />
      <Skeleton variant="text" width="70%" height="64px" className="mx-auto" />
      <Skeleton variant="text" width="50%" height="40px" className="mx-auto" />
    </div>
    <div className="my-12">
      <Skeleton variant="rectangular" width="100%" height="0" className="aspect-video md:aspect-[21/9]" />
    </div>
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 py-12">
      <div className="md:col-span-4 space-y-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="space-y-2">
            <Skeleton variant="text" width="80px" height="14px" />
            <Skeleton variant="text" width="160px" height="22px" />
          </div>
        ))}
      </div>
      <div className="md:col-span-8 space-y-6">
        <Skeleton variant="text" width="240px" height="32px" />
        <Skeleton variant="text" width="100%" height="20px" />
        <Skeleton variant="text" width="100%" height="20px" />
        <Skeleton variant="text" width="80%" height="20px" />
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reusable: section header
// Editorial typography with eyebrow, headline, and optional lede.
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ eyebrow, title, lede, align = 'left', number }) => {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-3xl ${alignment} mb-12 md:mb-16`}>
      <div
        className={`flex items-center gap-3 text-[#0079FF] dark:text-[#389BFF] uppercase tracking-[0.25em] text-xs md:text-sm font-bold mb-5 ${
          align === 'center' ? 'justify-center' : ''
        }`}
      >
        {number && (
          <span className="text-[#0079FF]/80 dark:text-[#389BFF]/80 font-mono text-[11px] md:text-xs font-bold">{number}</span>
        )}
        <span>{eyebrow}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.05] text-black dark:text-white break-words">
        {title}
      </h2>
      {lede && (
        <p className="mt-5 text-base sm:text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light leading-relaxed max-w-2xl">
          {lede}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable: lightbox for the responsive gallery
// ─────────────────────────────────────────────────────────────────────────────
const Lightbox = ({ images, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, onClose, onPrev, onNext]);

  if (index === null) return null;
  const current = images[index];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Image preview"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 backdrop-blur-md"
          aria-label="Close image preview"
        >
          <Icon name="close" className="w-6 h-6" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-md"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-6 text-white/80 hover:text-white p-3 rounded-full bg-white/10 backdrop-blur-md"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        <motion.img
          key={index}
          src={current}
          alt=""
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        />

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs font-mono tracking-widest">
          {index + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const heroImageRef = useRef(null);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecurityPopup, setShowSecurityPopup] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const container = shouldReduce ? reducedMotionVariants : centralStaggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.ok && res.data?.data) {
          setProject(res.data.data);
        } else {
          const found = fallbackProjects.find((p) => p.slug === id || p.id.toString() === id);
          setProject(found || null);
        }
      } catch {
        const found = fallbackProjects.find((p) => p.slug === id || p.id.toString() === id);
        setProject(found || null);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project?.title) {
      document.title = `${project.title} — Software Case Study | BuildWithLami`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && project.summary) {
        metaDesc.setAttribute('content', project.summary);
      }
    }
  }, [project]);

  const imageUrl = project?.image_url || project?.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop';

  const galleryItems = useMemo(() => {
    if (!project) return [];
    if (Array.isArray(project.gallery) && project.gallery.length > 0) {
      return project.gallery.map((g, i) =>
        typeof g === 'string'
          ? { src: g, alt: `${project.title} screenshot ${i + 1}`, device: 'desktop' }
          : g
      );
    }
    return [
      { src: imageUrl, alt: `${project.title} — primary interface`, device: 'desktop' },
      {
        src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
        alt: `${project.title} — analytics dashboard`,
        device: 'desktop',
      },
      {
        src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
        alt: `${project.title} — operator workspace`,
        device: 'tablet',
      },
      {
        src: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop',
        alt: `${project.title} — mobile experience`,
        device: 'phone',
      },
    ];
  }, [project, imageUrl]);

  const quickStats = useMemo(() => {
    if (!project) return [];
    const s = project.stats || {};
    const list = [
      { label: 'Screens', value: s.screens, suffix: '' },
      { label: 'API Endpoints', value: s.endpoints, suffix: '' },
      { label: 'Database Tables', value: s.tables, suffix: '' },
      {
        label: 'Lighthouse',
        value: project.metrics?.lighthouse,
        suffix: '/100',
      },
      { label: 'Launch Year', value: project.year, suffix: '' },
    ];
    return list.filter((x) => x.value !== undefined && x.value !== null && x.value !== '');
  }, [project]);

  const relatedProjects = useMemo(() => {
    if (!project) return [];
    const source = fallbackProjects.filter((p) => p.id !== project.id);
    if (Array.isArray(project.relatedSlugs) && project.relatedSlugs.length > 0) {
      const resolved = project.relatedSlugs
        .map((slug) => source.find((p) => p.slug === slug || p.id.toString() === String(slug)))
        .filter(Boolean);
      if (resolved.length < 2) {
        const sameCategory = source
          .filter((p) => p.category === project.category && !resolved.includes(p))
          .slice(0, 2 - resolved.length);
        resolved.push(...sameCategory);
      }
      return resolved.slice(0, 2);
    }
    return source
      .filter((p) => p.category === project.category)
      .slice(0, 2)
      .concat(source.filter((p) => p.category !== project.category).slice(0, 2))
      .slice(0, 2);
  }, [project]);

  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + galleryItems.length) % galleryItems.length)),
    [galleryItems.length]
  );
  const nextImage = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % galleryItems.length)),
    [galleryItems.length]
  );

  if (!project && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black dark:text-white pt-24">
        <p>Project not found.</p>
      </div>
    );
  }

  const words = project?.title ? project.title.split(' ') : [];
  const firstHalf = words.slice(0, Math.ceil(words.length / 2)).join(' ');
  const secondHalf = words.slice(Math.ceil(words.length / 2)).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#07090E] text-black dark:text-white font-body overflow-x-hidden pt-24 pb-12 transition-colors duration-300 selection:bg-[#0079FF] selection:text-white">
      {/* Back link */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-8">
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-[#0079FF] dark:hover:text-[#389BFF] transition-colors group uppercase tracking-widest font-bold"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Portfolio
        </Link>
      </div>

      <SkeletonTransition isLoading={loading} skeleton={<ProjectDetailSkeleton />}>
        {project && (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                1. HERO — editorial split, metadata strip, quick stats
                ═══════════════════════════════════════════════════════════════ */}
            <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-8 md:pt-16 pb-12 md:pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-end">
                <motion.div
                  className="lg:col-span-8"
                  initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduce ? 0 : 0.6, ease: 'easeOut' }}
                >
                  <p className="text-[#0079FF] dark:text-[#389BFF] text-xs md:text-sm font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <span>Software Case Study</span>
                    <span className="w-8 h-px bg-[#0079FF]/40" aria-hidden="true" />
                    <span className="text-gray-700 dark:text-gray-300">{project.year}</span>
                  </p>
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] xl:text-[8rem] font-heading font-bold uppercase tracking-tight leading-[0.92] text-black dark:text-white break-words">
                    {firstHalf}
                    <br />
                    <span className="text-gray-700 dark:text-gray-300">{secondHalf}</span>
                  </h1>
                  {project.tagline && (
                    <p className="mt-8 text-xl md:text-2xl text-gray-700 dark:text-gray-200 font-light leading-relaxed max-w-2xl">
                      {project.tagline}
                    </p>
                  )}
                </motion.div>

                <motion.div
                  className="lg:col-span-4"
                  initial={shouldReduce ? {} : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduce ? 0 : 0.6, delay: shouldReduce ? 0 : 0.15, ease: 'easeOut' }}
                >
                  <div className="space-y-5 border-t border-gray-200 dark:border-white/10 pt-6">
                    {[
                      { label: 'Industry', value: project.industry || project.category || 'Software' },
                      { label: 'Client', value: project.client || 'Personal Project' },
                      { label: 'Status', value: project.status || 'Live' },
                      { label: 'Duration', value: project.duration || '—' },
                      { label: 'Role', value: project.role || 'Lead Engineer' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-baseline justify-between gap-4">
                        <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 font-bold whitespace-nowrap">
                          {row.label}
                        </span>
                        <span className="text-sm md:text-base font-bold text-black dark:text-white text-right break-words">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    {project.live_url && project.live_url !== '#' && (
                      <motion.a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center bg-[#0079FF] hover:bg-[#0066D6] text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3.5 shadow-lg shadow-[#0079FF]/20 transition-all rounded-xl"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        Visit Live Site
                        <Icon name="arrow-up-right" className="w-4 h-4 ml-2" />
                      </motion.a>
                    )}
                    {project.github_url ? (
                      <motion.a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3.5 hover:border-[#0079FF] hover:text-[#0079FF] dark:hover:text-[#389BFF] transition-colors rounded-xl"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        <Icon name="github" className="w-4 h-4 mr-2" />
                        View Source
                      </motion.a>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => setShowSecurityPopup(true)}
                        className="inline-flex items-center justify-center border border-gray-300 dark:border-white/10 text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-6 py-3.5 hover:border-[#0079FF] hover:text-[#0079FF] dark:hover:text-[#389BFF] transition-colors cursor-pointer rounded-xl"
                        whileHover={shouldReduce ? {} : buttonHover}
                        whileTap={shouldReduce ? {} : buttonTap}
                      >
                        <Icon name="github" className="w-4 h-4 mr-2" />
                        Source Code
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Quick stats strip */}
              {quickStats.length > 0 && (
                <motion.div
                  className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                  initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={sectionViewport}
                  transition={{ duration: shouldReduce ? 0 : 0.5 }}
                >
                  {quickStats.map((s) => (
                    <div
                      key={s.label}
                      className="bg-white dark:bg-[#0E131F] p-5 md:p-6 text-center"
                    >
                      <div className="text-2xl md:text-4xl font-heading font-bold text-[#0079FF] dark:text-[#389BFF]">
                        {s.value}
                        {s.suffix}
                      </div>
                      <div className="mt-1 text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                HERO IMAGE — full-bleed, with subtle parallax
                ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              className="max-w-7xl mx-auto px-6 md:px-12 pb-12 md:pb-24"
              initial={shouldReduce ? {} : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={sectionViewport}
              transition={{ duration: shouldReduce ? 0 : 0.8 }}
            >
              <div className="relative w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl group bg-gray-100 dark:bg-[#0E131F]">
                <img
                  ref={heroImageRef}
                  src={imageUrl}
                  alt={`${project.title} — primary interface`}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-1000"
                  loading="eager"
                  width="1600"
                  height="680"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold text-[#0079FF] dark:text-[#389BFF]">
                      {project.industry || project.category}
                    </div>
                    <div className="text-lg md:text-2xl font-heading font-bold mt-1">
                      {project.title}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openLightbox(0)}
                    className="inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold bg-[#0079FF] text-white px-4 py-2.5 rounded-full hover:bg-[#0066D6] transition-colors shadow-lg shadow-[#0079FF]/30"
                    aria-label="Open image preview"
                  >
                    <Icon name="lightbox" className="w-4 h-4" />
                    Preview
                  </button>
                </div>
              </div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════════════════
                2. PROJECT OVERVIEW
                ═══════════════════════════════════════════════════════════════ */}
            {project.description && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="01"
                  eyebrow="Overview"
                  title={project.summary || 'A bespoke software build, engineered end to end.'}
                  lede="The core operational goal, system scope, and engineering architecture."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  <motion.div variants={item} className="lg:col-span-7">
                    <div className="text-[11px] uppercase tracking-[0.3em] text-[#0079FF] dark:text-[#389BFF] font-bold mb-3">Project Summary</div>
                    <p className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold text-black dark:text-white leading-[1.2]">
                      {project.description}
                    </p>
                  </motion.div>

                  <motion.div variants={item} className="lg:col-span-5 space-y-6">
                    {[
                      { label: 'Business Goal', value: project.goal || project.tagline || 'Centralize workflows, workforce operations, data pipelines, and reporting into a unified, high-reliability software system.' },
                      { label: 'Technical Approach', value: project.solution?.architecture || 'Modular React / Node.js architecture with clear domain boundaries, real-time WebSocket state synchronization, and strict PostgreSQL data constraints.' },
                      { label: 'Target Audience', value: project.industry ? `Operators, staff, and decision-makers in ${project.industry.toLowerCase()}.` : 'Founders, teams, and operators who demand high-uptime software.' },
                      { label: 'Main Challenge', value: project.challenge?.problem || 'Replacing fragmented processes with an automated, highly available system.' },
                      { label: 'My Role', value: project.role || 'Lead Software Engineer & Architect' },
                      { label: 'Timeline', value: project.duration || 'Ongoing' },
                    ].map((row) => (
                      <div key={row.label} className="border-t border-gray-200 dark:border-white/10 pt-4">
                        <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 font-bold mb-2">
                          {row.label}
                        </div>
                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                3. CHALLENGE
                ═══════════════════════════════════════════════════════════════ */}
            {project.challenge && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="02"
                  eyebrow="The Challenge"
                  title="What had to be solved — and why it was critical."
                  lede="The core operational bottlenecks and constraints that defined the software specifications."
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
                  <motion.div variants={item} className="lg:col-span-7">
                    <div className="bg-white dark:bg-[#0E131F] p-6 sm:p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl">
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-9 h-9 rounded-xl bg-[#0079FF]/10 text-[#0079FF] dark:text-[#389BFF] flex items-center justify-center">
                          <Icon name="target" className="w-5 h-5" />
                        </span>
                        <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                          The Problem
                        </span>
                      </div>
                      <p className="text-lg md:text-xl lg:text-2xl font-heading font-bold text-black dark:text-white leading-[1.35]">
                        {project.challenge.problem}
                      </p>
                    </div>
                  </motion.div>

                  <motion.div variants={item} className="lg:col-span-5 space-y-8">
                    {Array.isArray(project.challenge.constraints) && project.challenge.constraints.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 flex items-center justify-center">
                            <Icon name="shield" className="w-5 h-5" />
                          </span>
                          <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                            Constraints
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {project.challenge.constraints.map((c, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0079FF] shrink-0" aria-hidden="true" />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {Array.isArray(project.challenge.goals) && project.challenge.goals.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-5">
                          <span className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 flex items-center justify-center">
                            <Icon name="sparkle" className="w-5 h-5" />
                          </span>
                          <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                            Client Goals
                          </span>
                        </div>
                        <ul className="space-y-3">
                          {project.challenge.goals.map((g, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#0079FF] shrink-0" aria-hidden="true" />
                              <span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                4. SOLUTION
                ═══════════════════════════════════════════════════════════════ */}
            {project.solution && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="03"
                  eyebrow="The Solution"
                  title="Architectural decisions that drove performance."
                  lede="A record of why each layer was engineered the way it was."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  {[
                    { icon: 'server', label: 'Architecture', value: project.solution.architecture },
                    { icon: 'monitor', label: 'UI Decisions', value: project.solution.ui },
                    { icon: 'database', label: 'Backend Decisions', value: project.solution.backend },
                    { icon: 'chart', label: 'Performance', value: project.solution.performance },
                    { icon: 'shield', label: 'Security', value: project.solution.security },
                    { icon: 'users', label: 'Accessibility', value: project.solution.accessibility },
                  ]
                    .filter((row) => row.value)
                    .map((row) => (
                      <motion.article
                        key={row.label}
                        variants={item}
                        whileHover={shouldReduce ? {} : cardHover}
                        transition={cardHoverTransition}
                        className="bg-white dark:bg-[#0E131F] p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg group hover:border-[#0079FF]/40 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="w-10 h-10 rounded-xl bg-[#0079FF]/10 text-[#0079FF] dark:text-[#389BFF] flex items-center justify-center group-hover:bg-[#0079FF] group-hover:text-white transition-colors">
                            <Icon name={row.icon} className="w-5 h-5" />
                          </span>
                          <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-bold text-gray-700 dark:text-gray-300">
                            {row.label}
                          </span>
                        </div>
                        <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                          {row.value}
                        </p>
                      </motion.article>
                    ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                5. RESULTS
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.results) && project.results.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="04"
                  eyebrow="Results"
                  title="Measurable outcomes & operational impact."
                  lede="Concrete improvements delivered once the software was deployed to production."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
                  {project.results.map((r, i) => (
                    <motion.div
                      key={`${r.label}-${i}`}
                      variants={item}
                      whileHover={shouldReduce ? {} : cardHover}
                      transition={cardHoverTransition}
                      className="relative bg-white dark:bg-[#0E131F] p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl overflow-hidden group hover:border-[#0079FF]/50 transition-all"
                    >
                      <div
                        className="absolute -top-12 -right-12 w-40 h-40 bg-[#0079FF]/10 rounded-full blur-3xl group-hover:bg-[#0079FF]/20 transition-colors"
                        aria-hidden="true"
                      />
                      <div className="relative">
                        <div className="text-3xl md:text-5xl font-heading font-bold text-[#0079FF] dark:text-[#389BFF] tracking-tight">
                          {r.value}
                        </div>
                        <div className="mt-3 text-sm md:text-base font-bold text-black dark:text-white">
                          {r.label}
                        </div>
                        {r.description && (
                          <p className="mt-2 text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {r.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                6. FEATURE SHOWCASE
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.featureCategories) && project.featureCategories.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="05"
                  eyebrow="Feature Showcase"
                  title="Core product capabilities & modules."
                  lede="Grouped by how users and operators interact with the platform in daily business."
                />

                <div className="space-y-10 md:space-y-14">
                  {project.featureCategories.map((cat, idx) => (
                    <motion.div
                      key={cat.name}
                      variants={item}
                      className={`grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 ${
                        idx % 2 === 1 ? 'lg:[direction:rtl]' : ''
                      }`}
                    >
                      <div className="lg:col-span-4 [direction:ltr]">
                        <div className="sticky top-28">
                          <div className="w-12 h-12 rounded-xl bg-[#0079FF]/10 text-[#0079FF] dark:text-[#389BFF] flex items-center justify-center mb-5 border border-[#0079FF]/20">
                            <Icon name={cat.icon || 'sparkle'} className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl md:text-3xl font-heading font-bold text-black dark:text-white">
                            {cat.name}
                          </h3>
                        </div>
                      </div>
                      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 [direction:ltr]">
                        {cat.items.map((it, i) => (
                          <motion.div
                            key={`${cat.name}-${i}`}
                            whileHover={shouldReduce ? {} : cardHover}
                            transition={cardHoverTransition}
                            className="bg-white dark:bg-[#0E131F] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-lg hover:border-[#0079FF]/40 transition-all"
                          >
                            <h4 className="text-base md:text-lg font-heading font-bold text-black dark:text-white mb-2">
                              {it.title}
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              {it.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                7. APPLICATION FLOW
                ═══════════════════════════════════════════════════════════════ */}
            {Array.isArray(project.flow) && project.flow.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="06"
                  eyebrow="Application Flow"
                  title="A typical journey through the system."
                  lede="How an operator or user moves from intake through automated completion."
                />

                <div className="relative">
                  <div
                    className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0079FF]/50 via-[#0079FF]/20 to-transparent"
                    aria-hidden="true"
                  />
                  <ol className="space-y-6 md:space-y-10">
                    {project.flow.map((step, i) => (
                      <motion.li
                        key={`${step.step}-${i}`}
                        variants={item}
                        className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12 items-center ${
                          i % 2 === 1 ? 'md:[direction:rtl]' : ''
                        }`}
                      >
                        <div className="[direction:ltr]">
                          <div
                            className={`bg-white dark:bg-[#0E131F] p-5 md:p-7 rounded-3xl border border-gray-200 dark:border-white/10 shadow-lg ${
                              i % 2 === 1 ? 'md:text-left' : 'md:text-right'
                            }`}
                          >
                            <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[#0079FF] dark:text-[#389BFF] font-bold mb-2">
                              Step {String(i + 1).padStart(2, '0')}
                            </div>
                            <h4 className="text-xl md:text-2xl font-heading font-bold text-black dark:text-white mb-2">
                              {step.step}
                            </h4>
                            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                        <div className="hidden md:flex [direction:ltr] items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#0079FF] text-white font-heading font-bold text-lg flex items-center justify-center shadow-lg shadow-[#0079FF]/30">
                            {i + 1}
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ol>
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                8. RESPONSIVE GALLERY
                ═══════════════════════════════════════════════════════════════ */}
            {galleryItems.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="07"
                  eyebrow="Responsive Gallery"
                  title="The product in full context."
                  lede="Interfaces across desktop, tablet, and mobile — tuned for responsiveness and speed."
                />

                <div className="space-y-8 md:space-y-12">
                  {galleryItems.map((g, i) => {
                    const isPhone = g.device === 'phone';
                    const isTablet = g.device === 'tablet';
                    return (
                      <motion.button
                        key={`${g.src}-${i}`}
                        type="button"
                        variants={item}
                        whileHover={shouldReduce ? {} : cardHover}
                        transition={cardHoverTransition}
                        onClick={() => openLightbox(i)}
                        className={`group relative block w-full text-left rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-[#0E131F] shadow-xl ${
                          isPhone
                            ? 'max-w-xs mx-auto aspect-[9/19]'
                            : isTablet
                            ? 'max-w-2xl mx-auto aspect-[4/3]'
                            : 'aspect-[16/9]'
                        }`}
                        aria-label={`Open ${g.alt} in preview`}
                      >
                        <img
                          src={g.src}
                          alt={g.alt}
                          loading="lazy"
                          decoding="async"
                          width={isPhone ? 720 : isTablet ? 1280 : 1600}
                          height={isPhone ? 1520 : isTablet ? 960 : 900}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold">
                            {g.device === 'phone' ? 'Mobile' : g.device === 'tablet' ? 'Tablet' : 'Desktop'}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] md:text-xs uppercase tracking-[0.25em] font-bold text-[#0079FF] dark:text-[#389BFF]">
                            <Icon name="lightbox" className="w-4 h-4" />
                            Open
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                9. TECHNICAL DEEP DIVE & ARCHITECTURE
                ═══════════════════════════════════════════════════════════════ */}
            {(project.architecture || project.techCategories || project.timeline || project.responsibilities || project.metrics) && (
              <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-gray-200 dark:border-white/10">
                <div className="bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-xl space-y-12">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-200 dark:border-white/10">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#0079FF] dark:text-[#389BFF] font-bold mb-2">Technical Deep Dive</p>
                      <h3 className="text-2xl md:text-4xl font-heading font-bold text-black dark:text-white">
                        Architecture & Engineering Specifications
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {project.title} · Technical Authority Blueprint
                    </div>
                  </div>

                  {/* System Architecture Topology */}
                  {Array.isArray(project.architecture) && project.architecture.length > 0 && (
                    <div>
                      <div className="mb-6">
                        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#0079FF] dark:text-[#389BFF]">System Architecture</span>
                        <h4 className="text-xl md:text-2xl font-heading font-bold text-black dark:text-white mt-1">
                          Production Topology & Data Flow
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {project.architecture.map((layer, i) => (
                          <div
                            key={`${layer.layer}-${i}`}
                            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-2xl p-4 md:p-5"
                          >
                            <div className="md:col-span-3 flex items-center gap-3">
                              <span className="text-[#0079FF] dark:text-[#389BFF] font-mono text-xs font-bold">
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <h5 className="font-heading font-bold text-black dark:text-white text-base">
                                {layer.layer}
                              </h5>
                            </div>
                            <div className="md:col-span-9 text-sm text-gray-700 dark:text-gray-300 font-light leading-relaxed">
                              {layer.detail}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tech Stack Pillars */}
                  {Array.isArray(project.techCategories) && project.techCategories.length > 0 && (
                    <div className="pt-8 border-t border-gray-200 dark:border-white/10">
                      <div className="mb-6">
                        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#0079FF] dark:text-[#389BFF]">Categorized Tooling</span>
                        <h4 className="text-xl md:text-2xl font-heading font-bold text-black dark:text-white mt-1">
                          Technology Stack Breakdown
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {project.techCategories.map((cat) => (
                          <div
                            key={cat.name}
                            className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/5"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <span className="w-8 h-8 rounded-lg bg-[#0079FF]/10 text-[#0079FF] dark:text-[#389BFF] flex items-center justify-center">
                                <Icon name={cat.icon || 'tag'} className="w-4 h-4" />
                              </span>
                              <h5 className="text-sm font-heading font-bold text-black dark:text-white">
                                {cat.name}
                              </h5>
                            </div>
                            <ul className="space-y-2">
                              {cat.items.map((t, i) => (
                                <li key={i} className="flex items-center gap-2.5 text-xs text-gray-800 dark:text-gray-200 font-medium">
                                  <img src={getTechIcon(t)} alt="" className="w-4 h-4 object-contain" loading="lazy" />
                                  <span>{t}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Responsibilities & Timeline Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-200 dark:border-white/10">
                    {/* Responsibilities */}
                    {Array.isArray(project.responsibilities) && project.responsibilities.length > 0 && (
                      <div className="lg:col-span-6 space-y-4">
                        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#0079FF] dark:text-[#389BFF]">Scope & Ownership</span>
                        <h4 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white">
                          My Engineering Responsibilities
                        </h4>
                        <div className="flex flex-wrap gap-2 pt-2">
                          {project.responsibilities.map((r, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0079FF]" />
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline Phases */}
                    {Array.isArray(project.timeline) && project.timeline.length > 0 && (
                      <div className="lg:col-span-6 space-y-4">
                        <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#0079FF] dark:text-[#389BFF]">Process Cadence</span>
                        <h4 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white">
                          Development Phases
                        </h4>
                        <div className="space-y-2.5 pt-2">
                          {project.timeline.map((t, i) => (
                            <div key={i} className="flex items-start gap-3 text-xs">
                              <span className="font-mono font-bold text-[#0079FF] dark:text-[#389BFF] shrink-0 mt-0.5">
                                0{i + 1}
                              </span>
                              <div>
                                <span className="font-bold text-black dark:text-white mr-1.5">{t.phase}:</span>
                                <span className="text-gray-600 dark:text-gray-400 font-light">{t.detail}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                10. RELATED PROJECTS
                ═══════════════════════════════════════════════════════════════ */}
            {relatedProjects.length > 0 && (
              <motion.section
                className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 border-t border-gray-200 dark:border-white/10"
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
                variants={container}
              >
                <SectionHeader
                  number="08"
                  eyebrow="Related Projects"
                  title="More selected software work."
                  lede="Other engineering case studies in the same technical orbit."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  {relatedProjects.map((rp) => (
                    <motion.div
                      key={rp.id}
                      variants={item}
                      whileHover={shouldReduce ? {} : cardHover}
                      transition={cardHoverTransition}
                      onClick={() => navigate(`/projects/${rp.slug || rp.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/projects/${rp.slug || rp.id}`);
                        }
                      }}
                      role="link"
                      tabIndex={0}
                      className="group cursor-pointer bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0079FF] hover:border-[#0079FF]/50 transition-all"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={rp.image_url || rp.image}
                          alt={rp.title}
                          loading="lazy"
                          decoding="async"
                          width="800"
                          height="500"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-gray-200 dark:border-white/10">
                          {rp.year || (rp.created_at ? new Date(rp.created_at).getFullYear() : '')}
                        </div>
                      </div>
                      <div className="p-6 md:p-7 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#0079FF] dark:text-[#389BFF] font-bold mb-2">
                            {rp.industry || rp.category || 'Software'}
                          </div>
                          <h3 className="text-lg md:text-xl font-heading font-bold text-black dark:text-white mb-2 group-hover:text-[#0079FF] dark:group-hover:text-[#389BFF] transition-colors truncate">
                            {rp.title}
                          </h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                            {rp.summary}
                          </p>
                        </div>
                        <span
                          className="w-10 h-10 shrink-0 inline-flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 group-hover:bg-[#0079FF] group-hover:border-[#0079FF] group-hover:text-white transition-colors"
                          aria-hidden="true"
                        >
                          <Icon name="arrow-up-right" className="w-4 h-4" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                11. FINAL CTA
                ═══════════════════════════════════════════════════════════════ */}
            <motion.section
              className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28 border-t border-gray-200 dark:border-white/10"
              initial="hidden"
              whileInView="visible"
              viewport={sectionViewport}
              variants={container}
            >
              <div className="max-w-4xl mx-auto text-center bg-white dark:bg-[#0E131F] border border-gray-200 dark:border-white/10 rounded-3xl p-12 md:p-20 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0079FF] to-transparent"></div>
                <motion.p
                  variants={item}
                  className="text-xs uppercase tracking-[0.3em] text-[#0079FF] dark:text-[#389BFF] font-bold mb-4"
                >
                  Ready when you are
                </motion.p>
                <motion.h2
                  variants={item}
                  className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold tracking-tight text-black dark:text-white leading-[1.05]"
                >
                  Let&rsquo;s engineer something{' '}
                  <span className="bg-gradient-to-r from-[#0079FF] via-blue-500 to-indigo-400 bg-clip-text text-transparent">exceptional.</span>
                </motion.h2>
                <motion.p
                  variants={item}
                  className="mt-6 text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-light leading-relaxed mb-10"
                >
                  Tell me what you're building, what you're trying to achieve, and where you're stuck. I'll help you determine the right technical architecture.
                </motion.p>
                <motion.div
                  variants={item}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <motion.div
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    <Link
                      to="/contact"
                      className="inline-flex items-center justify-center bg-[#0079FF] hover:bg-[#0066D6] text-white font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 rounded-xl shadow-lg shadow-[#0079FF]/25 transition-all"
                    >
                      Start a Project Brief →
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={shouldReduce ? {} : buttonHover}
                    whileTap={shouldReduce ? {} : buttonTap}
                  >
                    <Link
                      to="/projects"
                      className="inline-flex items-center justify-center border border-gray-300 dark:border-white/20 text-black dark:text-white font-bold uppercase tracking-[0.2em] text-xs px-8 py-4 rounded-xl hover:border-[#0079FF] hover:text-[#0079FF] dark:hover:text-[#389BFF] transition-colors"
                    >
                      View More Case Studies
                    </Link>
                  </motion.div>
                </motion.div>
                <div className="mt-8">
                  <a
                    href={`https://wa.me/${CONTACT.phoneE164 || '2348085186714'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-gray-500 hover:text-[#0079FF] dark:hover:text-[#389BFF] transition-colors underline"
                  >
                    Or chat directly via WhatsApp ↗
                  </a>
                </div>
              </div>
            </motion.section>
          </>
        )}
      </SkeletonTransition>

      {/* Lightbox overlay */}
      <Lightbox
        images={galleryItems.map((g) => g.src)}
        index={lightboxIndex}
        onClose={closeLightbox}
        onPrev={prevImage}
        onNext={nextImage}
      />

      {/* Security popup */}
      <SecurityPopup
        isOpen={showSecurityPopup}
        onClose={() => setShowSecurityPopup(false)}
      />
    </div>
  );
};

export default ProjectDetailPage;
