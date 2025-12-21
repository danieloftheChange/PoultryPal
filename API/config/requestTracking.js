import { v4 as uuidv4 } from 'uuid';
import logger from './logger.js';
import metricsCollector from './metrics.js';

/**
 * Request ID Middleware
 * Adds a unique ID to each request for tracking across logs
 */
export const requestIdMiddleware = (req, res, next) => {
  // Use existing request ID from header or generate new one
  req.id = req.headers['x-request-id'] || uuidv4();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);

  next();
};

/**
 * Response Time Middleware
 * Tracks and logs response times for performance monitoring
 */
export const responseTimeMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log response time
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;

    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);

    // Log request details
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    });

    // Record metrics
    const route = req.route ? req.route.path : req.originalUrl || req.url;
    metricsCollector.recordRequest(req.method, route, res.statusCode, responseTime);

    // Call original end function
    originalEnd.apply(res, args);
  };

  next();
};

/**
 * Error Tracking Middleware
 * Captures and logs errors with request context
 */
export const errorTrackingMiddleware = (err, req, res, next) => {
  logger.error('Request error', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
  });

  // Record error in metrics
  metricsCollector.recordError(err.name || 'UnknownError');

  next(err);
};
