import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ensure uploads/courses exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'courses');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const fileFilter = (req, file, cb) => {
  // accept images only
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image files are allowed'), false);
  cb(null, true);
};

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// POST /api/uploads/courses - admin only
router.post('/courses', protect, adminOnly, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

  const proto = (req.headers['x-forwarded-proto'] && String(req.headers['x-forwarded-proto']).split(',')[0]) || req.protocol;
  const url = `${proto}://${req.get('host')}/uploads/courses/${req.file.filename}`;
  let thumbnailUrl = null;

  // Attempt to generate a thumbnail (requires sharp)
  try {
    let sharp;
    try {
      sharp = (await import('sharp')).default;
    } catch (err) {
      console.warn('Sharp not installed; skipping thumbnail generation');
    }

    if (sharp) {
      const thumbsDir = path.join(uploadsDir, 'thumbs');
      if (!fs.existsSync(thumbsDir)) fs.mkdirSync(thumbsDir, { recursive: true });

      const inputPath = path.join(uploadsDir, req.file.filename);
      const ext = path.extname(req.file.filename).toLowerCase();
      const base = path.basename(req.file.filename, ext);
      const thumbName = `${base}-thumb.jpg`;
      const thumbPath = path.join(thumbsDir, thumbName);

      await sharp(inputPath)
        .resize(800, 450, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);

      const proto = (req.headers['x-forwarded-proto'] && String(req.headers['x-forwarded-proto']).split(',')[0]) || req.protocol;
      thumbnailUrl = `${proto}://${req.get('host')}/uploads/courses/thumbs/${thumbName}`;
    }
  } catch (err) {
    console.error('Error generating thumbnail:', err);
  }

  res.status(201).json({ success: true, data: { url, thumbnailUrl } });
});

export default router;
