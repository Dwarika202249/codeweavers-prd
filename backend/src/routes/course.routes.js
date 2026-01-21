import express from 'express';
import Course from '../models/Course.model.js';
import Enrollment from '../models/Enrollment.model.js';
import slugify from 'slugify';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { getJson, setJson, delKey, delByPattern, incrCounter } from '../services/redis.js';

const router = express.Router();

// Create course (admin only)
router.post('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const { title, slug, shortDescription, description, duration, level, price, prerequisites, learningOutcomes, schedule, batchSize, mode, instructor, published, coverImage, targetAudience, topics, tags } = req.body;

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

  const course = await Course.create({ title, slug: slugCandidate, shortDescription, description, duration, level, price, instructor: instructor || '', coverImage: coverImage || '', coverImageThumb: req.body.coverImageThumb || '', coverImagePublicId: req.body.coverImagePublicId || '', coverImageResourceType: req.body.coverImageResourceType || '', prerequisites, learningOutcomes, schedule, batchSize: batchSize || '', mode: mode || 'Online', curriculum: curriculumClean, targetAudience: targetAudienceClean, topics: topicsClean, tags: tagsClean, published, createdBy: req.user.id });

  // Invalidate course list caches and set single course cache
  try {
    await delByPattern('courses:list*');
    await setJson(`course:${course._id}`, course, 60 * 5);
  } catch (e) { /* ignore */ }

  res.status(201).json({ success: true, data: { course } });
}));

// Get all courses (public) with list caching
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, q = '', level = '', published } = req.query;
  const p = Number(page) || 1;
  const l = Number(limit) || 20;

  // Normalize query string for key
  const qNorm = String(q || '').trim().toLowerCase();
  const levelNorm = String(level || '').trim();
  const pubVal = typeof published !== 'undefined' ? String(published).toLowerCase() : 'true';

  const key = `courses:list:q=${encodeURIComponent(qNorm)}:p=${p}:l=${l}:level=${encodeURIComponent(levelNorm)}:published=${pubVal}`;

  // Try cache
  const cached = await getJson(key);
  if (cached) {
    // instrumentation
    try { await incrCounter('cache:hit:courses:list'); } catch (e) { /* ignore */ }
    return res.json({ success: true, data: cached, cached: true });
  }

  // Build filter
  const filter = {};
  if (pubVal === 'true' || pubVal === '1') filter.published = true;
  else if (pubVal === 'false' || pubVal === '0') filter.published = false;

  if (levelNorm) filter.level = levelNorm;

  if (qNorm) {
    filter.$or = [
      { title: { $regex: qNorm, $options: 'i' } },
      { shortDescription: { $regex: qNorm, $options: 'i' } },
      { description: { $regex: qNorm, $options: 'i' } },
    ];
  }

  const skip = (p - 1) * l;

  const [courses, total] = await Promise.all([
    Course.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
    Course.countDocuments(filter),
  ]);

  const payload = { courses, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } };

  // cache result for short TTL (60s)
  try { await setJson(key, payload, 60); await incrCounter('cache:miss:courses:list'); } catch (e) { /* ignore cache errors */ }

  res.json({ success: true, data: payload });
}));

// Get course by id (cached)
router.get('/:id', asyncHandler(async (req, res) => {
  const key = `course:${req.params.id}`;
  // Try cache
  const cached = await getJson(key);
  if (cached) {
    return res.json({ success: true, data: { course: cached, cached: true } });
  }

  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Cache for 5 minutes
  try { await setJson(key, course, 60 * 5); } catch (e) { /* ignore cache errors */ }

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

  // allow cover image thumb update
  if (typeof req.body.coverImageThumb !== 'undefined') {
    course.coverImageThumb = req.body.coverImageThumb || '';
  }

  // apply other fields
  const updatable = ['title','slug','shortDescription','description','duration','level','price','prerequisites','learningOutcomes','schedule','batchSize','mode','published','coverImage','coverImagePublicId','coverImageResourceType','instructor','tags','capacity'];
  updatable.forEach((k) => {
    if (typeof req.body[k] !== 'undefined') course[k] = req.body[k];
  });

  await course.save();

  // Update cache and invalidate lists
  try {
    await setJson(`course:${course._id}`, course, 60 * 5);
    await delByPattern('courses:list*');
  } catch (e) { /* ignore cache errors */ }

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

  // Invalidate caches
  try {
    await delKey(`course:${req.params.id}`);
    await delByPattern('courses:list*');
  } catch (e) { /* ignore cache errors */ }

  res.json({ success: true, message: 'Course deleted' });
}));

/**
 * @route   GET /api/courses/stats/top-enrollments
 * @desc    Get top courses by enrollment count in the last N days (default 30)
 * @access  Private/Admin
 */
router.get(
  '/stats/top-enrollments',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const days = Math.max(1, Math.min(365, parseInt(req.query.days) || 30));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit) || 10));

    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0,0,0,0);

    const agg = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      { $project: { courseId: '$_id', count: 1, title: '$course.title', slug: '$course.slug' } },
    ]);

    res.json({ success: true, data: { top: agg } });
  })
);

export default router;
