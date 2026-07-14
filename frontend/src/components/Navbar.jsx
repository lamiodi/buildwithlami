import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken, clearAuth, getAuthUser } from '../services/auth';

const NAV_LINKS = [
  { name: 'Home', path: '#home', type: 'anchor' },
  { name: 'Projects', path: '/projects', type: 'link' },
  { name: 'About', path: '/about', type: 'link' },
  { name: 'Services', path: '/services', type: 'link' },
  { name: 'Portfolio', path: '/portfolio', type: 'link' },
  { name: 'SaaS Products', path: '#saas', type: 'anchor' },
  { name: 'Pricing', path: '#pricing', type: 'anchor' },
  { name: 'Contact', path: '/contact', type: 'link' },
];

const Navbar = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isLoggedIn = !!getAuthToken();
  const user = getAuthUser();

  const handleLogout = () => {
    clearAuth();
    setIsOpen(false);
    navigate('/');
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const getSectionPath = (path) => isHome ? path : `/${path}`;

  const renderLink = (link, className, onClick) => {
    if (link.type === 'anchor') {
      return (
        <Link 
          key={link.name}
          to={getSectionPath(link.path)} 
          onClick={(e) => {
            // Smooth scroll if we are already on the home page
            if (isHome) {
              const id = link.path.replace('#', '');
              const element = document.getElementById(id);
              if (element) {
                e.preventDefault();
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState({}, '', link.path);
              }
            }
            if (onClick) onClick();
          }}
          className={className}
        >
          {link.name}
        </Link>
      );
    }
    return (
      <Link 
        key={link.name}
        to={link.path} 
        onClick={onClick}
        className={className}
      >
        {link.name}
      </Link>
    );
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto relative z-50">
      {/* Brand Logo */}
      <Link 
        to="/" 
        className="text-xl font-heading font-bold tracking-widest flex items-center justify-center bg-gray-200 dark:bg-[#222] text-black dark:text-white w-10 h-10 hover:bg-accent hover:text-white dark:hover:bg-accent transition-colors z-50"
      >
        Ob
      </Link>
      
      {/* Desktop Menu */}
      <div className="hidden md:flex space-x-8 text-sm uppercase tracking-wider items-center text-gray-800 dark:text-gray-200 font-medium">
        {NAV_LINKS.map(link => renderLink(link, "hover:text-accent transition-colors"))}
        
        {isLoggedIn ? (
          <>
            <Link to="/admin/projects" className="hover:text-accent transition-colors">Admin</Link>
            <button
              onClick={handleLogout}
              className="border border-red-500/40 text-red-500 px-3 py-1.5 hover:bg-red-500 hover:text-white transition-colors font-bold text-xs rounded-lg"
              title={user?.email || 'Sign out'}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="border border-gray-800 dark:border-white/20 px-4 py-2 hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:border-accent transition-colors font-bold"
          >
            Sign In
          </Link>
        )}

        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

        <a 
          href="/resume.pdf" 
          target="_blank" 
          className="border border-gray-800 dark:border-white/20 px-4 py-2 hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:border-accent transition-colors font-bold"
        >
          Resume
        </a>
      </div>

      {/* Mobile Controls */}
      <div className="md:hidden flex items-center space-x-4 z-50">
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
        
        <button 
          className="text-gray-800 dark:text-white hover:text-accent transition-colors p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="fixed inset-0 bg-white/98 dark:bg-[#111111]/98 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 md:hidden text-black dark:text-white"
          >
            {NAV_LINKS.map(link => renderLink(link, "text-2xl font-heading font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors", closeMenu))}
            
            {isLoggedIn ? (
              <>
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="text-2xl font-heading font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-4 border-2 border-red-500 text-red-500 px-8 py-4 text-lg font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={closeMenu}
                className="mt-4 border-2 border-black dark:border-white px-8 py-4 text-lg font-bold uppercase tracking-widest hover:bg-accent hover:border-accent hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}

            <a 
              href="/resume.pdf" 
              target="_blank" 
              onClick={closeMenu} 
              className="mt-4 border-2 border-black dark:border-white px-8 py-4 text-lg font-bold uppercase tracking-widest hover:bg-accent hover:border-accent hover:text-white transition-colors"
            >
              Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ThemeToggle = ({ isDark, toggleTheme }) => (
  <button 
    onClick={toggleTheme} 
    className="hover:text-accent transition-colors p-2" 
    aria-label="Toggle Theme"
  >
    {isDark ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  </button>
);

export default Navbar;
