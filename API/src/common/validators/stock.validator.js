import Joi from 'joi';

/**
 * Stock Validation Schemas
 */

// Create stock validation schema
export const createStockSchema = Joi.object({
  item: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Item name must be at least 2 characters long',
      'string.max': 'Item name cannot exceed 100 characters',
      'string.empty': 'Item name is required',
      'any.required': 'Item name is required',
    }),

  category: Joi.string()
    .valid('Feed', 'Medicine', 'Equipment', 'Supplement', 'Other')
    .required()
    .messages({
      'any.only': 'Category must be Feed, Medicine, Equipment, Supplement, or Other',
      'any.required': 'Category is required',
    }),

  quantity: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required',
    }),

  threshold: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Threshold must be a number',
      'number.min': 'Threshold cannot be negative',
    }),

  unit: Joi.string()
    .max(20)
    .trim()
    .optional()
    .messages({
      'string.max': 'Unit cannot exceed 20 characters',
    }),

  notes: Joi.string()
    .max(500)
    .trim()
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});

// Update stock validation schema
export const updateStockSchema = Joi.object({
  item: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional(),

  category: Joi.string()
    .valid('Feed', 'Medicine', 'Equipment', 'Supplement', 'Other')
    .optional(),

  quantity: Joi.number()
    .min(0)
    .optional(),

  threshold: Joi.number()
    .min(0)
    .optional(),

  unit: Joi.string()
    .max(20)
    .trim()
    .optional(),

  notes: Joi.string()
    .max(500)
    .trim()
    .optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export default {
  createStockSchema,
  updateStockSchema,
};
