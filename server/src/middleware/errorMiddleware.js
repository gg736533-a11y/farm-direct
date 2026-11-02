import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  console.error('Server error caught:', err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  // Friendly error message for Prisma or database errors
  let message = err.message || 'Internal server error occurred.';
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    // Prisma error code
    message = 'A database operation error occurred. Please verify your data and try again.';
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}
