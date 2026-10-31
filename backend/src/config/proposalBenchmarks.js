/**
 * Internal proposal reference, reviewed 31 October 2026.
 * Starting benchmarks, not binding quotes. Validate scope, labour and provider costs.
 * Keep this module on the server. Never import it into the frontend or expose it
 * through a public API. Existing signed proposals retain their agreed terms.
 */
export const PROPOSAL_BENCHMARKS = Object.freeze({
  "reviewedOn": "2026-10-31",
  "packages": {
    "websites": [
      {
        "id": "web_starter",
        "name": "Starter",
        "startingNGN": 270000,
        "startingUSD": 6000,
        "cadence": "one-time"
      },
      {
        "id": "web_growth",
        "name": "Growth",
        "startingNGN": 520000,
        "startingUSD": 12000,
        "cadence": "one-time"
      },
      {
        "id": "web_pro",
        "name": "Pro Platform",
        "startingNGN": 950000,
        "startingUSD": 24000,
        "cadence": "one-time"
      }
    ],
    "ecommerce": [
      {
        "id": "ecom_starter",
        "name": "Starter",
        "startingNGN": 650000,
        "startingUSD": 12000,
        "cadence": "one-time"
      },
      {
        "id": "ecom_growth",
        "name": "Growth",
        "startingNGN": 1250000,
        "startingUSD": 24000,
        "cadence": "one-time"
      },
      {
        "id": "ecom_pro",
        "name": "Pro Headless",
        "startingNGN": 2200000,
        "startingUSD": 48000,
        "cadence": "one-time"
      }
    ],
    "software": [
      {
        "id": "soft_mvp",
        "name": "MVP Platform",
        "startingNGN": 1200000,
        "startingUSD": 30000,
        "cadence": "one-time"
      },
      {
        "id": "soft_growth",
        "name": "Growth Platform",
        "startingNGN": 2000000,
        "startingUSD": 60000,
        "cadence": "one-time"
      },
      {
        "id": "soft_enterprise",
        "name": "Enterprise",
        "startingNGN": 4000000,
        "startingUSD": 120000,
        "cadence": "one-time"
      }
    ],
    "portals": [
      {
        "id": "portal_gatepass",
        "name": "Access & Operations Hub",
        "startingNGN": 850000,
        "startingUSD": 24000,
        "cadence": "one-time"
      },
      {
        "id": "portal_school",
        "name": "School & Academic Portal",
        "startingNGN": 1600000,
        "startingUSD": 48000,
        "cadence": "one-time"
      },
      {
        "id": "portal_retail",
        "name": "Logistics & Retail ERP",
        "startingNGN": 2400000,
        "startingUSD": 72000,
        "cadence": "one-time"
      }
    ],
    "uiux": [
      {
        "id": "uiux_starter",
        "name": "Starter",
        "startingNGN": 280000,
        "startingUSD": 6000,
        "cadence": "one-time"
      },
      {
        "id": "uiux_growth",
        "name": "Growth",
        "startingNGN": 750000,
        "startingUSD": 15000,
        "cadence": "one-time"
      },
      {
        "id": "uiux_pro",
        "name": "Pro Platform",
        "startingNGN": 1600000,
        "startingUSD": 30000,
        "cadence": "one-time"
      }
    ],
    "branding": [
      {
        "id": "brand_starter",
        "name": "Starter",
        "startingNGN": 250000,
        "startingUSD": 6000,
        "cadence": "one-time"
      },
      {
        "id": "brand_growth",
        "name": "Growth",
        "startingNGN": 600000,
        "startingUSD": 15000,
        "cadence": "one-time"
      },
      {
        "id": "brand_pro",
        "name": "Pro Programme",
        "startingNGN": 1400000,
        "startingUSD": 30000,
        "cadence": "one-time"
      }
    ],
    "seo": [
      {
        "id": "seo_starter",
        "name": "Starter Audit",
        "startingNGN": 220000,
        "startingUSD": 6000,
        "cadence": "one-time"
      },
      {
        "id": "seo_growth",
        "name": "Growth Implementation",
        "startingNGN": 550000,
        "startingUSD": 12000,
        "cadence": "one-time"
      },
      {
        "id": "seo_pro",
        "name": "Ongoing Growth",
        "startingNGN": 350000,
        "startingUSD": 6000,
        "cadence": "monthly"
      }
    ],
    "marketing": [
      {
        "id": "mktg_starter",
        "name": "Strategy Blueprint",
        "startingNGN": 250000,
        "startingUSD": 6000,
        "cadence": "one-time"
      },
      {
        "id": "mktg_growth",
        "name": "Campaign Launch",
        "startingNGN": 700000,
        "startingUSD": 15000,
        "cadence": "one-time"
      },
      {
        "id": "mktg_pro",
        "name": "Monthly Management",
        "startingNGN": 850000,
        "startingUSD": 7500,
        "cadence": "monthly"
      }
    ],
    "ai": [
      {
        "id": "ai_starter",
        "name": "Starter Automation",
        "startingNGN": 450000,
        "startingUSD": 7200,
        "cadence": "one-time"
      },
      {
        "id": "ai_growth",
        "name": "Growth Pipeline",
        "startingNGN": 1400000,
        "startingUSD": 21600,
        "cadence": "one-time"
      },
      {
        "id": "ai_pro",
        "name": "Enterprise AI Suite",
        "startingNGN": 3000000,
        "startingUSD": 57600,
        "cadence": "one-time"
      }
    ]
  },
  "infrastructureValuesNGN": {
    "foundation": 130000,
    "growth": 240000,
    "scale": 420000,
    "enterprise": 750000
  },
  "addons": [
    {
      "id": "addon_shipping",
      "name": "Multi-Zone Courier Shipping Rules",
      "desc": "Local delivery zones (Lagos / Interstate / Intl) + Automated courier API sync",
      "costNGN": 100000,
      "highlight": true
    },
    {
      "id": "addon_gateway",
      "name": "Cross-Border Payment Gateway",
      "desc": "Accept international debit / credit cards, Stripe, UAE payments, or PayPal",
      "costNGN": 80000,
      "highlight": true
    },
    {
      "id": "addon_seo",
      "name": "Advanced Local SEO & GBP Optimization",
      "desc": "Google Business Profile setup, local citation building, geo-targeted landing pages, and review-generation strategy — beyond the technical SEO bundled in Growth",
      "costNGN": 100000,
      "highlight": true
    },
    {
      "id": "addon_automation",
      "name": "Custom Workflow Automations",
      "desc": "Webhook pipelines, automated CRM sync & customer order triggers",
      "costNGN": 100000
    },
    {
      "id": "addon_crm",
      "name": "CRM & Leads Pipeline Integration",
      "desc": "HubSpot, Notion, Airtable, or custom lead database capture",
      "costNGN": 100000
    },
    {
      "id": "addon_analytics",
      "name": "Advanced Conversion Analytics",
      "desc": "GA4 e-commerce events, Meta Pixel CAPI, and funnel drop-off tracking",
      "costNGN": 50000
    },
    {
      "id": "addon_multicurrency",
      "name": "Multi-Currency & Geolocation Pricing",
      "desc": "Automatic visitor location detection and regional currency conversion display",
      "costNGN": 75000
    },
    {
      "id": "addon_pages",
      "name": "Additional Custom Pages (Set of 3)",
      "desc": "Tailored responsive landing or story pages designed with high-conversion layouts",
      "costNGN": 75000
    },
    {
      "id": "addon_maintenance",
      "name": "Monthly Growth Care Retainer",
      "desc": "Up to 4 total hours/month for agreed care and improvement work; provider bills separate.",
      "costNGN": 85000
    }
  ]
});
