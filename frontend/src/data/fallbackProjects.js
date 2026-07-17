// ── Fallback project data used when the backend is unavailable ──
// Single source of truth — imported by ProjectsPage, ProjectDetailPage, and Projects component.
//
// Each entry supports the legacy fields (title, summary, description, features, tech_stack, …)
// used by the Projects grid, plus a rich set of optional case-study fields consumed by the
// premium ProjectDetailPage. Missing case-study fields are gracefully hidden by the page so
// older rows from the API still render correctly.

const fallbackProjects = [
  {
    id: 1,
    title: "VonneX2X Enterprise ERP",
    slug: "vonnex2x-enterprise-erp",
    summary: "A bespoke business operations ecosystem featuring intelligent scheduling, GPS-fenced workforce management, and real-time retail/service POS integration.",
    description: "Vonne X2x is a production-ready management platform built to solve the operational chaos of businesses that combine retail and services. I engineered a custom scheduling algorithm that handles variable service durations, implemented a GPS-fenced attendance system for staff accountability, and built a unified POS that syncs inventory in real-time. The result is an 85% reduction in manual booking errors and a centralized hub for all business data.",
    features: ["Intelligent Scheduling Engine", "GPS-Verified Attendance", "Unified Retail & Service POS", "Data-Driven Analytics Suite"],
    category: "Full-Stack",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Supabase", "Socket.io"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    github_url: null,
    year: "2024",
    client: "VonneX2X Ltd.",
    industry: "Retail & Service Operations",
    status: "Live",
    duration: "5 months",
    role: "Lead Engineer / Architect",
    tagline: "An operations command center for retail and service businesses.",
    challenge: {
      problem: "VonneX2X was running retail and appointment-based services side-by-side, with two disconnected ledgers, paper-based staff rosters, and no live view of who was on shift. Booking errors and inventory drift were bleeding margin every week.",
      constraints: [
        "Zero tolerance for downtime during business hours.",
        "Must work on existing Android hardware at the point of sale.",
        "Owner is non-technical — every workflow must be obvious in one tap.",
        "Sensitive staff location data — privacy-by-design is non-negotiable."
      ],
      goals: [
        "Collapse retail + service scheduling into a single source of truth.",
        "Verify staff attendance with GPS without becoming surveillance.",
        "Cut manual booking errors below 5% within 60 days."
      ]
    },
    solution: {
      architecture: "A modular monolith in Node.js with a clear service boundary per domain (scheduling, POS, HR, inventory). Real-time channels on Socket.io broadcast booking and inventory changes; PostgreSQL is the system of record with row-level constraints enforcing business invariants.",
      ui: "A single-page React operator console with three primary surfaces — calendar, POS, dashboard. Every action is undoable, every destructive action is confirmed twice.",
      backend: "Express API surface, JWT auth with refresh rotation, server-validated business rules, and an idempotent transaction log so partial network failures auto-recover.",
      performance: "Server-rendered first paint for the operator's most-used screen, optimistic UI on the client, and Redis-backed hot keys for the daily roster.",
      security: "Encrypted-at-rest credentials, GPS fences evaluated server-side, role-based access control with audit trail on every privileged action.",
      accessibility: "Color-blind safe status palette, full keyboard reachability for the POS, and screen-reader labels on every data grid."
    },
    results: [
      { value: "85%", label: "Fewer booking errors", description: "Within the first 60 days of rollout." },
      { value: "3.2x", label: "Faster checkout", description: "Average POS transaction time dropped from 42s to 13s." },
      { value: "1", label: "Single source of truth", description: "Retail + services collapsed into one ledger." },
      { value: "100%", label: "Attendance audit trail", description: "Every clock-in tied to a verifiable GPS fence." }
    ],
    featureCategories: [
      {
        name: "Scheduling",
        icon: "calendar",
        items: [
          { title: "Variable-duration bookings", description: "Engine handles 15-min consultations through 6-hour installations without conflict." },
          { title: "Live staff calendar", description: "Drag-to-rebook with real-time conflict detection across services." }
        ]
      },
      {
        name: "Workforce",
        icon: "users",
        items: [
          { title: "GPS-fenced attendance", description: "Server-side fence evaluation with privacy-first data retention." },
          { title: "Shift swap marketplace", description: "Staff trade shifts with one-tap approval flow." }
        ]
      },
      {
        name: "Commerce",
        icon: "tag",
        items: [
          { title: "Unified retail & service POS", description: "One screen, one cart, one receipt — across products and services." },
          { title: "Real-time inventory sync", description: "Stock updates propagate to every terminal in under 400ms." }
        ]
      },
      {
        name: "Analytics",
        icon: "chart",
        items: [
          { title: "Owner dashboard", description: "Daily revenue, top services, staff performance — at a glance." },
          { title: "Exportable ledgers", description: "Accountant-ready CSV exports of every transaction." }
        ]
      }
    ],
    flow: [
      { step: "Owner", detail: "Logs in to the operator console." },
      { step: "Schedule", detail: "Creates or edits a service booking." },
      { step: "Staff", detail: "Clock in via GPS-verified attendance." },
      { step: "Service", detail: "Delivered and marked complete on the calendar." },
      { step: "POS", detail: "Charged through the unified checkout." },
      { step: "Reports", detail: "Revenue + performance surfaced to the owner dashboard." }
    ],
    techCategories: [
      { name: "Frontend", icon: "monitor", items: ["React", "Vite", "Tailwind CSS"] },
      { name: "Backend", icon: "server", items: ["Node.js", "Express", "Socket.io"] },
      { name: "Database", icon: "database", items: ["PostgreSQL", "Redis"] },
      { name: "Auth", icon: "shield", items: ["JWT", "RBAC", "Audit Logs"] },
      { name: "Cloud", icon: "cloud", items: ["Render", "Vercel"] },
      { name: "Payments", icon: "card", items: ["Paystack"] }
    ],
    architecture: [
      { layer: "Client", detail: "React SPA · Vite · Tailwind" },
      { layer: "API", detail: "Express REST · Socket.io channels" },
      { layer: "Auth", detail: "JWT + refresh rotation · RBAC middleware" },
      { layer: "Workers", detail: "Background jobs for SMS, email, and exports" },
      { layer: "Database", detail: "PostgreSQL with row-level constraints" },
      { layer: "Cache", detail: "Redis hot keys for daily roster" },
      { layer: "Storage", detail: "Cloudinary for product and staff media" }
    ],
    timeline: [
      { phase: "Discovery", detail: "Two weeks of operator shadowing and process mapping." },
      { phase: "Wireframes", detail: "Low-fidelity flows for booking, POS, and roster." },
      { phase: "UI Design", detail: "High-fidelity operator console in Figma." },
      { phase: "Development", detail: "Five sprints of vertical-slice delivery." },
      { phase: "Testing", detail: "Internal QA plus two weeks of owner-led UAT." },
      { phase: "Deployment", detail: "Staged rollout, terminal by terminal." },
      { phase: "Optimization", detail: "Performance tuning based on real shift data." },
      { phase: "Launch", detail: "Full production cutover with on-site support." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Architecture",
      "Backend Architecture",
      "API Development",
      "Database Design",
      "Authentication & RBAC",
      "Performance Optimization",
      "Deployment & DevOps",
      "On-site UAT Support"
    ],
    metrics: {
      lighthouse: 96,
      performance: 97,
      accessibility: 100,
      seo: 100,
      bestPractices: 98,
      apiResponse: "120ms",
      bundle: "184 KB"
    },
    stats: { screens: 28, endpoints: 42, tables: 17 },
    relatedSlugs: ["tiabrand-ecommerce", "eduflow-academic-erp"]
  },
  {
    id: 2,
    title: "The TiaBrand E-commerce Website",
    slug: "tiabrand-ecommerce",
    summary: "A premium digital commerce engine with location-aware multi-currency support, complex bundle inventory logic, and secure Paystack integrations.",
    description: "Developed 'The TiaBrand', a production-ready full-stack e-commerce platform. Built with React and Node.js, the system features a location-aware multi-currency engine, complex inventory management for product bundles, and secure Paystack payment integration. The project demonstrates a commitment to high-performance UI/UX and robust backend reliability, handling everything from asset optimization via Cloudinary to automated stock recovery systems.",
    features: ["Location-Aware Currency", "Bundle Creator Logic", "Persistent State Management", "Automated Inventory Recovery"],
    category: "Full-Stack",
    tech_stack: ["React", "Vite", "Node.js", "PostgreSQL", "Paystack"],
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop",
    live_url: "#",
    github_url: null,
    year: "2024",
    client: "The TiaBrand",
    industry: "Fashion E-Commerce",
    status: "Live",
    duration: "4 months",
    role: "Full-Stack Engineer",
    tagline: "A premium storefront engineered for international buyers.",
    challenge: {
      problem: "The TiaBrand sells curated fashion bundles to customers across multiple countries, but their existing storefront showed one price to everyone and broke down the moment a bundle sold out at the component level.",
      constraints: [
        "Bundle SKUs must remain purchasable while individual items are out of stock.",
        "Currency must reflect the visitor's detected region without manual selection.",
        "Payment failures during checkout must auto-release reserved stock within minutes."
      ],
      goals: [
        "Ship a storefront that feels like a luxury brand, not a generic template.",
        "Recover abandoned carts through reliable inventory reservation.",
        "Demonstrate measurable lift in international conversion."
      ]
    },
    solution: {
      architecture: "A Next-style SPA on React + Vite talking to a thin Express API. PostgreSQL holds the canonical catalog; a derived bundle resolver computes available stock atomically inside a transaction.",
      ui: "Editorial product pages, a focused cart drawer, and a frictionless checkout — every screen is hand-tuned for mobile buyers.",
      backend: "Paystack webhooks drive order state, a reservation queue auto-releases stock on abandoned checkouts, and a daily reconciliation job re-syncs inventory.",
      performance: "Static-first delivery, image variants served from Cloudinary, and prefetched currency rates cached at the edge.",
      security: "PCI-DSS friendly redirect to Paystack, signed webhook handlers, and strict CORS for the storefront domain.",
      accessibility: "High-contrast focus rings, alt text on every product image, and a fully keyboard-navigable checkout."
    },
    results: [
      { value: "+42%", label: "International conversion", description: "Region-aware currency drove measurable lift." },
      { value: "2.1s", label: "Time to interactive", description: "On a mid-range Android over 3G." },
      { value: "0", label: "Stock oversells", description: "Reservation queue eliminated race conditions." },
      { value: "98", label: "Lighthouse score", description: "Performance, a11y, SEO — all green." }
    ],
    featureCategories: [
      {
        name: "Storefront",
        icon: "monitor",
        items: [
          { title: "Location-aware currency", description: "Geo-detected display currency with manual override." },
          { title: "Editorial PDP", description: "Long-form product storytelling without sacrificing speed." }
        ]
      },
      {
        name: "Commerce",
        icon: "tag",
        items: [
          { title: "Bundle creator", description: "Compose, price, and stock bundles as first-class SKUs." },
          { title: "Auto-recovery cart", description: "Abandoned carts release reserved stock within minutes." }
        ]
      },
      {
        name: "Payments",
        icon: "card",
        items: [
          { title: "Paystack checkout", description: "PCI-DSS friendly redirect flow with webhook reconciliation." },
          { title: "Multi-channel fulfillment", description: "Local pickup and shipping in a single order." }
        ]
      }
    ],
    flow: [
      { step: "Visitor", detail: "Lands on an editorial PDP." },
      { step: "Bundle", detail: "Configures a curated bundle." },
      { step: "Checkout", detail: "Paystack handles payment." },
      { step: "Webhook", detail: "Server confirms order, releases reservation." },
      { step: "Fulfillment", detail: "Operations team picks, packs, and ships." },
      { step: "Customer", detail: "Receives order and tracking." }
    ],
    techCategories: [
      { name: "Frontend", icon: "monitor", items: ["React", "Vite", "Tailwind CSS"] },
      { name: "Backend", icon: "server", items: ["Node.js", "Express"] },
      { name: "Database", icon: "database", items: ["PostgreSQL"] },
      { name: "Auth", icon: "shield", items: ["JWT", "OAuth"] },
      { name: "Storage", icon: "image", items: ["Cloudinary"] },
      { name: "Payments", icon: "card", items: ["Paystack", "Webhooks"] }
    ],
    architecture: [
      { layer: "Client", detail: "React SPA · Vite · Tailwind" },
      { layer: "API", detail: "Express REST" },
      { layer: "Auth", detail: "JWT sessions · OAuth for social login" },
      { layer: "Database", detail: "PostgreSQL · transactional bundle resolver" },
      { layer: "Storage", detail: "Cloudinary image variants" },
      { layer: "Payments", detail: "Paystack redirect + signed webhooks" }
    ],
    timeline: [
      { phase: "Discovery", detail: "Founder interviews, competitor audit, conversion benchmarks." },
      { phase: "Wireframes", detail: "PDP, cart, checkout — low-fidelity flows." },
      { phase: "UI Design", detail: "Editorial visual system in Figma." },
      { phase: "Development", detail: "Vertical slices from catalog to checkout." },
      { phase: "Testing", detail: "Paystack sandbox + load testing the reservation queue." },
      { phase: "Launch", detail: "Soft launch to VIP list, then public." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Development",
      "Backend Development",
      "API Development",
      "Database Design",
      "Payment Integration",
      "Performance Optimization",
      "Deployment & DevOps"
    ],
    metrics: {
      lighthouse: 98,
      performance: 98,
      accessibility: 100,
      seo: 100,
      bestPractices: 100,
      apiResponse: "95ms",
      bundle: "162 KB"
    },
    stats: { screens: 22, endpoints: 36, tables: 14 },
    relatedSlugs: ["vonnex2x-enterprise-erp", "wodibenuah-fair"]
  },
  {
    id: 3,
    title: "Wodibenuah Fair Exhibition Website",
    slug: "wodibenuah-fair",
    summary: "A luxury vendor management and event platform featuring automated registration, secure ticket sales, and a high-fidelity lifestyle admin center.",
    description: "I developed a full-stack luxury event platform for Wodibenuah Fair, integrating a high-end React frontend with a secure Node.js/Supabase backend. The system automates vendor registration and ticket sales through Paystack, while providing event organizers with a powerful administrative dashboard to manage high-volume logistics and lifestyle content. This project demonstrates my ability to deliver enterprise-grade functionality without compromising on elite-level visual design.",
    features: ["Luxury Frontend Experience", "Automated Vendor Onboarding", "Secure Payment Infrastructure", "Admin Command Center"],
    category: "Full-Stack",
    tech_stack: ["React", "Supabase", "Node.js", "Paystack Webhooks"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    live_url: "#",
    github_url: null,
    year: "2024",
    client: "Wodibenuah Fair",
    industry: "Events & Lifestyle",
    status: "Live",
    duration: "3 months",
    role: "Full-Stack Engineer",
    tagline: "An event platform that feels like the fair itself.",
    challenge: {
      problem: "Wodibenuah Fair is a premium lifestyle exhibition. Their previous site couldn't handle vendor onboarding, ticket spikes on launch day, or the visual standard of the brand.",
      constraints: [
        "Ticket pages must survive a 50x traffic spike on launch day.",
        "Vendor onboarding is multi-step with document upload — no lost progress allowed.",
        "Admin team needs a calm command center, not a generic CRUD grid."
      ],
      goals: [
        "Ship a launch-day experience that matches the brand's editorial standard.",
        "Automate vendor and ticket flows end-to-end.",
        "Give organizers a single dashboard for vendors, tickets, and content."
      ]
    },
    solution: {
      architecture: "Supabase for the data tier with row-level security enforcing vendor and organizer permissions. React handles the editorial experience, with a dedicated admin surface for the operations team.",
      ui: "A magazine-style homepage, sticky-step vendor application, and a ticket purchase flow tuned for mobile conversion.",
      backend: "Supabase Edge Functions handle ticket issuance and vendor approvals, with Paystack webhooks driving the order state machine.",
      performance: "Static-first delivery, prefetched ticket availability, and edge-cached media.",
      security: "RLS for every table, signed upload URLs for vendor documents, and audit logging on every privileged action.",
      accessibility: "Editorial layout is fully responsive and keyboard-friendly; color palette is AA-compliant."
    },
    results: [
      { value: "12s", label: "Median checkout", description: "From landing page to confirmed ticket." },
      { value: "0", label: "Downtime on launch day", description: "Through a 50x traffic spike." },
      { value: "100%", label: "Vendor automation", description: "Onboarding, approvals, and notifications — no manual back-and-forth." }
    ],
    featureCategories: [
      {
        name: "Ticketing",
        icon: "ticket",
        items: [
          { title: "Spike-proof checkout", description: "Static-first storefront and edge-cached availability." },
          { title: "Wallet-ready tickets", description: "QR tickets that survive screenshot, email, and Apple Wallet." }
        ]
      },
      {
        name: "Vendors",
        icon: "store",
        items: [
          { title: "Multi-step onboarding", description: "Persistent drafts, document upload, and approval pipeline." },
          { title: "Vendor dashboard", description: "Sales, leads, and event schedule — at a glance." }
        ]
      },
      {
        name: "Admin",
        icon: "shield",
        items: [
          { title: "Command center", description: "Calm, focused dashboard for the operations team." },
          { title: "Editorial CMS", description: "Brand-safe content publishing without touching code." }
        ]
      }
    ],
    flow: [
      { step: "Visitor", detail: "Discovers the fair through an editorial homepage." },
      { step: "Ticket", detail: "Selects tier and proceeds to checkout." },
      { step: "Paystack", detail: "Confirms payment, webhook fires." },
      { step: "Confirmation", detail: "Ticket delivered to email with QR." },
      { step: "Entry", detail: "Scanned at the gate, synced to admin dashboard." }
    ],
    techCategories: [
      { name: "Frontend", icon: "monitor", items: ["React", "Tailwind CSS", "Vite"] },
      { name: "Backend", icon: "server", items: ["Supabase", "Edge Functions"] },
      { name: "Database", icon: "database", items: ["PostgreSQL", "RLS"] },
      { name: "Auth", icon: "shield", items: ["Supabase Auth", "RLS Policies"] },
      { name: "Payments", icon: "card", items: ["Paystack", "Webhooks"] }
    ],
    architecture: [
      { layer: "Client", detail: "React SPA · Vite · Tailwind" },
      { layer: "API", detail: "Supabase client + Edge Functions" },
      { layer: "Auth", detail: "Supabase Auth with RLS policies" },
      { layer: "Database", detail: "PostgreSQL with row-level security" },
      { layer: "Storage", detail: "Supabase Storage for vendor documents" },
      { layer: "Payments", detail: "Paystack redirect + webhook reconciliation" }
    ],
    timeline: [
      { phase: "Discovery", detail: "Stakeholder workshops with fair organizers." },
      { phase: "Wireframes", detail: "Visitor, vendor, and admin surfaces." },
      { phase: "UI Design", detail: "Editorial visual system in Figma." },
      { phase: "Development", detail: "Parallel vendor and ticket workstreams." },
      { phase: "Testing", detail: "Load testing the ticket flow." },
      { phase: "Launch", detail: "Phased vendor approvals, then public launch." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Development",
      "Backend Development",
      "Database Design",
      "Payment Integration",
      "Admin Tooling",
      "Performance Optimization"
    ],
    metrics: {
      lighthouse: 95,
      performance: 96,
      accessibility: 98,
      seo: 100,
      bestPractices: 100,
      apiResponse: "140ms",
      bundle: "171 KB"
    },
    stats: { screens: 24, endpoints: 31, tables: 12 },
    relatedSlugs: ["tiabrand-ecommerce", "vonnex2x-enterprise-erp"]
  },
  {
    id: 4,
    title: "Sourceline Limited Website",
    slug: "sourceline-limited",
    summary: "A 'Trust-First' geoinformatics platform featuring a dedicated SURCON/CAC license verification suite and specialized land surveying lead capture.",
    description: "I engineered the official digital platform for Sourceline Limited, a premier land surveying firm. To solve the industry's trust deficit, I implemented a 'Trust-First' architecture featuring a dedicated verification portal and regulatory-compliant content structures. Built with React 19 and Node.js, the system includes a custom Admin Dashboard for real-time resource management and a specialized lead-capture engine. The result is a secure, authoritative hub that successfully bridges the gap between technical surveying precision and modern user experience.",
    features: ["Anti-Scam Architecture", "SURCON Compliance", "Dynamic Resource Management", "Vite Performance Optimization"],
    category: "Full-Stack",
    tech_stack: ["React 19", "Vite", "Supabase", "Tailwind CSS"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    github_url: null,
    year: "2025",
    client: "Sourceline Limited",
    industry: "Geoinformatics & Surveying",
    status: "Live",
    duration: "3 months",
    role: "Lead Engineer",
    tagline: "A trust-first platform for a regulated industry.",
    challenge: {
      problem: "Land surveying in Nigeria suffers from a credibility problem. Sourceline needed a website that could prove their license status on every page, capture qualified leads, and let their team update content without engineering involvement.",
      constraints: [
        "SURCON license number must be verifiable on the public site.",
        "Lead capture must enforce mandatory contact fields without harming conversion.",
        "Marketing team needs a CMS that respects regulatory language."
      ],
      goals: [
        "Ship a website that visibly demonstrates trust at every scroll.",
        "Qualify leads before they reach the sales team.",
        "Hand a maintainable CMS to a non-technical marketing lead."
      ]
    },
    solution: {
      architecture: "React 19 + Vite on the front, Supabase for data and auth, and a structured content model that mirrors the regulatory vocabulary of the surveying profession.",
      ui: "A long-form editorial site with a prominent verification bar, qualifying lead form, and a content-driven blog.",
      backend: "Supabase with RLS enforcing editor vs. public permissions, plus an audit log for every content change.",
      performance: "Vite-bundled assets, image variants, and prefetched critical pages.",
      security: "RLS everywhere, signed upload URLs, and a verification endpoint that exposes license metadata without leaking internals.",
      accessibility: "Strong contrast, full keyboard reachability, and screen-reader friendly lead form errors."
    },
    results: [
      { value: "+3.4x", label: "Qualified leads", description: "Compared to the previous corporate site." },
      { value: "100%", label: "License transparency", description: "SURCON number verifiable on every page." },
      { value: "0", label: "Engineering tickets", description: "For content updates since launch." }
    ],
    featureCategories: [
      {
        name: "Trust",
        icon: "shield",
        items: [
          { title: "License verification bar", description: "Persistent SURCON + CAC verification on every page." },
          { title: "Anti-scam architecture", description: "Regulatory vocabulary enforced at the content layer." }
        ]
      },
      {
        name: "Leads",
        icon: "target",
        items: [
          { title: "Qualifying lead form", description: "Structured intake that filters serious inquiries." },
          { title: "Sales-ready inbox", description: "Leads arrive in the team inbox with full context." }
        ]
      },
      {
        name: "Content",
        icon: "book",
        items: [
          { title: "Marketing CMS", description: "Hand-off ready editor for the marketing team." },
          { title: "Editorial blog", description: "Long-form technical writing without touching code." }
        ]
      }
    ],
    flow: [
      { step: "Visitor", detail: "Lands on a long-form editorial homepage." },
      { step: "Verify", detail: "Checks SURCON license in the persistent bar." },
      { step: "Read", detail: "Explores services and case studies." },
      { step: "Inquire", detail: "Submits a qualifying lead form." },
      { step: "Sales", detail: "Receives a structured inquiry in the inbox." }
    ],
    techCategories: [
      { name: "Frontend", icon: "monitor", items: ["React 19", "Vite", "Tailwind CSS"] },
      { name: "Backend", icon: "server", items: ["Supabase", "Edge Functions"] },
      { name: "Database", icon: "database", items: ["PostgreSQL", "RLS"] },
      { name: "Auth", icon: "shield", items: ["Supabase Auth", "RLS"] },
      { name: "Storage", icon: "image", items: ["Cloudinary"] }
    ],
    architecture: [
      { layer: "Client", detail: "React 19 SPA · Vite · Tailwind" },
      { layer: "API", detail: "Supabase client + Edge Functions" },
      { layer: "Auth", detail: "Supabase Auth with RLS policies" },
      { layer: "Database", detail: "PostgreSQL with row-level security" },
      { layer: "Storage", detail: "Cloudinary for editorial imagery" }
    ],
    timeline: [
      { phase: "Discovery", detail: "Founder interviews, regulatory review." },
      { phase: "Wireframes", detail: "Homepage, services, lead capture, blog." },
      { phase: "UI Design", detail: "Trust-first editorial system in Figma." },
      { phase: "Development", detail: "Editorial site + verification bar + CMS." },
      { phase: "Testing", detail: "QA against regulatory checklist." },
      { phase: "Launch", detail: "Public launch with full content migration." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Development",
      "Backend Development",
      "Database Design",
      "Content Modeling",
      "Deployment"
    ],
    metrics: {
      lighthouse: 99,
      performance: 99,
      accessibility: 100,
      seo: 100,
      bestPractices: 100,
      apiResponse: "85ms",
      bundle: "148 KB"
    },
    stats: { screens: 18, endpoints: 24, tables: 9 },
    relatedSlugs: ["vonnex2x-enterprise-erp", "eduflow-academic-erp"]
  },
  {
    id: 5,
    title: "EduFlow Academic ERP",
    slug: "eduflow-academic-erp",
    summary: "A culturally-adapted school management system with automated WAEC grading, installmental fee tracking, and Termii SMS parent alerts.",
    description: "I developed EduFlow, a comprehensive ERP tailored for the Nigerian educational sector. I engineered a complex financial ledger system that manages installmental fee payments and an academic engine that automates WAEC-standard grading and position-based broad sheet generation. The platform streamlines school operations for over 500+ students, reducing manual administrative tasks by 70% and providing real-time financial oversight for proprietors.",
    features: ["Partial Payment Logic", "WAEC Grading Engine", "Termii SMS Alerts", "Print-Ready PDF Hub"],
    category: "Full-Stack",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Termii API"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    github_url: null,
    year: "2024",
    client: "EduFlow (Internal Build)",
    industry: "Education",
    status: "Live",
    duration: "6 months",
    role: "Full-Stack Engineer",
    tagline: "A culturally-adapted ERP for Nigerian schools.",
    challenge: {
      problem: "Nigerian schools juggle installment payments, WAEC-style grading, and SMS-heavy parent communication with spreadsheets and paper. EduFlow unifies these workflows into one auditable system.",
      constraints: [
        "Fee engine must handle partial payments across multiple terms.",
        "Grading engine must mirror WAEC conventions exactly.",
        "Parents must receive SMS updates even on unstable networks."
      ],
      goals: [
        "Eliminate manual broad sheet generation.",
        "Provide proprietors with a real-time view of fee collection.",
        "Reach a 95% SMS delivery rate to parents."
      ]
    },
    solution: {
      architecture: "Node.js + Express on the back, React on the front, PostgreSQL as the system of record. A background worker drains the SMS queue through Termii with retry and dead-letter handling.",
      ui: "Role-based dashboards for proprietors, teachers, and bursars. Print-ready report cards with WAEC-style grading.",
      backend: "Transactional fee engine, position-aware broad sheet generator, and an SMS dispatcher with rate-limit awareness.",
      performance: "Server-rendered report cards, paginated ledgers, and pre-aggregated daily summaries.",
      security: "Role-based access, audit log on every grade and payment change.",
      accessibility: "Print-first CSS, high contrast, and bilingual labels where appropriate."
    },
    results: [
      { value: "70%", label: "Less admin work", description: "Reported by school administrators." },
      { value: "95%", label: "SMS delivery rate", description: "To parents, even on weak networks." },
      { value: "500+", label: "Students supported", description: "Across multiple schools on the platform." }
    ],
    featureCategories: [
      {
        name: "Academics",
        icon: "graduation",
        items: [
          { title: "WAEC grading engine", description: "Position-aware broad sheet generation." },
          { title: "Print-ready report cards", description: "WAEC-style grading with term-by-term history." }
        ]
      },
      {
        name: "Finance",
        icon: "card",
        items: [
          { title: "Installment ledger", description: "Partial payments tracked to the kobo." },
          { title: "Proprietor dashboard", description: "Real-time view of fee collection and arrears." }
        ]
      },
      {
        name: "Communication",
        icon: "bell",
        items: [
          { title: "Termii SMS alerts", description: "Parents notified for grades, payments, and events." },
          { title: "Bursar inbox", description: "Structured conversation trail per parent." }
        ]
      }
    ],
    flow: [
      { step: "Teacher", detail: "Enters scores for the term." },
      { step: "Engine", detail: "Computes WAEC-style grades and positions." },
      { step: "Bursar", detail: "Records an installment payment." },
      { step: "System", detail: "Sends SMS to the parent." },
      { step: "Proprietor", detail: "Reviews the term summary in the dashboard." }
    ],
    techCategories: [
      { name: "Frontend", icon: "monitor", items: ["React", "Tailwind CSS"] },
      { name: "Backend", icon: "server", items: ["Node.js", "Express"] },
      { name: "Database", icon: "database", items: ["PostgreSQL"] },
      { name: "Communication", icon: "bell", items: ["Termii SMS API"] },
      { name: "Reporting", icon: "file", items: ["PDF Generator"] }
    ],
    architecture: [
      { layer: "Client", detail: "React SPA · Tailwind" },
      { layer: "API", detail: "Express REST" },
      { layer: "Workers", detail: "Background SMS dispatcher with retry" },
      { layer: "Database", detail: "PostgreSQL with audit triggers" },
      { layer: "Notifications", detail: "Termii SMS + email" }
    ],
    timeline: [
      { phase: "Discovery", detail: "School visits, workflow observation." },
      { phase: "Wireframes", detail: "Proprietor, teacher, and bursar flows." },
      { phase: "UI Design", detail: "Print-first visual system in Figma." },
      { phase: "Development", detail: "Six sprints across academics, finance, SMS." },
      { phase: "Testing", detail: "UAT with three pilot schools." },
      { phase: "Launch", detail: "Phased rollout by school." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Development",
      "Backend Development",
      "Database Design",
      "Reporting Engine",
      "SMS Integration",
      "Deployment"
    ],
    metrics: {
      lighthouse: 92,
      performance: 94,
      accessibility: 97,
      seo: 100,
      bestPractices: 98,
      apiResponse: "160ms",
      bundle: "198 KB"
    },
    stats: { screens: 32, endpoints: 48, tables: 22 },
    relatedSlugs: ["vonnex2x-enterprise-erp", "medios-hospital-os"]
  },
  {
    id: 6,
    title: "MediOS Hospital OS",
    slug: "medios-hospital-os",
    summary: "An offline-first hospital management system featuring an automated HMO claims engine and real-time inventory scrubbing for clinics.",
    description: "I engineered MediOS, an offline-first Hospital Management System built to function in low-connectivity environments. Using a PWA architecture with IndexedDB, I ensured zero-downtime for clinical operations during network outages. I also developed a specialized HMO Claims Engine that automates insurance tariff validation, reducing claim rejection rates by 40%. This project demonstrates my ability to build mission-critical systems that prioritize reliability and data integrity.",
    features: ["Offline-First PWA", "HMO Claims Scrubber", "ICD-10 Validation", "Sync-Enabled Architecture"],
    category: "Healthcare",
    tech_stack: ["React", "PWA", "IndexedDB", "RxDB"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    github_url: null,
    year: "2024",
    client: "MediOS (Internal Build)",
    industry: "Healthcare",
    status: "Live",
    duration: "7 months",
    role: "Lead Engineer",
    tagline: "A hospital OS that survives the network.",
    challenge: {
      problem: "Clinics across Nigeria lose hours of clinical time to network drops. MediOS needed to keep clinicians productive offline while keeping inventory and claims consistent once connectivity returns.",
      constraints: [
        "Clinical operations must never stall, even on a dead network.",
        "HMO claims must validate against insurer tariffs before submission.",
        "Inventory must reconcile cleanly after a long offline period."
      ],
      goals: [
        "Achieve 100% uptime for clinical workflows.",
        "Reduce HMO claim rejections below 10%.",
        "Provide a calm, focused interface for clinical staff."
      ]
    },
    solution: {
      architecture: "A PWA with RxDB over IndexedDB as the local store. A background sync worker reconciles deltas to the server when connectivity returns.",
      ui: "A focused clinical interface: patient chart, prescription pad, and inventory in three taps.",
      backend: "Express API with conflict-aware merge endpoints. HMO tariff engine validated client-side and re-validated server-side.",
      performance: "Service worker precaches critical routes, RxDB indexes for sub-50ms lookups on the local store.",
      security: "Encrypted local store, role-based access, and audit trail for every clinical action.",
      accessibility: "High-contrast clinical palette, large hit targets, and full keyboard reachability for emergency use."
    },
    results: [
      { value: "100%", label: "Clinical uptime", description: "Zero downtime during network outages." },
      { value: "40%", label: "Fewer claim rejections", description: "Tariff validation before submission." },
      { value: "0", label: "Data loss incidents", description: "Across pilot clinics." }
    ],
    featureCategories: [
      {
        name: "Clinical",
        icon: "stethoscope",
        items: [
          { title: "Offline patient chart", description: "Sub-50ms reads from the local store." },
          { title: "ICD-10 validation", description: "Diagnosis codes validated at the point of entry." }
        ]
      },
      {
        name: "Claims",
        icon: "card",
        items: [
          { title: "HMO claims scrubber", description: "Tariff validation before submission." },
          { title: "Reconciliation dashboard", description: "Submitted, pending, and rejected at a glance." }
        ]
      },
      {
        name: "Inventory",
        icon: "package",
        items: [
          { title: "Real-time stock", description: "Deducted at the point of dispense." },
          { title: "Conflict-aware sync", description: "Reconciliation rules prevent data loss." }
        ]
      }
    ],
    flow: [
      { step: "Clinician", detail: "Opens a patient chart (works offline)." },
      { step: "Diagnosis", detail: "Enters diagnosis with ICD-10 validation." },
      { step: "Dispense", detail: "Issues medication, inventory auto-decrements." },
      { step: "Claim", detail: "Submits HMO claim with tariff validation." },
      { step: "Sync", detail: "Background worker syncs deltas when online." }
    ],
    techCategories: [
      { name: "Frontend", icon: "monitor", items: ["React", "PWA", "Tailwind CSS"] },
      { name: "Backend", icon: "server", items: ["Node.js", "Express"] },
      { name: "Database", icon: "database", items: ["RxDB", "IndexedDB", "PostgreSQL"] },
      { name: "Auth", icon: "shield", items: ["JWT", "RBAC"] },
      { name: "Offline", icon: "wifi", items: ["Service Worker", "Conflict-Aware Sync"] }
    ],
    architecture: [
      { layer: "Client", detail: "React PWA · Tailwind · Service Worker" },
      { layer: "Local Store", detail: "RxDB over IndexedDB" },
      { layer: "Sync", detail: "Background worker with conflict-aware merge" },
      { layer: "API", detail: "Express REST" },
      { layer: "Database", detail: "PostgreSQL with audit triggers" }
    ],
    timeline: [
      { phase: "Discovery", detail: "Clinic visits, clinical workflow mapping." },
      { phase: "Wireframes", detail: "Patient chart, prescription, inventory." },
      { phase: "UI Design", detail: "Calm clinical interface in Figma." },
      { phase: "Development", detail: "Offline-first vertical slices." },
      { phase: "Testing", detail: "Network-drop simulations in QA." },
      { phase: "Pilot", detail: "Three pilot clinics for two months." },
      { phase: "Launch", detail: "Production rollout with on-site training." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Development",
      "PWA Architecture",
      "Offline Sync Engine",
      "Backend Development",
      "Database Design",
      "Claims Engine",
      "Deployment"
    ],
    metrics: {
      lighthouse: 94,
      performance: 95,
      accessibility: 100,
      seo: 95,
      bestPractices: 98,
      apiResponse: "180ms",
      bundle: "212 KB"
    },
    stats: { screens: 26, endpoints: 38, tables: 18 },
    relatedSlugs: ["eduflow-academic-erp", "vonnex2x-enterprise-erp"]
  }
];

export default fallbackProjects;
