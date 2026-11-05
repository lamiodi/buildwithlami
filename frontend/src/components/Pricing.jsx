import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import CheckIcon from './CheckIcon';
import PricingRegionSelector from './PricingRegionSelector';
import { staggerContainer, fadeUpItem, cardHover, sectionViewport, reducedMotionVariants } from '../utils/motion';
import { COMMERCIAL_TERMS, BUILD_PRICING, INFRASTRUCTURE_LEVELS, USD_CARE_PRICING, CARE_TERMS } from '../config/pricing';
import { useAutomatedCurrency } from '../utils/currency';
import fallbackProjects from '../data/fallbackProjects';

const CORE_CATEGORIES = ['websites', 'ecommerce', 'software', 'portals', 'maintenance'];
const SPECIALIST_CATEGORIES = ['uiux', 'branding', 'seo', 'marketing', 'ai'];
const PROOF_PROJECTS = { websites:'sourceline-limited', ecommerce:'tiabrand-ecommerce', software:'vonnex2x-enterprise-erp', portals:'vonnex2x-enterprise-erp', uiux:'wodibenuah-fair' };
const HOME_BUDGETS = [
  { id:'websites', title:'Business website', scope:'Up to 5 page templates; editable CMS quoted separately.' },
  { id:'ecommerce', title:'Online store', scope:'Up to 25 products, order management and one payment gateway.' },
  { id:'software', title:'Business software', scope:'A defined workflow, user roles and the data it needs.' },
];
const categoryFromHash = hash => Object.hasOwn(BUILD_PRICING, String(hash || '').slice(1)) ? hash.slice(1) : null;

