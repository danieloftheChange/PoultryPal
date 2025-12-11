/**
 * Validation Middleware
 *
 * Provides request validation using Joi schemas
 * Validates request body, params, and query parameters
 */

/**
 * Validates request data against a Joi schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    // Check if schema has .body, .params, or .query properties (multi-part schema)
    // or if it's a direct Joi schema
    const isMultiPartSchema = schema.body || schema.params || schema.query;

    let error, value;

    if (isMultiPartSchema) {
      // Handle multi-part schemas (e.g., { body: schema, params: schema })
      const toValidate = {};
      if (schema.body) toValidate.body = req.body;
      if (schema.params) toValidate.params = req.params;
      if (schema.query) toValidate.query = req.query;

      const result = schema.validate(toValidate, { abortEarly: false });
      error = result.error;
      value = result.value;
    } else {
      // Handle direct Joi schemas - validate req.body by default
      const result = schema.validate(req.body, { abortEarly: false });
      error = result.error;
      value = result.value;
    }

    if (error) {
      // Format error messages
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace request data with validated and sanitized values
    if (isMultiPartSchema) {
      if (schema.body) req.body = value.body;
      if (schema.params) req.params = value.params;
      if (schema.query) req.query = value.query;
    } else {
      req.body = value;
    }

    next();
  };
};

/**
 * Sanitize string inputs to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;

  return str
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML tags
    .trim();
};

/**
 * Custom Joi validators
 */
export const customValidators = {
  /**
   * Strong password validator
   * Requires: min 8 chars, uppercase, lowercase, number, special char
   */
  strongPassword: (value, helpers) => {
    if (value.length < 8) {
      return helpers.error('password.min');
    }
    if (!/[A-Z]/.test(value)) {
      return helpers.error('password.uppercase');
    }
    if (!/[a-z]/.test(value)) {
      return helpers.error('password.lowercase');
    }
    if (!/[0-9]/.test(value)) {
      return helpers.error('password.number');
    }
    if (!/[@$!%*?&]/.test(value)) {
      return helpers.error('password.special');
    }
    return value;
  },

  /**
   * MongoDB ObjectId validator
   */
  objectId: (value, helpers) => {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
      return helpers.error('string.objectId');
    }
    return value;
  },

  /**
   * UUID validator
   */
  uuid: (value, helpers) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      return helpers.error('string.uuid');
    }
    return value;
  },
};

export default { validate, sanitizeString, customValidators };
