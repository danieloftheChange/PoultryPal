import Joi from 'joi';

/**
 * Farm Validation Schemas
 */

// Create farm validation schema
export const createFarmSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Farm name must be at least 2 characters long',
      'string.max': 'Farm name cannot exceed 100 characters',
      'string.empty': 'Farm name is required',
      'any.required': 'Farm name is required',
    }),

  location: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 200 characters',
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
});

// Update farm validation schema
export const updateFarmSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Farm name must be at least 2 characters long',
      'string.max': 'Farm name cannot exceed 100 characters',
    }),

  location: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .optional()
    .messages({
      'string.min': 'Location must be at least 2 characters long',
      'string.max': 'Location cannot exceed 200 characters',
    }),

  description: Joi.string()
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export default {
  createFarmSchema,
  updateFarmSchema,
};
