import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ChevronRight, 
  ExternalLink, 
  MessageSquare, 
  FileText, 
  Sparkles,
  Shield,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Home,
  Code2,
  Briefcase,
  Layers,
  Tag,
  User,
  Mail
} from 'lucide-react';
import { getAuthToken, clearAuth, getAuthUser } from '../services/auth';
import { soundManager } from '../utils/sound';
import { CONTACT } from '../config/contact';

const NAV_LINKS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Software', path: '/software', icon: Code2 },
  { name: 'Services', path: '/services', icon: Layers },
  { name: 'Projects', path: '/projects', icon: Briefcase },
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
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 max-w-7xl mx-auto relative z-40">
        {/* Brand Logo */}
        <Link 
          to="/" 
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="text-xl font-heading font-extrabold tracking-widest flex items-center justify-center bg-gray-900 text-white dark:bg-white dark:text-black w-10 h-10 rounded-xl hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all shadow-sm active:scale-95"
          aria-label="BuildWithLami Home"
        >
          Ob
        </Link>
        
        {/* Desktop Menu */}
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
              to="/admin/projects" 
              className="px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 transition-colors"
            >
              Admin
            </Link>
          )}

          <div className="flex items-center space-x-1 pl-2 border-l border-gray-200 dark:border-white/10">
            <SoundToggle />
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          </div>

          <a 
            href="/full-stack-developer.pdf" 
            download="Eugene-Odibenuah-Resume.pdf"
            target="_blank" 
            rel="noopener noreferrer"
            className="border border-gray-800 dark:border-white/20 px-4 py-2 rounded-lg hover:bg-accent hover:text-white hover:border-accent dark:hover:bg-accent dark:hover:border-accent transition-all font-bold text-xs shadow-sm"
          >
            Resume
          </a>
        </div>

        {/* Mobile Navbar Controls */}
        <div className="md:hidden flex items-center space-x-2">
          <SoundToggle />
          <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          
          {/* Dedicated High-Responsiveness Mobile Hamburger Button */}
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-11 h-11 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white hover:text-accent dark:hover:text-accent shadow-sm active:scale-90 transition-all touch-manipulation cursor-pointer"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-accent" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* ── FULLSCREEN RESPONSIVE MOBILE MENU DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] w-full h-[100dvh] bg-white/98 dark:bg-[#0d0d0d]/98 backdrop-blur-2xl md:hidden flex flex-col justify-between overflow-y-auto text-black dark:text-white p-6"
            style={{ overscrollBehavior: 'contain' }}
          >
            {/* Top Bar inside Mobile Drawer */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <Link 
                to="/" 
                onClick={closeMenu}
                className="text-xl font-heading font-extrabold tracking-widest flex items-center justify-center bg-gray-900 text-white dark:bg-white dark:text-black w-10 h-10 rounded-xl shadow-sm"
              >
                Ob
              </Link>
              
              <div className="flex items-center space-x-2">
                <SoundToggle />
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

            {/* Navigation Links Grid (Large Tap Targets) */}
            <div className="my-auto py-6 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-4 block mb-2">
                Navigation
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
                          ⭐ Hot
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

            {/* Bottom Actions & Contact Shortcuts */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10 space-y-3">
              <Link
                to="/contact"
                onClick={closeMenu}
                className="w-full py-3.5 px-4 rounded-xl bg-accent text-white font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <span>Request Project Proposal</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <a 
                  href="/full-stack-developer.pdf" 
                  download="Eugene-Odibenuah-Resume.pdf"
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={closeMenu} 
                  className="py-3 px-3 rounded-xl border border-gray-300 dark:border-white/20 text-center text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Resume (PDF)</span>
                </a>

                <a
                  href={`https://wa.me/${CONTACT.phoneE164 || '2348085186714'}?text=${encodeURIComponent("Hi Eugene, I'm reaching out from BuildWithLami to discuss a project.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="py-3 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp</span>
                </a>
              </div>

              <div className="text-center pt-2">
                <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                  Eugene Odibenuah · BuildWithLami
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const SoundToggle = () => {
  const [soundOn, setSoundOn] = useState(() => {
    try {
      const saved = localStorage.getItem('bwl_sound_enabled');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const handleToggle = (e) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    soundManager.setSoundEnabled(next);
    if (next) soundManager.playPop();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="w-10 h-10 rounded-xl flex items-center justify-center hover:text-accent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer touch-manipulation"
      aria-label={soundOn ? "Mute audio feedback" : "Enable audio feedback"}
      title={soundOn ? "Sound Effects: ON" : "Sound Effects: OFF"}
    >
      {soundOn ? (
        <Volume2 className="w-5 h-5 text-accent" />
      ) : (
        <VolumeX className="w-5 h-5 opacity-50" />
      )}
    </button>
  );
};

const ThemeToggle = ({ isDark, toggleTheme }) => (
  <button 
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      toggleTheme();
    }} 
    className="w-10 h-10 rounded-xl flex items-center justify-center hover:text-accent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer touch-manipulation" 
    aria-label="Toggle Theme"
  >
    {isDark ? (
      <Sun className="w-5 h-5 text-amber-400" />
    ) : (
      <Moon className="w-5 h-5" />
    )}
  </button>
);

export default Navbar;
