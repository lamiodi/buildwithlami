// Single source of truth for public FAQ content. The visible FAQ sections
// and the FAQPage structured data in seo.js both import from here, so the
// markup and the schema always tell Google the same story.
// Shape: { q, a } — matches how Software/Survey/Drone pages render them.

export const homeFaqs = [
  {
    q: "What is your typical project timeline?",
    a: "My delivery timeline depends on the project's size and complexity:\n\nLanding Pages: 1–2 weeks\nBusiness Websites: 2–6 weeks\nE-commerce Websites: 4–8 weeks\nCustom Web Applications: 6–12 weeks\nEnterprise Platforms & SaaS: 3–6 months\n\nAfter a discovery session, I'll provide a tailored project schedule with key milestones, review stages, and an estimated launch date."
  },
  {
    q: "Do you offer post-launch support and maintenance?",
    a: "Yes, I offer ongoing maintenance and support packages to ensure your application remains secure, up-to-date, and performs optimally as your user base grows."
  },
  {
    q: "How do you handle SEO?",
    a: "SEO is built into my process from day one. I ensure proper semantic HTML, optimized performance (Core Web Vitals), metadata management, and accessible architecture so search engines can easily crawl and index your content."
  },
  {
    q: "What technologies do you use?",
    a: "We focus on a modern, reliable stack: React, Node.js, and PostgreSQL — deployed on Render with Cloudinary for media. We run a focused, single-cloud architecture so your product stays maintainable."
  },
  {
    q: "Can you help redesign an existing website?",
    a: "Absolutely. I often help clients modernize their legacy applications or websites, migrating them to newer, faster, and more secure technology stacks while improving the overall UX/UI."
  },
  {
    q: "What are your payment terms?",
    a: "Typically, I structure payments: 50% upfront to secure a spot in the schedule and begin architecture & development, and the remaining 50% upon final delivery, testing, and project handover."
  }
];

export const softwareFaqs = [
  {
    q: 'Do I own 100% of the code and intellectual property?',
    a: 'Yes, unconditionally. Upon final milestone payment, full copyright and repository ownership (GitHub transfer) is assigned to you with comprehensive documentation.'
  },
  {
    q: 'How are payments structured for software projects?',
    a: 'Software projects are structured with a transparent 50/50 milestone payment model: 50% upfront to reserve your schedule and begin architecture & development, and the remaining 50% upon final delivery, testing, and production deployment. I accept NGN via Paystack and international bank transfer.'
  },
  {
    q: 'What post-launch support and warranty is included?',
    a: 'Every custom software build includes 90 days of complimentary bug fixes, performance monitoring, and security patching after launch.'
  },
  {
    q: 'Can you work with existing codebases and legacy systems?',
    a: 'Yes. I frequently conduct code audits, refactoring, performance optimizations, and feature expansions for existing React, Node, Python, and PostgreSQL systems.'
  }
];

export const surveyFaqs = [
  {
    q: "How are your surveys supervised and prepared for statutory lodgement?",
    a: "All survey field observations, boundary measurements, and technical drafting are executed by Eugene Odibenuah. Statutory survey plans, official lodgement, and cadastral title documentations are prepared and delivered under the direct supervision of licensed SURCON-registered surveyors in full compliance with Nigerian survey regulations."
  },
  {
    q: "How long does a typical land survey take from start to finish?",
    a: "Standard residential boundary demarcation and perimeter surveys typically require 1–2 days of field observations, followed by 2–3 business days for computation, drafting, and plan preparation. Larger agricultural or estate subdivision projects (5+ hectares) generally require 1–2 weeks depending on site access, terrain, and weather conditions."
  },
  {
    q: "What deliverables will I receive upon project completion?",
    a: "Depending on your project scope, you will receive: Survey Plans prepared under registered supervision (suitable for title deed annexure and Governor's Consent), Tabulated Beacon Coordinate Schedules, Layered AutoCAD (.DWG / .DXF) vector files, Digital Terrain Models (DTM/DEM), and georeferenced aerial orthomosaics."
  },
  {
    q: "What coordinate systems and reference datums do you use?",
    a: "We deploy project-specific coordinate reference systems: Minna Datum (Clarke 1880 spheroid) projected to UTM Zone 31N or 32N for Nigerian national cadastral lodgements, WGS 84 for satellite GIS workflows, or custom local site coordinate grids for engineering and construction layout setting out."
  },
  {
    q: "What information is needed to begin a survey and receive a quote?",
    a: "To provide an accurate scope and quotation, we require: site location (Google Maps pin or landmark address), approximate plot count or land acreage, title or purchase documentation (if available), and the intended purpose of the survey (boundary title, architectural design, subdivision, or construction)."
  },
  {
    q: "Do you execute land survey projects outside Lagos State?",
    a: "Yes. While our primary base is Lagos, we regularly deploy across Ogun, Oyo, Delta, Edo, Ondo, and Abuja (FCT). Mobilization logistics and statutory state survey requirements are factored into our transparent project proposals."
  }
];

export const droneFaqs = [
  {
    q: "Can you fly anywhere in Nigeria?",
    a: "Missions are conducted across Nigeria (frequently in Lagos, Ogun, Oyo, and FCT Abuja) subject to Nigerian Civil Aviation Authority (NCAA) airspace restrictions, necessary local authorisations/clearances where applicable, weather windows, and on-site safety assessments. Longer-distance regional deployments are quoted with standard mobilization."
  },
  {
    q: "How does pricing and quotation work?",
    a: "Every flight mission is quoted individually based on site location, flight complexity, required deliverables (48MP RAW stills, 4K 10-bit video, or photogrammetry basemaps), battery cycle requirements, and editing turnaround. Request a quote with your site details for a clear, transparent scope."
  },
  {
    q: "How long does post-processing and delivery take?",
    a: "Standard photo packages are delivered within 2–3 business days. Cinematic 4K video edits and photogrammetry orthomosaics typically take 3–5 business days. Express same-day or 24-hour turnaround is available on request for urgent marketing campaigns."
  },
  {
    q: "Do you provide RAW stills and log footage?",
    a: "Yes. Clients can request 48MP RAW stills (DNG) and 10-bit D-Log M master video files captured on our flagship DJI Mini 4 Pro alongside the final graded deliverables."
  },
  {
    q: "What is the difference between your drone mapping and your survey division?",
    a: "Drone mapping delivers high-resolution aerial imagery, 2D orthomosaics, and photogrammetric digital surface models (DSM) for planning, agriculture, and construction visuals. For legally binding boundary demarcation, registered cadastral surveys, ground control, and certified engineering setting out, our professional Survey Division executes full SURCON-supervised services."
  },
  {
    q: "Can you work with construction companies on milestone schedules?",
    a: "Yes. We offer recurring monthly or milestone-based construction progress flyovers, high-resolution facade/roof visual audits, and stakeholder-ready video reels with fixed scheduled deployment windows."
  },
  {
    q: "How do weather and wind affect flight operations?",
    a: "High winds exceeding aircraft safety limits, heavy rain, or severe low-visibility conditions can delay flights. We monitor weather windows closely in the 48 hours prior to takeoff and reschedule at no additional cost if conditions compromise safety."
  }
];

export const faqsByPath = {
  '/': homeFaqs,
  '/software': softwareFaqs,
  '/survey': surveyFaqs,
  '/drone': droneFaqs,
};
