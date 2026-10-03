import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Navbar from './components/Navbar';
import Seo from './components/Seo';
import Footer from './components/Footer';
import WhatsAppWidget from './components/WhatsAppWidget';
import ErrorBoundary from './components/ErrorBoundary';
import Preloader from './components/Preloader';
import ToastHost from './components/ToastHost';
import { Toaster } from './components/ui/sonner';
import SoundEffects from './components/SoundEffects';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { HomePageSkeleton, PageSkeleton } from './components/Skeleton';
import { soundManager } from './utils/sound';
import { Volume2, VolumeX } from 'lucide-react';

// Statically import core public pages for zero-latency instant transitions
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import PricingPage from './pages/PricingPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import UnsubscribePage from './pages/UnsubscribePage';
import SoftwareHomePage from './pages/software/SoftwareHomePage';

// Lazy-loaded divisions and admin pages
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
const AdminTasks = lazyWithRetry(() => import('./pages/admin/AdminTasks'));
const AdminClientDetail = lazyWithRetry(() => import('./pages/admin/AdminClientDetail'));
const AdminOutreach = lazyWithRetry(() => import('./pages/admin/AdminOutreach'));
const AdminAftercare = lazyWithRetry(() => import('./pages/admin/AdminAftercare'));
const ReferralLanding = lazyWithRetry(() => import('./pages/ReferralLanding'));
const PaymentPage = lazyWithRetry(() => import('./pages/PaymentPage'));