export default function Pricing({ isHomepage = false }) {
  const shouldReduce = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const currency = useAutomatedCurrency();
  const [activeCategory, setActiveCategory] = useState(() => categoryFromHash(location.hash) || 'websites');
  const container = shouldReduce ? reducedMotionVariants : staggerContainer;
  const item = shouldReduce ? reducedMotionVariants : fadeUpItem;

  useEffect(() => {
    const category = categoryFromHash(location.hash);
    if (category) setActiveCategory(category);
  }, [location.hash]);

  const amount = (ngn, usd) => `${currency === 'NGN' ? '₦' : '$'}${Number(currency === 'NGN' ? ngn : usd).toLocaleString(currency === 'NGN' ? 'en-NG' : 'en-US')}`;
  const price = (ngn, usd, formatted) => {
    const suffix = String(formatted || '').match(/(\s*\/\s*(yr|mo)\b|\s*\+\s*starting|\s*\+)\s*$/i)?.[0] || '';
    return `${amount(ngn, usd)}${suffix}`;
  };

  if (isHomepage) return (
    <section id="pricing" aria-labelledby="home-budget-title" className="bg-gray-50 px-6 py-16 dark:bg-background md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2 id="home-budget-title" className="font-heading text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Plan your budget.</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">Entry scopes for three common projects. Compare packages and ongoing costs on the pricing page.</p>
          </div>
          <PricingRegionSelector />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HOME_BUDGETS.map(budget => {
            const category = BUILD_PRICING[budget.id];
            return <article key={budget.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#141414]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{budget.title}</h3>
              <p className="mt-3 font-heading text-3xl font-bold text-gray-900 dark:text-white"><span className="text-xs font-normal text-gray-500 dark:text-gray-400">From </span>{amount(category.startingPriceNGN, category.startingPriceUSD)}</p>
              <p className="mb-4 mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{budget.scope}</p>
              <Link to={`/pricing#${budget.id}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent underline underline-offset-4">View {budget.title.toLowerCase()} scopes<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>;
          })}
        </div>
      </div>
    </section>
  );

  const category = BUILD_PRICING[activeCategory];
  const isCare = activeCategory === 'maintenance';
  const proof = fallbackProjects.find(project => project.slug === PROOF_PROJECTS[activeCategory] && project.project_status === 'Client Work');
  const changeCategory = id => {
    if (!Object.hasOwn(BUILD_PRICING, id)) return;
    setActiveCategory(id);
    navigate({pathname:location.pathname, search:location.search, hash:`#${id}`}, {replace:true});
  };

  return (
    <section id="pricing" className="bg-gray-50 px-6 py-24 transition-colors dark:bg-background md:px-12">
      <div className="mx-auto max-w-7xl space-y-10">
        <motion.header className="mx-auto max-w-3xl text-center" variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
          <motion.h1 variants={item} className="mb-4 font-heading text-4xl font-bold tracking-tight text-gray-900 dark:text-white md:text-5xl lg:text-6xl">Clear starting budgets.<br /><span className="font-normal italic text-accent">Tailored project proposals.</span></motion.h1>
          <motion.p variants={item} className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">{isCare ? 'Care plans' : activeCategory === 'websites' ? 'Websites' : activeCategory === 'ecommerce' ? 'Online stores' : 'Projects'} start from {price(category.startingPriceNGN, category.startingPriceUSD ?? USD_CARE_PRICING[category.tiers[0].id]?.priceUSD, category.startingPriceFormatted)}. I’ll confirm the scope and final price before work begins.</motion.p>
          <motion.div variants={item} className="mt-6">
            <Link to={`/contact?service=${activeCategory}&currency=${currency}`} className="btn-primary">{isCare ? 'Get my care quote' : 'Get my project quote'}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
          </motion.div>
        </motion.header>

        <div className="flex flex-col gap-6 border-b border-gray-200 pb-8 dark:border-white/10 sm:flex-row sm:justify-between">
          <div className="w-full sm:max-w-md">
            <label htmlFor="pricing-category" className="mb-2 block text-xs font-bold text-gray-900 dark:text-white">Choose the closest service</label>
            <select id="pricing-category" value={activeCategory} onChange={event => changeCategory(event.target.value)} className="bwl-input min-h-12 text-base font-semibold">
              <optgroup label="Core build and support">{CORE_CATEGORIES.map(id => <option key={id} value={id}>{BUILD_PRICING[id].label}</option>)}</optgroup>
              <optgroup label="Specialist services and add-ons">{SPECIALIST_CATEGORIES.map(id => <option key={id} value={id}>{BUILD_PRICING[id].label}</option>)}</optgroup>
            </select>
          </div>
          <PricingRegionSelector />
        </div>

        <div id={activeCategory} className="scroll-mt-24">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="max-w-3xl">
              <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">{category.title.replace(/^\d+\.\s*/, '')}</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{category.desc}</p>
            </div>
            <p className="shrink-0 rounded-xl border border-accent/20 bg-accent/5 p-4 font-heading text-2xl font-bold text-gray-900 dark:bg-accent/10 dark:text-white"><span className="mb-1 block text-xs font-semibold text-accent">{isCare ? 'Plans from' : 'Starting budget'}</span>{price(category.startingPriceNGN, category.startingPriceUSD ?? USD_CARE_PRICING[category.tiers[0].id]?.priceUSD, category.startingPriceFormatted)}</p>
          </div>

          <p className="mb-8 rounded-xl border border-gray-200 p-4 text-sm leading-relaxed text-gray-600 dark:border-white/10 dark:text-gray-300">{isCare
            ? 'Care fees cover labour; provider bills are separate. Every plan includes automated uptime alerts reviewed during business hours. Essential covers static sites; CMS websites, stores and applications need an assessed care scope.'
            : 'Build fees are paid once. Ongoing care is optional. Your proposal lists included hosting and operations allowances, provider renewals and paid tools.'}</p>

          {proof && <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-y border-gray-200 py-4 dark:border-white/10"><p className="text-sm text-gray-600 dark:text-gray-300">Relevant client work: <strong className="text-gray-900 dark:text-white">{proof.title}</strong></p><Link to={`/projects/${proof.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent">View case study<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>}

          <motion.div key={activeCategory} className={`grid grid-cols-1 gap-6 ${category.tiers.length === 4 ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'}`} variants={container} initial="hidden" whileInView="visible" viewport={sectionViewport}>
            {category.tiers.map(tier => {
              const custom = tier.priceFormatted === 'Custom Quote';
              const infrastructure = INFRASTRUCTURE_LEVELS[tier.infrastructureLevel];
              const usd = USD_CARE_PRICING[tier.id];
              const query = new URLSearchParams({service:activeCategory, tier:tier.name, currency});
              const annual = isCare && tier.monthlyPriceNGN && tier.annualPriceNGN;
              const saving = annual ? (currency === 'NGN' ? tier.monthlyPriceNGN * 12 - tier.annualPriceNGN : usd.monthlyPriceUSD * 12 - usd.annualPriceUSD) : 0;
              const features = isCare ? tier.features.filter(feature => !/^(Up to \d+ total hours|Automated uptime|2 minor text or image)/.test(feature)) : tier.features;
              return <motion.article key={tier.id} id={`pricing-card-${tier.id}`} whileHover={shouldReduce ? {} : cardHover} className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 dark:bg-[#141414] sm:p-7 ${tier.popular ? 'border-accent shadow-lg ring-2 ring-accent/15' : 'border-gray-200 dark:border-white/10'}`}>
                <div>
                  {tier.popular && <span className="absolute -top-3 right-5 bg-accent px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">{tier.popularBadge?.replace('⭐ ', '') || 'Best Value'}</span>}
                  <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                  <p className="mb-5 mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{tier.bestFor}</p>
                  <p className="mb-5 border-b border-gray-100 pb-5 font-heading text-3xl font-bold text-gray-900 dark:border-white/10 dark:text-white">{custom ? 'Tailored quote' : <><span className="mb-1 block font-body text-xs font-normal text-gray-500 dark:text-gray-400">{isCare ? (tier.billingCadence === 'ANNUAL' ? 'Annual plan' : 'Monthly plan') : 'Starting at'}</span>{price(tier.priceNGN, tier.priceUSD ?? usd?.priceUSD, tier.priceFormatted)}</>}</p>
                  {annual && <p className="mb-5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">Or {amount(tier.annualPriceNGN, usd.annualPriceUSD)}/year{saving > 0 && <span className="block text-emerald-700 dark:text-emerald-400">Save {currency === 'NGN' ? '₦' : '$'}{saving.toLocaleString()} compared with 12 monthly payments</span>}</p>}
                  <dl className="mb-6 space-y-3 text-sm">
                    {isCare ? <>
                      <div><dt className="text-xs text-gray-500 dark:text-gray-400">Work allowance</dt><dd className="mt-1 font-semibold text-gray-900 dark:text-white">{tier.monthlyHours ? `${tier.monthlyHours} total hours/month` : tier.revisions}</dd></div>
                      <div><dt className="text-xs text-gray-500 dark:text-gray-400">Response time</dt><dd className="mt-1 text-gray-700 dark:text-gray-300">{tier.support}</dd></div>
                    </> : <>
                      <div><dt className="text-xs text-gray-500 dark:text-gray-400">Delivery estimate</dt><dd className="mt-1 text-gray-700 dark:text-gray-300">{tier.timeline}</dd></div>
                      <div><dt className="text-xs text-gray-500 dark:text-gray-400">{tier.warrantyDays ? 'Bug-fix warranty' : 'Launch support'}</dt><dd className="mt-1 text-gray-700 dark:text-gray-300">{tier.warrantyDays ? `${tier.warrantyDays} days after launch` : tier.support}</dd></div>
                    </>}
                  </dl>
                  <p className="mb-3 text-xs font-semibold text-gray-900 dark:text-white">Included work</p>
                  <ul className="mb-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">{features.slice(0, 4).map(feature => <li key={feature} className="flex items-start gap-2 leading-relaxed"><CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{feature}</span></li>)}</ul>
                  <details className="mb-6 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                    <summary className="cursor-pointer py-3 font-semibold text-gray-900 dark:text-white">Scope details and exclusions</summary>
                    {features.length > 4 && <ul className="mt-2 list-disc space-y-2 pl-4">{features.slice(4).map(feature => <li key={feature}>{feature}</li>)}</ul>}
                    {!isCare && <p className="mt-3"><strong>Design reviews: </strong>{tier.revisions}</p>}
                    {infrastructure && <><p className="mt-4 font-semibold">{infrastructure.shortName} hosting and operations allowance · 12 months</p><ul className="mt-2 list-disc space-y-2 pl-4">{infrastructure.included.map(feature => <li key={feature}>{feature}</li>)}</ul></>}
                    <p className="mt-4 font-semibold">Quoted separately or excluded</p>
                    <ul className="mt-2 list-disc space-y-2 pl-4">{tier.notIncluded?.map(exclusion => <li key={exclusion}>{exclusion}</li>)}</ul>
                  </details>
                </div>
                <Link to={`/contact?${query}`} className={`${tier.popular ? 'btn-primary' : 'btn-dark'} w-full`}>{isCare ? 'Discuss this care plan' : 'Get my project quote'}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </motion.article>;
            })}
          </motion.div>

          {!isCare && category.whatAffectsPricing?.length > 0 && <div className="mt-6 flex flex-col justify-between gap-3 text-sm sm:flex-row"><p className="max-w-3xl text-gray-600 dark:text-gray-300"><strong>Price depends on: </strong>{category.whatAffectsPricing.slice(0,2).join(' · ')}</p><Link to={`/contact?service=${activeCategory}&currency=${currency}`} className="inline-flex min-h-11 shrink-0 items-center font-semibold text-accent">Ask a pricing question →</Link></div>}
        </div>

        <details key={isCare ? 'care-terms' : 'build-terms'} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-[#141414] sm:p-8">
          <summary className="cursor-pointer font-heading text-xl font-bold text-gray-900 dark:text-white">{isCare ? 'Care hours, billing and response terms' : 'Payment, running costs and warranty'}</summary>
          <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
            {isCare ? CARE_TERMS.map(term => <div key={term.title}><dt className="font-semibold text-gray-900 dark:text-white">{term.title}</dt><dd className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{term.description}</dd></div>) : <>
              <div><dt className="font-semibold text-gray-900 dark:text-white">Build payments</dt><dd className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">50% to start, 50% on delivery.</dd></div>
              <div><dt className="font-semibold text-gray-900 dark:text-white">Hosting and provider bills</dt><dd className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">Eligible builds include the allowance named in the scope for 12 months. Domains, licences, usage above that allowance and renewals are itemized separately. You can pay providers directly after handover.</dd></div>
              <div><dt className="font-semibold text-gray-900 dark:text-white">Bug-fix warranty</dt><dd className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">The stated warranty covers faults in the agreed build. New features, content changes and ongoing maintenance are separate work.</dd></div>
              <div><dt className="font-semibold text-gray-900 dark:text-white">Optional care</dt><dd className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">Choose an assessed care scope, a monthly retainer or handover to your team. A retainer is not required to keep your site online. <Link to="/pricing#maintenance" className="font-semibold text-accent underline underline-offset-4">View care plans</Link>.</dd></div>
            </>}
          </dl>
          {!isCare && category.pricingNotes && <p className="mt-6 border-t border-gray-200 pt-4 text-xs leading-relaxed text-gray-500 dark:border-white/10 dark:text-gray-400">{category.pricingNotes}</p>}
        </details>
        <p className="text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">{COMMERCIAL_TERMS.footerNotice}</p>
      </div>
    </section>
  );
}
