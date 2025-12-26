import express from 'express';
import Contact from '../models/Contact.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { sendContactNotification, sendContactConfirmation } from '../services/email.service.js';

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Submit a contact form
 * @access  Public
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error('Please provide name, email, subject, and message');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    // Validate subject
    const validSubjects = ['course', 'project', 'general', 'other'];
    if (!validSubjects.includes(subject)) {
      res.status(400);
      throw new Error('Invalid subject type');
    }

    // Create contact inquiry
    const contact = await Contact.create({
      name,
      email: email.toLowerCase(),
      subject,
      message,
    });

    // Send emails (don't await to not block response)
    Promise.all([
      sendContactNotification(contact),
      sendContactConfirmation(contact),
    ]).catch((err) => {
      console.error('Failed to send contact emails:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: {
        referenceId: contact.referenceId,
      },
    });
  })
);

/**
 * @route   GET /api/contact
 * @desc    Get all contact inquiries (admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, subject } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (subject) filter.subject = subject;

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Contact.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  })
);

/**
 * @route   GET /api/contact/:id
 * @desc    Get a single contact inquiry (admin only)
 * @access  Private/Admin
 */
router.get(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Contact inquiry not found');
    }

    res.json({
      success: true,
      data: { contact },
    });
  })
);

/**
 * @route   PUT /api/contact/:id/status
 * @desc    Update contact inquiry status (admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['new', 'in-progress', 'resolved', 'closed'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Contact inquiry not found');
    }

    contact.status = status;
    if (status === 'resolved' || status === 'closed') {
      contact.respondedAt = new Date();
    }
    await contact.save();

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { contact },
    });
  })
);

/**
 * @route   POST /api/contact/:id/notes
 * @desc    Add admin note to contact inquiry (admin only)
 * @access  Private/Admin
 */
router.post(
  '/:id/notes',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { note } = req.body;

    if (!note) {
      res.status(400);
      throw new Error('Note content is required');
    }

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Contact inquiry not found');
    }

    contact.adminNotes.push({
      note,
      addedBy: req.user._id,
    });
    await contact.save();

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { contact },
    });
  })
);

/**
 * @route   DELETE /api/contact/:id
 * @desc    Delete a contact inquiry (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      res.status(404);
      throw new Error('Contact inquiry not found');
    }

    await contact.deleteOne();

    res.json({
      success: true,
      message: 'Contact inquiry deleted successfully',
    });
  })
);

export default router;
