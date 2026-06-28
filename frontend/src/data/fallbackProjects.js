// ── Fallback project data used when the backend is unavailable ──
// Single source of truth — imported by ProjectsPage, ProjectDetailPage, and Projects component.

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
    year: "2024"
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
    year: "2024"
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
    year: "2024"
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
    year: "2025"
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
    year: "2024"
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
    year: "2024"
  }
];

export default fallbackProjects;
