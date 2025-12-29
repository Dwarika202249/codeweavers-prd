import express from 'express';
import Enrollment from '../models/Enrollment.model.js';
import Course from '../models/Course.model.js';
import Assignment from '../models/Assignment.model.js';
import Submission from '../models/Submission.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import Certificate from '../models/Certificate.model.js';
import User from '../models/User.model.js';
import { sendEmail } from '../services/email.service.js';
import { generateCertificatePDF } from '../services/certificate.service.js';
import config from '../config/index.js';
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

// Certificates upload storage
const certUploadsDir = path.join(process.cwd(), 'uploads', 'certificates');
if (!fs.existsSync(certUploadsDir)) fs.mkdirSync(certUploadsDir, { recursive: true });
const certStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, certUploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`),
});
const certUpload = multer({ storage: certStorage, limits: { fileSize: 10 * 1024 * 1024 } });

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
          .populate('user', 'name email avatar')
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
 * POST /api/enrollments/:id/complete
 * Mark a lesson/topic as completed (owner or admin)
 */
router.post(
  '/:id/complete',
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

    const { moduleIndex, topic } = req.body;
    if (typeof moduleIndex !== 'number' || !topic) {
      res.status(400);
      throw new Error('moduleIndex and topic are required');
    }

    // validate the module/topic exists in the course
    const course = await Course.findById(enrollment.course);
    if (!course) {
      res.status(404);
      throw new Error('Course not found');
    }

    const mod = (course.curriculum || [])[moduleIndex];
    if (!mod || !Array.isArray(mod.topics) || !mod.topics.includes(topic)) {
      res.status(400);
      throw new Error('Invalid moduleIndex or topic');
    }

    enrollment.completedLessons = enrollment.completedLessons || [];
    const exists = enrollment.completedLessons.some(c => c.moduleIndex === moduleIndex && c.topic === topic);
    if (!exists) {
      enrollment.completedLessons.push({ moduleIndex, topic, completedAt: new Date() });
      await enrollment.save();
      await enrollment.recomputeProgress();
    }

    res.json({ success: true, data: { enrollment } });
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
 * POST /api/enrollments/:id/certificates
 * Student applies for certificate when enrollment.progress >= 100
 */
router.post(
  '/:id/certificates',
  protect,
  asyncHandler(async (req, res) => {
    const enrollment = await Enrollment.findById(req.params.id).populate('course');
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (req.user.role !== 'admin' && enrollment.user.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (Number(enrollment.progress || 0) < 100) {
      res.status(400);
      throw new Error('Enrollment is not complete yet');
    }

    // Check existing certificate
    const existing = await Certificate.findOne({ enrollment: enrollment._id });
    if (existing) {
      if (existing.status === 'rejected') {
        existing.status = 'requested';
        existing.notes = req.body.note || existing.notes;
        existing.requestAt = new Date();
        await existing.save();

        // Notify admin via email
        try {
          await sendEmail({
            to: (process.env.ADMIN_EMAIL || 'contact@codeweavers.in'),
            subject: `Certificate re-requested for ${enrollment._id}`,
            html: `<p>Student ${req.user.name} (${req.user.email}) has re-requested a certificate for course ${enrollment.course?.title || enrollment.course}.</p>`,
            text: `Student ${req.user.name} (${req.user.email}) has re-requested a certificate for course ${enrollment.course?.title || enrollment.course}.`,
          });
        } catch (err) {
          // best-effort
          console.warn('Failed to send certificate re-request email', err);
        }

        // Notify admins in-app
        try {
          const Notification = (await import('../models/Notification.model.js')).default;
          const admins = await User.find({ role: 'admin' }).select('_id');
          await Promise.all(admins.map((a) => Notification.create({
            user: a._id,
            type: 'certificate_requested',
            title: `Certificate re-requested by ${req.user.name}`,
            message: `${req.user.name} has re-requested a certificate for ${enrollment.course?.title || 'a course'}`,
            data: { enrollment: enrollment._id, certificate: existing._id },
          })));
        } catch (e) {
          console.warn('Failed to create admin notification for certificate re-request', e);
        }

        return res.json({ success: true, data: { certificate: existing } });
      }

      res.status(409);
      throw new Error('Certificate request already exists or has been issued');
    }

    const cert = await Certificate.create({ enrollment: enrollment._id, student: req.user._id, notes: req.body.note || '' });

    // Notify admin via email
    try {
      await sendEmail({
        to: (process.env.ADMIN_EMAIL || 'contact@codeweavers.in'),
        subject: `New Certificate Request for ${enrollment.course?.title || enrollment.course}`,
        html: `<p>Student ${req.user.name} (${req.user.email}) has requested a certificate for course ${enrollment.course?.title || enrollment.course}.</p>
               <p>Enrollment ID: ${enrollment._id}</p>`,
        text: `Student ${req.user.name} (${req.user.email}) has requested a certificate for course ${enrollment.course?.title || enrollment.course}. Enrollment ID: ${enrollment._id}`,
      });
    } catch (err) {
      console.warn('Failed to send certificate request email', err);
    }

    // Notify admins in-app
    try {
      const Notification = (await import('../models/Notification.model.js')).default;
      const admins = await User.find({ role: 'admin' }).select('_id');
      await Promise.all(admins.map((a) => Notification.create({
        user: a._id,
        type: 'certificate_requested',
        title: `New certificate request from ${req.user.name}`,
        message: `${req.user.name} has requested a certificate for ${enrollment.course?.title || 'a course'}`,
        data: { enrollment: enrollment._id, certificate: cert._id },
      })));
    } catch (e) {
      console.warn('Failed to create admin notification for certificate request', e);
    }

    res.status(201).json({ success: true, data: { certificate: cert } });
  })
);

/**
 * ADMIN: list certificates
 */
router.get(
  '/certificates',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const pageRaw = req.query.page ?? 1;
    const limitRaw = req.query.limit ?? 50;
    const status = req.query.status;

    const pageNum = Number.parseInt(String(pageRaw)) || 1;
    const limitNum = Number.parseInt(String(limitRaw)) || 50;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status) filter.status = status;

    try {
      const [certificates, total] = await Promise.all([
        Certificate.find(filter)
          .populate('student', 'name email avatar')
          .populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Certificate.countDocuments(filter),
      ]);

      res.json({ success: true, data: { certificates, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
    } catch (err) {
      console.error('Error fetching certificates list', err);
      res.status(500);
      throw new Error('Failed to load certificates');
    }
  })
);

/**
 * GET /api/enrollments/:id/certificate
 * Get certificate for this enrollment (owner or admin)
 */
router.get(
  '/:id/certificate',
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

    const certificate = await Certificate.findOne({ enrollment: enrollment._id })
      .populate('student', 'name email')
      .populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } });

    res.json({ success: true, data: { certificate } });
  })
);

/**
 * GET /api/certificates/my
 * List certificates for current user
 */
router.get(
  '/certificates/my',
  protect,
  asyncHandler(async (req, res) => {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('student', 'name email avatar')
      .populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { certificates } });
  })
);

/**
 * ADMIN: get certificate by id
 */
router.get(
  '/certificates/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email avatar')
      .populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } });

    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    res.json({ success: true, data: { certificate } });
  })
);

/**
 * GET /api/enrollments/:id/certificate
 * Get certificate for this enrollment (owner or admin)
 */
router.get(
  '/:id/certificate',
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

    const certificate = await Certificate.findOne({ enrollment: enrollment._id })
      .populate('student', 'name email')
      .populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } });

    res.json({ success: true, data: { certificate } });
  })
);

/**
 * GET /api/enrollments/:id/assignments
 * List assignments for this enrollment's course and include student's submission (if any)
 */
router.get(
  '/:id/assignments',
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

    const assignments = await Assignment.find({ course: enrollment.course, archived: { $ne: true } }).sort({ createdAt: -1 });

    const enriched = await Promise.all(assignments.map(async (a) => {
      const submission = await Submission.findOne({ assignment: a._id, enrollment: enrollment._id });
      return { assignment: a, submission };
    }));

    res.json({ success: true, data: { assignments: enriched } });
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
      .populate('user', 'name email avatar')
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


/**
 * ADMIN: issue certificate (upload PDF)
 * POST /api/certificates/:id/issue (multipart form-data file='file')
 */
router.post(
  '/certificates/:id/issue',
  protect,
  adminOnly,
  certUpload.single('file'),
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id).populate({ path: 'enrollment', populate: { path: 'course', select: 'title' } });
    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    if (certificate.status === 'issued') {
      res.status(400);
      throw new Error('Certificate already issued');
    }

    let fileUrl;

    // support server-side generation: accept string 'true'/'1' or boolean true in JSON body
    const genVal = req.body?.generate;
    const shouldGenerate = (typeof genVal === 'string' && (genVal === 'true' || genVal === '1')) || genVal === true;

    if (shouldGenerate) {
      // generate PDF using service
      const enrollment = await Enrollment.findById(certificate.enrollment).populate('course');
      const student = await User.findById(certificate.student);
      const serial = `CW-${Date.now()}`;
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/certificates/${certificate._id}/download`;
      // Prefer course instructor name for signature if available
      const instructorName = enrollment?.course?.instructor || 'Course Instructor';
      const signaturePath = config.certificateSignaturePath || '';
      const logoPath = config.certificateLogoPath || '';
      const result = await generateCertificatePDF({ studentName: student?.name || 'Student', courseTitle: enrollment?.course?.title || 'Course', issuedAt: new Date(), serial, issuerName: instructorName, logoPath, signaturePath, verificationUrl });
      // normalize fileUrl returned by service to point to THIS backend host's uploads path
      if (result.fileUrl) {
        try {
          const parsed = new URL(result.fileUrl);
          // use backend host + the same pathname to avoid mixing hosts
          fileUrl = `${req.protocol}://${req.get('host')}${parsed.pathname}`;
        } catch (e) {
          // result.fileUrl might be a relative path like /uploads/..., or just 'uploads/..'
          const rel = result.fileUrl.startsWith('/') ? result.fileUrl : `/${result.fileUrl}`;
          fileUrl = `${req.protocol}://${req.get('host')}${rel}`;
        }
      } else {
        res.status(500);
        throw new Error('Failed to generate certificate file');
      }

      // attach meta with serial
      await certificate.markIssued({ issuedBy: req.user._id, fileUrl, notes: req.body.notes || certificate.notes, meta: { serial } });
    } else {
      if (!req.file) {
        res.status(400);
        throw new Error('Certificate PDF file is required');
      }

      const file = req.file;
      fileUrl = `${req.protocol}://${req.get('host')}/uploads/certificates/${file.filename}`;

      // mark issued and attach file
      await certificate.markIssued({ issuedBy: req.user._id, fileUrl, notes: req.body.notes || certificate.notes, meta: req.body.meta ? JSON.parse(req.body.meta) : undefined });
    }

    // update enrollment certificateIssuedAt
    const enrollment = await Enrollment.findById(certificate.enrollment._id);
    if (enrollment) {
      enrollment.certificateIssuedAt = certificate.issuedAt || new Date();
      await enrollment.save();
    }

    // notify student via email and in-app
    try {
      const student = await User.findById(certificate.student);
      const courseTitle = certificate.enrollment?.course?.title || 'your course';
      const downloadLink = `${req.protocol}://${req.get('host')}/api/certificates/${certificate._id}/download`;
      await sendEmail({
        to: student.email,
        subject: `Your certificate for ${courseTitle} is ready`,
        html: `<p>Hi ${student.name || 'Student'},</p><p>Your certificate for <strong>${courseTitle}</strong> has been issued. <a href="${downloadLink}">Download your certificate</a></p>`,
        text: `Your certificate for ${courseTitle} has been issued. Download: ${downloadLink}`,
      });

      // in-app notification
      try {
        const Notification = (await import('../models/Notification.model.js')).default;
        await Notification.create({
          user: student._id,
          type: 'certificate_issued',
          title: `Your certificate for ${courseTitle} is ready`,
          message: `Download your certificate for ${courseTitle}`,
          data: { certificate: certificate._id, enrollment: certificate.enrollment },
        });
      } catch (e) {
        console.warn('Failed to create in-app notification for certificate issued', e);
      }
    } catch (err) {
      console.warn('Failed to send certificate issued email', err);
    }

    res.json({ success: true, data: { certificate } });
  })
);

