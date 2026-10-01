import { useEffect, useState } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { CONTACT } from '../config/contact';

export function ServiceShortcuts({ division, services, onSelect }) {
  const survey = division === 'SURVEY';
  const outcomes = survey
    ? ['Confirm your land boundaries', 'Plan with a clear picture of your site', 'Set out your next build', 'Divide land into workable plots']
    : ['Show a property at its best', 'Keep stakeholders up to date', 'Create your next brand film', 'See the whole site in one map'];
  return (
    <section className="division-shortcuts" aria-labelledby={`${division}-start-heading`}>
      <div className="division-shortcuts-heading">
        <p className="division-eyebrow">Built around your project</p>
        <h2 id={`${division}-start-heading`}>What are you planning?</h2>
        <p>Choose a starting point. We’ll help define the right scope.</p>
      </div>
      <div className="division-shortcut-grid">
        {services.map((service, index) => (
          <button type="button" key={service.id} onClick={() => onSelect(service.category)}>
            <span className="division-shortcut-number">0{index + 1} <ArrowUpRight size={20} aria-hidden="true" /></span>
            <strong>{outcomes[index]}</strong>
            <span>{service.category}</span>
            <span className="division-shortcut-action">Discuss this project →</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function MobileQuoteBar({ division, onQuote, hidden = false }) {
  const [contactVisible, setContactVisible] = useState(false);
  useEffect(() => {
    const contact = document.getElementById('contact');
    if (!contact || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => setContactVisible(entry.isIntersecting), { threshold: 0 });
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);
  if (hidden || contactVisible) return null;
  const subject = division === 'SURVEY' ? 'survey' : 'drone project';
  return (
    <aside className="division-mobile-cta" aria-label="Project enquiry">
      <a href={`https://wa.me/${CONTACT.phoneE164}?text=${encodeURIComponent(`Hello Eugene, I would like to discuss a ${subject}.`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} aria-hidden="true" /> WhatsApp</a>
      <button type="button" onClick={onQuote}>Get a quote <ArrowUpRight size={18} aria-hidden="true" /></button>
    </aside>
  );
}
