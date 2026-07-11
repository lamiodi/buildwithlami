import express from 'express';
import multer from 'multer';
import cloudinary from '../utils/cloudinary.js';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

router.post('/', verifyToken, requireRole('Administrator', 'Owner', 'Project Manager', 'Survey Manager', 'Drone Manager'), upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided.' });
        }

        // Bail out gracefully when Cloudinary isn't configured so
        // the admin can still demo the CMS without a Cloudinary
        // account. We return a deterministic data-URI placeholder
        // that the admin UI can preview.
        if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
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
});

export default router;
