/**
 * Centralized Error Handler Middleware
 *
 * Provides consistent error responses and proper error logging
 * Handles both operational and programming errors
 */

import { AppError } from '../src/common/errors/AppError.js';

/**
 * Development error response
 * Includes stack traces and full error details
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

/**
 * Production error response
 * Hides sensitive error details from clients
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }), // Include validation errors if present
    });
  }
  // Programming or unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error('ERROR 💥', err);

    // Send generic message
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong on the server',
    });
  }
};

/**
 * Handle MongoDB Cast Errors (invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Key Errors
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = '${value}'. Please use another value.`;
  return new AppError(message, 409);
};

/**
 * Handle MongoDB Validation Errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401);
};

/**
 * Handle JWT Expired Errors
 */
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/**
 * Handle Multer File Upload Errors
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new AppError('File too large. Maximum size is 5MB.', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Too many files. Maximum is 10 files.', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Unexpected field in file upload.', 400);
  }
  return new AppError(err.message, 400);
};

/**
 * Global Error Handler Middleware
 *
 * This should be the last middleware in the chain
 * Catches all errors and sends appropriate responses
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (err, req, res, next) => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development vs Production error handling
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.isOperational = err.isOperational;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MulterError') error = handleMulterError(error);

    sendErrorProd(error, res);
  } else {
    // Fallback for other environments
    sendErrorDev(err, res);
  }
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 *
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 *
 * @example
 * router.get('/users', catchAsync(async (req, res) => {
 *   const users = await User.find();
 *   res.json({ users });
 * }));
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 404 Not Found Handler
 * Handles routes that don't exist
 */
export const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Cannot find ${req.originalUrl} on this server`,
    404
  );
  next(err);
};

/**
 * Unhandled Rejection Handler
 * Handles promise rejections that weren't caught
 */
export const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err);

    // Close server gracefully
    server.close(() => {
      process.exit(1);
    });
  });
};

/**
 * Uncaught Exception Handler
 * Handles synchronous errors that weren't caught
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err);

    // Must exit immediately for uncaught exceptions
    process.exit(1);
  });
};

export default {
  errorHandler,
  catchAsync,
  notFoundHandler,
  handleUnhandledRejection,
  handleUncaughtException,
};
