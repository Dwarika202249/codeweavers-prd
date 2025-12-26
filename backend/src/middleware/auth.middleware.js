import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import config from '../config/index.js';
import { asyncHandler } from './error.middleware.js';

/**
 * Protect routes - require authentication
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    if (!user.isActive) {
      res.status(401);
      throw new Error('Account is deactivated');
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, invalid token');
  }
});

/**
 * Optional authentication - attach user if token exists
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Token invalid, but continue without user
      req.user = null;
    }
  }

  next();
});

/**
 * Restrict to admin only
 */
export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied. Admin only.');
  }
  next();
};

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};
