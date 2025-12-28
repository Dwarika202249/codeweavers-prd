import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { protect, generateToken } from '../middleware/auth.middleware.js';
import config from '../config/index.js';
import Enrollment from '../models/Enrollment.model.js';
import { sendEmail } from '../services/email.service.js';

const router = express.Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(config.googleClientId);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with email/password
 * @access  Public
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please provide name, email, and password');
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error('Password must be at least 8 characters');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      authProvider: 'email',
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login with email/password
 * @access  Public
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check if user registered with Google
    if (user.authProvider === 'google' && !user.password) {
      res.status(400);
      throw new Error('This account uses Google login. Please sign in with Google.');
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  })
);

/**
 * @route   POST /api/auth/google
 * @desc    Login/Register with Google OAuth
 * @access  Public
 */
router.post(
  '/google',
  asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
      res.status(400);
      throw new Error('Google credential is required');
    }

    try {
      // Verify the Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: config.googleClientId,
      });

      const payload = ticket.getPayload();
      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists
      let user = await User.findOne({
        $or: [{ googleId }, { email: email.toLowerCase() }],
      });

      if (user) {
        // Update Google ID if user exists but registered with email
        if (!user.googleId) {
          user.googleId = googleId;
          user.avatar = user.avatar || picture;
          user.isEmailVerified = true;
          await user.save();
        }

        // Check if account is active
        if (!user.isActive) {
          res.status(401);
          throw new Error('Account is deactivated. Please contact support.');
        }

        // Update last login
        await user.updateLastLogin();
      } else {
        // Create new user
        user = await User.create({
          name,
          email: email.toLowerCase(),
          googleId,
          avatar: picture,
          authProvider: 'google',
          isEmailVerified: true,
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: user.createdAt === user.updatedAt ? 'Registration successful' : 'Login successful',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
          },
          token,
        },
      });
    } catch (error) {
      res.status(401);
      throw new Error('Invalid Google credential');
    }
  })
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get(
  '/me',
  protect,
  asyncHandler(async (req, res) => {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          avatar: req.user.avatar,
          isEmailVerified: req.user.isEmailVerified,
          createdAt: req.user.createdAt,
        },
      },
    });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (name) user.name = name;
    // Accept avatar as a URL or data URL (base64) and validate basic type
    if (typeof avatar === 'string' && avatar.trim()) {
      // Basic validation: must be a URL-like string or data URL
      if (avatar.startsWith('data:')) {
        // Validate base64 size roughly
        const base64 = avatar.split(',')[1] || '';
        // Calculate approximate bytes from base64 length
        const padding = (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
        const sizeInBytes = Math.floor((base64.length * 3) / 4) - padding;
        const maxBytes = 2 * 1024 * 1024; // 2MB
        if (sizeInBytes > maxBytes) {
          res.status(413);
          throw new Error('Avatar image too large (max 2MB)');
        }
        user.avatar = avatar;
      } else if (/^https?:\/\//i.test(avatar)) {
        user.avatar = avatar;
      } else {
        res.status(400);
        throw new Error('Invalid avatar format');
      }
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  })
);

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/password',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Please provide current and new password');
    }

    if (newPassword.length < 8) {
      res.status(400);
      throw new Error('New password must be at least 8 characters');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Check if user has a password (might be Google-only)
    if (!user.password) {
      res.status(400);
      throw new Error('Cannot change password for Google-only accounts');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  })
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete current user's account (protected) - requires current password for non-OAuth accounts
 * @access  Private
 */
router.delete(
  '/account',
  protect,
  asyncHandler(async (req, res) => {
    const { currentPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // If user has a local password, verify it
    if (user.password) {
      if (!currentPassword) {
        res.status(400);
        throw new Error('Current password is required to delete account');
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }
    }

    // Remove related resources (enrollments)
    try {
      await Enrollment.deleteMany({ user: user._id });
    } catch (err) {
      // ignore failures but log
      console.warn('Failed to remove enrollments for user', user._id, err);
    }

    // Delete user
    await user.deleteOne();

    // Notify admin and user (best-effort)
    try {
      await sendEmail({
        to: config.adminEmail,
        subject: `Account deleted: ${user.email}`,
        html: `<p>User <strong>${user.name}</strong> (${user.email}) has deleted their account.</p>`,
        text: `User ${user.name} (${user.email}) has deleted their account.`,
      });

      await sendEmail({
        to: user.email,
        subject: 'Your account has been deleted',
        html: `<p>Hi ${user.name},</p><p>Your account has been deleted successfully. If this was a mistake, contact support at ${config.adminEmail}.</p>`,
        text: `Hi ${user.name},\n\nYour account has been deleted successfully. If this was a mistake, contact support at ${config.adminEmail}.`,
      });
    } catch (err) {
      console.warn('Failed to send account deletion emails', err);
    }

    res.json({ success: true, message: 'Account deleted successfully' });
  })
);

export default router;
