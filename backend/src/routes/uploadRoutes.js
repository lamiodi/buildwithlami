import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/', authenticate, requireRole('OWNER'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'portfolio_projects',
        });

        res.json({ url: uploadResponse.secure_url });
    } catch (err) {
        console.error('[Upload] Cloudinary upload error:', err);
        res.status(500).json({ error: 'Failed to upload image.' });
    }
});

export default router;
