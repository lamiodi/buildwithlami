import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronRight
} from 'lucide-react';
import CheckIcon from './CheckIcon';
import { staggerContainer, fadeUpItem, cardHover, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { 
  COMMERCIAL_TERMS, 
  BUILD_PRICING,
  INFRASTRUCTURE_LEVELS,
  USD_TIER_PRICING
} from '../config/pricing';
import { useAutomatedCurrency } from '../utils/currency';
import fallbackProjects from '../data/fallbackProjects';

const CORE_PRICING_CATEGORIES = ['websites', 'ecommerce', 'software', 'portals', 'maintenance'];
const SPECIALIST_PRICING_CATEGORIES = ['uiux', 'branding', 'seo', 'marketing', 'ai'];
const usdPriceForTier = (tierId) => USD_TIER_PRICING[tierId]?.priceUSD;
const usdStartingPriceFor = (category) => usdPriceForTier(category.tiers[0]?.id);
const PROOF_PROJECT_BY_CATEGORY = {
  websites: 'sourceline-limited',
  ecommerce: 'tiabrand-ecommerce',
  software: 'vonnex2x-enterprise-erp',
  portals: 'vonnex2x-enterprise-erp',
  uiux: 'wodibenuah-fair'
};

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

  const displayCurrency = useAutomatedCurrency();

  const formatRegionalAmount = (amountNgn, amountUsd) => {
    const amount = displayCurrency === 'USD' ? amountUsd : amountNgn;
    const symbol = displayCurrency === 'USD' ? '$' : '₦';
    return `${symbol}${Number(amount || 0).toLocaleString(displayCurrency === 'USD' ? 'en-US' : 'en-NG')}`;
  };

  // USD values are fixed regional prices; they are intentionally not
  // presented as exchange-rate equivalents of Nigerian pricing.
  const renderPrice = (amountNgn, amountUsd, formatted, forceCustom = false) => {
    if (forceCustom || formatted === 'Custom Quote') return formatted;
    const suffixMatch = String(formatted || '').match(/(\s*\/\s*(yr|mo)\b|\s*\+\s*starting|\s*\+)\s*$/i);
    const suffix = suffixMatch ? suffixMatch[0] : '';
    return <span>{formatRegionalAmount(amountNgn, amountUsd)}{suffix}</span>;
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

  // Get active category object and tiers
  const currentCategoryData = BUILD_PRICING[activeCategory] || BUILD_PRICING.websites;
  const currentTiers = currentCategoryData.tiers;
  const isCareCategory = activeCategory === 'maintenance';
  const isWebsiteCategory = activeCategory === 'websites';
  const relevantProof = fallbackProjects.find(
    (project) => project.slug === PROOF_PROJECT_BY_CATEGORY[activeCategory] && project.project_status === 'Client Work'
  );
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
          {isHomepage && (
            <div className="bwl-eyebrow mb-4 justify-center">
              <span className="w-2 h-2 bg-accent inline-block" />
              <span>Studio Pricing · Scoped to the Work</span>
            </div>
          )}

          <motion.h2 variants={item} className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-gray-900 dark:text-white tracking-tight mb-4">
            Transparent Pricing. <br />
            <span className="italic font-normal text-accent">No Surprise Invoices.</span>
          </motion.h2>

          <motion.p variants={item} className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed mb-6">
            {isHomepage
              ? 'Every deliverable and boundary is priced before work begins, with clear scopes and 50/50 milestone invoicing.'
              : 'Choose a service and compare clear starting prices, timelines, and deliverables.'}
          </motion.p>

          {isHomepage && (
            <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-gray-500 dark:text-gray-400">
              <span><strong className="text-gray-900 dark:text-white font-semibold">50% upfront</strong>, 50% on delivery</span>
              <span className="hidden sm:inline text-gray-300 dark:text-white/20">·</span>
              <span>Post-launch warranty included</span>
            </motion.div>
          )}
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
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Best for businesses establishing their online presence.</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
                    Custom websites built around real goals, content, and customers—not a generic theme.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {renderPrice(
                        BUILD_PRICING.websites.startingPriceNGN,
                        usdStartingPriceFor(BUILD_PRICING.websites),
                        BUILD_PRICING.websites.startingPriceFormatted
                      )}
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
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Best for brands selling products online.</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
                    Online stores designed for clearer paths to purchase, multi-channel payments, and fulfillment.
                  </p>
                  <div className="p-4 rounded-2xl bg-accent/5 dark:bg-accent/10 border border-accent/20 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {renderPrice(
                        BUILD_PRICING.ecommerce.startingPriceNGN,
                        usdStartingPriceFor(BUILD_PRICING.ecommerce),
                        BUILD_PRICING.ecommerce.startingPriceFormatted
                      )}
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
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Best for teams building a product or automating operations.</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-light">
                    Custom web applications, SaaS prototypes, booking systems, and internal operational portals.
                  </p>
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">Starting from</span>
                    <span className="text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
                      {renderPrice(
                        BUILD_PRICING.software.startingPriceNGN,
                        usdStartingPriceFor(BUILD_PRICING.software),
                        BUILD_PRICING.software.startingPriceFormatted
                      )}
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-gray-200 dark:border-white/10 pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">Not sure which package fits? We can help you choose.</p>
              <div className="flex flex-wrap gap-5 text-sm font-semibold">
                <Link to="/contact" className="text-gray-900 dark:text-white underline underline-offset-4 hover:text-accent">Discuss your project</Link>
                <Link to="/pricing" className="text-accent inline-flex items-center gap-1">Compare all packages <ChevronRight className="w-4 h-4" /></Link>
              </div>
            </div>
          </div>
        ) : (
          /* ── FULL STUDIO PRICING PAGE EXPERIENCE ── */
          <div className="space-y-16">

            {/* ── 1. PRIMARY CATEGORY NAVIGATION (Responsive Matrix) ── */}
            <div className="border-b border-gray-200 dark:border-white/10 pb-8">
              <div className="max-w-2xl">
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
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
                  Prices are shown automatically in {displayCurrency} based on your region.
                </p>
              </div>
            </div>

            {/* ── 2. CARDS GRID (For Active Category) ── */}
            <div id={activeCategory}>
              <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="max-w-3xl">
                  <h3 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 dark:text-white">
                    {currentCategoryData.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {currentCategoryData.desc}
                  </p>
                </div>
                <div className="shrink-0 p-3 sm:p-4 rounded-xl bg-accent/5 dark:bg-accent/10 border border-accent/20 text-left md:text-right">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block">
                    {isCareCategory ? 'Plans from' : 'Starting investment'}
                  </span>
                  <span className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
                    {renderPrice(
                      currentCategoryData.startingPriceNGN,
                      usdStartingPriceFor(currentCategoryData),
                      currentCategoryData.startingPriceFormatted
                    )}
                  </span>
                </div>
              </div>

              {isWebsiteCategory && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#141414]">
                  <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-white/10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">Build fee</span>
                    <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Paid once</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">Strategy, design, development, testing, and launch.</p>
                  </div>
                  <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-white/10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">First 12 months</span>
                    <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Infrastructure included</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">The level named on your package is included after launch.</p>
                  </div>
                  <div className="p-5 sm:p-6">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">From month 13</span>
                    <p className="mt-2 text-sm font-bold text-gray-900 dark:text-white">Annual care starts</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">The exact yearly amount is shown on every website plan below.</p>
                  </div>
                </div>
              )}

              {relevantProof && (
                <div className="mb-8 border-y border-gray-200 dark:border-white/10 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent">Relevant client work</span>
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{relevantProof.industry}</span>
                    </div>
                    <p className="font-heading font-bold text-gray-900 dark:text-white">{relevantProof.title}</p>
                  </div>
                  <Link
                    to={`/projects/${relevantProof.slug}`}
                    className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    View case study <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              )}

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
                  const usdTierPricing = USD_TIER_PRICING[tier.id];
                  const contactQuery = new URLSearchParams({
                    service: activeCategory,
                    tier: tier.name,
                    currency: displayCurrency
                  }).toString();
                  const annualCarePrice = isCareCategory && tier.monthlyPriceNGN && tier.annualPriceNGN
                    ? formatRegionalAmount(tier.annualPriceNGN, usdTierPricing?.annualPriceUSD)
                    : null;
                  const annualWebsiteCarePrice = isWebsiteCategory && tier.annualCare
                    ? formatRegionalAmount(tier.annualCare.priceNGN, tier.annualCare.priceUSD)
                    : null;
                  const annualCareSavings = annualCarePrice
                    ? formatRegionalAmount(
                        (tier.monthlyPriceNGN * 12) - tier.annualPriceNGN,
                        (usdTierPricing.monthlyPriceUSD * 12) - usdTierPricing.annualPriceUSD
                      )
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

                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                          <span className="font-bold text-gray-900 dark:text-white">Best for: </span>{tier.bestFor}
                        </p>

                        {/* Price Tag */}
                        <div className="flex flex-wrap items-baseline gap-1.5 mb-4 border-b border-gray-100 dark:border-white/5 pb-4">
                          {isCustom ? (
                            <span className="text-3xl font-heading font-bold text-black dark:text-white leading-none">{tier.priceFormatted}</span>
                          ) : (
                            <>
                              <span className="text-xs text-gray-500 font-semibold">
                                {isCareCategory
                                  ? tier.billingCadence === 'ANNUAL' ? 'annual plan' : 'monthly plan'
                                  : 'starting at'}
                              </span>
                              <span className="text-3xl sm:text-4xl font-heading font-extrabold text-black dark:text-white tracking-tight leading-none">
                                {renderPrice(tier.priceNGN, usdTierPricing?.priceUSD, tier.priceFormatted)}
                              </span>
                            </>
                          )}
                        </div>

                        {annualCarePrice && (
                          <p className="-mt-1 mb-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Annual: <span className="text-gray-900 dark:text-white">{annualCarePrice}/year</span>
                            {annualCareSavings && Number(tier.monthlyPriceNGN * 12) > Number(tier.annualPriceNGN) && (
                              <span className="ml-2 text-emerald-700 dark:text-emerald-400">Save {annualCareSavings}</span>
                            )}
                          </p>
                        )}

                        {infrastructure && (
                          <p className="mb-5 border-y border-blue-200 dark:border-blue-400/20 py-3 text-xs font-semibold text-blue-700 dark:text-blue-300">
                            {infrastructure.shortName} infrastructure {isCareCategory ? 'included while active' : 'included for 12 months'}
                          </p>
                        )}

                        {annualWebsiteCarePrice && (
                          <div className="mb-5 rounded-xl border border-accent/25 bg-accent/5 dark:bg-accent/10 p-4">
                            <div className="flex flex-wrap items-end justify-between gap-2">
                              <div>
                                <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-accent">Annual care from month 13</span>
                                <span className="mt-1 block text-xs font-semibold text-gray-600 dark:text-gray-300">{tier.annualCare.planName}</span>
                              </div>
                              <strong className="text-xl font-heading text-gray-900 dark:text-white">
                                {annualWebsiteCarePrice}<span className="text-xs font-sans font-semibold text-gray-500 dark:text-gray-400">/year</span>
                              </strong>
                            </div>
                            <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-gray-400">{tier.annualCare.summary}</p>
                          </div>
                        )}

                        {/* Essential delivery details */}
                        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium mb-6">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-500">Timeline:</span>
                            <span>{tier.timeline}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-accent">
                            <span className="font-semibold text-gray-500">Support:</span>
                            <span className="font-semibold">{tier.support}</span>
                          </div>
                        </div>

                        {/* Deliverables List (Included) */}
                        <div className="space-y-3 mb-6">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 block font-mono">
                            Included in this scope
                          </span>
                          <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                            {tier.features.slice(0, 4).map((feat, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2.5 leading-snug">
                                <CheckIcon className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <Link
                          to={`/contact?${contactQuery}`}
                          className={tier.popular ? 'btn-primary w-full' : 'btn-dark w-full'}
                          style={{ touchAction: 'manipulation' }}
                        >
                          Request proposal <ArrowRight className="w-3.5 h-3.5 ml-2" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 dark:border-white/10 pt-5 text-xs">
                <div className="max-w-4xl text-gray-600 dark:text-gray-400">
                  {currentCategoryData.whatAffectsPricing?.length > 0 && (
                    <p>
                      <strong className="text-gray-900 dark:text-white">Price depends on: </strong>
                      {currentCategoryData.whatAffectsPricing.slice(0, 2).join(' · ')}
                    </p>
                  )}
                  {currentCategoryData.pricingNotes && (
                    <p className="mt-2 leading-relaxed">{currentCategoryData.pricingNotes}</p>
                  )}
                </div>
                <Link
                  to={`/contact?service=${encodeURIComponent(activeCategory)}`}
                  className="shrink-0 font-bold text-accent hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Ask a pricing question →
                </Link>
              </div>
            </div>

            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200 dark:border-white/10">
              <h3 className="text-xl font-bold font-heading text-black dark:text-white mb-4">Simple terms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <p><strong className="text-gray-900 dark:text-white">Payments:</strong> 50% to start, 50% on delivery.</p>
                <p><strong className="text-gray-900 dark:text-white">First year:</strong> Named infrastructure included with eligible builds.</p>
                <p><strong className="text-gray-900 dark:text-white">Renewal:</strong> Annual care begins in month 13 at the price shown.</p>
                <p><strong className="text-gray-900 dark:text-white">Warranty:</strong> Post-launch bug support is included.</p>
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
