import express from 'express';
import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        users,
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
 * @route   GET /api/users/:id
 * @desc    Get a single user (admin only)
 * @access  Private/Admin
 */
router.get(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  })
);

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id/role',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { role } = req.body;
    const validRoles = ['user', 'admin'];

    if (!role || !validRoles.includes(role)) {
      res.status(400);
      throw new Error('Invalid role');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent changing own role
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot change your own role');
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  })
);

/**
 * @route   PUT /api/users/:id/status
 * @desc    Activate/deactivate user (admin only)
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      res.status(400);
      throw new Error('isActive must be a boolean');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent deactivating own account
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot deactivate your own account');
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
        },
      },
    });
  })
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot delete your own account');
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  })
);

/**
 * @route   GET /api/users/stats/summary
 * @desc    Get user statistics (admin only)
 * @access  Private/Admin
 */
router.get(
  '/stats/summary',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const [total, active, admins, googleUsers, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ authProvider: 'google' }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          total,
          active,
          inactive: total - active,
          admins,
          regularUsers: total - admins,
          googleUsers,
          emailUsers: total - googleUsers,
          newUsersLast30Days: recentUsers,
        },
      },
    });
  })
);

export default router;
