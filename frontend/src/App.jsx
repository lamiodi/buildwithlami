import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ErrorBoundary from './components/ErrorBoundary';
import Preloader from './components/Preloader';
import ToastHost from './components/ToastHost';
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProjectsPage = React.lazy(() => import('./pages/ProjectsPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const ServicesPage = React.lazy(() => import('./pages/ServicesPage'));
const ProjectDetailPage = React.lazy(() => import('./pages/ProjectDetailPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const SurveyHomePage = React.lazy(() => import('./pages/survey/SurveyHomePage'));
const DroneHomePage = React.lazy(() => import('./pages/drone/DroneHomePage'));
import ThemeToast from './components/ThemeToast';
const AdminClientProjects = React.lazy(() => import('./pages/admin/AdminClientProjects'));
const AdminClients = React.lazy(() => import('./pages/admin/AdminClients'));
const AdminProjectDetail = React.lazy(() => import('./pages/admin/AdminProjectDetail'));
const AdminIntakeTemplates = React.lazy(() => import('./pages/admin/AdminIntakeTemplates'));
const AdminInvoices = React.lazy(() => import('./pages/admin/AdminInvoices'));
const AdminReports = React.lazy(() => import('./pages/admin/AdminReports'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSettings = React.lazy(() => import('./pages/admin/AdminSettings'));
const AdminLogs = React.lazy(() => import('./pages/admin/AdminLogs'));
const AdminPortfolio = React.lazy(() => import('./pages/admin/AdminPortfolio'));
const AdminInbox = React.lazy(() => import('./pages/admin/AdminInbox'));
const AdminContracts = React.lazy(() => import('./pages/admin/AdminContracts'));
const AdminTwoFactorSetup = React.lazy(() => import('./pages/admin/AdminTwoFactorSetup'));
const AdminCRM = React.lazy(() => import('./pages/admin/AdminCRM'));
const AdminEmailTemplates = React.lazy(() => import('./pages/admin/AdminEmailTemplates'));
const AdminCMS = React.lazy(() => import('./pages/admin/AdminCMS'));
const AdminTestimonials = React.lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminEquipment = React.lazy(() => import('./pages/admin/AdminEquipment'));
const AdminIndustries = React.lazy(() => import('./pages/admin/AdminIndustries'));
const AdminHelp = React.lazy(() => import('./pages/admin/AdminHelp'));
const AdminPaymentQueue = React.lazy(() => import('./pages/admin/AdminPaymentQueue'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const AdminSurveyBookings = React.lazy(() => import('./pages/admin/survey/AdminSurveyBookings'));
const AdminSurveyProjects = React.lazy(() => import('./pages/admin/survey/AdminSurveyProjects'));
const AdminDroneBookings = React.lazy(() => import('./pages/admin/drone/AdminDroneBookings'));
const AdminDroneFlightMissions = React.lazy(() => import('./pages/admin/drone/AdminDroneFlightMissions'));
const AdminLayout = React.lazy(() => import('./components/AdminLayout'));
const ClientProjectTracker = React.lazy(() => import('./pages/ClientProjectTracker'));
const ClientIntakeForm = React.lazy(() => import('./pages/ClientIntakeForm'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

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

  // Determine if the current route should hide the global Navbar and Footer
  const hideGlobalLayout = location.pathname === '/drone' || location.pathname === '/survey' || location.pathname.startsWith('/admin') || location.pathname === '/login';

  return (
    <AuthProvider>
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-background dark:text-white font-body selection:bg-accent selection:text-white transition-colors duration-500">
      <ErrorBoundary>
        {!hideGlobalLayout && <Navbar isDark={isDark} toggleTheme={toggleTheme} />}
        <main>
          <Suspense fallback={<Preloader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/projects" element={<PageWrapper><ProjectsPage /></PageWrapper>} />
                <Route path="/resources" element={<PageWrapper><ResourcesPage /></PageWrapper>} />
                <Route path="/portfolio" element={<PageWrapper><PortfolioPage /></PageWrapper>} />
                <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
                <Route path="/projects/:id" element={<PageWrapper><ProjectDetailPage /></PageWrapper>} />
                <Route path="/survey" element={<PageWrapper><SurveyHomePage /></PageWrapper>} />
                <Route path="/drone" element={<PageWrapper><DroneHomePage /></PageWrapper>} />
                
                {/* Admin Routes — Protected by JWT verification */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout isDark={isDark} toggleTheme={toggleTheme} /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="crm" element={<AdminCRM />} />
                  <Route path="email-templates" element={<AdminEmailTemplates />} />
                  <Route path="cms" element={<AdminCMS />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="equipment" element={<AdminEquipment />} />
                  <Route path="industries" element={<AdminIndustries />} />
                  {/* Phase 6 — workspace-scoped admin pages */}
                  <Route path="survey/bookings" element={<AdminSurveyBookings />} />
                  <Route path="survey/projects" element={<AdminSurveyProjects />} />
                  <Route path="drone/bookings" element={<AdminDroneBookings />} />
                  <Route path="drone/missions" element={<AdminDroneFlightMissions />} />
                  <Route path="portfolio" element={<AdminPortfolio />} />
                  <Route path="projects" element={<AdminClientProjects />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="projects/:id" element={<AdminProjectDetail />} />
                  <Route path="invoices" element={<AdminInvoices />} />
                  <Route path="reports" element={<AdminReports />} />
                  <Route path="templates" element={<AdminIntakeTemplates />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="inbox" element={<AdminInbox />} />
                  <Route path="contracts" element={<AdminContracts />} />
                  <Route path="payments" element={<AdminPaymentQueue />} />
                  <Route path="security/2fa" element={<AdminTwoFactorSetup />} />
                  <Route path="help" element={<AdminHelp />} />
                </Route>
                
                {/* Auth Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Client Public Routes */}
                <Route path="/track/:trackingId" element={<ClientProjectTracker />} />
                <Route path="/form/:formId" element={<ClientIntakeForm />} />
                <Route path="/pay/:token" element={<PaymentPage />} />

                <Route path="*" element={<PageWrapper><NotFoundPage /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>
        {!hideGlobalLayout && <Footer />}
        <WhatsAppWidget />
        <ThemeToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
        <ToastHost />
      </ErrorBoundary>
    </div>
    </AuthProvider>
  );
}

export default App;