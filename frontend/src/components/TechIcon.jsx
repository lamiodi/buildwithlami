import React from 'react';

/**
 * Native, zero-network-dependency SVG Tech Icons.
 * Guaranteed 100% rendering in both Light and Dark modes.
 */
export const TechIcon = ({ name, className = "w-6 h-6" }) => {
  const n = (name || '').toLowerCase();

  // Next.js
  if (n.includes('next')) {
    return (
      <svg className={className} viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="90" cy="90" r="90" className="fill-black dark:fill-white" />
        <path
          d="M149.508 157.438L69.1418 54H54V125.97H66.6236V69.9865L139.965 164.452C143.254 162.247 146.444 159.904 149.508 157.438Z"
          className="fill-white dark:fill-black"
        />
        <rect x="115" y="54" width="13" height="72" className="fill-white dark:fill-black" />
      </svg>
    );
  }

  // Express.js
  if (n.includes('express')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 8.358v7.284H0V8.358h24zM3.486 10.372H1.94v3.256h1.546v-.884h-0.61v-.426h0.61v-.667h-0.61v-.395h0.61v-.884zm4.27 0H6.21v3.256h1.546v-.884h-0.61v-.426h0.61v-.667h-0.61v-.395h0.61v-.884zm4.27 0h-1.546v3.256h1.546v-.884h-0.61v-.426h0.61v-.667h-0.61v-.395h0.61v-.884zm3.924 0h-1.287l-0.74 1.77-0.74-1.77h-1.287l1.39 3.256h1.274l1.39-3.256zm4.27 0h-1.546v3.256h1.546v-.884h-0.61v-.426h0.61v-.667h-0.61v-.395h0.61v-.884z" className="text-gray-900 dark:text-white" />
      </svg>
    );
  }

  // Vercel
  if (n.includes('vercel')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 22.525H0l12-21.05 12 21.05z" className="text-black dark:text-white" />
      </svg>
    );
  }

  // GitHub / GitHub Actions
  if (n.includes('github')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          className="text-black dark:text-white"
        />
      </svg>
    );
  }

  // Paystack
  if (n.includes('paystack')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="3.5" rx="1.75" fill="#00C3F7" />
        <rect x="2" y="9" width="14" height="3.5" rx="1.75" fill="#00C3F7" />
        <rect x="2" y="15" width="20" height="3.5" rx="1.75" fill="#00C3F7" />
        <rect x="2" y="21" width="9" height="3" rx="1.5" fill="#00C3F7" />
      </svg>
    );
  }

  // Resend
  if (n.includes('resend')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 4h10.25a7.25 7.25 0 0 1 0 14.5H2.5V4zm4 4v6.5h6.25a3.25 3.25 0 0 0 0-6.5H6.5z" className="text-black dark:text-white" />
        <path d="M12.75 14.5L18.5 20h-4.5l-4.5-4.5h3.25z" className="text-black dark:text-white" />
      </svg>
    );
  }

  // React
  if (n.includes('react')) {
    return (
      <svg className={className} viewBox="-11.5 -10.23174 23 20.46348" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    );
  }

  // TypeScript
  if (n.includes('typescript')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M11.5 15.5H9.5V8.5H11.5V15.5ZM19 10.5H16.5V15.5H14.5V8.5H19V10.5Z" fill="white" />
      </svg>
    );
  }

  // JavaScript
  if (n.includes('javascript')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path d="M7 16c.5.8 1.3 1.2 2.3 1.2 1.4 0 2.2-.7 2.2-2.3v-6.4h-2v6.4c0 .5-.2.7-.6.7-.4 0-.7-.2-.9-.6L7 16zm7.2-.2c.6.9 1.6 1.4 2.8 1.4 1.7 0 2.8-.9 2.8-2.2 0-1.4-.9-1.9-2.2-2.4l-.5-.2c-.7-.3-1-.5-1-1 0-.4.3-.8.9-.8.5 0 .9.2 1.2.6l1.3-1c-.6-.8-1.4-1.2-2.5-1.2-1.6 0-2.6.9-2.6 2.2 0 1.3.8 1.9 2 2.4l.5.2c.8.3 1.2.6 1.2 1.1 0 .5-.4.8-1.1.8-.7 0-1.2-.4-1.6-.9l-1.2 1z" fill="black" />
      </svg>
    );
  }

  // Tailwind CSS
  if (n.includes('tailwind')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.335 6.182 14.974 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.335 13.382 8.974 12 6.001 12z" fill="#06B6D4" />
      </svg>
    );
  }

  // Framer Motion
  if (n.includes('framer')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" fill="#0055FF" />
      </svg>
    );
  }

  // Node.js
  if (n.includes('node')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7.8v11.6L12 25.2l10-5.8V7.8L12 2zm0 2.3l7.9 4.6v9.2L12 22.7l-7.9-4.6V8.9L12 4.3z" fill="#5FA04E" />
      </svg>
    );
  }

  // PostgreSQL
  if (n.includes('postgres')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-5h2v5zm0-7h-2V7.5h2V9.5z" fill="#336791" />
      </svg>
    );
  }

  // Prisma / Drizzle
  if (n.includes('prisma') || n.includes('drizzle')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.062 17.562L13.562 1.625c-.375-.688-1.375-.688-1.75 0L1.938 20.312c-.375.688.125 1.5.875 1.5h18.375c.75 0 1.25-.812.874-1.438v-.812zm-9.374-11.5l5.874 11H7.438l5.25-11z" className="text-emerald-600 dark:text-emerald-400" />
      </svg>
    );
  }

  // Supabase
  if (n.includes('supabase')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M21.362 9.354H12V.5a.5.5 0 0 0-.858-.35L.78 12.355a.5.5 0 0 0 .354.854H10.5v8.855a.5.5 0 0 0 .858.35l10.354-12.205a.5.5 0 0 0-.35-.855z" fill="#3ECF8E" />
      </svg>
    );
  }

  // Redis
  if (n.includes('redis')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M21.5 7.5L12 2 2.5 7.5l9.5 5.5 9.5-5.5zM2.5 16.5L12 22l9.5-5.5-3.5-2-6 3.5-6-3.5-3.5 2z" fill="#DC382D" />
      </svg>
    );
  }

  // Render
  if (n.includes('render')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2zm0 3.3l6.5 4.2-6.5 4.3-6.5-4.3L12 5.3z" fill="#46E3B7" />
      </svg>
    );
  }

  // Cloudinary
  if (n.includes('cloudinary')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#3448C5" />
      </svg>
    );
  }

  // Stripe
  if (n.includes('stripe')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.671 15.012 0 12.183 0 6.355 0 2.38 3.24 2.38 8.04c0 5.602 5.09 6.84 8.79 8.212 2.39.88 3.245 1.54 3.245 2.508 0 1.002-.857 1.487-2.28 1.487-2.27 0-5.18-.99-7.05-2.01L4 23.945C6.07 24.978 9.38 25.68 12.38 25.68c6.12 0 10.32-3.08 10.32-8.08 0-5.46-4.83-6.93-8.72-8.45z" fill="#635BFF" />
      </svg>
    );
  }

  // REST & Webhooks
  if (n.includes('rest') || n.includes('webhook') || n.includes('api')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-5h2v5zm0-7h-2V7.5h2V9.5z" fill="#009688" />
      </svg>
    );
  }

  // Figma
  if (n.includes('figma')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83" />
        <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF" />
        <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8C5.8 8 4 6.2 4 4z" fill="#F24E1E" />
        <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262" />
        <path d="M20 12c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4 4 1.8 4 4z" fill="#1ABCFE" />
      </svg>
    );
  }

  // VS Code
  if (n.includes('vs code') || n.includes('vscode')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M17.5 1.5L8.5 9.8 4.2 6.4 1.5 7.9l4.4 4.1L1.5 16.1l2.7 1.5 4.3-3.4 9 8.3 5-2.5V4l-5-2.5zm1.5 15.6l-5.6-4.5L19 8.1v9z" fill="#007ACC" />
      </svg>
    );
  }

  // Postman
  if (n.includes('postman')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#FF6C37" />
        <path d="M15 8l-6 4 6 4V8z" fill="white" />
      </svg>
    );
  }

  // Fallback
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" className="text-accent" />
    </svg>
  );
};

export default TechIcon;
