/**
 * Custom Application Error Classes
 *
 * Provides structured error handling with HTTP status codes
 * and consistent error responses across the application.
 */

/**
 * Base Application Error Class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 * Used for invalid input or malformed requests
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * Unauthorized Error (401)
 * Used when authentication is required but not provided or invalid
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden Error (403)
 * Used when user is authenticated but lacks permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not Found Error (404)
 * Used when requested resource doesn't exist
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 * Used when request conflicts with current state (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Unprocessable Entity Error (422)
 * Used when request is well-formed but semantically incorrect
 */
export class UnprocessableEntityError extends AppError {
  constructor(message = 'Unprocessable entity') {
    super(message, 422);
    this.name = 'UnprocessableEntityError';
  }
}

/**
 * Internal Server Error (500)
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, false); // Not operational by default
    this.name = 'InternalServerError';
  }
}

/**
 * Service Unavailable Error (503)
 * Used when service is temporarily unavailable (e.g., database down)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * Validation Error
 * Used for data validation failures
 */
export class ValidationError extends BadRequestError {
  constructor(message = 'Validation failed', errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Database Error
 * Used for database operation failures
 */
export class DatabaseError extends InternalServerError {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export default {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  InternalServerError,
  ServiceUnavailableError,
  ValidationError,
  DatabaseError,
};
