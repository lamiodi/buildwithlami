import { z } from 'zod';

export const WORK_STATUSES = ['ONBOARDING', 'PLANNING', 'DESIGN', 'DEVELOPMENT', 'REVIEW'];
const stageSchema = z.array(z.object({
    name: z.string().trim().min(1).max(200),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
}).passthrough()).max(100);

export function normalizeStages(items) {
    return stageSchema.parse(items.map((item) => ({ ...item, name: item.name || item.title })));
}

export function progressFromStages(stages) {
    return stages.length ? Math.round(stages.filter((s) => s.status === 'COMPLETED').length / stages.length * 100) : 0;
}