const AdminSurveyBookings = lazyWithRetry(() => import('./pages/admin/survey/AdminSurveyBookings'));
const AdminSurveyProjects = lazyWithRetry(() => import('./pages/admin/survey/AdminSurveyProjects'));
const AdminDroneBookings = lazyWithRetry(() => import('./pages/admin/drone/AdminDroneBookings'));
const AdminDroneFlightMissions = lazyWithRetry(() => import('./pages/admin/drone/AdminDroneFlightMissions'));
const AdminLayout = lazyWithRetry(() => import('./components/AdminLayout'));
const ClientProjectTracker = lazyWithRetry(() => import('./pages/ClientProjectTracker'));
const ClientIntakeForm = lazyWithRetry(() => import('./pages/ClientIntakeForm'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazyWithRetry(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));
const ContractSigningPage = lazyWithRetry(() => import('./pages/ContractSigningPage'));
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
const ClientOnboarding = lazyWithRetry(() => import('./pages/client/ClientOnboarding'));
const ClientApprovals = lazyWithRetry(() => import('./pages/client/ClientApprovals'));
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
      transition={{ duration: shouldReduce ? 0 : 0.2 }}
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const location = useLocation();
  const preloaderPreview = import.meta.env.DEV && new URLSearchParams(location.search).get('preview') === 'preloader';
  const prefersReducedMotion = useReducedMotion();

  // Initialize API client: fetch CSRF token on app start
  useEffect(() => {
    api.init();
  }, []);

  // Read theme state from the DOM (set instantly by index.html inline script)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  // Scroll to top or specific hash on route change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      // Slight delay to ensure DOM is fully rendered before scrolling
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
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
    if (!showPreloader || preloaderPreview) return;
    const t = setTimeout(() => setPreloaderTimedOut(true), 4000);
    return () => clearTimeout(t);
  }, [showPreloader, preloaderPreview]);

  // Site-wide click sounds have a visible mute — soundManager already
  // persists the preference, this just exposes the control.
  const [soundOn, setSoundOn] = useState(() => soundManager.isEnabled());
  const toggleSound = () => setSoundOn(soundManager.toggleSound());

  // Determine if the current route should hide the global Navbar and Footer
  const currentPath = (location.pathname || '').toLowerCase();
  const hideGlobalLayout =
    currentPath.startsWith('/drone') ||
    currentPath.startsWith('/survey') ||
    currentPath.startsWith('/admin') ||
    currentPath.startsWith('/portal') ||
    currentPath === '/login' ||
    currentPath === '/forgot-password' ||
    currentPath.startsWith('/reset-password') ||
    currentPath.startsWith('/sign') ||
    currentPath.startsWith('/contracts/sign') ||
    currentPath.startsWith('/pay') ||
    currentPath.startsWith('/form') ||
    currentPath.startsWith('/track') ||
    currentPath.startsWith('/unsubscribe');

  // Preloader is exclusively displayed on Software Studio pages (e.g. /, /software, /projects, /services, /pricing, /about, /contact)
  // It is omitted on other divisions (Survey, Drone) and internal flows (Admin, Portal, Auth, etc.)
  const isSoftwareRoute =
    !currentPath.startsWith('/drone') &&
    !currentPath.startsWith('/survey') &&
    !currentPath.startsWith('/admin') &&
    !currentPath.startsWith('/portal') &&
    currentPath !== '/login' &&
    currentPath !== '/forgot-password' &&
    !currentPath.startsWith('/reset-password') &&
    !currentPath.startsWith('/sign') &&
    !currentPath.startsWith('/contracts/sign') &&
    !currentPath.startsWith('/pay') &&
    !currentPath.startsWith('/track') &&
    !currentPath.startsWith('/form');

  // Suspend fallback is decided outside of render so its identity is stable
  // across renders. React would otherwise recreate the component on every
  // parent render, resetting any internal state it might hold.
  const suspenseFallback =
    location.pathname === '/' || location.pathname === ''
      ? <HomePageSkeleton />
      : <PageSkeleton />;

  return (
    <AuthProvider>
      <Seo />
    <ClientAuthProvider>
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-background dark:text-white font-body selection:bg-accent selection:text-white transition-colors duration-500 relative">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white dark:focus:bg-gray-900 focus:text-accent focus:shadow-xl focus:ring-2 focus:ring-accent font-semibold rounded-md transition-all"
      >
        Skip to content
      </a>
      {showPreloader && !preloaderTimedOut && isSoftwareRoute && (
        <Preloader preview={preloaderPreview} isDark={isDark} onComplete={() => setShowPreloader(false)} />
      )}
      <ErrorBoundary>
        {!hideGlobalLayout && <Navbar isDark={isDark} toggleTheme={toggleTheme} />}
        <main id="main" tabIndex={-1} className="focus:outline-none">
          <Suspense fallback={suspenseFallback}>
            <AnimatePresence mode="wait" initial={false}>
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
                  <Route path="clients/:id" element={<AdminClientDetail />} />
                  <Route path="tasks" element={<AdminTasks />} />
                  <Route path="quotations" element={<AdminQuotations />} />
                  <Route path="outreach" element={<AdminOutreach />} />
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
                  <Route path="aftercare" element={<AdminAftercare />} />
                  <Route path="security/2fa" element={<AdminTwoFactorSetup />} />
                  <Route path="help" element={<AdminHelp />} />
                </Route>
                
                {/* Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<PageWrapper><ForgotPasswordPage /></PageWrapper>} />
                <Route path="/reset-password/:token" element={<PageWrapper><ResetPasswordPage /></PageWrapper>} />

                {/* Client Public Routes */}
                <Route path="/ref/:code" element={<PageWrapper><ReferralLanding /></PageWrapper>} />
                <Route path="/track/:trackingId" element={<ClientProjectTracker />} />
                <Route path="/form/:formId" element={<ClientIntakeForm />} />
                <Route path="/pay/:token" element={<PaymentPage />} />
                <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
                <Route path="/sign/:token" element={<PageWrapper><ContractSigningPage /></PageWrapper>} />
                <Route path="/contracts/sign/:token" element={<PageWrapper><ContractSigningPage /></PageWrapper>} />

                {/* Client Portal MVP Routes */}
                <Route path="/portal/login" element={<ClientLogin />} />
                <Route path="/portal" element={<ClientProtectedRoute><ClientPortalLayout isDark={isDark} toggleTheme={toggleTheme} /></ClientProtectedRoute>}>
                  <Route index element={<ClientDashboard />} />
                  <Route path="onboarding" element={<ClientOnboarding />} />
                  <Route path="approvals" element={<ClientApprovals />} />
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
        {!hideGlobalLayout && <Footer soundOn={soundOn} onToggleSound={toggleSound} />}
        {!hideGlobalLayout && <WhatsAppWidget />}
        <ToastHost />
        <Toaster position="top-right" richColors />
        <SoundEffects />
        {hideGlobalLayout && <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Mute click sounds' : 'Enable click sounds'}
          title={soundOn ? 'Mute click sounds' : 'Enable click sounds'}
          className="fixed bottom-5 left-5 z-40 p-2.5 rounded-full border border-gray-300 dark:border-white/15 bg-white/85 dark:bg-black/70 backdrop-blur text-gray-600 dark:text-gray-300 hover:text-accent hover:border-accent transition-colors cursor-pointer"
        >
          {soundOn ? (
            <Volume2 className="w-4 h-4" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4" aria-hidden="true" />
          )}
        </button>}
      </ErrorBoundary>
    </div>
    </ClientAuthProvider>
    </AuthProvider>
  );
}

export default App;