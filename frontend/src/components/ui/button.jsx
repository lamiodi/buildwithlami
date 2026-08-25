import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  variant = 'primary', // 'primary' | 'secondary' | 'dark' | 'ghost'
  to,
  href,
  onClick,
  children,
  className = '',
  icon,
  type = 'button',
  disabled = false,
  ...props
}) => {
  const base = "text-[11px] font-heading font-bold uppercase tracking-[0.15em] transition-all duration-300 inline-flex items-center justify-center text-center active:scale-[0.98] cursor-pointer";
  
  const variants = {
    primary: "bg-accent text-white px-8 sm:px-10 py-4 hover:bg-black dark:hover:bg-white dark:hover:text-black shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "border border-gray-300 dark:border-white/15 text-gray-900 dark:text-gray-100 px-8 sm:px-10 py-4 hover:border-accent hover:text-accent bg-transparent disabled:opacity-50 disabled:cursor-not-allowed",
    dark: "bg-black dark:bg-white text-white dark:text-black hover:bg-accent dark:hover:bg-accent dark:hover:text-white px-6 py-3.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
    ghost: "text-accent hover:text-black dark:hover:text-white p-0 bg-transparent gap-1.5"
  };

  const combinedClasses = `${base} ${variants[variant] || variants.primary} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        <span>{children}</span>
        {icon && <span className="ml-2 inline-flex items-center">{icon}</span>}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        <span>{children}</span>
        {icon && <span className="ml-2 inline-flex items-center">{icon}</span>}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={combinedClasses} {...props}>
      <span>{children}</span>
      {icon && <span className="ml-2 inline-flex items-center">{icon}</span>}
    </button>
  );
};

export default Button;
