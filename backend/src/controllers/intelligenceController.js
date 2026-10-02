// ─── src/controllers/intelligenceController.js ────────────
// Admin OS Phase 6 (Intelligence) — thin HTTP layer over the
// intelligence / assistant / quotation-draft services.
// ──────────────────────────────────────────────────────────

import { z } from 'zod';
import {
    getTonightQueueData,
    getWorkloadPlan,
    getWorkloadSettings,
    updateWorkloadSettings,
    getProjectProfitability,
    generateClientSummary,
    saveManualSummary,
    isUuid,
} from '../services/intelligenceService.js';
import { askAssistant } from '../services/assistantService.js';
import { generateQuotationDraft } from '../services/quotationDraftService.js';
import { writeAuditLog, getClientIp } from '../utils/auditLog.js';

// GET /api/intelligence/tonight-queue
export async function getTonightQueue(req, res) {
    try {
        res.json(await getTonightQueueData());
    } catch (err) {
        console.error('[Intelligence] tonight-queue error:', err.message);
        res.status(500).json({ error: 'Failed to score tonight queue.' });
    }
}

// GET /api/intelligence/workload
export async function getWorkload(req, res) {
    try {
        res.json(await getWorkloadPlan());
    } catch (err) {
        console.error('[Intelligence] workload error:', err.message);
        res.status(500).json({ error: 'Failed to load workload plan.' });
    }
}

const workloadSchema = z.object({
    weekly_hours: z.number().positive().max(168).optional(),
    max_concurrent_builds: z.number().int().min(1).max(50).optional(),
    evening_capacity_hours: z.number().positive().max(24).optional(),
    work_days: z.string().max(60).optional(),
    work_hours: z.string().max(60).optional(),
}).strict();

// PATCH /api/intelligence/workload/settings
export async function patchWorkloadSettings(req, res) {
    let parsed;
    try {
        parsed = workloadSchema.parse(req.body || {});
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        throw err;
    }
    try {
        const settings = await updateWorkloadSettings(parsed);
        await writeAuditLog({
            action: 'WORKLOAD_SETTINGS_UPDATED',
            entityType: 'workload_settings',
            entityId: '1',
            details: parsed,
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.json(settings);
    } catch (err) {
        console.error('[Intelligence] workload settings error:', err.message);
        res.status(500).json({ error: 'Failed to update workload settings.' });
    }
}

// GET /api/intelligence/profitability?projectId=…
export async function getProfitability(req, res) {
    const { projectId } = req.query;
    if (projectId && !isUuid(projectId)) {
        return res.status(400).json({ error: 'Invalid projectId.' });
    }
    try {
        res.json(await getProjectProfitability(projectId || null));
    } catch (err) {
        console.error('[Intelligence] profitability error:', err.message);
        res.status(500).json({ error: 'Failed to compute profitability.' });
    }
}

// POST /api/intelligence/assistant  { question }
export async function postAssistant(req, res) {
    const question = typeof req.body?.question === 'string' ? req.body.question.slice(0, 500) : '';
    if (!question.trim()) return res.status(400).json({ error: 'Ask me a question.' });
    try {
        res.json(await askAssistant(question));
    } catch (err) {
        console.error('[Intelligence] assistant error:', err.message);
        res.status(500).json({ error: 'The assistant hit an error. Try again.' });
    }
}

// POST /api/intelligence/clients/:id/summary — generate (AI/rules)
export async function postClientSummary(req, res) {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid client ID.' });
    try {
        const result = await generateClientSummary(id);
        if (!result.ok) return res.status(result.reason === 'client_not_found' ? 404 : 400).json({ error: result.reason });
        await writeAuditLog({
            action: 'CLIENT_SUMMARY_GENERATED',
            entityType: 'clients',
            entityId: id,
            details: { source: result.source },
            user: req.user,
            ipAddress: getClientIp(req),
        });
        res.json({ summary: result.summary, source: result.source, structured: result.structured });
    } catch (err) {
        console.error('[Intelligence] client summary error:', err.message);
        res.status(500).json({ error: 'Failed to generate client summary.' });
    }
}

const manualSummarySchema = z.object({ summary: z.string().max(4000) }).strict();

// PUT /api/intelligence/clients/:id/summary — manual edit
export async function putClientSummary(req, res) {
    const { id } = req.params;
    if (!isUuid(id)) return res.status(400).json({ error: 'Invalid client ID.' });
    let parsed;
    try {
        parsed = manualSummarySchema.parse(req.body || {});
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        throw err;
    }
    try {
        const saved = await saveManualSummary(id, parsed.summary.trim());
        if (!saved) return res.status(404).json({ error: 'Client not found.' });
        res.json(saved);
    } catch (err) {
        console.error('[Intelligence] client summary save error:', err.message);
        res.status(500).json({ error: 'Failed to save client summary.' });
    }
}

const draftSchema = z.object({
    lead_id: z.string().uuid().optional().nullable(),
    project_type: z.string().max(120).optional(),
    budget: z.number().positive().max(1_000_000_000).optional().nullable(),
    currency: z.string().length(3).optional(),
    notes: z.string().max(2000).optional(),
}).strict();

// POST /api/intelligence/quotation-draft — propose, never save
export async function postQuotationDraft(req, res) {
    let parsed;
    try {
        parsed = draftSchema.parse(req.body || {});
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        throw err;
    }
    try {
        const result = await generateQuotationDraft({
            leadId: parsed.lead_id || null,
            projectType: parsed.project_type,
            budget: parsed.budget ?? null,
            currency: parsed.currency,
            notes: parsed.notes,
        });
        if (!result.ok) {
            return res.status(result.reason === 'lead_not_found' ? 404 : 400).json({ error: result.reason });
        }
        res.json({ draft: result.draft, source: result.source, presetId: result.presetId });
    } catch (err) {
        console.error('[Intelligence] quotation draft error:', err.message);
        res.status(500).json({ error: 'Failed to draft quotation.' });
    }
}
