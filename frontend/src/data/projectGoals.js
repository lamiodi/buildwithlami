import { getServicePlan } from './serviceDetails.js';

export const PROJECT_GOALS = [
  { id: 'websites', label: 'Business website', description: 'Explain your services and turn interest into enquiries.', planId: 'interfaces', heading: 'A clear home for your business.', guidance: 'Start with the services you offer, the people you want to reach and the action they should take. I’ll help you decide whether a focused site or an editable CMS fits.' },
  { id: 'ecommerce', label: 'Online store', description: 'Sell products, accept payments and manage orders.', planId: 'ecommerce', heading: 'Make it easier to buy from you.', guidance: 'Tell me about your catalogue, payments and delivery. I’ll scope the storefront and order workflow around how your business sells.' },
  { id: 'software', label: 'Business software', description: 'Connect your workflows, people and business data.', planId: 'web-platforms', heading: 'Software built around your workflow.', guidance: 'Start with the task that slows your team down. I’ll help define the users, permissions and one complete workflow before adding more features.' },
  { id: 'unsure', label: 'Not sure yet', description: 'Talk through the problem and choose a starting point.', planId: null, heading: 'Let’s make the next step clearer.', guidance: 'You don’t need a technical brief. Tell me who you help, what is difficult today and what you want to improve. I’ll help you identify a suitable starting scope.' }
];

export function getProjectGoal(id) {
  return PROJECT_GOALS.find(goal => goal.id === id) || null;
}

export function getGoalPlan(goal) {
  return goal?.planId ? getServicePlan(goal.planId) : null;
}
