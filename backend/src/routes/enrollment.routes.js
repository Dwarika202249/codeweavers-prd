import express from 'express';
import Enrollment from '../models/Enrollment.model.js';
import Course from '../models/Course.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Multer storage for simple assignment uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'enrollments');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, unique);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * POST /api/enrollments
 * body: { courseId } or { courseSlug }
 * access: private
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { courseId, courseSlug, status } = req.body;

    let course;
    if (courseId) {
      course = await Course.findById(courseId);
    } else if (courseSlug) {
      course = await Course.findOne({ slug: courseSlug });
    }

    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    // Check for existing
    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) {
      res.status(400);
      throw new Error('Already enrolled');
    }

    const enrollment = await Enrollment.create({ user: req.user._id, course: course._id, status: status || 'enrolled' });

    res.status(201).json({ success: true, data: { enrollment } });
  })
);

/**
 * GET /api/enrollments
 * - if admin: returns all enrollments (query params page/limit)
 * - else: returns current user's enrollments
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (req.user.role === 'admin') {
      const [enrollments, total] = await Promise.all([
        Enrollment.find()
          .populate('user', 'name email')
          .populate('course', 'title shortDescription slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit)),
        Enrollment.countDocuments(),
      ]);

      return res.json({ success: true, data: { enrollments, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
    }

    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title shortDescription slug')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { enrollments } });
  })
);

/**
 * GET /api/enrollments/:id
 * access: private (owner or admin)
 */
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('course', 'title shortDescription slug curriculum coverImage instructor');

    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (req.user.role !== 'admin' && enrollment.user._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    res.json({ success: true, data: { enrollment } });
  })
);

/**
 * PUT /api/enrollments/:id
 * update status/progress
 * access: private (owner or admin)
 */
router.put(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const { status, progress, completedModules, startDate, endDate, paymentStatus, pricePaid, transactionId, invoiceId } = req.body;
    if (status) enrollment.status = status;
    if (typeof progress !== 'undefined') enrollment.progress = Math.max(0, Math.min(100, Number(progress)));

    if (typeof completedModules !== 'undefined') enrollment.completedModules = Array.isArray(completedModules) ? completedModules : [];
    if (startDate) enrollment.startDate = new Date(startDate);
    if (endDate) enrollment.endDate = new Date(endDate);

    if (typeof paymentStatus !== 'undefined') enrollment.paymentStatus = paymentStatus;
    if (typeof pricePaid !== 'undefined') enrollment.pricePaid = Number(pricePaid);
    if (typeof transactionId !== 'undefined') enrollment.transactionId = transactionId;
    if (typeof invoiceId !== 'undefined') enrollment.invoiceId = invoiceId;

    await enrollment.save();

    res.json({ success: true, data: { enrollment } });
  })
);

/**
 * POST /api/enrollments/:id/assignments
 * upload assignment file (form-data file field = 'file')
 */
router.post(
  '/:id/assignments',
  protect,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (!req.file) {
      res.status(400);
      throw new Error('File is required');
    }

    const file = req.file;
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/enrollments/${file.filename}`;

    enrollment.assignments = enrollment.assignments || [];
    const assignment = {
      title: req.body.title || file.originalname,
      fileUrl,
      filename: file.originalname,
      uploadedAt: new Date(),
      notes: req.body.notes || '',
    };

    enrollment.assignments.push(assignment);
    await enrollment.save();

    res.status(201).json({ success: true, data: { assignment } });
  })
);

/**
 * POST /api/enrollments/:id/notes
 * Add an admin note to an enrollment (admin only)
 */
router.post(
  '/:id/notes',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    const { note } = req.body;
    if (!note || typeof note !== 'string' || note.trim() === '') {
      res.status(400);
      throw new Error('Note is required');
    }

    enrollment.adminNotes = enrollment.adminNotes || [];
    enrollment.adminNotes.push({ note: note.trim(), addedBy: req.user._id, createdAt: new Date() });
    await enrollment.save();

    // populate addedBy for the notes before returning
    await enrollment.populate({ path: 'adminNotes.addedBy', select: 'name email' });

    res.status(201).json({ success: true, data: { enrollment } });
  })
);

/**
 * POST /api/enrollments/:id/request-refund
 * mark refund requested (simple placeholder)
 */
router.post(
  '/:id/request-refund',
  protect,
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    enrollment.refundRequested = true;
    await enrollment.save();

    res.json({ success: true, data: { enrollment } });
  })
);

/**
 * DELETE /api/enrollments/:id
 * access: owner or admin
 */
router.delete(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    await enrollment.deleteOne();

    res.json({ success: true, message: 'Enrollment removed' });
  })
);

export default router;
