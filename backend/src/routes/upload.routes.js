import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ensure uploads/courses exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'courses');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Use memory storage to upload directly to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const mimetype = String(file.mimetype || '').toLowerCase();
  // Accept images, videos, and PDFs
  if (mimetype.startsWith('image/') || mimetype.startsWith('video/') || mimetype === 'application/pdf') {
    return cb(null, true);
  }
  return cb(new Error('Only image, video, or PDF files are allowed'), false);
};

// Allow larger files for video uploads (adjust as needed)
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter });

import { uploadBuffer, destroy } from '../services/cloudinary.js';
import config from '../config/index.js';

// POST /api/uploads/courses - admin only
router.post('/courses', protect, adminOnly, upload.single('file'), async (req, res) => {
  if (!req.file || !req.file.buffer) return res.status(400).json({ success: false, message: 'File is required' });

  try {
    // Prepare options - resource_type auto lets Cloudinary detect images/videos
    const safeName = (req.file.originalname || 'upload').replace(/\s+/g, '-');
    const publicId = `${config.cloudinaryFolder}/courses/${Date.now()}-${safeName}`;

    // detect mime-type to tailor eager transformations
    const mimetype = String(req.file.mimetype || '').toLowerCase();
    const isImage = mimetype.startsWith('image/');
    const isVideo = mimetype.startsWith('video/');
    const isPdf = mimetype === 'application/pdf' || (path.extname(req.file.originalname || '').toLowerCase() === '.pdf');

    const uploadOptions = {
      resource_type: 'auto',
      public_id: publicId,
      folder: config.cloudinaryFolder ? `${config.cloudinaryFolder}/courses` : 'uploads/courses',
      overwrite: false,
      // For images, generate optimized derivatives (auto format & quality) and a thumbnail
      ...(isImage ? { eager: [{ transformation: [{ width: 1600, crop: 'limit', quality: 'auto' }], format: 'auto' }, { transformation: [{ width: 800, height: 450, crop: 'fill', quality: 'auto' }], format: 'jpg' }] } : {}),
      // For videos, create a jpg snapshot as thumbnail
      ...(isVideo ? { eager: [{ transformation: [{ width: 800, height: 450, crop: 'fill' }], format: 'jpg' }] } : {}),
      // For PDFs, render first page as jpg for thumbnail
      ...(isPdf ? { eager: [{ transformation: [{ width: 800, height: 450, crop: 'fill', page: 1 }], format: 'jpg' }] } : {}),
    };

    let result;
    try {
      result = await uploadBuffer(req.file.buffer, uploadOptions);
    } catch (firstErr) {
      console.warn('Cloudinary upload with eager transforms failed, retrying basic upload', { error: firstErr && (firstErr.message || String(firstErr)), mimetype: req.file.mimetype, filename: req.file.originalname });
      try {
        // Retry with minimal options to ensure basic upload works
        result = await uploadBuffer(req.file.buffer, {
          resource_type: 'auto',
          public_id: publicId,
          folder: config.cloudinaryFolder ? `${config.cloudinaryFolder}/courses` : 'uploads/courses',
          overwrite: false,
        });
      } catch (secondErr) {
        // both attempts failed - surface original error and the retry error
        console.error('Cloudinary upload failed (eager + fallback)', { first: firstErr, second: secondErr, mimetype: req.file.mimetype, filename: req.file.originalname });
        throw secondErr;
      }
    }

    const url = result && result.secure_url;
    const public_id = result && result.public_id;
    const resource_type = result && result.resource_type; // "image" or "video" or "raw"

    // Prefer eager-generated thumbnail if available
    let thumbnailUrl = null;
    if (result.eager && result.eager.length > 0) {
      const eagerEntry = result.eager.find(e => e.secure_url) || result.eager[0];
      thumbnailUrl = eagerEntry.secure_url || eagerEntry.url || null;
    } else if (resource_type === 'image') {
      thumbnailUrl = `https://res.cloudinary.com/${config.cloudinaryCloudName}/image/upload/c_fill,w_800,h_450/${public_id}.jpg`;
    } else if (resource_type === 'video') {
      thumbnailUrl = `https://res.cloudinary.com/${config.cloudinaryCloudName}/video/upload/c_fill,w_800,h_450/${public_id}.jpg`;
    }

    // If client provided a courseId, persist metadata into that course document
    let updatedCourse = null;
    const courseId = req.body && req.body.courseId ? String(req.body.courseId) : null;
    if (courseId) {
      try {
        const Course = (await import('../models/Course.model.js')).default;
        const course = await Course.findById(courseId);
        if (course) {
          course.coverImage = url;
          course.coverImageThumb = thumbnailUrl || '';
          course.coverImagePublicId = public_id;
          course.coverImageResourceType = resource_type;
          await course.save();
          updatedCourse = course;
        }
      } catch (err) {
        console.warn('Failed to update course with upload metadata', err);
      }
    }

    res.status(201).json({ success: true, data: { url, public_id, resource_type, thumbnailUrl, course: updatedCourse } });
  } catch (err) {
    console.error('Cloudinary upload failed', err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message || String(err) });
  }
});

