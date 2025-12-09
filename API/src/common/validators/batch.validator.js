import Joi from 'joi';

/**
 * Batch Validation Schemas
 */

// Create batch validation schema
export const createBatchSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Batch name must be at least 2 characters long',
      'string.max': 'Batch name cannot exceed 100 characters',
      'string.empty': 'Batch name is required',
      'any.required': 'Batch name is required',
    }),

  arrivalDate: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.base': 'Arrival date must be a valid date',
      'date.format': 'Arrival date must be in ISO format',
      'date.max': 'Arrival date cannot be in the future',
      'any.required': 'Arrival date is required',
    }),

  ageAtArrival: Joi.number()
    .integer()
    .min(0)
    .max(365)
    .required()
    .messages({
      'number.base': 'Age at arrival must be a number',
      'number.integer': 'Age at arrival must be a whole number',
      'number.min': 'Age at arrival cannot be negative',
      'number.max': 'Age at arrival cannot exceed 365 days',
      'any.required': 'Age at arrival is required',
    }),

  chickenType: Joi.string()
    .valid('Broiler', 'Layer', 'Dual-Purpose')
    .required()
    .messages({
      'any.only': 'Chicken type must be Broiler, Layer, or Dual-Purpose',
      'any.required': 'Chicken type is required',
    }),

  originalCount: Joi.number()
    .integer()
    .min(1)
    .max(1000000)
    .required()
    .messages({
      'number.base': 'Original count must be a number',
      'number.integer': 'Original count must be a whole number',
      'number.min': 'Original count must be at least 1',
      'number.max': 'Original count cannot exceed 1,000,000',
      'any.required': 'Original count is required',
    }),

  supplier: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional()
    .messages({
      'string.min': 'Supplier name must be at least 2 characters long',
      'string.max': 'Supplier name cannot exceed 100 characters',
    }),

  notes: Joi.string()
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});

// Update batch validation schema
export const updateBatchSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional(),

  dead: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Dead count must be a number',
      'number.integer': 'Dead count must be a whole number',
      'number.min': 'Dead count cannot be negative',
    }),

  culled: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Culled count must be a number',
      'number.integer': 'Culled count must be a whole number',
      'number.min': 'Culled count cannot be negative',
    }),

  offlaid: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Offlaid count must be a number',
      'number.integer': 'Offlaid count must be a whole number',
      'number.min': 'Offlaid count cannot be negative',
    }),

  notes: Joi.string()
    .max(500)
    .trim()
    .optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Update bird counts validation schema
export const updateBirdCountsSchema = Joi.object({
  dead: Joi.number()
    .integer()
    .min(0)
    .optional(),

  culled: Joi.number()
    .integer()
    .min(0)
    .optional(),

  offlaid: Joi.number()
    .integer()
    .min(0)
    .optional(),

  reason: Joi.string()
    .max(200)
    .trim()
    .optional(),

  notes: Joi.string()
    .max(500)
    .trim()
    .optional(),
}).min(1).messages({
  'object.min': 'At least one count (dead, culled, or offlaid) must be provided',
});

// Batch allocation validation schema
export const createBatchAllocationSchema = Joi.object({
  batchId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Batch ID is required',
      'any.required': 'Batch ID is required',
    }),

  houseId: Joi.string()
    .required()
    .messages({
      'string.empty': 'House ID is required',
      'any.required': 'House ID is required',
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required',
    }),
});

export default {
  createBatchSchema,
  updateBatchSchema,
  updateBirdCountsSchema,
  createBatchAllocationSchema,
};
