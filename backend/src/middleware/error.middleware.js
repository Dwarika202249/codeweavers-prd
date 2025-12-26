import config from '../config/index.js';

/**
 * 404 Not Found handler
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
  // Default to 500 if status is still 200
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(config.isDev && {
      stack: err.stack,
    }),
  });
};

/**
 * Async handler wrapper to avoid try-catch in every route
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
