// ─── src/services/quotationDraftService.js ────────────────
// Admin OS Phase 6 — AI-assisted quotation generation
// (blueprint §91 Phase 6.6, §23).
//
// The rules layer picks a package from the studio catalogue
// (mirroring the STUDIO_PRESETS in the admin quotations UI —
// the two lists must stay in sync), optionally scales it to a
// target budget, and personalises it with the lead's context.
// When AI is configured the LLM rewrites titles / descriptions /
// notes for the specific lead; every AI failure falls back to
// the rules draft. Nothing is saved — the payload fills the
// admin's create form for review before it becomes a quotation.
// ──────────────────────────────────────────────────────────

import pool from '../config/db.js';
import { isAiConfigured, chatJson } from './aiService.js';

// Catalogue mirrors STUDIO_PRESETS in
// frontend/src/pages/admin/AdminQuotations.jsx — keep in sync.
const CATALOG = [
    { id: 'web_starter', keywords: ['starter', 'landing', 'portfolio', 'basic'], title: 'Starter Digital Platform & Portfolio', items: [
        { description: 'Phase 1: Minimalist UI/UX Design & Brand Asset Integration', qty: 1, rate: 110000 },
        { description: 'Phase 2: High-Performance Frontend Build & WhatsApp Capture', qty: 1, rate: 110000 },
        { description: 'Phase 3: Core Web Vitals Optimization & 14-Day Warranty Support', qty: 1, rate: 50000 },
    ] },
    { id: 'web_business', keywords: ['business', 'corporate', 'cms', 'website'], title: 'Business Corporate Platform & CMS', items: [
        { description: 'Phase 1: Information Architecture, UX Wireframes & Design System', qty: 1, rate: 150000 },
        { description: 'Phase 2: Full Corporate Build (Up to 10 Pages) + CMS Integration', qty: 1, rate: 250000 },
        { description: 'Phase 3: Lead Capture CRM Pipeline, SEO Setup & 30-Day Support', qty: 1, rate: 120000 },
    ] },
    { id: 'web_plus', keywords: ['portal', 'pro', 'multi-department'], title: 'Business Pro Portal & Multi-Department Platform', items: [
        { description: 'Phase 1: Enterprise Information Architecture & Portal UI/UX', qty: 1, rate: 250000 },
        { description: 'Phase 2: Custom Multi-Page Portal, Staff Directory & Invoicing', qty: 1, rate: 500000 },
        { description: 'Phase 3: Technical SEO Audit, Speed Optimization & 60-Day Support', qty: 1, rate: 200000 },
    ] },
    { id: 'ecom_launch', keywords: ['ecommerce', 'e-commerce', 'shop', 'store', 'boutique'], title: 'E-Commerce Launch Engine (Boutique)', items: [
        { description: 'Phase 1: Storefront UI/UX & Catalog Architecture (Up to 25 SKUs)', qty: 1, rate: 200000 },
        { description: 'Phase 2: Frictionless Checkout, Paystack/Cards & Inventory Setup', qty: 1, rate: 350000 },
        { description: 'Phase 3: Order Management Dashboard, Testing & 30-Day Support', qty: 1, rate: 100000 },
    ] },
    { id: 'ecom_growth', keywords: ['multi-gateway', 'abandoned cart', 'large store'], title: 'E-Commerce Growth Platform (Multi-Gateway & Abandoned Cart)', items: [
        { description: 'Phase 1: Bespoke Storefront UI/UX, Product Filtering & Category Hierarchy', qty: 1, rate: 350000 },
        { description: 'Phase 2: Multi-Gateway Setup (Paystack + Stripe), Multi-Zone Shipping & Accounts', qty: 1, rate: 600000 },
        { description: 'Phase 3: Abandoned Cart Automation, Discount Engine, GA4/Meta Pixel & 60-Day Warranty', qty: 1, rate: 300000 },
    ] },
    { id: 'soft_mvp', keywords: ['mvp', 'saas', 'app', 'custom software'], title: 'Custom Web Application & SaaS Prototype MVP', items: [
        { description: 'Phase 1: Data Modeling, RBAC Auth & REST API Architecture', qty: 1, rate: 350000 },
        { description: 'Phase 2: Full-Stack Web Application, Interactive Dashboards & Logic', qty: 1, rate: 600000 },
        { description: 'Phase 3: Webhook Integrations, QA Testing, Production Deployment & 90-Day Warranty', qty: 1, rate: 250000 },
    ] },
    { id: 'soft_growth', keywords: ['erp', 'enterprise', 'operating system'], title: 'Enterprise ERP & Scalable Business Operating System', items: [
        { description: 'Phase 1: Enterprise System Modeling, Multi-Role Workflows & API Specs', qty: 1, rate: 600000 },
        { description: 'Phase 2: Custom ERP Modules, Financial Ledgers & Client Data Vault', qty: 1, rate: 1000000 },
        { description: 'Phase 3: Partner Integrations, Automated CI/CD, Load Testing & 90-Day Warranty', qty: 1, rate: 400000 },
    ] },
    { id: 'service_survey', keywords: ['survey', 'as-built', 'cadastral', 'topo'], title: 'Surveying & Geospatial Services', items: [
        { description: 'Field Data Acquisition (Control Setup & Detail Capture)', qty: 1, rate: 120000 },
        { description: 'Processing, Drafting & Certified Plan Production', qty: 1, rate: 80000 },
        { description: 'Submission, Charting & Client Handover Pack', qty: 1, rate: 50000 },
    ] },
    { id: 'service_drone', keywords: ['drone', 'aerial', 'ortho', 'photogrammetry'], title: 'Drone Aerial Services', items: [
        { description: 'Flight Planning & On-Site Aerial Capture', qty: 1, rate: 150000 },
        { description: 'Orthomosaic / Media Processing & Editing', qty: 1, rate: 100000 },
        { description: 'Deliverable Packaging (Maps, Media, Report) & Handover', qty: 1, rate: 50000 },
    ] },
];