/**
 * ADMIN: reject a certificate request
 */
router.post(
  '/certificates/:id/reject',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id);
    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    await certificate.markRejected({ notes: req.body.notes || '' });

    // notify student via email and in-app
    try {
      const student = await User.findById(certificate.student);
      await sendEmail({
        to: student.email,
        subject: `Your certificate request has been rejected`,
        html: `<p>Hi ${student.name || 'Student'},</p><p>Your certificate request has been rejected. Notes: ${certificate.notes || ''}</p>`,
        text: `Your certificate request has been rejected. Notes: ${certificate.notes || ''}`,
      });

      // in-app notification
      try {
        const Notification = (await import('../models/Notification.model.js')).default;
        await Notification.create({
          user: student._id,
          type: 'certificate_rejected',
          title: `Certificate request rejected`,
          message: `${certificate.notes || ''}`,
          data: { certificate: certificate._id, enrollment: certificate.enrollment },
        });
      } catch (e) {
        console.warn('Failed to create in-app notification for certificate rejection', e);
      }
    } catch (err) {
      console.warn('Failed to send certificate rejection email', err);
    }

    res.json({ success: true, data: { certificate } });
  })
);

/**
 * Secure download for issued certificates
 * GET /api/certificates/:id/download
 */
router.get(
  '/certificates/:id/download',
  protect,
  asyncHandler(async (req, res) => {
    const certificate = await Certificate.findById(req.params.id).populate('student', 'name email');
    if (!certificate) {
      res.status(404);
      throw new Error('Certificate not found');
    }

    if (certificate.status !== 'issued') {
      res.status(400);
      throw new Error('Certificate not issued yet');
    }

    // allow admin or the student who owns it
    if (req.user.role !== 'admin' && certificate.student._id.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (!certificate.fileUrl) {
      res.status(404);
      throw new Error('Certificate file not found');
    }

    // derive filename from fileUrl
    let filename = '';
    try {
      const parsed = new URL(certificate.fileUrl);
      filename = path.basename(parsed.pathname);
    } catch (err) {
      // fallback
      const parts = certificate.fileUrl.split('/');
      filename = parts[parts.length - 1];
    }

    const filePath = path.join(process.cwd(), 'uploads', 'certificates', filename);
    if (!fs.existsSync(filePath)) {
      res.status(404);
      throw new Error('Certificate file not found on server');
    }

    // stream / download
    return res.download(filePath, `${(certificate.student && certificate.student.name) ? certificate.student.name.replace(/\s+/g, '_') + '-certificate.pdf' : 'certificate.pdf'}`);
  })
);

export default router;
