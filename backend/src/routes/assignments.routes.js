import express from 'express';
import Assignment from '../models/Assignment.model.js';
import Submission from '../models/Submission.model.js';
import Enrollment from '../models/Enrollment.model.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

/**
 * Admin: create an assignment
 * POST /api/assignments
 * body: { courseId, title, description?, dueDate?, allowResubmissions?, maxScore? }
 */
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { courseId, title, description, dueDate, allowResubmissions, maxScore } = req.body || {};
    if (!courseId || !title) {
      res.status(400);
      throw new Error('courseId and title are required');
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description: description || '',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      allowResubmissions: typeof allowResubmissions === 'boolean' ? allowResubmissions : true,
      maxScore: typeof maxScore === 'number' ? maxScore : 100,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: { assignment } });
  })
);

/**
 * Admin: list assignments (optional filter by course)
 * GET /api/assignments?courseId=&page=&limit=
 */
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, courseId, q } = req.query;
    const pageNum = Number.parseInt(String(page)) || 1;
    const limitNum = Number.parseInt(String(limit)) || 50;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (courseId) filter.course = courseId;
    if (q) filter.title = { $regex: q, $options: 'i' };

    const [items, total] = await Promise.all([
      Assignment.find(filter).populate('createdBy', 'name email').populate('course', 'title').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Assignment.countDocuments(filter),
    ]);

    res.json({ success: true, data: { assignments: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  })
);

/**
 * Admin: get assignment by id
 */
router.get(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name email');
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    // also include submission count
    const count = await Submission.countDocuments({ assignment: assignment._id });

    res.json({ success: true, data: { assignment, submissionCount: count } });
  })
);

/**
 * Admin: update assignment
 */
router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    const { title, description, dueDate, allowResubmissions, maxScore, archived } = req.body || {};
    if (typeof title !== 'undefined') assignment.title = title;
    if (typeof description !== 'undefined') assignment.description = description;
    if (typeof dueDate !== 'undefined') assignment.dueDate = dueDate ? new Date(dueDate) : undefined;
    if (typeof allowResubmissions !== 'undefined') assignment.allowResubmissions = Boolean(allowResubmissions);
    if (typeof maxScore !== 'undefined') assignment.maxScore = Number(maxScore);
    if (typeof archived !== 'undefined') assignment.archived = Boolean(archived);

    await assignment.save();
    res.json({ success: true, data: { assignment } });
  })
);

/**
 * Admin: delete assignment
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    await assignment.deleteOne();
    res.json({ success: true, message: 'Assignment removed' });
  })
);


/**
 * POST /api/assignments/:id/submissions
 * body: { enrollmentId, link, notes }
 * access: private (student who owns enrollment) or admin
 */
router.post(
  '/:id/submissions',
  protect,
  asyncHandler(async (req, res) => {
    const { enrollmentId, link, notes } = req.body || {};
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    if (!enrollmentId || !link) {
      res.status(400);
      throw new Error('enrollmentId and link are required');
    }

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      res.status(404);
      throw new Error('Enrollment not found');
    }

    if (String(enrollment.course) !== String(assignment.course)) {
      res.status(400);
      throw new Error('Enrollment does not belong to this course');
    }

    // Only student who owns the enrollment (or admin) can submit
    if (req.user.role !== 'admin' && String(enrollment.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error('Not authorized to submit for this enrollment');
    }

    // validate link is github URL
    try {
      const u = new URL(link);
      const host = (u.hostname || '').toLowerCase();
      const ok = (u.protocol === 'http:' || u.protocol === 'https:') && (host.endsWith('github.com') || host.endsWith('gist.github.com') || host.endsWith('githubusercontent.com'));
      if (!ok) {
        res.status(400);
        throw new Error('Link must be a valid GitHub URL');
      }
    } catch (err) {
      res.status(400);
      throw new Error('Link must be a valid URL');
    }

    // Upsert behavior: one submission per assignment+enrollment
    let submission = await Submission.findOne({ assignment: assignment._id, enrollment: enrollment._id });

    if (submission) {
      if (!assignment.allowResubmissions) {
        res.status(400);
        throw new Error('Resubmissions are not allowed for this assignment');
      }

      submission.link = link;
      submission.notes = notes || submission.notes;
      submission.status = 'submitted';
      submission.resubmissionCount = (submission.resubmissionCount || 0) + 1;
      await submission.save();
      return res.json({ success: true, data: { submission } });
    }

    submission = await Submission.create({
      assignment: assignment._id,
      enrollment: enrollment._id,
      student: enrollment.user,
      link,
      notes: notes || '',
    });

    res.status(201).json({ success: true, data: { submission } });
  })
);

/**
 * (Admin) GET /api/assignments/:id/submissions
 * list submissions for an assignment
 */
router.get(
  '/:id/submissions',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404);
      throw new Error('Assignment not found');
    }

    const { page = 1, limit = 50, status } = req.query;
    const pageNum = Number.parseInt(String(page)) || 1;
    const limitNum = Number.parseInt(String(limit)) || 50;
    const skip = (pageNum - 1) * limitNum;

    const filter = { assignment: assignment._id };
    if (status) filter.status = status;

    const [submissions, total] = await Promise.all([
      Submission.find(filter).populate('student', 'name email').populate('enrollment', 'course').sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Submission.countDocuments(filter),
    ]);

    res.json({ success: true, data: { submissions, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } } });
  })
);


/**
 * ADMIN: grade a submission
 * PATCH /api/assignments/submissions/:id/grade
 * body: { score?, feedback?, status } - status should be 'graded' or 'rejected'
 */
router.patch(
  '/submissions/:id/grade',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id).populate('student', 'name email');
    if (!submission) {
      res.status(404);
      throw new Error('Submission not found');
    }

    const { score, feedback, status } = req.body || {};
    if (typeof score !== 'undefined') submission.score = Number(score);
    if (typeof feedback !== 'undefined') submission.feedback = feedback;
    if (status && ['graded', 'rejected'].includes(status)) submission.status = status;

    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();

    await submission.save();

    // Notify student in-app
    try {
      const Notification = (await import('../models/Notification.model.js')).default;
      await Notification.create({
        user: submission.student,
        type: 'submission_graded',
        title: `Your submission for assignment has been ${submission.status}`,
        message: `Your submission has been ${submission.status}${typeof submission.score !== 'undefined' ? ` with score ${submission.score}` : ''}.`,
        data: { assignment: submission.assignment, submission: submission._id, enrollment: submission.enrollment },
      });
    } catch (e) {
      console.warn('Failed to create notification', e);
    }

    res.json({ success: true, data: { submission } });
  })
);

export default router;
