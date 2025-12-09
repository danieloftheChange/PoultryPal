import Joi from 'joi';

/**
 * Diagnosis Validation Schemas
 */

// Create diagnosis validation schema
export const createDiagnosisSchema = Joi.object({
  imageUrl: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'Image URL must be a valid URL',
      'string.empty': 'Image URL is required',
      'any.required': 'Image URL is required',
    }),

  disease: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Disease name must be at least 2 characters long',
      'string.max': 'Disease name cannot exceed 100 characters',
      'string.empty': 'Disease is required',
      'any.required': 'Disease is required',
    }),

  confidence: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Confidence must be a number',
      'number.min': 'Confidence cannot be less than 0',
      'number.max': 'Confidence cannot exceed 100',
    }),

  symptoms: Joi.array()
    .items(Joi.string().trim())
    .optional()
    .messages({
      'array.base': 'Symptoms must be an array',
    }),

  notes: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 1000 characters',
    }),
});

// Update diagnosis validation schema
export const updateDiagnosisSchema = Joi.object({
  imageUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Image URL must be a valid URL',
    }),

  disease: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .optional(),

  confidence: Joi.number()
    .min(0)
    .max(100)
    .optional(),

  symptoms: Joi.array()
    .items(Joi.string().trim())
    .optional(),

  notes: Joi.string()
    .max(1000)
    .trim()
    .optional(),

  treatment: Joi.string()
    .max(1000)
    .trim()
    .optional()
    .messages({
      'string.max': 'Treatment notes cannot exceed 1000 characters',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export default {
  createDiagnosisSchema,
  updateDiagnosisSchema,
};