const DEFAULT_NOTES = 'Payment Terms: 50% Kickoff Deposit to commence architecture & development. 50% Final Delivery Balance upon QA, handover, and production deployment. Includes 90-day post-launch warranty support.';

/**
 * Rules-based package selection from lead text + hints.
 * Scored by keyword hits on division, service, notes and the
 * requested projectType; falls back to the business website
 * package for SOFTWARE leads and survey/drone service packs
 * for those divisions.
 */
export function pickCatalogEntry({ division, notes, projectType } = {}) {
    const haystack = [projectType, notes, division].filter(Boolean).join(' ').toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const entry of CATALOG) {
        let score = 0;
        for (const kw of entry.keywords) {
            if (haystack.includes(kw)) score += 1;
        }
        if (score > bestScore) { best = entry; bestScore = score; }
    }
    if (best) return best;
    if (division === 'SURVEY') return CATALOG.find((c) => c.id === 'service_survey');
    if (division === 'DRONE') return CATALOG.find((c) => c.id === 'service_drone');
    return CATALOG.find((c) => c.id === 'web_business');
}

/**
 * Proportionally scales package rates so the total lands on the
 * target budget (rounded to the nearest 1,000). Budgets smaller
 * than the package floor are floored at the package price.
 */
export function scaleToBudget(items, budget) {
    const target = Number(budget);
    if (!target || target <= 0) return items;
    const current = items.reduce((sum, it) => sum + it.qty * it.rate, 0);
    if (current <= 0 || target <= current) return items;
    const factor = target / current;
    let scaled = items.map((it) => ({ ...it, rate: Math.round((it.rate * factor) / 1000) * 1000 }));
    // Absorb rounding drift into the largest line.
    const drift = target - scaled.reduce((sum, it) => sum + it.qty * it.rate, 0);
    if (drift !== 0) {
        const biggest = scaled.reduce((a, b) => (a.rate >= b.rate ? a : b));
        biggest.rate += Math.round(drift / (biggest.qty || 1));
    }
    return scaled;
}

/**
 * Build a draft quotation payload.
 *
 * @param {object} args
 * @param {string} [args.leadId]      — load the lead for context
 * @param {string} [args.projectType] — free-text hint ("ecommerce", …)
 * @param {number} [args.budget]      — target total
 * @param {string} [args.currency]    — 3-letter, defaults to lead's or NGN
 * @param {string} [args.notes]       — requirements text
 * @returns {Promise<{ok: boolean, draft?: object, source?: 'ai'|'rules',
 *                    presetId?: string, reason?: string}>}
 */
export async function generateQuotationDraft({ leadId, projectType, budget, currency, notes } = {}) {
    let lead = null;
    if (leadId) {
        // Leads carry division + notes only (no service/tier/currency —
        // those live on the contact `messages` table, v43).
        const { rows } = await pool.query(
            `SELECT id, full_name, division, notes FROM leads WHERE id = $1`,
            [leadId]
        );
        if (rows.length === 0) return { ok: false, reason: 'lead_not_found' };
        lead = rows[0];
    }

    const entry = pickCatalogEntry({
        division: lead?.division,
        notes: `${notes || ''} ${lead?.notes || ''}`,
        projectType,
    });
    let items = scaleToBudget(entry.items, budget);
    let source = 'rules';
    const title = `${lead?.full_name ? `${lead.full_name} — ` : ''}${entry.title}`;

    if (isAiConfigured()) {
        try {
            const out = await chatJson([
                {
                    role: 'system',
                    content: 'You personalise web-agency quotations. Use ONLY the package and data provided — never invent new line items or change prices unless the user asked for a different budget. Return JSON: {"title": string, "line_items": [{"description": string, "qty": positive number, "rate": number}], "notes": string}. Keep every original line item (you may sharpen its wording to the client context), keep total = sum(qty*rate) equal to the package total, notes ≤ 60 words and must state 50/50 milestone payment terms.',
                },
                {
                    role: 'user',
                    content: JSON.stringify({
                        package: { id: entry.id, title: entry.title, line_items: items },
                        lead: lead ? { name: lead.full_name, division: lead.division, notes: lead.notes } : null,
                        requirements: notes || null,
                        currency: currency || 'NGN',
                    }),
                },
            ], { maxTokens: 800 });

            const cleanItems = Array.isArray(out?.line_items)
                ? out.line_items
                    .filter((it) => it && typeof it.description === 'string' && it.description.trim())
                    .map((it) => ({
                        description: it.description.trim().slice(0, 200),
                        qty: Number(it.qty) > 0 ? Number(it.qty) : 1,
                        rate: Number(it.rate) >= 0 ? Math.round(Number(it.rate)) : 0,
                    }))
                : [];
            // Only accept the AI pass if it kept every line and the total.
            const pkgTotal = items.reduce((s, it) => s + it.qty * it.rate, 0);
            if (cleanItems.length === items.length
                && cleanItems.reduce((s, it) => s + it.qty * it.rate, 0) === pkgTotal) {
                items = cleanItems;
                source = 'ai';
            }
        } catch (err) {
            console.log('[QuotationDraft] AI unavailable:', err.reason || err.message);
        }
    }

    const amount = items.reduce((s, it) => s + it.qty * it.rate, 0);
    return {
        ok: true,
        draft: {
            title,
            lead_id: lead?.id || undefined,
            currency: (currency || 'NGN').toUpperCase().slice(0, 3),
            line_items: items,
            amount,
            notes: DEFAULT_NOTES,
        },
        source,
        presetId: entry.id,
    };
}
