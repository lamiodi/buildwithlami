import 'dotenv/config';
import pool from '../config/db.js';

const templates = [
  {
    name: "E-Commerce Website Intake",
    description: "Please fill out this comprehensive questionnaire so we can structure your online store perfectly.",
    schema: [
      { id: "1", type: "text", label: "Business/Store Name", required: true },
      { id: "2", type: "select", label: "Primary Industry", required: true, options: ["Fashion & Apparel", "Electronics", "Health & Beauty", "Food & Grocery", "Digital Products", "Other"] },
      { id: "3", type: "textarea", label: "Describe your target audience", required: true },
      { id: "4", type: "select", label: "Estimated Number of Products", required: true, options: ["1-50", "51-500", "501-2000", "2000+"] },
      { id: "5", type: "checkbox", label: "Required Payment Gateways", required: false, options: ["Stripe", "PayPal", "Square", "Apple Pay / Google Pay", "Crypto"] },
      { id: "6", type: "checkbox", label: "Required Features", required: false, options: ["Customer Accounts", "Wishlists", "Subscription Billing", "Multi-currency", "Multi-language", "Abandoned Cart Recovery"] },
      { id: "7", type: "text", label: "Competitor URLs (comma separated)", required: false },
      { id: "8", type: "textarea", label: "Brand Guidelines (Colors, Vibe, Fonts)", required: false }
    ]
  },
  {
    name: "ERP System Requirements",
    description: "Detailed requirements gathering for your custom Enterprise Resource Planning system.",
    schema: [
      { id: "1", type: "text", label: "Company Name", required: true },
      { id: "2", type: "select", label: "Current System / Software", required: true, options: ["Excel/Spreadsheets", "QuickBooks", "Legacy On-Premise ERP", "Odoo", "Other"] },
      { id: "3", type: "checkbox", label: "Core Modules Required", required: true, options: ["Accounting & Finance", "Human Resources (HR)", "Inventory Management", "CRM / Sales", "Supply Chain", "Manufacturing"] },
      { id: "4", type: "text", label: "Estimated Number of Users", required: true },
      { id: "5", type: "textarea", label: "Biggest Pain Points in Current Process", required: true },
      { id: "6", type: "select", label: "Deployment Preference", required: true, options: ["Cloud-based (SaaS)", "On-Premise (Local Server)"] },
      { id: "7", type: "checkbox", label: "Third-Party Integrations Needed", required: false, options: ["Shopify/WooCommerce", "Banking APIs", "Shipping Providers (FedEx, UPS)", "Slack/Teams", "Custom APIs"] },
      { id: "8", type: "textarea", label: "Data Migration Requirements", required: false }
    ]
  }
];

const seedTemplates = async () => {
  try {
    for (const t of templates) {
      await pool.query(
        `INSERT INTO intake_templates (name, description, schema) VALUES ($1, $2, $3)`,
        [t.name, t.description, JSON.stringify(t.schema)]
      );
      console.log(`Seeded Template: ${t.name}`);
    }
    console.log("Templates seeded successfully!");
  } catch (err) {
    console.error("Error seeding templates:", err);
  } finally {
    pool.end();
  }
};

seedTemplates();
