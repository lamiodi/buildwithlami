import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Sparkles,
  Shield,
  Sun,
  Moon,
  Briefcase,
  Layers,
  Tag,
  User,
  Mail,
  ArrowRight
} from 'lucide-react';
import { getAuthToken, clearAuth, getAuthUser } from '../services/auth';
import { CONTACT } from '../config/contact';

const NAV_LINKS = [
  { name: 'Work', path: '/projects', icon: Briefcase },
  { name: 'Services', path: '/services', icon: Layers },
  { name: 'Pricing', path: '/pricing', icon: Tag, highlight: true },
  { name: 'About', path: '/about', icon: User },
  { name: 'Contact', path: '/contact', icon: Mail },
];

const Navbar = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!getAuthToken();
  const user = getAuthUser();

  // Close mobile menu whenever the route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    clearAuth();
    closeMenu();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-background/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5 transition-colors duration-300">
        <nav className="flex items-center justify-between px-6 py-3.5 md:px-12 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <Link 
            to="/" 
            onClick={() => {
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2.5 group active:scale-95 transition-all"
            aria-label="Buildwith_lami Home"
          >
            <img
              src="/2.png"
              alt="Buildwith_lami"
              className="h-9 w-auto block dark:hidden group-hover:opacity-90 transition-opacity"
            />
            <img
              src="/1.png"
              alt="Buildwith_lami"
              className="h-9 w-auto hidden dark:block group-hover:opacity-90 transition-opacity"
            />
          </Link>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-6 lg:space-x-8 text-xs uppercase tracking-wider items-center text-gray-800 dark:text-gray-200 font-bold">
            {NAV_LINKS.map(link => {
              const active = isActive(link.path);
              return (
                <Link 
                  key={link.name}
                  to={link.path}
                  className={`transition-colors py-1 relative ${
                    active 
                      ? 'text-accent dark:text-accent font-extrabold' 
                      : 'hover:text-accent text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.highlight && (
                    <span className="absolute -top-1.5 -right-2 w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                  {active && (
                    <motion.span 
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full" 
                    />
                  )}
                </Link>
              );
            })}
            
            {isLoggedIn && (
              <Link 
                to="/admin" 
                className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 transition-colors"
              >
                Admin
              </Link>
            )}

            <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-white/10">
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            </div>

            {/* High-Converting Primary CTA */}
            <Link 
              to="/contact" 
              className="bg-accent text-white px-6 py-2.5 hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 font-heading font-bold text-[11px] uppercase tracking-[0.15em] shadow-md hover:shadow-accent/30 flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Navbar Controls */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            
            {/* Mobile Hamburger Button */}
            <button 
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white hover:text-accent dark:hover:text-accent shadow-sm active:scale-90 transition-all touch-manipulation cursor-pointer"
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-5 h-5 text-accent" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── FULLSCREEN RESPONSIVE MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] w-full h-[100dvh] bg-white/98 dark:bg-[#0d0d0d]/98 backdrop-blur-2xl md:hidden flex flex-col justify-between overflow-y-auto text-black dark:text-white p-6"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Top Bar inside Mobile Drawer */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <Link 
                to="/" 
                onClick={closeMenu}
                className="flex items-center gap-2"
              >
                <img
                  src="/2.png"
                  alt="Buildwith_lami"
                  className="h-8 w-auto block dark:hidden"
                />
                <img
                  src="/1.png"
                  alt="Buildwith_lami"
                  className="h-8 w-auto hidden dark:block"
                />
              </Link>
              
              <div className="flex items-center space-x-2">
                <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
                <button
                  type="button"
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-800 dark:text-gray-200 hover:text-accent transition-all active:scale-90 cursor-pointer touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Links Grid */}
            <div className="my-auto py-6 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-4 block mb-2">
                Menu
              </span>
              
              {NAV_LINKS.map(link => {
                const active = isActive(link.path);
                const IconComponent = link.icon;

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={closeMenu}
                    className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between text-base font-heading font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-accent/10 text-accent dark:bg-accent/15 border border-accent/30'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2 rounded-xl ${active ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span>{link.name}</span>
                      {link.highlight && (
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-accent text-white px-2 py-0.5 rounded-full">
                          ⭐ Scoped Pricing
                        </span>
                      )}
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-accent' : 'text-gray-400'}`} />
                  </Link>
                );
              })}

              {isLoggedIn && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="w-full py-3.5 px-4 rounded-2xl flex items-center justify-between text-base font-heading font-bold uppercase tracking-wider bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 rounded-xl bg-blue-600 text-white">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span>Admin Dashboard</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-500" />
                </Link>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
              <Link
                to="/contact"
                onClick={closeMenu}
                className="w-full py-3.5 px-4 rounded-xl bg-accent text-white font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <span>Start a Project Inquiry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-gray-500 font-medium">
                <span>Milestone Invoicing: 50/50</span>
                <a
                  href={`https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent("Hi Eugene, I'm reaching out from Buildwith_lami to discuss a project.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> WhatsApp Direct
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const ThemeToggle = ({ isDark, toggleTheme }) => (
  <button 
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      toggleTheme();
    }} 
    className="w-9 h-9 rounded-xl flex items-center justify-center hover:text-accent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer touch-manipulation" 
    aria-label="Toggle Theme"
  >
    {isDark ? (
      <Sun className="w-4 h-4 text-amber-400" />
    ) : (
      <Moon className="w-4 h-4" />
    )}
  </button>
);

export default Navbar;
