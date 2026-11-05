import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Globe, ShoppingBag, Workflow, CircleHelp, CheckCircle2 } from 'lucide-react';
import { PROJECT_GOALS, getGoalPlan, getProjectGoal } from '../data/projectGoals.js';
import { inquiryContext, projectContactHref, whatsAppHref } from '../utils/inquiryContext.js';
import { useAutomatedCurrency } from '../utils/currency.js';

const icons = { websites: Globe, ecommerce: ShoppingBag, software: Workflow, unsure: CircleHelp };

export default function ServiceFinder() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const selected = getProjectGoal(params.get('service'));
  const plan = getGoalPlan(selected);
  const currency = useAutomatedCurrency();
  const context = inquiryContext({search:params.toString()});
  const budget = plan && new Intl.NumberFormat(currency === 'NGN' ? 'en-NG' : 'en-US', {
    style:'currency', currency, maximumFractionDigits:0
  }).format(currency === 'NGN' ? plan.priceNGN : plan.priceUSD);

  const choose = id => {
    const next = new URLSearchParams(params);
    next.set('service', id);
    // A package from an earlier link is not a new recommendation.
    next.delete('tier');
    navigate({pathname:location.pathname, search:`?${next}`, hash:location.hash}, {
      replace:true, preventScrollReset:true,
    });
  };

  return (
    <section id="start" aria-labelledby="service-finder-title" className="max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-24 scroll-mt-24">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10 dark:border-white/10 dark:bg-[#141414]">
        <div className="flex items-start gap-4 mb-8">
          <img src="/images/lami-theme-avatar.webp" alt="" width="56" height="56" className="h-14 w-14 shrink-0 rounded-2xl bg-accent/10 object-contain" loading="lazy" />
          <div>
            <p className="bwl-eyebrow mb-2">A starting point, together</p>
            <h2 id="service-finder-title" className="font-heading text-3xl sm:text-4xl font-bold leading-tight text-black dark:text-white">What would you like to build?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300">Choose the closest goal. I’ll point you to relevant work, a starting budget and the next step.</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          <fieldset className="grid sm:grid-cols-2 gap-3 min-w-0">
            <legend className="sr-only">Choose your project goal</legend>
            {PROJECT_GOALS.map(goal => {
              const Icon = icons[goal.id];
              return (
                <label key={goal.id} className="block cursor-pointer">
                  <input type="radio" name="project-goal" value={goal.id} checked={selected?.id === goal.id} onChange={() => choose(goal.id)} className="peer sr-only" />
                  <span className="flex h-full min-h-36 flex-col rounded-2xl border border-gray-200 p-4 transition-colors peer-checked:border-accent peer-checked:bg-accent/5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:border-accent/60 dark:border-white/15">
                    <span className="flex items-center justify-between gap-3"><Icon className="h-5 w-5 text-accent" aria-hidden="true" />{selected?.id === goal.id && <CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />}</span>
                    <span className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{goal.label}</span>
                    <span className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{goal.description}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>
          <div role="region" aria-label="Your starting point" aria-live="polite" className="rounded-2xl bg-gray-50 p-5 sm:p-6 dark:bg-white/[0.03] min-w-0">
            <p className="text-xs font-semibold text-accent">{selected ? 'Your starting point' : 'A little direction from Eugene'}</p>
            <h3 className="mt-3 font-heading text-2xl font-bold text-gray-900 dark:text-white">{selected?.heading || 'Start with the problem you want to solve.'}</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{selected?.guidance || 'Pick a goal to explore a suitable starting scope. If you’re still deciding, choose “Not sure yet” and we can work through it together.'}</p>
            {plan && <>
              <div className="mt-5 border-y border-gray-200 py-4 dark:border-white/10">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{currency === 'NGN' ? 'Nigeria' : 'International'} starting budget</p>
                <p className="mt-1 text-3xl font-heading font-bold text-gray-900 dark:text-white">From {budget}</p>
                <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">For the entry scope. Explore the service below for package details.</p>
              </div>
              <p className="mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">Relevant work</p>
              <Link to={`/projects/${plan.project}`} className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-900 underline decoration-accent underline-offset-4 dark:text-white">{plan.projectTitle}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </>}
            {selected && <div className="mt-5 flex flex-col items-start gap-3">
              <Link to={projectContactHref(selected.id, currency)} className="btn-primary w-full sm:w-auto">{plan ? 'Discuss this project' : 'Help me choose'}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              <a href={whatsAppHref(context.message)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-xs font-semibold text-gray-700 underline underline-offset-4 dark:text-gray-300">Message Eugene on WhatsApp about this</a>
              {plan && <Link to={`/pricing#${selected.id}`} className="inline-flex min-h-11 items-center text-xs text-gray-600 underline underline-offset-4 dark:text-gray-400">Explore this service’s scope</Link>}
            </div>}
          </div>
        </div>
      </div>
    </section>
  );
}
