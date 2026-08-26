import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ErrorBoundary from './components/ErrorBoundary';
import Preloader from './components/Preloader';
import ToastHost from './components/ToastHost';
import ThemeToast from './components/ThemeToast';
import { Toaster } from './components/ui/sonner';
import SoundEffects from './components/SoundEffects';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { HomePageSkeleton, PageSkeleton } from './components/Skeleton';

const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const ProjectsPage = lazyWithRetry(() => import('./pages/ProjectsPage'));
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));
const ServicesPage = lazyWithRetry(() => import('./pages/ServicesPage'));
const ProjectDetailPage = lazyWithRetry(() => import('./pages/ProjectDetailPage'));
const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'));
const SoftwareHomePage = lazyWithRetry(() => import('./pages/software/SoftwareHomePage'));
const SurveyHomePage = lazyWithRetry(() => import('./pages/survey/SurveyHomePage'));
const DroneHomePage = lazyWithRetry(() => import('./pages/drone/DroneHomePage'));
const SurveyProjectDetailPage = lazyWithRetry(() => import('./pages/survey/SurveyProjectDetailPage'));
const DroneProjectDetailPage = lazyWithRetry(() => import('./pages/drone/DroneProjectDetailPage'));

const AdminClientProjects = lazyWithRetry(() => import('./pages/admin/AdminClientProjects'));
const AdminClients = lazyWithRetry(() => import('./pages/admin/AdminClients'));
const AdminProjectDetail = lazyWithRetry(() => import('./pages/admin/AdminProjectDetail'));
const AdminIntakeTemplates = lazyWithRetry(() => import('./pages/admin/AdminIntakeTemplates'));
const AdminInvoices = lazyWithRetry(() => import('./pages/admin/AdminInvoices'));
const AdminExpenses = lazyWithRetry(() => import('./pages/admin/AdminExpenses'));
const AdminReports = lazyWithRetry(() => import('./pages/admin/AdminReports'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/AdminDashboard'));
const AdminSettings = lazyWithRetry(() => import('./pages/admin/AdminSettings'));
const AdminLogs = lazyWithRetry(() => import('./pages/admin/AdminLogs'));
const AdminPortfolio = lazyWithRetry(() => import('./pages/admin/AdminPortfolio'));
const AdminInbox = lazyWithRetry(() => import('./pages/admin/AdminInbox'));
const AdminContracts = lazyWithRetry(() => import('./pages/admin/AdminContracts'));
const AdminTwoFactorSetup = lazyWithRetry(() => import('./pages/admin/AdminTwoFactorSetup'));
const AdminCRM = lazyWithRetry(() => import('./pages/admin/AdminCRM'));
const AdminQuotations = lazyWithRetry(() => import('./pages/admin/AdminQuotations'));
const AdminEmailTemplates = lazyWithRetry(() => import('./pages/admin/AdminEmailTemplates'));
const AdminHelp = lazyWithRetry(() => import('./pages/admin/AdminHelp'));
const AdminPaymentQueue = lazyWithRetry(() => import('./pages/admin/AdminPaymentQueue'));
const PaymentPage = lazyWithRetry(() => import('./pages/PaymentPage'));

const PricingPage = lazyWithRetry(() => import('./pages/PricingPage'));
const AdminSurveyBookings = lazyWithRetry(() => import('./pages/admin/survey/AdminSurveyBookings'));
const AdminSurveyProjects = lazyWithRetry(() => import('./pages/admin/survey/AdminSurveyProjects'));
const AdminDroneBookings = lazyWithRetry(() => import('./pages/admin/drone/AdminDroneBookings'));
const AdminDroneFlightMissions = lazyWithRetry(() => import('./pages/admin/drone/AdminDroneFlightMissions'));
const AdminLayout = lazyWithRetry(() => import('./components/AdminLayout'));
const ClientProjectTracker = lazyWithRetry(() => import('./pages/ClientProjectTracker'));
const ClientIntakeForm = lazyWithRetry(() => import('./pages/ClientIntakeForm'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { api } from './services/api.js';

// Client Portal Components
const ClientLogin = lazyWithRetry(() => import('./pages/client/ClientLogin'));
const ClientPortalLayout = lazyWithRetry(() => import('./components/ClientPortalLayout'));
const ClientDashboard = lazyWithRetry(() => import('./pages/client/ClientDashboard'));
const ClientProjects = lazyWithRetry(() => import('./pages/client/ClientProjects'));
const ClientQuotations = lazyWithRetry(() => import('./pages/client/ClientQuotations'));
const ClientContracts = lazyWithRetry(() => import('./pages/client/ClientContracts'));
const ClientInvoices = lazyWithRetry(() => import('./pages/client/ClientInvoices'));
const ClientDocuments = lazyWithRetry(() => import('./pages/client/ClientDocuments'));
const ClientMessages = lazyWithRetry(() => import('./pages/client/ClientMessages'));
const ClientProfile = lazyWithRetry(() => import('./pages/client/ClientProfile'));
const ClientTimeline = lazyWithRetry(() => import('./pages/client/ClientTimeline'));
const ClientProtectedRoute = lazyWithRetry(() => import('./components/ClientProtectedRoute'));
import { ClientAuthProvider } from './contexts/ClientAuthContext';

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

  // Initialize API client: fetch CSRF token on app start
  useEffect(() => {
    api.init();
  }, []);

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

  if (showPreloader && !preloaderTimedOut && !location.pathname.startsWith('/admin')) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }

  // Determine if the current route should hide the global Navbar and Footer
  const currentPath = (location.pathname || '').toLowerCase();
  const hideGlobalLayout =
    currentPath.startsWith('/drone') ||
    currentPath.startsWith('/survey') ||
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/portal') ||
    currentPath === '/login';

  const RouteSuspenseFallback = () => {
    if (location.pathname === '/' || location.pathname === '') {
      return <HomePageSkeleton />;
    }
    return <PageSkeleton />;
  };

  return (
    <AuthProvider>
    <ClientAuthProvider>
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-background dark:text-white font-body selection:bg-accent selection:text-white transition-colors duration-500">
      <ErrorBoundary>
        {!hideGlobalLayout && <Navbar isDark={isDark} toggleTheme={toggleTheme} />}
        <main>
          <Suspense fallback={<RouteSuspenseFallback />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
                <Route path="/projects" element={<PageWrapper><ProjectsPage /></PageWrapper>} />

                <Route path="/pricing" element={<PageWrapper><PricingPage /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
                <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
                <Route path="/software" element={<PageWrapper><SoftwareHomePage /></PageWrapper>} />
                <Route path="/projects/:id" element={<PageWrapper><ProjectDetailPage /></PageWrapper>} />
                <Route path="/survey" element={<PageWrapper><SurveyHomePage /></PageWrapper>} />
                <Route path="/survey/projects/:id" element={<PageWrapper><SurveyProjectDetailPage /></PageWrapper>} />
                <Route path="/drone" element={<PageWrapper><DroneHomePage /></PageWrapper>} />
                <Route path="/drone/projects/:id" element={<PageWrapper><DroneProjectDetailPage /></PageWrapper>} />
                
                {/* Admin Routes — Protected by JWT verification */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout isDark={isDark} toggleTheme={toggleTheme} /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="crm" element={<AdminCRM />} />
                  <Route path="email-templates" element={<AdminEmailTemplates />} />
                  {/* Phase 6 — workspace-scoped admin pages */}
                  <Route path="survey/bookings" element={<AdminSurveyBookings />} />
                  <Route path="survey/projects" element={<AdminSurveyProjects />} />
                  <Route path="survey/portfolio" element={<AdminPortfolio lockedDivision="SURVEY" />} />
                  <Route path="drone/bookings" element={<AdminDroneBookings />} />
                  <Route path="drone/missions" element={<AdminDroneFlightMissions />} />
                  <Route path="drone/portfolio" element={<AdminPortfolio lockedDivision="DRONE" />} />
                  <Route path="portfolio" element={<AdminPortfolio lockedDivision="SOFTWARE" />} />
                  <Route path="projects" element={<AdminClientProjects />} />
                  <Route path="clients" element={<AdminClients />} />
                  <Route path="quotations" element={<AdminQuotations />} />
                  <Route path="projects/:id" element={<AdminProjectDetail />} />
                  <Route path="invoices" element={<AdminInvoices />} />
                  <Route path="expenses" element={<AdminExpenses />} />
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

                {/* Client Portal MVP Routes */}
                <Route path="/portal/login" element={<ClientLogin />} />
                <Route path="/portal" element={<ClientProtectedRoute><ClientPortalLayout isDark={isDark} toggleTheme={toggleTheme} /></ClientProtectedRoute>}>
                  <Route index element={<ClientDashboard />} />
                  <Route path="projects" element={<ClientProjects />} />
                  <Route path="quotations" element={<ClientQuotations />} />
                  <Route path="contracts" element={<ClientContracts />} />
                  <Route path="invoices" element={<ClientInvoices />} />
                  <Route path="documents" element={<ClientDocuments />} />
                  <Route path="messages" element={<ClientMessages />} />
                  <Route path="timeline" element={<ClientTimeline />} />
                  <Route path="profile" element={<ClientProfile />} />
                </Route>

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
        <Toaster position="top-right" richColors />
        <SoundEffects />
      </ErrorBoundary>
    </div>
    </ClientAuthProvider>
    </AuthProvider>
  );
}

export default App;