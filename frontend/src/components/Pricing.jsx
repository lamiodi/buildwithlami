import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Sliders, 
  ChevronRight,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { 
  COMMERCIAL_TERMS, 
  BUILD_PRICING,
  INFRASTRUCTURE_LEVELS,
  formatDualCurrency,
  FALLBACK_USD_RATE
} from '../config/pricing';
import { useAutomatedCurrency } from '../utils/currency';

const CORE_PRICING_CATEGORIES = ['websites', 'ecommerce', 'software', 'portals', 'maintenance'];
const SPECIALIST_PRICING_CATEGORIES = ['uiux', 'branding', 'seo', 'marketing', 'ai'];
const CURRENCY_PREFERENCE_KEY = 'bwl-pricing-currency';

const categoryFromHash = (hash) => {
  const categoryId = String(hash || '').replace(/^#/, '');
  return Object.prototype.hasOwnProperty.call(BUILD_PRICING, categoryId) ? categoryId : null;
};

const Pricing = ({ isHomepage = false }) => {
  const shouldReduce = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  const autoDetectedCurrency = useAutomatedCurrency();
  const [currencyPreference, setCurrencyPreference] = useState(() => {
    if (typeof window === 'undefined') return 'AUTO';
    try {
      const storedPreference = window.localStorage.getItem(CURRENCY_PREFERENCE_KEY);
      return ['AUTO', 'NGN', 'USD'].includes(storedPreference) ? storedPreference : 'AUTO';
    } catch {
      return 'AUTO';
    }
  });
  const displayCurrency = currencyPreference === 'AUTO' ? autoDetectedCurrency : currencyPreference;

  // Try to fetch the live FX rate from the backend; fall back to the
  // static rate defined in pricing.js if the request fails.
  const [liveRate, setLiveRate] = useState(FALLBACK_USD_RATE);
  useEffect(() => {
    let cancelled = false;
    const apiBase = import.meta.env.VITE_API_URL || '';
    if (!apiBase) return; // backend not configured — keep fallback
    fetch(`${apiBase}/api/fx-rates`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data?.rates?.USD) return;
        const rate = Number(data.rates.USD.rate);
        if (Number.isFinite(rate) && rate > 0) setLiveRate(rate);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Helper: render a price string with auto-detected currency.
  // Returns the primary (local) value plus a small secondary (USD) hint
  // for NGN visitors, OR the primary (USD) value plus the NGN hint for
  // international visitors. Custom-quote tiers display verbatim.
  const renderPrice = (amountNgn, formatted, forceCustom = false) => {
    if (forceCustom || formatted === 'Custom Quote') return formatted;
    // Preserve any cadence suffix (" / yr", " / mo", "+ starting") from the
    // authored priceFormatted so maintenance retainers and Pro tiers keep
    // their natural rhythm in the display.
    const suffixMatch = String(formatted || '').match(/(\s*\/\s*(yr|mo)\b|\s*\+\s*starting|\s*starting\s*)$/i);
    const suffix = suffixMatch ? suffixMatch[0] : '';
    const { primary, secondary } = formatDualCurrency(amountNgn, liveRate, displayCurrency);
    const numPart = primary.replace(/^[₦$]/, '');
    return (
      <>
        <span>{displayCurrency === 'USD' ? '$' : '₦'}{numPart}{suffix}</span>
        <span className="ml-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          ≈ {displayCurrency === 'USD' ? `₦${secondary.replace(/^[₦$]/, '')}` : secondary}
        </span>
      </>
    );
  };

  const [activeCategory, setActiveCategory] = useState(
    () => categoryFromHash(location.hash) || 'websites'
  );

  useEffect(() => {
    const hashedCategory = categoryFromHash(location.hash);
    if (hashedCategory) setActiveCategory(hashedCategory);
  }, [location.hash]);

  const handleCategoryChange = (categoryId) => {
    if (!Object.prototype.hasOwnProperty.call(BUILD_PRICING, categoryId)) return;
    setActiveCategory(categoryId);
    navigate(
      { pathname: location.pathname, search: location.search, hash: `#${categoryId}` },
      { replace: true }
    );
  };

  const handleCurrencyChange = (preference) => {
    if (!['AUTO', 'NGN', 'USD'].includes(preference)) return;
    setCurrencyPreference(preference);
    try {
      window.localStorage.setItem(CURRENCY_PREFERENCE_KEY, preference);
    } catch {
      // The preference still works for this visit when storage is unavailable.
    }
  };

  // Get active category object and tiers
  const currentCategoryData = BUILD_PRICING[activeCategory] || BUILD_PRICING.websites;
  const currentTiers = currentCategoryData.tiers;
  const isCareCategory = activeCategory === 'maintenance';
  const activeInfrastructureLevels = currentCategoryData.baseInfraIncluded
    ? [...new Set(currentTiers.map((tier) => tier.infrastructureLevel).filter(Boolean))]
        .map((levelId) => INFRASTRUCTURE_LEVELS[levelId])
        .filter(Boolean)
    : [];

  const infrastructureValue = (level) => {
    const { primary, secondary } = formatDualCurrency(level.annualNGN, liveRate, displayCurrency);
    return {
      primary: `${level.valuePrefix ? `${level.valuePrefix} ` : ''}${primary}/year value`,
      secondary: `≈ ${secondary}/year`
    };
  };


  return (
    <section id="pricing" className="py-24 px-6 md:px-12 bg-gray-50 dark:bg-background transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* ── HEADER ── */}
        <motion.div
          className="text-center mb-16"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={sectionViewport}
        >
          <div className="bwl-eyebrow mb-4 justify-center">
            <span className="w-2 h-2 bg-accent inline-block" />
            <span>Studio Pricing · Scoped to the Work</span>
          </div>

          <motion.h2 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Transparent Pricing. <br />
            <span className="italic font-normal text-accent">No Surprise Invoices.</span>
          </motion.h2>

          <motion.p variants={item} className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed mb-6">
            Every deliverable and boundary is clearly priced before work begins. Fixed scopes, predictable timelines, and clear 50/50 milestone invoicing.
          </motion.p>

          {/* Minimalist Trust & Invoicing Reassurance Bar */}
          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Milestone Invoicing: <strong className="text-gray-900 dark:text-white font-semibold">50% upfront, 50% upon delivery</strong></span>
            </div>
            <span className="hidden sm:inline text-gray-300 dark:text-white/20">·</span>
            <div className="flex items-center gap-1.5">
              <span className="text-accent font-bold">✦</span>
              <span>Post-launch warranty support included with every package</span>
            </div>
          </motion.div>

          {/* ── 3-STEP COMMERCIAL FRAMEWORK: BUILD → RUN → MAINTAIN ── */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto text-left"
          >
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-mono font-bold text-[10px] flex items-center justify-center">01</span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white">BUILD · One-Time Development</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Fixed-scope design, frontend & backend engineering, and pre-launch QA on standard 50/50 milestone terms with included post-launch warranty.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-mono font-bold text-[10px] flex items-center justify-center">02</span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white">RUN · Production Infrastructure</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                The matching infrastructure level is included at no additional charge for the first 12 months of every eligible build.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-5 h-5 rounded-full bg-accent/10 text-accent font-mono font-bold text-[10px] flex items-center justify-center">03</span>
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white">MAINTAIN · Optional Care Plans</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Optional human support for planned updates, reporting, and reserved developer improvement hours after launch.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── HOMEPAGE SUMMARY PILLARS (Clean Overview for Homepage) ── */}
        {isHomepage ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Web Development */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <div className="bwl-eyebrow mb-2">
                    <span className="w-2 h-2 bg-accent inline-block" />
                    <span>01 · Web Development</span>
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">Web Development</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
                    Custom websites built around real goals, content, and customers—not a generic theme.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {renderPrice(BUILD_PRICING.websites.startingPriceNGN, BUILD_PRICING.websites.startingPriceFormatted)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">Starter · Growth (Best Value) · Pro Custom</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>Responsive custom interface</span></li>
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>Editable CMS content integration</span></li>
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>Up to 30 days post-launch support</span></li>
                  </ul>
                </div>
                <Link to="/pricing#websites" className="btn-dark w-full text-center" style={{ touchAction: 'manipulation' }}>
                  View Web Tiers <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>

              {/* Pillar 2: E-Commerce (Featured) */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#141414] border-2 border-accent shadow-xl flex flex-col justify-between relative">
                <span className="absolute -top-3 right-6 bg-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 shadow-md">
                  Core Commerce Engine
                </span>
                <div>
                  <div className="bwl-eyebrow mb-2">
                    <span className="w-2 h-2 bg-accent inline-block" />
                    <span>02 · E-Commerce</span>
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">E-Commerce Engines</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
                    Online stores designed for clearer paths to purchase, multi-channel payments, and fulfillment.
                  </p>
                  <div className="p-4 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {renderPrice(BUILD_PRICING.ecommerce.startingPriceNGN, BUILD_PRICING.ecommerce.startingPriceFormatted)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block mt-1 font-medium">Starter · Growth (Best Value) · Pro Custom</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>Paystack checkout & bank transfer (NGN, USD, EUR, GBP)</span></li>
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>Abandoned cart recovery & accounts</span></li>
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>30 days priority bug-fix support</span></li>
                  </ul>
                </div>
                <Link to="/pricing#ecommerce" className="btn-primary w-full text-center" style={{ touchAction: 'manipulation' }}>
                  Compare E-Commerce Tiers <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>

              {/* Pillar 3: Custom Software */}
              <div className="p-8 rounded-3xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-lg flex flex-col justify-between hover:border-accent/40 transition-all duration-300">
                <div>
                  <div className="bwl-eyebrow mb-2">
                    <span className="w-2 h-2 bg-accent inline-block" />
                    <span>03 · Custom Software</span>
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-gray-900 dark:text-white mb-2">Custom Software & SaaS</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
                    Custom web applications, SaaS prototypes, booking systems, and internal operational portals.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {renderPrice(BUILD_PRICING.software.startingPriceNGN, BUILD_PRICING.software.startingPriceFormatted)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">MVP · Growth Platform · Enterprise</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-gray-700 dark:text-gray-300 mb-6">
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>Secure sign-in, user roles, and business data workflows</span></li>
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>100% IP & GitHub repository transfer</span></li>
                    <li className="flex items-center gap-2.5"><CheckIcon className="text-accent" /> <span>90 days warranty support</span></li>
                  </ul>
                </div>
                <Link to="/pricing#software" className="btn-dark w-full text-center" style={{ touchAction: 'manipulation' }}>
                  View Software Scope <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </div>
            </div>

            {/* Deep link CTA Banner on Homepage */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-gray-900 to-black text-white dark:from-neutral-900 dark:to-[#121212] border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Studio Pricing Matrix</span>
                <h4 className="text-xl font-bold font-heading">Explore all 10 service categories and transparent scope tiers</h4>
                <p className="text-xs text-gray-400 mt-1">Includes Web Dev, E-Commerce, Custom Software, Business Management Systems & ERP, UI/UX, Branding, SEO, Marketing, AI, and Maintenance.</p>
              </div>
              <Link 
                to="/pricing" 
                className="shrink-0 px-6 py-3.5 rounded-full bg-accent text-white font-extrabold text-xs uppercase tracking-wider hover:bg-accent/90 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                Open Full Pricing Page <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── FULL STUDIO PRICING PAGE EXPERIENCE ── */
          <div className="space-y-16">

            {/* ── 1. PRIMARY CATEGORY NAVIGATION (Responsive Matrix) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-gray-200 dark:border-white/10 pb-8">
              <div>
                <label htmlFor="pricing-category" className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
                  Choose the closest service
                </label>
                <select
                  id="pricing-category"
                  value={activeCategory}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className="bwl-input min-h-12 text-base font-semibold"
                >
                  <optgroup label="Core build and support">
                    {CORE_PRICING_CATEGORIES.map((categoryId) => (
                      <option key={categoryId} value={categoryId}>{BUILD_PRICING[categoryId].label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Specialist services and add-ons">
                    {SPECIALIST_PRICING_CATEGORIES.map((categoryId) => (
                      <option key={categoryId} value={categoryId}>{BUILD_PRICING[categoryId].label}</option>
                    ))}
                  </optgroup>
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Not sure which service fits? Choose “Not sure yet” on the inquiry form and describe the outcome you need.
                </p>
              </div>

              <div>
                <label htmlFor="pricing-currency" className="block text-xs font-bold text-gray-900 dark:text-white mb-2">
                  Display currency
                </label>
                <select
                  id="pricing-currency"
                  value={currencyPreference}
                  onChange={(event) => handleCurrencyChange(event.target.value)}
                  className="bwl-input min-h-12 min-w-52 text-base font-semibold"
                >
                  <option value="AUTO">Auto ({autoDetectedCurrency})</option>
                  <option value="NGN">Nigerian Naira (NGN)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                  Showing {displayCurrency}. Final invoices are issued in NGN.
                </p>
              </div>
            </div>

            {/* ── 2. CARDS GRID (For Active Category) ── */}
            <div id={activeCategory}>
              <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="bwl-eyebrow mb-2">
                    <span className="w-2 h-2 bg-accent inline-block" />
                    <span>{currentCategoryData.title}</span>
                  </div>
                  {currentCategoryData.offerStructureLabel && (
                    <p className="mb-2 text-xs font-bold text-accent">{currentCategoryData.offerStructureLabel}</p>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                    {currentCategoryData.desc}
                  </h3>
                </div>
                <div className="shrink-0 p-3 sm:p-4 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/20 text-left md:text-right">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block">Starting Investment</span>
                  <span className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                    {renderPrice(currentCategoryData.startingPriceNGN, currentCategoryData.startingPriceFormatted)}
                  </span>
                </div>
              </div>

              <motion.div
                className={`grid grid-cols-1 ${
                  currentTiers.length === 4 
                    ? 'md:grid-cols-2 lg:grid-cols-4' 
                    : 'md:grid-cols-3'
                } gap-6`}
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={sectionViewport}
              >
                {currentTiers.map((tier) => {
                  const isCustom = tier.priceFormatted === "Custom Quote";
                  const infrastructure = tier.infrastructureLevel
                    ? INFRASTRUCTURE_LEVELS[tier.infrastructureLevel]
                    : null;
                  const includedInfrastructureValue = infrastructure
                    ? infrastructureValue(infrastructure)
                    : null;
                  const contactQuery = new URLSearchParams({
                    service: activeCategory,
                    tier: tier.name,
                    currency: displayCurrency
                  }).toString();
                  const annualCarePrice = isCareCategory && tier.monthlyPriceNGN && tier.annualPriceNGN
                    ? formatDualCurrency(tier.annualPriceNGN, liveRate, displayCurrency)
                    : null;
                  const annualCareSavings = annualCarePrice
                    ? formatDualCurrency((tier.monthlyPriceNGN * 12) - tier.annualPriceNGN, liveRate, displayCurrency)
                    : null;

                  return (
                    <motion.div
                      key={tier.id}
                      id={`pricing-card-${tier.id}`}
                      whileHover={shouldReduce ? {} : cardHover}
                      className={`relative p-6 sm:p-8 border ${
                        tier.popular
                          ? 'border-accent dark:border-accent shadow-xl ring-2 ring-accent/20'
                          : 'border-gray-200 dark:border-white/10'
                      } bg-white dark:bg-[#141414] rounded-2xl group hover:shadow-2xl hover:border-accent/60 transition-all duration-300 flex flex-col justify-between`}
                    >
                      <div>
                        {tier.popular && (
                          <span className="absolute -top-3 right-6 bg-accent text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 shadow-md">
                            {typeof tier.popularBadge === 'string' ? tier.popularBadge.replace('⭐ ', '') : "Best Value"}
                          </span>
                        )}

                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h3 className="text-2xl font-heading font-bold text-black dark:text-white">
                            {tier.name}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-4">{tier.badge}</p>

                        <div className="p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl mb-5">
                          <span className="text-[11px] uppercase tracking-wider text-gray-800 dark:text-gray-200 font-bold block">{tier.bestFor}</span>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 italic block mt-0.5">{tier.examples}</span>
                        </div>

                        {/* Price Tag */}
                        <div className="flex flex-wrap items-baseline gap-1.5 mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
                          {isCustom ? (
                            <span className="text-3xl font-heading font-bold text-black dark:text-white leading-none">{tier.priceFormatted}</span>
                          ) : (
                            <>
                              <span className="text-xs text-gray-500 font-semibold">starting at</span>
                              <span className="text-3xl sm:text-4xl font-heading font-extrabold text-black dark:text-white tracking-tight leading-none">
                                {renderPrice(tier.priceNGN, tier.priceFormatted)}
                              </span>
                            </>
                          )}
                        </div>

                        {annualCarePrice && (
                          <p className="-mt-1 mb-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Annual: <span className="text-gray-900 dark:text-white">{annualCarePrice.primary}/year</span>
                            {annualCareSavings && Number(tier.monthlyPriceNGN * 12) > Number(tier.annualPriceNGN) && (
                              <span className="ml-2 text-emerald-700 dark:text-emerald-400">Save {annualCareSavings.primary}</span>
                            )}
                          </p>
                        )}

                        {infrastructure && (
                          <div className="mb-5 border-y border-blue-200 dark:border-blue-400/20 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                                {isCareCategory ? 'Included while Care is active' : 'Included for the first 12 months'}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                {includedInfrastructureValue.primary}
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                              {infrastructure.name}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                              {infrastructure.summary} <span className="whitespace-nowrap">{includedInfrastructureValue.secondary}</span>
                            </p>
                          </div>
                        )}

                        {/* Timeline, Revisions, Support Guarantees */}
                        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium mb-6 bg-gray-50/70 dark:bg-white/5 p-3 rounded-xl">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-500">Timeline:</span>
                            <span>{tier.timeline}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-500">Revisions:</span>
                            <span>{tier.revisions}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-accent">
                            <span className="font-semibold text-gray-500">Support:</span>
                            <span className="font-semibold">{tier.support}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-6 font-light">
                          {tier.desc}
                        </p>

                        {/* Deliverables List (Included) */}
                        <div className="space-y-3 mb-6">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 block font-mono">
                            Included in this scope
                          </span>
                          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            {tier.features.map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2.5 leading-snug">
                                <CheckIcon className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Explicit NOT INCLUDED List (GoodFound Pattern) */}
                        {tier.notIncluded && tier.notIncluded.length > 0 && (
                          <div className="space-y-2 mb-8 pt-4 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-400 block font-mono">
                              Not included
                            </span>
                            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400 font-light">
                              {tier.notIncluded.map((notItem, nIdx) => (
                                <li key={nIdx} className="flex items-start gap-2 leading-snug">
                                  <span className="text-rose-500 font-bold shrink-0 text-[11px]">—</span>
                                  <span>{notItem}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="relative z-10">
                        <Link
                          to={`/contact?${contactQuery}`}
                          className={tier.popular ? 'btn-primary w-full' : 'btn-dark w-full'}
                          style={{ touchAction: 'manipulation' }}
                        >
                          Request a scoped proposal <ArrowRight className="w-3.5 h-3.5 ml-2" />
                        </Link>
                        <p className="text-[10px] text-center text-gray-400 mt-2 font-mono">
                          50% upfront, 50% upon delivery
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Category-Specific Pricing Explanations & Notes (GoodFound Pattern) */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 rounded-3xl bg-gray-100/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-accent" /> What affects final pricing
                  </h4>
                  <ul className="space-y-1.5 text-gray-600 dark:text-gray-400">
                    {currentCategoryData.whatAffectsPricing?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" /> Pricing & Delivery Notes
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {currentCategoryData.pricingNotes}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    <span>Questions before sending a brief?</span>
                    <Link to={`/contact?service=${encodeURIComponent(activeCategory)}`} className="underline hover:opacity-80">Ask a pricing question →</Link>
                  </div>
                </div>
              </div>

              {activeInfrastructureLevels.length > 0 && (
                <div className="mt-10 overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-400/20 bg-blue-50/60 dark:bg-blue-950/10">
                  <div className="px-6 py-7 sm:px-8 border-b border-blue-200 dark:border-blue-400/20">
                    <h3 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                      Infrastructure that scales with your build
                    </h3>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-blue-950/70 dark:text-blue-100/70">
                      {isCareCategory
                        ? 'Your Care plan keeps the level shown on its card active. Higher levels add capacity, stronger recovery, closer operational oversight, and faster human response windows.'
                        : 'Your build includes the level shown on its card for 12 months. Higher levels add capacity, safer release environments, stronger recovery, and closer operational oversight.'}
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 ${activeInfrastructureLevels.length === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} divide-y lg:divide-y-0 lg:divide-x divide-blue-200 dark:divide-blue-400/20`}>
                    {activeInfrastructureLevels.map((level) => {
                      const value = infrastructureValue(level);
                      return (
                        <div key={level.id} className="p-6 sm:p-7">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="text-lg font-bold font-heading text-gray-900 dark:text-white">{level.shortName}</p>
                              <p className="mt-1 text-xs font-semibold text-blue-700 dark:text-blue-300">{value.primary}</p>
                            </div>
                            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{level.summary}</p>
                          <ul className="mt-5 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            {level.included.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 leading-relaxed">
                                <CheckIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-300" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <p className="px-6 py-4 sm:px-8 border-t border-blue-200 dark:border-blue-400/20 text-xs leading-relaxed text-blue-950/70 dark:text-blue-100/70">
                    {isCareCategory
                      ? 'Infrastructure remains included while the Care plan is active and within its stated limits. Usage above those limits and premium third-party services are scoped separately with no hidden markup.'
                      : 'Included capacity is subject to the limits shown above and the final proposal. From month 13, continue through a matching Care plan, move provider billing to your client-owned accounts, or right-size the profile around actual usage. Provider renewals are passed through with 0% markup.'}
                  </p>
                </div>
              )}
            </div>

            {/* ── 3. PRODUCTION INFRASTRUCTURE & RESPONSIBILITY STANDARD ── */}
            <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10 shadow-lg space-y-8">
              <div className="max-w-3xl">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent block mb-1">Production Infrastructure & Commercial Standard</span>
                <h3 className="text-3xl font-bold font-heading text-black dark:text-white mb-3">
                  Build, infrastructure and Care—clearly separated
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                  Your build fee, first-year infrastructure, warranty, and optional Care plan each solve a different need. You keep full account ownership without proprietary hosting lock-in.
                </p>
              </div>

              {/* 3 Pillars Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Pillar 1: BUILD */}
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-accent/10 text-accent font-mono font-bold text-xs flex items-center justify-center">01</span>
                    <h4 className="text-sm font-bold font-heading text-black dark:text-white">BUILD · One-Time Engineering</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    One-time design & engineering fee covering the agreed project scope on standard <strong>50% Kickoff & 50% Final Delivery</strong> terms.
                  </p>
                  <div className="pt-2 border-t border-gray-200 dark:border-white/10 text-[11px] space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>✓</span> <span>Included post-launch warranty</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>✓</span> <span>100% Code & IP ownership handover</span>
                    </div>
                  </div>
                </div>

                {/* Pillar 2: RUN */}
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 font-mono font-bold text-xs flex items-center justify-center">02</span>
                    <h4 className="text-sm font-bold font-heading text-black dark:text-white">RUN · Production Infrastructure</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    The named Foundation, Growth, Scale, or Enterprise level required to operate your live application.
                  </p>
                  <div className="pt-2 border-t border-gray-200 dark:border-white/10 text-[11px] space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div>
                      <strong className="text-gray-900 dark:text-white">First 12 months:</strong> Included at no additional charge within the stated limits.
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-white">From month 13:</strong> Continue through Care or take over provider billing with 0% markup.
                    </div>
                  </div>
                </div>

                {/* Pillar 3: MAINTAIN */}
                <div className="p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 font-mono font-bold text-xs flex items-center justify-center">03</span>
                    <h4 className="text-sm font-bold font-heading text-black dark:text-white">MAINTAIN · Optional Care Plans</h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                    Keeps the matching infrastructure level active and adds human support, reporting, and reserved developer hours.
                  </p>
                  <div className="pt-2 border-t border-gray-200 dark:border-white/10 text-[11px] space-y-1.5 text-gray-600 dark:text-gray-300">
                    <div>
                      <strong className="text-gray-900 dark:text-white">Separate from warranty:</strong> Care covers planned work, not implementation defects.
                    </div>
                    <div>
                      <strong className="text-gray-900 dark:text-white">Response clarity:</strong> Continuous automated monitoring does not imply staffed 24/7 support.
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsibility & Scope Boundary Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <span>✓</span> Buildwith_lami Responsibility (Application Engineering)
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300 font-light">
                    <li>• Bespoke application & database architecture implementation</li>
                    <li>• Agreed deliverables, user workflows & responsive UI across devices</li>
                    <li>• Application-level speed optimization & Core Web Vitals within scope</li>
                    <li>• Comprehensive pre-launch staging QA & deployment handover</li>
                    <li>• Resolving genuine implementation bugs during your warranty period</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2">
                  <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span>ℹ</span> Infrastructure & Provider Boundaries
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 font-light">
                    <li>• Usage beyond the compute, storage, traffic, and email limits in your proposal</li>
                    <li>• External SaaS, payment gateway, SMS, and premium licence charges</li>
                    <li>• Third-party provider outages outside Buildwith_lami control</li>
                    <li>• Infrastructure renewal after the included first 12 months</li>
                    <li>• Client-added external plugins, unverified scripts, or unsupported edits</li>
                  </ul>
                </div>
              </div>

              {/* Technical Performance Disclaimer */}
              <div className="p-4 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                <div className="flex items-start sm:items-center gap-2.5">
                  <span className="text-accent font-bold text-sm shrink-0">⚡</span>
                  <span className="leading-relaxed">
                    <strong>Performance Boundary:</strong> {COMMERCIAL_TERMS.disclaimer}
                  </span>
                </div>
              </div>
              </div>

            {/* ── FOOTER COMMERCIAL NOTICE ── */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 font-mono pt-4 border-t border-gray-200 dark:border-white/10">
              {COMMERCIAL_TERMS.footerNotice}
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default Pricing;
