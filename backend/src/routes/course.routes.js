import express from 'express';
import Course from '../models/Course.model.js';
import slugify from 'slugify';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create course (admin only)
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { title, slug, shortDescription, description, duration, level, price, prerequisites, learningOutcomes, schedule, published, targetAudience, topics, tags } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  // compute slug candidate
  const slugCandidate = slug ? slug : slugify(title, { lower: true, strict: true });
  const existing = await Course.findOne({ slug: slugCandidate });
  if (existing) {
    res.status(400);
    throw new Error('Course with this slug already exists');
  }

  const curriculumClean = Array.isArray(req.body.curriculum) ? req.body.curriculum.map((m) => ({
    week: m.week || '',
    title: m.title || '',
    topics: Array.isArray(m.topics) ? m.topics : (typeof m.topics === 'string' ? m.topics.split(',').map(s => s.trim()).filter(Boolean) : []),
    project: m.project || '',
  })) : [];

  const targetAudienceClean = Array.isArray(req.body.targetAudience) ? req.body.targetAudience.map(s => String(s).trim()).filter(Boolean) : (typeof req.body.targetAudience === 'string' ? req.body.targetAudience.split(',').map(s => s.trim()).filter(Boolean) : []);

  const topicsClean = Array.isArray(req.body.topics) ? req.body.topics.map(s => String(s).trim()).filter(Boolean) : (typeof req.body.topics === 'string' ? req.body.topics.split(',').map(s => s.trim()).filter(Boolean) : []);

  const tagsClean = Array.isArray(req.body.tags) ? req.body.tags.map(s => String(s).trim()).filter(Boolean) : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(s => s.trim()).filter(Boolean) : []);

  const course = await Course.create({ title, slug: slugCandidate, shortDescription, description, duration, level, price, prerequisites, learningOutcomes, schedule, curriculum: curriculumClean, targetAudience: targetAudienceClean, topics: topicsClean, tags: tagsClean, published, createdBy: req.user.id });

  res.status(201).json({ success: true, data: { course } });
}));

// Get all courses (public)
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q, level, published } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = {};
  if (typeof published !== 'undefined') {
    // accept true/false strings
    const val = String(published).toLowerCase();
    if (['true','false','1','0'].includes(val)) filter.published = val === 'true' || val === '1';
  } else {
    // by default only show published courses to public
    filter.published = true;
  }

  if (level) filter.level = String(level);

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

// Get course by slug
router.get('/slug/:slug', asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug });
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

  // allow curriculum update with cleaning
  if (req.body.curriculum) {
    course.curriculum = Array.isArray(req.body.curriculum) ? req.body.curriculum.map((m) => ({
      week: m.week || '',
      title: m.title || '',
      topics: Array.isArray(m.topics) ? m.topics : (typeof m.topics === 'string' ? m.topics.split(',').map(s => s.trim()).filter(Boolean) : []),
      project: m.project || '',
    })) : [];
  }

  // allow targetAudience update
  if (typeof req.body.targetAudience !== 'undefined') {
    course.targetAudience = Array.isArray(req.body.targetAudience) ? req.body.targetAudience.map(s => String(s).trim()).filter(Boolean) : (typeof req.body.targetAudience === 'string' ? req.body.targetAudience.split(',').map(s => s.trim()).filter(Boolean) : []);
  }

  // allow topics update
  if (typeof req.body.topics !== 'undefined') {
    course.topics = Array.isArray(req.body.topics) ? req.body.topics.map(s => String(s).trim()).filter(Boolean) : (typeof req.body.topics === 'string' ? req.body.topics.split(',').map(s => s.trim()).filter(Boolean) : []);
  }

  // allow tags update (clean strings)
  if (typeof req.body.tags !== 'undefined') {
    course.tags = Array.isArray(req.body.tags) ? req.body.tags.map(s => String(s).trim()).filter(Boolean) : (typeof req.body.tags === 'string' ? req.body.tags.split(',').map(s => s.trim()).filter(Boolean) : []);
  }

  // apply other fields
  const updatable = ['title','slug','shortDescription','description','duration','level','price','prerequisites','learningOutcomes','schedule','published','coverImage','instructor','tags','capacity'];
  updatable.forEach((k) => {
    if (typeof req.body[k] !== 'undefined') course[k] = req.body[k];
  });

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
