import express from 'express';
import Course from '../models/Course.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create course (admin only)
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { title, slug, shortDescription, description, duration, level, price, prerequisites, learningOutcomes, schedule, published } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  const existing = await Course.findOne({ slug: slug || undefined });
  if (existing) {
    res.status(400);
    throw new Error('Course with this slug already exists');
  }

  const course = await Course.create({ title, slug, shortDescription, description, duration, level, price, prerequisites, learningOutcomes, schedule, published, createdBy: req.user.id });

  res.status(201).json({ success: true, data: { course } });
}));

// Get all courses (public)
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { shortDescription: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Course.countDocuments(filter),
  ]);

  res.json({ success: true, data: { courses, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
}));

// Get course by id
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json({ success: true, data: { course } });
}));

// Update course (admin only)
router.put('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  Object.assign(course, req.body);
  await course.save();

  res.json({ success: true, data: { course } });
}));

// Delete course (admin only)
router.delete('/:id', protect, adminOnly, asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await course.remove();
  res.json({ success: true, message: 'Course deleted' });
}));

export default router;
