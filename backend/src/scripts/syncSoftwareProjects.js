// ─── syncSoftwareProjects.js ──────────────────────────────
// Synchronises the 6 canonical software projects into PostgreSQL with:
// - division = 'SOFTWARE'
// - Curated category tags (Web Platforms, Business Systems, E-Commerce, SaaS)
// - Full v28 case study JSONB data (challenge, solution, results, tech stack, gallery, etc.)
// ──────────────────────────────────────────────────────────

import 'dotenv/config';
import pool from '../config/db.js';

async function checkCols() {
  console.log('[Sync] Updating projects_division_check constraint...');
  await pool.query(`
    ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_division_check;
    ALTER TABLE projects ADD CONSTRAINT projects_division_check CHECK (division IN ('SOFTWARE', 'SURVEY', 'DRONE', 'Technology', 'Surveying', 'Drone', 'Products'));
  `);
  const res = await pool.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='projects' ORDER BY ordinal_position");
  console.log('PROJECTS COLUMNS:', res.rows.map(r => `${r.column_name}: ${r.data_type} (${r.udt_name})`));
  const cons = await pool.query("SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'projects'::regclass");
  console.log('PROJECTS CONSTRAINTS:', cons.rows);
}



const canonicalProjects = [
  {
    title: "VonneX2X Enterprise ERP",
    slug: "vonnex2x-enterprise-erp",
    summary: "A bespoke business operations ecosystem featuring intelligent scheduling, GPS-fenced workforce management, and real-time retail/service POS integration.",
    description: "Vonne X2x is a production-ready management platform built to solve the operational chaos of businesses that combine retail and services. I engineered a custom scheduling algorithm that handles variable service durations, implemented a GPS-fenced attendance system for staff accountability, and built a unified POS that syncs inventory in real-time. The result is an 85% reduction in manual booking errors and a centralized hub for all business data.",
    features: ["Intelligent Scheduling Engine", "GPS-Verified Attendance", "Unified Retail & Service POS", "Data-Driven Analytics Suite"],
    category: "Business Systems",
    project_status: "Client Project",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Supabase"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    repo_url: null,
    year: "2024",
    client_name: "VonneX2X Ltd.",
    industry: "Retail & Service Operations",
    status: "PUBLISHED",
    status_label: "Live",
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
      { value: "Centralized", label: "Booking Workflow", description: "Variable-duration appointments & conflict detection in one calendar." },
      { value: "Unified", label: "POS & Inventory", description: "Retail and service transactions consolidated into a single ledger." },
      { value: "1", label: "Single Source of Truth", description: "Rosters, sales, and appointments managed in one hub." },
      { value: "GPS-Verified", label: "Attendance Tracking", description: "Audited clock-ins tied to verifiable geofences." }
    ],
    feature_categories: [
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
    tech_categories: [
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
    related_slugs: ["tiabrand-ecommerce", "eduflow-academic-erp"],
    display_order: 1,
    featured: true
  },
  {
    title: "The TiaBrand E-commerce Website",
    slug: "tiabrand-ecommerce",
    summary: "A premium e-commerce platform built to support multi-currency sales, complex product bundles, and secure Paystack payments while keeping product and order management simple.",
    description: "Developed 'The TiaBrand', a production-ready full-stack e-commerce platform. Built with React and Node.js, the system features a location-aware multi-currency engine, complex inventory management for product bundles, and secure Paystack payment integration. The project demonstrates a commitment to high-performance UI/UX and robust backend reliability, handling everything from asset optimization via Cloudinary to automated stock recovery systems.",
    features: ["Location-Aware Currency", "Bundle Creator Logic", "Persistent State Management", "Automated Inventory Recovery"],
    category: "E-Commerce",
    project_status: "Client Project",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Paystack"],
    image_url: "https://images.unsplash.com/photo-1661956602116-aa6865609028?q=80&w=1964&auto=format&fit=crop",
    live_url: "#",
    repo_url: null,
    year: "2024",
    client_name: "The TiaBrand",
    industry: "Fashion E-Commerce",
    status: "PUBLISHED",
    status_label: "Live",
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
    feature_categories: [
      {
        name: "Storefront",
        icon: "monitor",
        items: [
          { title: "Location-aware currency", description: "Geo-detected display currency with manual override." },
          { title: "Editorial PDP", description: "Long-form product storytelling without sacrificing speed." }
        ]
      },
      {
        name: "Cart & Checkout",
        icon: "cart",
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
      { step: "Visitor", detail: "Lands from social / search, location detected." },
      { step: "Cart", detail: "Builds a bundle, inventory reserved for 15 mins." },
      { step: "Paystack", detail: "Redirects to secure payment." },
      { step: "Webhook", detail: "Fires on success, updates inventory ledger." },
      { step: "Receipt", detail: "Order confirmation + tracking link emailed." }
    ],
    tech_categories: [
      { name: "Frontend", icon: "monitor", items: ["React", "Vite", "Tailwind CSS"] },
      { name: "Backend", icon: "server", items: ["Node.js", "Express"] },
      { name: "Database", icon: "database", items: ["PostgreSQL"] },
      { name: "Payments", icon: "card", items: ["Paystack API", "Webhooks"] },
      { name: "Assets", icon: "image", items: ["Cloudinary CDN"] }
    ],
    architecture: [
      { layer: "Client", detail: "React SPA · Vite · Tailwind" },
      { layer: "API", detail: "Express REST · JWT Auth" },
      { layer: "Database", detail: "PostgreSQL with transaction-safe inventory" },
      { layer: "Payments", detail: "Paystack redirect + webhook state machine" },
      { layer: "CDN", detail: "Cloudinary responsive image pipeline" }
    ],
    timeline: [
      { phase: "Discovery", detail: "Catalog review and multi-currency requirements." },
      { phase: "Wireframes", detail: "Product detail, bundle builder, cart drawer." },
      { phase: "UI Design", detail: "Editorial lookbook aesthetics in Figma." },
      { phase: "Development", detail: "Frontend + backend + payment engine." },
      { phase: "Testing", detail: "End-to-end checkout test runs." },
      { phase: "Launch", detail: "Go-live with 24/7 post-launch monitoring." }
    ],
    responsibilities: [
      "UX Research",
      "UI Design",
      "Frontend Development",
      "Backend Architecture",
      "Database Modeling",
      "Payment Gateway Integration",
      "Performance Optimization"
    ],
    metrics: {
      lighthouse: 98,
      performance: 97,
      accessibility: 98,
      seo: 100,
      bestPractices: 100,
      apiResponse: "95ms",
      bundle: "162 KB"
    },
    stats: { screens: 22, endpoints: 36, tables: 14 },
    related_slugs: ["vonnex2x-enterprise-erp", "wodibenuah-fair"],
    display_order: 2,
    featured: false
  },
  {
    title: "Wodibenuah Fair Exhibition Website",
    slug: "wodibenuah-fair",
    summary: "A high-end lifestyle event platform featuring automated vendor onboarding, high-volume ticket checkout, and a real-time organizer command center.",
    description: "I developed a full-stack luxury event platform for Wodibenuah Fair, integrating a high-end React frontend with a secure Node.js/Supabase backend. The system automates vendor registration and ticket sales through Paystack, while providing event organizers with a powerful administrative dashboard to manage high-volume logistics and lifestyle content. This project demonstrates my ability to deliver enterprise-grade functionality without compromising on elite-level visual design.",
    features: ["Luxury Frontend Experience", "Automated Vendor Onboarding", "Secure Payment Infrastructure", "Admin Command Center"],
    category: "Web Platforms",
    project_status: "Client Project",
    tech_stack: ["React", "Supabase", "Node.js", "Paystack"],
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
    live_url: "#",
    repo_url: null,
    year: "2024",
    client_name: "Wodibenuah Fair",
    industry: "Events & Lifestyle",
    status: "PUBLISHED",
    status_label: "Live",
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
    feature_categories: [
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
    tech_categories: [
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
    related_slugs: ["tiabrand-ecommerce", "vonnex2x-enterprise-erp"],
    display_order: 3,
    featured: false
  },
  {
    title: "Sourceline Limited Website",
    slug: "sourceline-limited",
    summary: "A trust-first geoinformatics platform with SURCON/CAC regulatory license verification, a dynamic CMS, and a qualified lead capture engine.",
    description: "I engineered the official digital platform for Sourceline Limited, a premier land surveying firm. To solve the industry's trust deficit, I implemented a 'Trust-First' architecture featuring a dedicated verification portal and regulatory-compliant content structures. Built with React 19 and Node.js, the system includes a custom Admin Dashboard for real-time resource management and a specialized lead-capture engine. The result is a secure, authoritative hub that successfully bridges the gap between technical surveying precision and modern user experience.",
    features: ["Anti-Scam Architecture", "SURCON Compliance", "Dynamic Resource Management", "Vite Performance Optimization"],
    category: "Web Platforms",
    project_status: "Client Project",
    tech_stack: ["React 19", "Supabase", "Vite", "Tailwind CSS"],
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    repo_url: null,
    year: "2025",
    client_name: "Sourceline Limited",
    industry: "Geoinformatics & Surveying",
    status: "PUBLISHED",
    status_label: "Live",
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
    feature_categories: [
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
    tech_categories: [
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
    related_slugs: ["vonnex2x-enterprise-erp", "eduflow-academic-erp"],
    display_order: 4,
    featured: false
  },
  {
    title: "EduFlow Academic ERP",
    slug: "eduflow-academic-erp",
    summary: "A school management and financial platform featuring automated WAEC grading, installment fee ledgers, and automated parent SMS notifications.",
    description: "I developed EduFlow, a comprehensive ERP tailored for the Nigerian educational sector. I engineered a complex financial ledger system that manages installmental fee payments and an academic engine that automates WAEC-standard grading and position-based broad sheet generation. The platform streamlines school operations for over 500+ students, reducing manual administrative tasks by 70% and providing real-time financial oversight for proprietors.",
    features: ["Partial Payment Logic", "WAEC Grading Engine", "Termii SMS Alerts", "Print-Ready PDF Hub"],
    category: "Business Systems",
    project_status: "Internal Product",
    tech_stack: ["React", "Node.js", "PostgreSQL", "Termii API"],
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    repo_url: null,
    year: "2024",
    client_name: "EduFlow (Internal Build)",
    industry: "Education",
    status: "PUBLISHED",
    status_label: "Live",
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
    feature_categories: [
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
    tech_categories: [
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
    related_slugs: ["vonnex2x-enterprise-erp", "medios-hospital-os"],
    display_order: 5,
    featured: false
  },
  {
    title: "MediOS Hospital OS",
    slug: "medios-hospital-os",
    summary: "An offline-first clinic and hospital management system featuring zero-downtime offline charts and an automated HMO insurance claims scrubber.",
    description: "I engineered MediOS, an offline-first Hospital Management System built to function in low-connectivity environments. Using a PWA architecture with IndexedDB, I ensured zero-downtime for clinical operations during network outages. I also developed a specialized HMO Claims Engine that automates insurance tariff validation, reducing claim rejection rates by 40%. This project demonstrates my ability to build mission-critical systems that prioritize reliability and data integrity.",
    features: ["Offline-First PWA", "HMO Claims Scrubber", "ICD-10 Validation", "Sync-Enabled Architecture"],
    category: "SaaS",
    project_status: "Concept Prototype",
    tech_stack: ["React", "PWA", "IndexedDB", "RxDB"],
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
    live_url: "#",
    repo_url: null,
    year: "2024",
    client_name: "MediOS (Internal Build)",
    industry: "Healthcare",
    status: "PUBLISHED",
    status_label: "Live",
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
    feature_categories: [
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
    tech_categories: [
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
    related_slugs: ["eduflow-academic-erp", "vonnex2x-enterprise-erp"],
    display_order: 6,
    featured: false
  }
];

async function syncProjects() {
  console.log('[Sync] Starting PostgreSQL software projects synchronisation...');
  await checkCols();
  
  for (const proj of canonicalProjects) {
    console.log(`[Sync] Upserting project: ${proj.title} (slug: ${proj.slug})`);

    const existingRes = await pool.query('SELECT id, image_url, gallery FROM projects WHERE slug = $1', [proj.slug]);
    
    // Preserve existing uploaded Cloudinary images if already present in DB
    const existingRow = existingRes.rows[0];
    const finalImageUrl = existingRow?.image_url && existingRow.image_url.includes('cloudinary.com')
      ? existingRow.image_url
      : proj.image_url;

    const finalGallery = existingRow?.gallery && Array.isArray(existingRow.gallery) && existingRow.gallery.length > 0
      ? existingRow.gallery
      : (proj.gallery || [{ src: finalImageUrl, alt: proj.title, device: 'desktop' }]);

    const query = `
      INSERT INTO projects (
        title, slug, summary, content, tech_stack, features, category,
        image_url, live_url, repo_url, division, featured, status,
        location, client_name, display_order, tags, published_at,
        tagline, year, industry, status_label, duration, role,
        gallery, challenge, solution, results, feature_categories,
        flow, tech_categories, architecture, timeline,
        responsibilities, metrics, stats, related_slugs, meta
      )
      VALUES (
        $1, $2, $3, $4, $5, $6::jsonb, $7,
        $8, $9, $10, 'SOFTWARE', $11, $12,
        $13, $14, $15, $16, NOW(),
        $17, $18, $19, $20, $21, $22,
        $23::jsonb, $24::jsonb, $25::jsonb, $26::jsonb, $27::jsonb,
        $28::jsonb, $29::jsonb, $30::jsonb, $31::jsonb,
        $32::jsonb, $33::jsonb, $34::jsonb, $35::jsonb, $36::jsonb
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        content = EXCLUDED.content,
        tech_stack = EXCLUDED.tech_stack,
        features = EXCLUDED.features,
        category = EXCLUDED.category,
        image_url = CASE 
          WHEN projects.image_url IS NOT NULL AND projects.image_url != '' THEN projects.image_url 
          ELSE EXCLUDED.image_url 
        END,
        live_url = EXCLUDED.live_url,
        repo_url = EXCLUDED.repo_url,
        division = 'SOFTWARE',
        featured = EXCLUDED.featured,
        status = EXCLUDED.status,
        client_name = EXCLUDED.client_name,
        display_order = EXCLUDED.display_order,
        tags = EXCLUDED.tags,
        tagline = EXCLUDED.tagline,
        year = EXCLUDED.year,
        industry = EXCLUDED.industry,
        status_label = EXCLUDED.status_label,
        duration = EXCLUDED.duration,
        role = EXCLUDED.role,
        gallery = CASE 
          WHEN jsonb_array_length(projects.gallery) > 0 THEN projects.gallery 
          ELSE EXCLUDED.gallery 
        END,
        challenge = EXCLUDED.challenge,
        solution = EXCLUDED.solution,
        results = EXCLUDED.results,
        feature_categories = EXCLUDED.feature_categories,
        flow = EXCLUDED.flow,
        tech_categories = EXCLUDED.tech_categories,
        architecture = EXCLUDED.architecture,
        timeline = EXCLUDED.timeline,
        responsibilities = EXCLUDED.responsibilities,
        metrics = EXCLUDED.metrics,
        stats = EXCLUDED.stats,
        related_slugs = EXCLUDED.related_slugs,
        updated_at = NOW()
      RETURNING id, title, slug, division, category, image_url;
    `;

    const values = [
      proj.title,
      proj.slug,
      proj.summary,
      proj.description,
      proj.tech_stack,
      JSON.stringify(proj.features || []),
      proj.category,
      finalImageUrl,
      proj.live_url,
      proj.repo_url,
      proj.featured,
      proj.status,
      proj.location || null,
      proj.client_name,
      proj.display_order,
      proj.tags || [],
      proj.tagline,
      proj.year,
      proj.industry,
      proj.status_label,
      proj.duration,
      proj.role,
      JSON.stringify(finalGallery),
      JSON.stringify(proj.challenge),
      JSON.stringify(proj.solution),
      JSON.stringify(proj.results),
      JSON.stringify(proj.feature_categories),
      JSON.stringify(proj.flow),
      JSON.stringify(proj.tech_categories),
      JSON.stringify(proj.architecture),
      JSON.stringify(proj.timeline),
      JSON.stringify(proj.responsibilities),
      JSON.stringify(proj.metrics),
      JSON.stringify(proj.stats),
      JSON.stringify(proj.related_slugs),
      JSON.stringify({}),
    ];

    const result = await pool.query(query, values);
    console.log(`[Sync] OK: ${result.rows[0].title} -> division=${result.rows[0].division}, category=${result.rows[0].category}, id=${result.rows[0].id}`);
  }

  console.log('[Sync] Done! All 6 software projects synced to PostgreSQL.');
  process.exit(0);
}

syncProjects().catch((err) => {
  console.error('[Sync] Failed:', err);
  process.exit(1);
});
