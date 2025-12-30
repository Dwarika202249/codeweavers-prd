import express from 'express';
import Settings from '../models/Settings.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * GET /api/admin/settings
 * Admin only - return settings document
 */
router.get('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();
  res.json({ success: true, data: { settings } });
}));

/**
 * PUT /api/admin/settings
 * Admin only - update settings; accepts partial payload
 */
router.put('/', protect, adminOnly, asyncHandler(async (req, res) => {
  const settings = await Settings.getSettings();

  // Merge incoming fields safely
  if (req.body.general) {
    settings.general = { ...settings.general.toObject ? settings.general.toObject() : settings.general, ...req.body.general };
  }
  if (req.body.branding) {
    settings.branding = { ...settings.branding.toObject ? settings.branding.toObject() : settings.branding, ...req.body.branding };
  }

  settings.updatedBy = req.user._id;
  await settings.save();

  // Return updated
  res.json({ success: true, data: { settings } });
}));

export default router;
