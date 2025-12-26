import express from 'express';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import User from '../models/User.model.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Limit export requests to prevent abuse
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // limit each IP to 5 export requests per windowMs
  message: 'Too many export requests from this IP, please try again later.',
});

// Export users as CSV with filtering and streaming
router.get(
  '/users',
  protect,
  adminOnly,
  exportLimiter,
  asyncHandler(async (req, res) => {
    // Query params: search, role, isActive, from, to, limit
    const { search, role, isActive, from, to, limit } = req.query;

    // Build filter with validation
    const filter = {};

    if (role) {
      const allowedRoles = ['user', 'admin'];
      if (!allowedRoles.includes(String(role))) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      filter.role = String(role);
    }

    if (typeof isActive !== 'undefined') {
      // accept 'true'|'false'|'1'|'0'
      const val = String(isActive).toLowerCase();
      if (!['true','false','1','0'].includes(val)) {
        return res.status(400).json({ message: 'Invalid isActive filter' });
      }
      filter.isActive = val === 'true' || val === '1';
    }

    if (from || to) {
      // validate dates
      let fromDate;
      let toDate;
      if (from) {
        if (isNaN(Date.parse(String(from)))) return res.status(400).json({ message: 'Invalid from date' });
        fromDate = new Date(String(from));
      }
      if (to) {
        if (isNaN(Date.parse(String(to)))) return res.status(400).json({ message: 'Invalid to date' });
        toDate = new Date(String(to));
        toDate.setHours(23,59,59,999);
      }
      if (fromDate && toDate && fromDate > toDate) return res.status(400).json({ message: 'from date must be before to date' });
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = fromDate;
      if (toDate) filter.createdAt.$lte = toDate;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    // Safety cap and limit parsing
    const maxRows = 200000; // absolute maximum allowed
    const parsedLimit = Number(limit);
    const saneLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.floor(parsedLimit) : 100000;
    const requestedLimit = Math.min(saneLimit, maxRows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="users-${new Date().toISOString().slice(0,10)}.csv"`);

    // Write header
    const header = ['id', 'name', 'email', 'role', 'isActive', 'createdAt'];
    res.write(header.join(',') + '\n');

    // Stream via cursor
    const cursor = User.find(filter).select('name email role isActive createdAt').lean().cursor();
    let rowsSent = 0;

    for await (const u of cursor) {
      // Respect requested limit
      if (rowsSent >= requestedLimit) {
        break;
      }
      const row = [u._id, u.name, u.email, u.role, u.isActive, u.createdAt ? new Date(u.createdAt).toISOString() : ''];
      const safe = row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',');
      res.write(safe + '\n');
      rowsSent += 1;
    }

    res.end();
  })
);

export default router;
