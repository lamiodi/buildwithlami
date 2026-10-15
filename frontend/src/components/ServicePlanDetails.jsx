import { Link } from 'react-router-dom';
import { getServicePlan, regionalStartingPrices } from '../data/serviceDetails.js';

export default function ServicePlanDetails({ serviceId }) {
  const plan = getServicePlan(serviceId);
  if (!plan) return null;
  return (
    <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.tier.name}: {plan.tier.badge}</p>
      <p className="mt-2 text-sm font-semibold text-accent">Starting prices · {regionalStartingPrices(plan)}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{plan.decision}</p>
      <dl className="mt-4 space-y-3 text-sm leading-relaxed">
        <div><dt className="font-semibold">Build window</dt><dd className="text-gray-600 dark:text-gray-300">{plan.tier.timeline}, subject to the agreed scope, content and approvals.</dd></div>
        <div><dt className="font-semibold">Included support</dt><dd className="text-gray-600 dark:text-gray-300">{plan.tier.support}</dd></div>
        <div><dt className="font-semibold">Ongoing costs</dt><dd className="text-gray-600 dark:text-gray-300">{plan.pricingNotes}</dd></div>
      </dl>
      <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
        <Link className="min-h-11 content-center underline decoration-accent underline-offset-4" to={`/projects/${plan.project}`}>See the work: {plan.projectTitle}</Link>
        <Link className="min-h-11 content-center underline underline-offset-4" to={`/pricing#${plan.category}`}>Compare inclusions and exclusions</Link>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">Regional starting prices apply. Scope, contracting location and support requirements are confirmed in your proposal.</p>
    </div>
  );
}
