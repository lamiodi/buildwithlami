// ── services/cloudinaryService.js ────────────────────────
// Shared Cloudinary upload helper.
//
// Extracted from routes/uploadRoutes.js so the payment
// controller can upload proof files without duplicating the
// data-URI fallback logic. Falls back to a `data:` URI when
// Cloudinary is not configured so the workflow still works in
// local dev without a Cloudinary account.

import cloudinary from '../utils/cloudinary.js';

/**
 * Upload a multer file (multer.memoryStorage) to Cloudinary.
 *
 * @param {Object} file - multer file (has `buffer`, `mimetype`, `originalname`, `size`).
 * @param {Object} options - { folder, resource_type, public_id? }
 * @returns {Promise<{url: string, mocked?: boolean}>}
 */
export const uploadToCloudinary = async (file, options = {}) => {
    if (!file) throw new Error('No file provided to upload.');
    const { folder = 'buildwithlami', resource_type = 'auto', public_id } = options;

    // Graceful fallback when no Cloudinary creds. Returns the
    // file as a data URI so the upload flow still works end-to-end.
    if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        return { url: `data:${file.mimetype};base64,${b64}`, mocked: true };
    }

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const response = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type,
        ...(public_id ? { public_id } : {}),
    });

    return { url: response.secure_url };
};
