import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_BYTES },
});

// Multer error handler — translates the file-size and unexpected-field
// errors into a clean 413/400 response so the UI gets a predictable
// payload. Must come BEFORE the route handler.
const handleMulterErrors = (err, _req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
                error: `File is too large. The maximum upload size is ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
            });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        // Some other upload error (e.g. Cloudinary SDK rejection).
        return next(err);
    }
    next();
};

router.post(
    '/',
    verifyToken,
    requireRole('Owner'),
    upload.single('image'),
    handleMulterErrors,
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No image provided.' });
            }

            // Bail out gracefully when Cloudinary isn't configured so
            // the admin can still demo the CMS without a Cloudinary
            // account. We return a deterministic data-URI placeholder
            // that the admin UI can preview.
            if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
                if (process.env.NODE_ENV === 'production') {
                    return res.status(503).json({ error: 'Cloud storage service (Cloudinary) is not configured in production.' });
                }
                const b64 = Buffer.from(req.file.buffer).toString('base64');
                const dataUri = `data:${req.file.mimetype};base64,${b64}`;
                return res.json({ url: dataUri, mocked: true });
            }

            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;

            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'buildwithlami',
            });

            res.json({ url: uploadResponse.secure_url });
        } catch (err) {
            console.error('[Upload] Cloudinary upload error:', err);
            res.status(500).json({ error: 'Failed to upload image.' });
        }
    }
);

export default router;
