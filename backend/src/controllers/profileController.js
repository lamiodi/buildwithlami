import { z } from 'zod';
import pool from '../config/db.js';

// ── Validation ───────────────────────────────────────────
const updateProfileSchema = z.object({
    full_name: z.string().min(1).optional(),
    headline: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    resume_url: z.string().url().optional().nullable(),
    avatar_url: z.string().url().optional().nullable(),
    social_links: z.any().optional().nullable()
});

// The profile table is constrained to a single row with id = 1.
const PROFILE_ID = 1;

export async function getProfile(req, res) {
    try {
        const { rows } = await pool.query(`SELECT * FROM profile WHERE id = $1`, [PROFILE_ID]);
        if (rows.length === 0) return res.status(404).json({ error: 'Profile not found.' });
        return res.json(rows[0]);
    } catch (err) {
        console.error('[Profile] getProfile error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}

export async function updateProfile(req, res) {
    try {
        const data = updateProfileSchema.parse(req.body);

        const { rows: existing } = await pool.query(`SELECT id FROM profile WHERE id = $1`, [PROFILE_ID]);

        if (existing.length === 0) {
            if (!data.full_name) return res.status(400).json({ error: 'full_name is required for initial profile creation.' });

            const { rows } = await pool.query(
                `INSERT INTO profile (id, full_name, headline, bio, resume_url, avatar_url, social_links)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [PROFILE_ID, data.full_name, data.headline, data.bio, data.resume_url, data.avatar_url, data.social_links]
            );
            return res.status(201).json(rows[0]);
        } else {
            const fields = [];
            const values = [];
            let idx = 1;

            for (const [key, val] of Object.entries(data)) {
                if (val !== undefined) { fields.push(`${key} = $${idx++}`); values.push(val); }
            }

            if (fields.length === 0) return res.status(400).json({ error: 'No fields to update.' });

            fields.push(`updated_at = NOW()`);
            values.push(PROFILE_ID);

            const { rows } = await pool.query(
                `UPDATE profile SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
                values
            );
            return res.json(rows[0]);
        }
    } catch (err) {
        if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
        console.error('[Profile] updateProfile error:', err.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
