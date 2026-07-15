// Single source of truth for contact details shown across the site.
// Update this file once and every component (Contact, ContactPage,
// WhatsAppWidget, Footer, etc.) will reflect the change.

export const CONTACT = {
    email: 'hello@buildwithlami.com',
    phoneDisplay: '+234 906 418 5442',
    // E.164 format, no leading + — required by WhatsApp's `wa.me/` deep link.
    phoneE164: '2349064185442',
    address: 'Lagos, Nigeria',
    social: {
        twitter: 'https://twitter.com/buildwithlami',
        github: 'https://github.com/buildwithlami',
        linkedin: 'https://linkedin.com/in/buildwithlami',
    },
};
