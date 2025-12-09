import rateLimit from 'express-rate-limit';

/**
 * Rate Limiting Configuration
 *
 * Protects API from brute force attacks and abuse
 */

// Standard headers configuration
const standardHeaders = true;
const legacyHeaders = false;

/**
 * General API Rate Limiter
 * Applies to all API endpoints
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders,
  legacyHeaders,
  // Skip successful requests in count (optional)
  skipSuccessfulRequests: false,
  // Skip failed requests in count (optional)
  skipFailedRequests: false,
});

/**
 * Authentication Rate Limiter
 * Applies to login and signup endpoints
 * 5 requests per 15 minutes per IP
 * Helps prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/signup attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders,
  legacyHeaders,
  // Don't count successful requests against the limit
  skipSuccessfulRequests: true,
  // Handler for when limit is exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
      retryAfter: '15 minutes',
    });
  },
});

/**
 * Strict Rate Limiter
 * Applies to sensitive operations (delete, critical updates)
 * 10 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Rate limit exceeded for this operation. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders,
  legacyHeaders,
  skipSuccessfulRequests: false,
});

/**
 * Create Operation Rate Limiter
 * Applies to POST endpoints (create operations)
 * 20 requests per 15 minutes per IP
 */
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 create operations per windowMs
  message: {
    success: false,
    message: 'Too many create requests. Please slow down.',
    retryAfter: '15 minutes',
  },
  standardHeaders,
  legacyHeaders,
});

/**
 * File Upload Rate Limiter
 * Applies to file upload endpoints
 * 10 uploads per 15 minutes per IP
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per windowMs
  message: {
    success: false,
    message: 'Too many file uploads. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders,
  legacyHeaders,
});

/**
 * Custom rate limiter factory
 * Create custom rate limiters with specific settings
 *
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests
 * @param {string} message - Custom error message
 * @returns {Function} Rate limiter middleware
 */
export const createCustomLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.',
    },
    standardHeaders,
    legacyHeaders,
  });
};

export default {
  generalLimiter,
  authLimiter,
  strictLimiter,
  createLimiter,
  uploadLimiter,
  createCustomLimiter,
};
