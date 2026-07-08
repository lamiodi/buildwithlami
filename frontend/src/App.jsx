import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ErrorBoundary from './components/ErrorBoundary';
import Preloader from './components/Preloader';
import ToastHost from './components/ToastHost';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import ThemeToast from './components/ThemeToast';
import AdminClientProjects from './pages/admin/AdminClientProjects';
import AdminClients from './pages/admin/AdminClients';
import AdminProjectDetail from './pages/admin/AdminProjectDetail';
import AdminIntakeTemplates from './pages/admin/AdminIntakeTemplates';
import AdminInvoices from './pages/admin/AdminInvoices';
import AdminReports from './pages/admin/AdminReports';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';
import AdminPortfolio from './pages/admin/AdminPortfolio';
import AdminLayout from './components/AdminLayout';
import ClientProjectTracker from './pages/ClientProjectTracker';
import ClientIntakeForm from './pages/ClientIntakeForm';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

// Page transition wrapper
const PageWrapper = ({ children }) => {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: shouldReduce ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: shouldReduce ? 1 : 0 }}
      transition={{ duration: shouldReduce ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [toastMessage, setToastMessage] = useState(null);
  const [showPreloader, setShowPreloader] = useState(true);
  const location = useLocation();

  // Read theme state from the DOM (set instantly by index.html inline script)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    // Show toast only on first load if no saved theme (auto-detected)
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const hour = new Date().getHours();
      const isDaytime = hour >= 6 && hour < 18;
      if (!isDaytime) {
        setToastMessage("Good evening! 🌙 Dark mode enabled based on your local time.");
      } else {
        setToastMessage("Good morning! ☀️ Light mode enabled based on your local time.");
      }
    }
  }, []);

  // Scroll to top or specific hash on route change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Slight delay to ensure DOM is fully rendered before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return nextTheme;
    });
  };

  // Defensive: if Preloader throws or never finishes (e.g. a stalled animation),
  // surface the app after 4s so the user is never permanently locked out.
  const [preloaderTimedOut, setPreloaderTimedOut] = useState(false);
  useEffect(() => {
    if (!showPreloader) return;
    const t = setTimeout(() => setPreloaderTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [showPreloader]);

  if (showPreloader && !preloaderTimedOut) {
    try {
      return <Preloader onComplete={() => setShowPreloader(false)} />;
    } catch (err) {
      console.error('[App] Preloader crashed, falling through:', err);
      setShowPreloader(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-background dark:text-white font-body selection:bg-accent selection:text-white transition-colors duration-500">
      <ErrorBoundary>
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <main>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/projects" element={<PageWrapper><ProjectsPage /></PageWrapper>} />
              <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
              <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
              <Route path="/projects/:id" element={<PageWrapper><ProjectDetailPage /></PageWrapper>} />
              
              {/* Admin Routes — Protected by JWT verification */}
              <Route path="/admin" element={<ProtectedRoute><AdminLayout isDark={isDark} toggleTheme={toggleTheme} /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="portfolio" element={<AdminPortfolio />} />
                <Route path="projects" element={<AdminClientProjects />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="projects/:id" element={<AdminProjectDetail />} />
                <Route path="invoices" element={<AdminInvoices />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="templates" element={<AdminIntakeTemplates />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="logs" element={<AdminLogs />} />
              </Route>
              
              {/* Auth Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Client Public Routes */}
              <Route path="/track/:trackingId" element={<ClientProjectTracker />} />
              <Route path="/form/:formId" element={<ClientIntakeForm />} />

              <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
        <WhatsAppWidget />
        <ThemeToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
        <ToastHost />
      </ErrorBoundary>
    </div>
  );
}

export default App;