// DELETE /api/uploads/cloudinary - admin only
router.delete('/cloudinary', protect, adminOnly, async (req, res) => {
  const { publicId, resourceType } = req.body || {};
  if (!publicId) return res.status(400).json({ success: false, message: 'publicId is required' });

  try {
    const options = {};
    if (resourceType) options.resource_type = resourceType;
    const result = await destroy(publicId, options);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Cloudinary delete failed', err);
    res.status(500).json({ success: false, message: 'Delete failed', error: err.message || String(err) });
  }
});

// POST /api/uploads/avatar - authenticated users can upload their profile picture
router.post('/avatar', protect, upload.single('file'), async (req, res) => {
  if (!req.file || !req.file.buffer) return res.status(400).json({ success: false, message: 'File is required' });

  try {
    const safeName = (req.file.originalname || 'avatar').replace(/\s+/g, '-');
    // use user's id to namespace
    const publicId = `${config.cloudinaryFolder}/avatars/${req.user.id}-${Date.now()}-${safeName}`;

    const uploadOptions = {
      resource_type: 'image',
      public_id: publicId,
      folder: config.cloudinaryFolder ? `${config.cloudinaryFolder}/avatars` : 'uploads/avatars',
      overwrite: true,
      eager: [{ transformation: [{ width: 400, height: 400, crop: 'thumb', gravity: 'face', quality: 'auto' }], format: 'auto' }],
    };

    let result;
    try {
      result = await uploadBuffer(req.file.buffer, uploadOptions);
    } catch (firstErr) {
      console.warn('Cloudinary avatar upload with eager transforms failed, retrying basic upload', { error: firstErr && (firstErr.message || String(firstErr)), mimetype: req.file.mimetype, filename: req.file.originalname });
      try {
        result = await uploadBuffer(req.file.buffer, {
          resource_type: 'image',
          public_id: publicId,
          folder: config.cloudinaryFolder ? `${config.cloudinaryFolder}/avatars` : 'uploads/avatars',
          overwrite: true,
        });
      } catch (secondErr) {
        console.error('Cloudinary avatar upload failed (eager + fallback)', { first: firstErr, second: secondErr, mimetype: req.file.mimetype, filename: req.file.originalname });
        throw secondErr;
      }
    }

    const url = result && result.secure_url;
    const public_id = result && result.public_id;
    const resource_type = result && result.resource_type;

    // persist into user document and remove previous avatar if any
    try {
      const User = (await import('../models/User.model.js')).default;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      // remove old avatar if exists
      if (user.avatarPublicId) {
        try {
          await destroy(user.avatarPublicId, { resource_type: user.avatarResourceType || 'image' });
        } catch (e) {
          console.warn('Failed to delete old avatar during upload', e);
        }
      }

      user.avatar = url;
      user.avatarPublicId = public_id;
      user.avatarResourceType = resource_type;
      await user.save();

      res.json({ success: true, data: { user, url, public_id, resource_type } });
    } catch (err) {
      console.warn('Failed to persist avatar on user', err);
      res.status(500).json({ success: false, message: 'Upload succeeded but failed to update user', error: err.message || String(err) });
    }
  } catch (err) {
    console.error('Cloudinary avatar upload failed', err);
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message || String(err) });
  }
});

// DELETE /api/uploads/avatar - authenticated user deletes their avatar
router.delete('/avatar', protect, async (req, res) => {
  try {
    const User = (await import('../models/User.model.js')).default;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.avatarPublicId) return res.status(400).json({ success: false, message: 'No avatar to delete' });

    try {
      await destroy(user.avatarPublicId, { resource_type: user.avatarResourceType || 'image' });
    } catch (e) {
      console.warn('Failed to delete avatar from Cloudinary', e);
    }

    user.avatar = '';
    user.avatarPublicId = undefined;
    user.avatarResourceType = undefined;
    await user.save();

    res.json({ success: true, data: { user } });
  } catch (err) {
    console.error('Failed to delete avatar', err);
    res.status(500).json({ success: false, message: 'Delete failed', error: err.message || String(err) });
  }
});

export default router;
