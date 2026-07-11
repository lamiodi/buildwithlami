// ─── src/routes/divisionRoutes.js ────────────────────────
// Phase 6 — Division-scoped admin reads.
//
// Two route groups, one per division. Each applies
// `requireDivision` with the division baked in, so a Survey
// Manager can't accidentally fetch the DRONE list, and a
// Drone Pilot can't see SURVEY projects.
//
// Owner / Administrator always pass (their role grants
// `'*'` access inside `requireDivision`).
// ──────────────────────────────────────────────────────────

import express from 'express';
import { verifyToken, requireDivision } from '../middlewares/authMiddleware.js';
import { getProjects } from '../controllers/projectController.js';
import pool from '../config/db.js';

// Two routers — one per division — share the same handler
// functions below but apply `requireDivision` with the right
// division. This keeps the route file tiny while still
// preventing any cross-division reads at the middleware level.
const surveyRouter = express.Router();
const droneRouter = express.Router();

surveyRouter.use(verifyToken, requireDivision('SURVEY'));
droneRouter.use(verifyToken, requireDivision('DRONE'));

/**
 * Internal: list bookings for a fixed division, accepting the
 * same `status` / `from` / `to` filters the rest of the app
 * already uses on /api/bookings.
 */
async function listBookingsByDivision(division, req, res) {
    const { status, from, to } = req.query;
    const params = [division];
    const conditions = ['division = $1'];
    if (status) { params.push(status); conditions.push(`status = $${params.length}`); }
    if (from)   { params.push(from);   conditions.push(`created_at >= $${params.length}`); }
    if (to)     { params.push(to);     conditions.push(`created_at <= $${params.length}`); }
    try {
        const { rows } = await pool.query(
            `SELECT * FROM bookings WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC LIMIT 500`,
            params
        );
        return res.json(rows);
    } catch (err) {
        console.error('[Division] listBookings error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

/**
 * Internal: list projects for a fixed division. Re-uses the
 * existing `getProjects` controller (which already supports
 * `?division=`) by injecting the division into the query.
 */
async function listProjectsByDivision(division, req, res, next) {
    req.query = { ...req.query, division };
    return getProjects(req, res, next);
}

// ── Survey routes ────────────────────────────────────────
surveyRouter.get('/bookings', (req, res) => listBookingsByDivision('SURVEY', req, res));
surveyRouter.get('/projects', (req, res, next) => listProjectsByDivision('SURVEY', req, res, next));

// ── Drone routes ─────────────────────────────────────────
droneRouter.get('/bookings', (req, res) => listBookingsByDivision('DRONE', req, res));
droneRouter.get('/projects', (req, res, next) => listProjectsByDivision('DRONE', req, res, next));

// Export both routers under a single mount point. We wrap them
// in a parent router that dispatches by the URL prefix.
const dispatch = express.Router();
dispatch.use('/survey', surveyRouter);
dispatch.use('/drone', droneRouter);

export default dispatch;
