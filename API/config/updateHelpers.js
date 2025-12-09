/**
 * Update Helpers
 *
 * Provides utilities for safe database updates
 * Prevents mass assignment vulnerabilities
 */

/**
 * Filter request body to only include allowed fields
 * Prevents mass assignment attacks
 *
 * @param {Object} body - Request body
 * @param {Array<string>} allowedFields - Array of allowed field names
 * @returns {Object} Filtered object with only allowed fields
 *
 * @example
 * const updates = filterAllowedFields(req.body, ['name', 'email', 'phone']);
 */
export const filterAllowedFields = (body, allowedFields) => {
  const filtered = {};

  allowedFields.forEach(field => {
    if (body[field] !== undefined) {
      filtered[field] = body[field];
    }
  });

  return filtered;
};

/**
 * Filter nested object fields
 * Useful for updates with nested structures
 *
 * @param {Object} body - Request body
 * @param {Object} fieldMap - Map of field names to their allowed nested fields
 * @returns {Object} Filtered object
 *
 * @example
 * const updates = filterNestedFields(req.body, {
 *   'address': ['street', 'city', 'zipCode'],
 *   'contact': ['phone', 'email']
 * });
 */
export const filterNestedFields = (body, fieldMap) => {
  const filtered = {};

  Object.keys(fieldMap).forEach(parentField => {
    if (body[parentField] && typeof body[parentField] === 'object') {
      filtered[parentField] = filterAllowedFields(
        body[parentField],
        fieldMap[parentField]
      );
    }
  });

  return filtered;
};

/**
 * Validate that at least one field is present for update
 * Prevents empty update operations
 *
 * @param {Object} updates - Filtered updates object
 * @throws {Error} If no fields are present
 */
export const requireAtLeastOne = (updates) => {
  if (Object.keys(updates).length === 0) {
    throw new Error('At least one field must be provided for update');
  }
};

/**
 * Remove undefined and null values from object
 * Useful for optional field updates
 *
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
export const removeEmpty = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Sanitize update data
 * Trims strings and removes empty values
 *
 * @param {Object} updates - Updates object
 * @returns {Object} Sanitized updates
 */
export const sanitizeUpdates = (updates) => {
  const sanitized = {};

  Object.entries(updates).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = value.trim();
    } else if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

/**
 * Create a safe update object for MongoDB
 * Combines filtering, sanitization, and validation
 *
 * @param {Object} body - Request body
 * @param {Array<string>} allowedFields - Allowed fields
 * @param {Object} options - Options
 * @param {boolean} options.requireOne - Require at least one field (default: true)
 * @param {boolean} options.sanitize - Sanitize strings (default: true)
 * @param {boolean} options.removeEmpty - Remove empty values (default: true)
 * @returns {Object} Safe update object
 *
 * @example
 * const updates = createSafeUpdate(req.body, ['name', 'email'], {
 *   requireOne: true,
 *   sanitize: true,
 *   removeEmpty: true
 * });
 */
export const createSafeUpdate = (
  body,
  allowedFields,
  options = {}
) => {
  const {
    requireOne = true,
    sanitize = true,
    removeEmpty: shouldRemoveEmpty = true,
  } = options;

  // Filter to allowed fields
  let updates = filterAllowedFields(body, allowedFields);

  // Sanitize if requested
  if (sanitize) {
    updates = sanitizeUpdates(updates);
  }

  // Remove empty values if requested
  if (shouldRemoveEmpty) {
    updates = removeEmpty(updates);
  }

  // Validate at least one field if requested
  if (requireOne) {
    requireAtLeastOne(updates);
  }

  return updates;
};

/**
 * Protected fields that should never be updated directly
 * Common fields to exclude from mass assignment
 */
export const PROTECTED_FIELDS = [
  '_id',
  'id',
  'createdAt',
  'updatedAt',
  '__v',
  'password', // Use separate password update endpoint
];

/**
 * Check if a field is protected
 *
 * @param {string} field - Field name to check
 * @returns {boolean} True if field is protected
 */
export const isProtectedField = (field) => {
  return PROTECTED_FIELDS.includes(field);
};

/**
 * Remove protected fields from an object
 *
 * @param {Object} obj - Object to filter
 * @returns {Object} Object without protected fields
 */
export const removeProtectedFields = (obj) => {
  const filtered = { ...obj };

  PROTECTED_FIELDS.forEach(field => {
    delete filtered[field];
  });

  return filtered;
};

export default {
  filterAllowedFields,
  filterNestedFields,
  requireAtLeastOne,
  removeEmpty,
  sanitizeUpdates,
  createSafeUpdate,
  PROTECTED_FIELDS,
  isProtectedField,
  removeProtectedFields,
};
