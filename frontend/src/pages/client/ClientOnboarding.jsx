import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { api } from '../../services/api';
import { notify } from '../../services/notify';
import Skeleton from '../../components/Skeleton';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Send, AlertCircle, CloudUpload } from 'lucide-react';

// ─── Client Onboarding Wizard ─────────────────────────────
// Admin OS Phase 1 (blueprint §6–§14, §72, §93).
// Multi-step, auto-saving (server keeps the authoritative
// completion %), with conditional E-commerce / Booking sections
// and the SUBMITTED → NEEDS_CHANGES → APPROVED review loop.
//
// Mirrors ONBOARDING_SECTIONS in onboardingController.js — the
// `required` arrays drive the local progress ring; the server
// recomputes the same number on every autosave.

const YES_NO = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
];

const F = (name, label, type = 'text', extra = {}) => ({ name, label, type, ...extra });

const SECTIONS = [
  {
    key: 'contact',
    label: 'Contact Details',
    description: 'So we know the best way to reach you.',
    required: ['full_name', 'business_name', 'email', 'whatsapp'],
    fields: [
      F('full_name', 'Your full name', 'text', { required: true, half: true }),
      F('business_name', 'Business name', 'text', { required: true, half: true }),
      F('email', 'Email address', 'email', { required: true, half: true }),
      F('whatsapp', 'WhatsApp number', 'tel', { required: true, half: true, placeholder: '+234 801 234 5678' }),
      F('phone', 'Alternative phone', 'tel', { half: true }),
      F('country', 'Country', 'text', { half: true }),
      F('city_state', 'City / State', 'text', { half: true }),
      F('preferred_contact_method', 'Preferred contact method', 'select', { half: true, options: [
        { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'EMAIL', label: 'Email' }, { value: 'PHONE', label: 'Phone' },
      ] }),
      F('preferred_contact_time', 'Best time to reach you', 'text', { half: true, placeholder: 'e.g. evenings after 6pm' }),
      F('timezone', 'Time zone', 'text', { half: true, placeholder: 'e.g. WAT (GMT+1)' }),
      F('job_role', 'Your role / job title', 'text', { half: true }),
      F('secondary_contact_name', 'Secondary contact (optional)', 'text', { half: true }),
      F('secondary_contact_email', 'Secondary contact email', 'email', { half: true }),
      F('secondary_contact_whatsapp', 'Secondary contact WhatsApp', 'tel', { half: true }),
    ],
  },
  {
    key: 'business',
    label: 'Business',
    description: 'Tell us about your business.',
    required: ['business_description', 'industry'],
    fields: [
      F('registered_name', 'Registered business name', 'text', { half: true }),
      F('trading_name', 'Trading / brand name', 'text', { half: true }),
      F('business_type', 'Business type', 'select', { half: true, options: [
        { value: 'sole_proprietor', label: 'Sole proprietor' }, { value: 'partnership', label: 'Partnership' },
        { value: 'ltd', label: 'Limited company' }, { value: 'nonprofit', label: 'Non-profit' }, { value: 'other', label: 'Other' },
      ] }),
      F('industry', 'Industry', 'text', { required: true, half: true, placeholder: 'e.g. Fashion retail, Real estate' }),
      F('year_founded', 'Year founded', 'text', { half: true }),
      F('registration_number', 'Registration number (optional)', 'text', { half: true }),
      F('country_registration', 'Country of registration', 'text', { half: true }),
      F('business_address', 'Business address', 'text', { half: true }),
      F('business_description', 'What does your business do?', 'textarea', { required: true, placeholder: 'Describe your products / services and what makes you unique…' }),
      F('support_email', 'Customer support email', 'email', { half: true }),
      F('support_phone', 'Customer support phone', 'tel', { half: true }),
      F('support_whatsapp', 'Customer support WhatsApp', 'tel', { half: true }),
      F('sales_email', 'Sales email', 'email', { half: true }),
      F('billing_email', 'Billing email', 'email', { half: true }),
    ],
  },
  {
    key: 'social',
    label: 'Social Media',
    description: 'Where your brand lives online.',
    required: [],
    fields: [
      F('instagram', 'Instagram username', 'text', { half: true, placeholder: '@yourbrand' }),
      F('instagram_url', 'Instagram URL', 'url', { half: true }),
      F('facebook', 'Facebook URL', 'url', { half: true }),
      F('tiktok', 'TikTok username', 'text', { half: true }),
      F('tiktok_url', 'TikTok URL', 'url', { half: true }),
      F('twitter_x', 'X / Twitter URL', 'url', { half: true }),
      F('linkedin', 'LinkedIn URL', 'url', { half: true }),
      F('snapchat', 'Snapchat username', 'text', { half: true }),
      F('youtube', 'YouTube URL', 'url', { half: true }),
      F('pinterest', 'Pinterest URL', 'url', { half: true }),
      F('whatsapp_business', 'WhatsApp Business number', 'tel', { half: true }),
    ],
  },
  {
    key: 'website',
    label: 'Website & Domain',
    description: 'Existing website, domain and hosting. Never share passwords here — sensitive access is collected separately via a secure vault.',
    required: ['owns_domain'],
    fields: [
      F('existing_website_url', 'Existing website URL (if any)', 'url', { half: true }),
      F('owns_domain', 'Do you already own a domain?', 'select', { required: true, half: true, options: YES_NO }),
      F('domain_name', 'Domain name', 'text', { half: true, placeholder: 'yourbrand.com' }),
      F('domain_registrar', 'Domain registrar', 'select', { half: true, options: [
        { value: 'namecheap', label: 'Namecheap' }, { value: 'godaddy', label: 'GoDaddy' },
        { value: 'cloudflare', label: 'Cloudflare' }, { value: 'hostinger', label: 'Hostinger' },
        { value: 'other', label: 'Other' }, { value: 'unknown', label: 'Not sure' },
      ] }),
      F('hosting_provider', 'Existing hosting provider', 'text', { half: true }),
      F('website_platform', 'Existing platform', 'select', { half: true, options: [
        { value: 'wordpress', label: 'WordPress' }, { value: 'shopify', label: 'Shopify' },
        { value: 'wix', label: 'Wix' }, { value: 'squarespace', label: 'Squarespace' },
        { value: 'custom', label: 'Custom' }, { value: 'none', label: 'None' },
      ] }),
      F('email_provider', 'Business email provider', 'text', { half: true, placeholder: 'e.g. Google Workspace, Zoho' }),
      F('has_analytics', 'Google Analytics set up?', 'select', { half: true, options: YES_NO }),
      F('has_search_console', 'Google Search Console?', 'select', { half: true, options: YES_NO }),
      F('has_google_business', 'Google Business Profile?', 'select', { half: true, options: YES_NO }),
    ],
  },
  {
    key: 'brand',
    label: 'Brand',
    description: 'Logos, colours and the look you love.',
    required: ['brand_name'],
    fields: [
      F('brand_name', 'Brand name', 'text', { required: true, half: true }),
      F('brand_tagline', 'Tagline', 'text', { half: true }),
      F('brand_description', 'Brand description', 'textarea', { placeholder: 'How should the brand feel to customers?' }),
      F('has_logo', 'Do you have a logo?', 'select', { half: true, options: YES_NO }),
      F('logo_url', 'Logo file link', 'url', { half: true, placeholder: 'Drive / Dropbox link — or upload under Documents' }),
      F('favicon_url', 'Favicon link (optional)', 'url', { half: true }),
      F('primary_colour', 'Primary brand colour', 'text', { half: true, placeholder: '#F44A22 or "flame orange"' }),
      F('secondary_colour', 'Secondary colour', 'text', { half: true }),
      F('accent_colour', 'Accent colour', 'text', { half: true }),
      F('preferred_fonts', 'Preferred fonts', 'text', { half: true }),
      F('brand_guide_url', 'Brand guidelines link', 'url', { half: true }),
      F('design_style', 'Preferred design style', 'select', { half: true, options: [
        { value: 'minimal', label: 'Minimal' }, { value: 'luxury', label: 'Luxury' },
        { value: 'corporate', label: 'Corporate' }, { value: 'modern', label: 'Modern' },
        { value: 'bold', label: 'Bold' }, { value: 'feminine', label: 'Feminine' },
        { value: 'editorial', label: 'Editorial' }, { value: 'playful', label: 'Playful' },
        { value: 'tech', label: 'Tech' }, { value: 'professional', label: 'Professional' },
        { value: 'other', label: 'Other' },
      ] }),
      F('inspiration_1', 'Website you like #1', 'url', { half: true }),
      F('inspiration_1_notes', 'What you like about it', 'text', { half: true }),
      F('inspiration_2', 'Website you like #2', 'url', { half: true }),
      F('inspiration_2_notes', 'What you like about it', 'text', { half: true }),
      F('inspiration_3', 'Website you like #3', 'url', { half: true }),
      F('inspiration_3_notes', 'What you like about it', 'text', { half: true }),
      F('avoid_list', 'Anything you do NOT want?', 'textarea', { placeholder: 'Colours, layouts, animations, styles to avoid…' }),
    ],
  },
  {
    key: 'goals',
    label: 'Project Goals',
    description: 'What should this website achieve?',
    required: ['primary_purpose', 'target_audience'],
    fields: [
      F('primary_purpose', 'Primary purpose of the website', 'select', { required: true, options: [
        { value: 'generate_leads', label: 'Generate leads' }, { value: 'sell_products', label: 'Sell products' },
        { value: 'book_appointments', label: 'Book appointments' }, { value: 'build_credibility', label: 'Build credibility' },
        { value: 'accept_payments', label: 'Accept payments' }, { value: 'showcase_portfolio', label: 'Showcase portfolio' },
        { value: 'educate_customers', label: 'Educate customers' }, { value: 'collect_enquiries', label: 'Collect enquiries' },
        { value: 'mailing_list', label: 'Build a mailing list' }, { value: 'promote_services', label: 'Promote services' },
        { value: 'other', label: 'Other' },
      ] }),
      F('visitor_first_action', 'What should a visitor do first?', 'text', { half: true, placeholder: 'e.g. buy a product, book a call' }),
      F('target_audience', 'Who is your target audience?', 'textarea', { required: true, placeholder: 'Age, location, interests…' }),
      F('countries_served', 'Countries you sell / serve', 'text', { half: true, placeholder: 'e.g. Nigeria, UK' }),
      F('problem_to_solve', 'What problem should the site solve?', 'textarea', {}),
      F('main_business_goal', 'Most important business goal', 'text', { half: true }),
    ],
  },
  {
    key: 'content',
    label: 'Content',
    description: 'Copy and files for the site. You can also upload files under Documents in the portal — paste links here.',
    required: ['has_copy'],
    fields: [
      F('has_copy', 'Do you have website copy (text)?', 'select', { required: true, half: true, options: [
        { value: 'yes', label: 'Yes, ready' }, { value: 'partial', label: 'Some of it' }, { value: 'no', label: 'No — need help' },
      ] }),
      F('need_copywriting', 'Need copywriting assistance?', 'select', { half: true, options: YES_NO }),
      F('copy_doc_link', 'Copy document link', 'url', { half: true }),
      F('product_doc_link', 'Product / service descriptions link', 'url', { half: true }),
      F('company_profile_link', 'Company profile link', 'url', { half: true }),
      F('brochure_link', 'Brochure link', 'url', { half: true }),
      F('price_list', 'Price list link', 'url', { half: true }),
      F('team_info_link', 'Team information link', 'url', { half: true }),
      F('faq_link', 'FAQ link', 'url', { half: true }),
      F('testimonials_link', 'Testimonials link', 'url', { half: true }),
    ],
  },
  {
    key: 'ecommerce',
    label: 'E-commerce',
    description: 'Products, payments and shipping.',
    when: ['ECOMMERCE'],
    required: ['product_count', 'currency'],
    fields: [
      F('product_count', 'Approximate number of products', 'text', { required: true, half: true, placeholder: 'e.g. 120' }),
      F('product_categories', 'Product categories', 'text', { half: true }),
      F('product_variants', 'Variants (colours / sizes per product)?', 'textarea', { half: true }),
      F('product_data_link', 'Product data link (CSV / Sheet)', 'url', { half: true, placeholder: 'Google Sheet, CSV or Drive folder' }),
      F('uses_skus', 'Do you use SKUs?', 'select', { half: true, options: YES_NO }),
      F('inventory_tracking', 'Inventory tracking needed?', 'select', { half: true, options: YES_NO }),
      F('low_stock_alerts', 'Low-stock alerts?', 'select', { half: true, options: YES_NO }),
      F('allow_backorders', 'Backorders allowed?', 'select', { half: true, options: YES_NO }),
      F('need_preorders', 'Pre-orders needed?', 'select', { half: true, options: YES_NO }),
      F('custom_measurements', 'Custom measurements?', 'select', { half: true, options: YES_NO }),
      F('personalisation', 'Personalisation fields?', 'select', { half: true, options: YES_NO }),
      F('product_bundles', 'Product bundles?', 'select', { half: true, options: YES_NO }),
      F('gift_cards', 'Gift cards?', 'select', { half: true, options: YES_NO }),
      F('discount_codes', 'Discount codes?', 'select', { half: true, options: YES_NO }),
      F('wholesale_pricing', 'Wholesale pricing?', 'select', { half: true, options: YES_NO }),
      F('currency', 'Primary currency', 'select', { required: true, half: true, options: [
        { value: 'NGN', label: 'Nigerian Naira (₦)' }, { value: 'USD', label: 'US Dollar ($)' },
        { value: 'GBP', label: 'British Pound (£)' }, { value: 'EUR', label: 'Euro (€)' },
        { value: 'other', label: 'Other' },
      ] }),
      F('other_currencies', 'Other display currencies', 'text', { half: true }),
      F('fixed_vs_live', 'Fixed prices or live conversion?', 'select', { half: true, options: [
        { value: 'fixed', label: 'Fixed per currency' }, { value: 'live', label: 'Live conversion' }, { value: 'not_sure', label: 'Not sure' },
      ] }),
      { name: 'payment_providers', label: 'Payment methods to accept (we never ask for secret keys here — access is requested securely later)', type: 'multiselect', options: [
        { value: 'paystack', label: 'Paystack' }, { value: 'stripe', label: 'Stripe' },
        { value: 'paypal', label: 'PayPal' }, { value: 'klarna', label: 'Klarna' },
        { value: 'clearpay', label: 'Clearpay' }, { value: 'bank_transfer', label: 'Bank transfer' },
        { value: 'cod', label: 'Cash on delivery' }, { value: 'other', label: 'Other' },
      ] },
      F('shipping_countries', 'Countries you ship to', 'text', { half: true }),
      F('local_delivery_areas', 'Local delivery areas', 'text', { half: true }),
      F('international_shipping', 'International shipping?', 'select', { half: true, options: YES_NO }),
      F('shipping_model', 'Shipping pricing', 'select', { half: true, options: [
        { value: 'flat', label: 'Flat rate' }, { value: 'weight', label: 'Weight based' },
        { value: 'price', label: 'Price based' }, { value: 'not_sure', label: 'Not sure' },
      ] }),
      F('free_shipping_threshold', 'Free shipping threshold (optional)', 'text', { half: true }),
      F('pickup_available', 'Pickup available?', 'select', { half: true, options: YES_NO }),
      F('courier_partners', 'Courier partners', 'text', { half: true }),
      F('delivery_times', 'Estimated delivery times', 'text', { half: true }),
      F('return_window', 'Return window', 'text', { half: true, placeholder: 'e.g. 14 days' }),
      F('exchange_policy', 'Exchange policy', 'textarea', {}),
      F('refund_policy', 'Refund policy', 'textarea', {}),
      F('non_returnable', 'Non-returnable products', 'text', { half: true }),
      F('return_address', 'Return address', 'text', { half: true }),
    ],
  },
  {
    key: 'booking',
    label: 'Booking & Services',
    description: 'Your services and how clients book you.',
    when: ['BOOKING'],
    required: ['services'],
    fields: [
      F('services', 'List your services', 'textarea', { required: true, placeholder: 'e.g. Boundary survey — ₦150k per plot…' }),
      F('service_categories', 'Service categories', 'text', { half: true }),
      F('service_duration', 'Typical service duration', 'text', { half: true }),
      F('service_pricing', 'Pricing', 'textarea', {}),
      F('deposit_amount', 'Deposit required', 'text', { half: true }),
      F('appointment_locations', 'Appointment locations', 'text', { half: true }),
      F('opening_hours', 'Opening hours', 'text', { half: true }),
      F('staff_members', 'Staff / team members', 'text', { half: true }),
      F('booking_notice', 'Minimum booking notice', 'text', { half: true, placeholder: 'e.g. 48 hours' }),
      F('cancellation_policy', 'Cancellation policy', 'textarea', {}),
      F('rescheduling_policy', 'Rescheduling rules', 'textarea', {}),
      F('calendar_integration', 'Calendar integration needed?', 'select', { half: true, options: YES_NO }),
      F('whatsapp_booking', 'WhatsApp booking?', 'select', { half: true, options: YES_NO }),
      F('email_confirmation', 'Email confirmations?', 'select', { half: true, options: YES_NO }),
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing & SEO',
    description: 'How customers find you.',
    required: [],
    fields: [
      F('primary_keywords', 'Primary keywords', 'text', { half: true, placeholder: 'e.g. "lagos fashion store"' }),
      F('target_locations', 'Target locations', 'text', { half: true }),
      F('competitors', 'Main competitors', 'text', { half: true }),
      F('newsletter_platform', 'Newsletter platform', 'text', { half: true }),
      F('has_google_analytics', 'Google Analytics?', 'select', { half: true, options: YES_NO }),
      F('has_meta_pixel', 'Meta Pixel?', 'select', { half: true, options: YES_NO }),
      F('has_tiktok_pixel', 'TikTok Pixel?', 'select', { half: true, options: YES_NO }),
      F('need_email_marketing', 'Email marketing needed?', 'select', { half: true, options: YES_NO }),
      F('need_seo', 'SEO service needed?', 'select', { half: true, options: YES_NO }),
      F('need_blog', 'Blog needed?', 'select', { half: true, options: YES_NO }),
    ],
  },
  {
    key: 'policies',
    label: 'Policies & Legal',
    description: 'Policies you already have. BuildWithLami drafts standard templates where missing — this is not legal advice.',
    required: [],
    fields: [
      F('has_policies', 'Do you have existing policies?', 'select', { half: true, options: YES_NO }),
      F('privacy_policy', 'Privacy Policy (link or text)', 'textarea', {}),
      F('terms', 'Terms & Conditions (link or text)', 'textarea', {}),
      F('shipping_policy', 'Shipping Policy', 'textarea', {}),
      F('return_policy', 'Return Policy', 'textarea', {}),
      F('refund_policy', 'Refund Policy', 'textarea', {}),
      F('cookie_policy', 'Cookie Policy', 'textarea', {}),
      F('accessibility_statement', 'Accessibility statement', 'textarea', {}),
    ],
  },
];

const isAnswered = (v) => {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
};

const computePercent = (responses, projectType) => {
  let total = 0, answered = 0;
  for (const s of SECTIONS) {
    if (s.when && !s.when.includes(projectType)) continue;
    if (!s.required?.length) continue;
    const data = responses?.[s.key] || {};
    for (const f of s.required) {
      total += 1;
      if (isAnswered(data[f])) answered += 1;
    }
  }
  return total === 0 ? 0 : Math.round((answered / total) * 100);
};

const fieldLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const inputClass = "w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors font-body";
const labelClass = "block text-[10px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5";

const Field = ({ field, value, onChange }) => {
  const common = { id: field.name, value: value ?? '', onChange: (e) => onChange(e.target.value), className: inputClass, placeholder: field.placeholder };

  return (
    <div className={field.half ? '' : 'md:col-span-2'}>
      <label htmlFor={field.name} className={labelClass}>
        {field.label}{field.required && <span className="text-accent ml-1">*</span>}
      </label>
      {field.type === 'textarea' && <textarea rows="3" {...common} />}
      {(field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'url') && <input type={field.type} {...common} />}
      {field.type === 'select' && (
        <select {...common}>
          <option value="">— Select —</option>
          {field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
      {field.type === 'multiselect' && (
        <div className="flex flex-wrap gap-2">
          {field.options.map((o) => {
            const active = Array.isArray(value) && value.includes(o.value);
            return (
              <button
                key={o.value} type="button"
                onClick={() => onChange(active ? value.filter((v) => v !== o.value) : [...(value || []), o.value])}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors font-body border ${
                  active
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-accent/50'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function ClientOnboarding() {
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepIndex, setStepIndex] = useState(0);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    api.get('/client-portal/onboarding', {}, 'client').then((res) => {
      if (res.ok) setOnboarding(res.data);
      setLoading(false);
    });
  }, []);

  const projectType = onboarding?.project_type || 'BUSINESS';
  const sections = useMemo(
    () => SECTIONS.filter((s) => !s.when || s.when.includes(projectType)),
    [projectType]
  );
  const steps = [...sections, { key: '_review', label: 'Review & Submit', review: true }];

  const responses = onboarding?.responses || {};
  const percent = onboarding ? (onboarding.completion_percent ?? computePercent(responses, projectType)) : 0;
  const locked = !onboarding || ['SUBMITTED', 'APPROVED'].includes(onboarding.status);

  const sectionDone = (section) =>
    !section.required?.length || section.required.every((f) => isAnswered(responses[section.key]?.[f]));

  // Autosave — debounce the current section up to the server,
  // which recomputes completion_percent authoritatively.
  const saveSection = useCallback((sectionKey, data) => {
    if (locked) return;
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const res = await api.patch('/client-portal/onboarding', { section: sectionKey, data }, 'client');
      if (res.ok && res.data) {
        setOnboarding((prev) => ({ ...(prev || {}), ...res.data }));
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 1800);
      } else {
        setSaveState('idle');
        notify.error(res.error || 'Autosave failed — check your connection.');
      }
    }, 1200);
  }, [locked]);

  useEffect(() => () => saveTimer.current && clearTimeout(saveTimer.current), []);

  const setField = (sectionKey, fieldName, value) => {
    setOnboarding((prev) => {
      const next = {
        ...(prev || {}),
        responses: {
          ...(prev?.responses || {}),
          [sectionKey]: { ...(prev?.responses?.[sectionKey] || {}), [fieldName]: value },
        },
      };
      saveSection(sectionKey, next.responses[sectionKey]);
      return next;
    });
  };

  const submit = async () => {
    setSubmitting(true);
    const res = await api.post('/client-portal/onboarding/submit', {}, 'client');
    setSubmitting(false);
    if (res.ok && res.data) {
      setOnboarding(res.data);
      notify.success('Onboarding submitted — Lami will review it shortly. 🚀');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      notify.error(res.error || 'Could not submit — try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-3 rounded-full" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!onboarding) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 font-body">
        <CloudUpload size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-2">No onboarding yet</h2>
        <p className="text-gray-500 dark:text-gray-400">
          When your project kicks off, an onboarding form will appear here. Keep an eye on your email.
        </p>
      </div>
    );
  }

  if (onboarding.status === 'APPROVED') {
    return (
      <div className="max-w-xl mx-auto text-center py-20 font-body">
        <CheckCircle2 size={44} className="mx-auto text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-2">Onboarding complete ✅</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Your onboarding was approved. Everything from here happens in your project — check the Projects tab for progress.
        </p>
      </div>
    );
  }

  if (onboarding.status === 'SUBMITTED') {
    return (
      <div className="max-w-xl mx-auto text-center py-20 font-body">
        <Send size={40} className="mx-auto text-accent mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-2">Submitted for review</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Thanks! Your onboarding ({onboarding.completion_percent}% complete) is with Lami for review. You'll get an email if anything needs updating.
        </p>
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-white/5 p-6 text-left">
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: `${onboarding.completion_percent}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{onboarding.completion_percent}% complete</p>
        </div>
      </div>
    );
  }

  const currentStep = steps[stepIndex];

  return (
    <div className="max-w-5xl">
      {/* Header + progress */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-heading">Project Onboarding</h1>
          <div className="flex items-center gap-2 text-xs font-bold font-body">
            {saveState === 'saving' && <span className="text-gray-400">Saving…</span>}
            {saveState === 'saved' && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={14} /> Saved</span>}
            <span className="bg-accent/10 text-accent px-3 py-1.5 rounded-xl">{percent}% complete</span>
          </div>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Changes requested banner */}
      {onboarding.status === 'NEEDS_CHANGES' && onboarding.requested_changes && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200 font-body text-sm">Lami needs a few updates:</p>
            <p className="text-sm text-amber-800 dark:text-amber-300 font-body mt-1 whitespace-pre-line">{onboarding.requested_changes}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 font-body mt-2">Update the sections above, then submit again from the Review step.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        {/* Steps rail */}
        <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-1">
          {steps.map((s, i) => {
            const done = s.review ? false : sectionDone(s);
            const active = i === stepIndex;
            return (
              <button
                key={s.key}
                onClick={() => setStepIndex(i)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors font-body ${
                  active
                    ? 'bg-accent text-white shadow-md'
                    : done
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-[#1c1c1c] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-100 dark:border-white/5'
                }`}
              >
                {done && !active ? <CheckCircle2 size={15} /> : active ? <Circle size={15} className="fill-white/20" /> : <Circle size={15} />}
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Step body */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 md:p-8">
          {currentStep.review ? (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading mb-1.5">Review & Submit</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-6">
                Double-check your answers. You can come back and edit any section — progress is saved automatically.
              </p>
              <div className="space-y-5 max-h-[420px] overflow-y-auto pr-2">
                {sections.map((s) => {
                  const data = responses[s.key] || {};
                  const answeredEntries = Object.entries(data).filter(([, v]) => isAnswered(v));
                  return (
                    <div key={s.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-accent">{s.label}</h3>
                        <button onClick={() => setStepIndex(steps.indexOf(s))} className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 hover:text-accent">Edit</button>
                      </div>
                      {answeredEntries.length === 0 ? (
                        <p className="text-sm text-gray-400 italic font-body">Nothing filled in.</p>
                      ) : (
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                          {answeredEntries.map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-3 text-sm font-body">
                              <dt className="text-gray-400 shrink-0">{fieldLabel(k)}</dt>
                              <dd className="font-bold text-gray-900 dark:text-white text-right truncate">{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={submit}
                disabled={submitting || percent === 0}
                className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-accent/30 font-body"
              >
                <Send size={16} />
                {submitting ? 'Submitting…' : onboarding.status === 'NEEDS_CHANGES' ? 'Resubmit Onboarding' : 'Submit Onboarding'}
              </button>
              {percent === 0 && <p className="text-xs text-red-500 font-body mt-2">Fill in at least the required fields before submitting.</p>}
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white font-heading mb-1.5">{currentStep.label}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body mb-6">{currentStep.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {currentStep.fields.map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    value={responses[currentStep.key]?.[field.name]}
                    onChange={(value) => setField(currentStep.key, field.name, value)}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100 dark:border-white/5">
                <button
                  onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                  disabled={stepIndex === 0}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 font-body"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <span className="text-xs text-gray-400 font-body">{saveState === 'saving' ? 'Saving…' : 'Progress auto-saves'}</span>
                <button
                  onClick={() => setStepIndex((i) => Math.min(steps.length - 1, i + 1))}
                  className="inline-flex items-center gap-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 text-sm font-bold py-2.5 px-5 rounded-xl transition-opacity font-body"
                >
                  {stepIndex === steps.length - 2 ? 'Review' : 'Next'} <ChevronRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
