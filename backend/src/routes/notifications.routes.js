import express from 'express';
import Notification from '../models/Notification.model.js';
import { protect } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = express.Router();

/**
 * GET /api/notifications
 * list current user's notifications (most recent first)
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { limit = 20 } = req.query;
    const items = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(Number(limit));
    const unread = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ success: true, data: { notifications: items, unreadCount: unread } });
  })
);

/**
 * PATCH /api/notifications/:id/read
 */
router.patch(
  '/:id/read',
  protect,
  asyncHandler(async (req, res) => {
    const notif = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notif) {
      res.status(404);
      throw new Error('Notification not found');
    }
    notif.read = true;
    await notif.save();
    res.json({ success: true, data: { notification: notif } });
  })
);

/**
 * PATCH /api/notifications/read-all
 */
router.patch(
  '/read-all',
  protect,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    res.json({ success: true });
  })
);

export default router;