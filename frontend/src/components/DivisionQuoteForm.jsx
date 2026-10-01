import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { CONTACT } from '../config/contact';
import { validateBooking } from '../utils/formValidation';

const emptyBrief = { full_name: '', email: '', phone: '', service: '', location: '', preferred_date: '', notes: '', land_size: '', survey_purpose: '' };

export default function DivisionQuoteForm({ division, services, selectedService }) {
  const [brief, setBrief] = useState({ ...emptyBrief });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const submitting = useRef(false);
  const survey = division === 'SURVEY';
  const prefix = division.toLowerCase();
  const id = (field) => `${prefix}-quote-${field}`;
  const whatsapp = `https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(`Hello Eugene, I would like a ${survey ? 'land survey' : 'drone project'} quote.`)}`;

  useEffect(() => {
    if (selectedService) {
      setBrief((current) => ({ ...current, service: selectedService.service }));
      setErrors((current) => ({ ...current, service: '' }));
      setStatus('idle');
    }
  }, [selectedService]);

  useEffect(() => {
    if (status === 'success') resultRef.current?.focus();
  }, [status]);

  function change(field, value) {
    setBrief((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const payload = Object.fromEntries(Object.entries(brief).map(([key, value]) => [key, value.trim()]));
    const validation = validateBooking(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      if (validation.errors.phone || validation.errors.preferred_date || validation.errors.notes) setDetailsOpen(true);
      requestAnimationFrame(() => formRef.current?.querySelector(`[name="${Object.keys(validation.errors)[0]}"]`)?.focus());
      return;
    }
    submitting.current = true;
    setErrors({});
    setStatus('submitting');
    try {
      const { land_size, survey_purpose, ...fields } = payload;
      const notes = [land_size && `Land size: ${land_size}`, survey_purpose && `Survey purpose: ${survey_purpose}`, fields.notes].filter(Boolean).join('\n\n');
      const response = await api.post('/bookings', { ...fields, notes, division });
      if (!response.ok) throw new Error('Quote request failed');
      setStatus('success');
      setBrief({ ...emptyBrief });
    } catch {
      setStatus('error');
    } finally {
      submitting.current = false;
    }
  }

  function input(field, label, { type = 'text', required = false, placeholder, autoComplete, maxLength = 200 } = {}) {
    return (
      <div className="division-field">
        <label htmlFor={id(field)}>{label}{required ? ' *' : ' (optional)'}</label>
        <input id={id(field)} name={field} type={type} required={required} placeholder={placeholder}
          autoComplete={autoComplete} maxLength={maxLength} value={brief[field]}
          onChange={(event) => change(field, event.target.value)}
          aria-invalid={!!errors[field]} aria-describedby={errors[field] ? `${id(field)}-error` : undefined} />
        {errors[field] && <p id={`${id(field)}-error`} className="division-field-error" role="alert">{errors[field]}</p>}
      </div>
    );
  }

  if (status === 'success') return (
    <div ref={resultRef} tabIndex={-1} className="division-quote-success" role="status">
      <CheckCircle2 size={36} aria-hidden="true" />
      <h3>Your request is in.</h3>
      <p>Thank you. We’ll review your brief and contact you by email to discuss scope, timing, and a quote. Your project date will be confirmed separately.</p>
      <button type="button" onClick={() => { setStatus('idle'); setDetailsOpen(false); }}>Send another enquiry <ArrowRight size={16} /></button>
    </div>
  );

  return (
    <form ref={formRef} className="division-quote" onSubmit={submit} noValidate aria-label={`${survey ? 'Survey' : 'Drone'} quote request`}>
      <p className="division-form-intro">Start with the essentials. Fields marked * are required; project details can follow.</p>
      <fieldset disabled={status === 'submitting'}>
        <legend className="sr-only">Your contact details and project brief</legend>
        <div className="division-form-grid">
          {input('full_name', 'Your name', { required: true, autoComplete: 'name', placeholder: 'Your full name' })}
          {input('email', 'Email address', { type: 'email', required: true, autoComplete: 'email', placeholder: 'you@company.com' })}
        </div>
        <div className="division-field">
          <label htmlFor={id('service')}>What do you need? *</label>
          <select id={id('service')} name="service" required value={brief.service} onChange={(event) => change('service', event.target.value)}
            aria-invalid={!!errors.service} aria-describedby={errors.service ? `${id('service')}-error` : undefined}>
            <option value="">Choose a service</option>
            {services.map((service) => <option key={service.id} value={service.category}>{service.category}</option>)}
            <option value="Help choosing a service">Not sure yet — help me choose</option>
          </select>
          {errors.service && <p id={`${id('service')}-error`} role="alert" className="division-field-error">{errors.service}</p>}
        </div>
        {input('location', 'Site location', { placeholder: 'Town / area and state' })}
        <details open={detailsOpen} onToggle={(event) => setDetailsOpen(event.currentTarget.open)}>
          <summary>Add project details <span>(optional)</span></summary>
          <div className="division-extra-fields">
            <div className="division-form-grid">
              {input('phone', 'Phone / WhatsApp', { type: 'tel', autoComplete: 'tel', placeholder: '+234 …', maxLength: 30 })}
              {input('preferred_date', 'Preferred date', { type: 'date' })}
            </div>
            {survey && <div className="division-form-grid">
              {input('land_size', 'Approximate land size', { placeholder: 'e.g. 2 plots, or not sure' })}
              {input('survey_purpose', 'Purpose of survey', { placeholder: 'e.g. building or buying land' })}
            </div>}
            <div className="division-field">
              <label htmlFor={id('notes')}>Anything else we should know? (optional)</label>
              <textarea id={id('notes')} name="notes" rows={4} maxLength={1000} value={brief.notes}
                placeholder={survey ? 'Tell us about the site and what you are planning.' : 'Tell us what you want to capture and where it will be used.'}
                onChange={(event) => change('notes', event.target.value)} aria-invalid={!!errors.notes}
                aria-describedby={errors.notes ? `${id('notes')}-error` : undefined} />
              {errors.notes && <p id={`${id('notes')}-error`} role="alert" className="division-field-error">{errors.notes}</p>}
            </div>
          </div>
        </details>
        <button className="division-submit" type="submit" aria-busy={status === 'submitting'}>
          {status === 'submitting' ? 'Sending your request…' : status === 'error' ? 'Try sending again' : 'Request my quote'} <ArrowRight size={18} aria-hidden="true" />
        </button>
      </fieldset>
      {status === 'error' && <p className="division-field-error" role="alert">We couldn’t confirm your request. Your details are still here. Please retry, or contact us using WhatsApp below.</p>}
      <p className="division-form-note">We’ll confirm the scope and price with you before work is booked.</p>
      <a className="division-whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> Prefer a conversation? Chat on WhatsApp</a>
    </form>
  );
}
