// ─── src/routes/cmsRoutes.js ─────────────────────────────
// Phase 4 — Content Management (CMS).
//
// Public reads (no auth):
//   GET  /api/cms/pages?status=PUBLISHED      — list published pages
//   GET  /api/cms/pages/:slug                 — fetch one published page
//   GET  /api/cms/testimonials?division=…     — list testimonials
//   GET  /api/cms/equipment?division=…         — list equipment
//   GET  /api/cms/industries                  — list industries
//
// Admin writes (Owner / Administrator):
//   GET  /api/cms/pages-id/:id                — fetch any status
//   POST /api/cms/pages                       — create
//   PUT  /api/cms/pages/:id                   — update
//   DELETE /api/cms/pages/:id                 — delete
//   POST /api/cms/testimonials                — create
//   PUT  /api/cms/testimonials/:id            — update
//   DELETE /api/cms/testimonials/:id          — delete
//   (same CRUD for equipment, industries)
//
// Note: the public "GET /api/cms/pages/:slug" takes a slug; the
// admin "GET /api/cms/pages-id/:id" is mounted under a separate
// path so the two don't collide in Express.
// ──────────────────────────────────────────────────────────

import express from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import {
    getPages,
    getPageBySlug,
    getPageById,
    createPage,
    updatePage,
    deletePage,
    getTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getEquipment,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getIndustries,
    createIndustry,
    updateIndustry,
    deleteIndustry,
} from '../controllers/cmsController.js';

const router = express.Router();

// Public reads are cheap but not free; cap at 60/min/IP to keep
// scrapers from hammering the database.
const publicReadLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { error: 'Too many requests. Please slow down.' },
});

// ── Public read endpoints ────────────────────────────────
router.get('/pages', publicReadLimiter, getPages);
router.get('/pages/:slug', publicReadLimiter, getPageBySlug);
router.get('/testimonials', publicReadLimiter, getTestimonials);
router.get('/equipment', publicReadLimiter, getEquipment);
router.get('/industries', publicReadLimiter, getIndustries);

// ── Admin (write) endpoints ──────────────────────────────
router.use(verifyToken);
router.use(requireRole('Owner', 'Administrator'));

// Pages — admin read by id, then writes.
router.get('/pages-id/:id', getPageById);
router.post('/pages', createPage);
router.put('/pages/:id', updatePage);
router.delete('/pages/:id', deletePage);

// Testimonials
router.post('/testimonials', createTestimonial);
router.put('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// Equipment
router.post('/equipment', createEquipment);
router.put('/equipment/:id', updateEquipment);
router.delete('/equipment/:id', deleteEquipment);

// Industries
router.post('/industries', createIndustry);
router.put('/industries/:id', updateIndustry);
router.delete('/industries/:id', deleteIndustry);

export default router;
