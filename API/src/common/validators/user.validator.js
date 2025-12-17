import Joi from 'joi';
import { customValidators } from '../../../config/validationMiddleware.js';

/**
 * User Validation Schemas
 */

// Custom password validation with detailed error messages
const passwordSchema = Joi.string()
  .min(8)
  .custom(customValidators.strongPassword)
  .messages({
    'string.min': 'Password must be at least 8 characters long',
    'password.min': 'Password must be at least 8 characters long',
    'password.uppercase': 'Password must contain at least one uppercase letter',
    'password.lowercase': 'Password must contain at least one lowercase letter',
    'password.number': 'Password must contain at least one number',
    'password.special': 'Password must contain at least one special character (@$!%*?&)',
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  });

// Signup validation schema
export const signupSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.empty': 'First name is required',
      'any.required': 'First name is required',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.empty': 'Last name is required',
      'any.required': 'Last name is required',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),

  password: passwordSchema.required(),
});

// Login validation schema
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required',
    }),

  rememberMe: Joi.boolean().optional(),
});

// Register staff validation schema
export const registerUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.empty': 'First name is required',
      'any.required': 'First name is required',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.empty': 'Last name is required',
      'any.required': 'Last name is required',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),

  password: passwordSchema.required(),

  role: Joi.string()
    .valid('Worker', 'Manager')
    .required()
    .messages({
      'any.only': 'Role must be either Worker or Manager',
      'string.empty': 'Role is required',
      'any.required': 'Role is required',
    }),

  contact: Joi.string()
    .pattern(/^[0-9+\-() ]+$/)
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base': 'Contact must be a valid phone number',
      'string.min': 'Contact must be at least 10 characters long',
      'string.max': 'Contact cannot exceed 20 characters',
    }),
});

// Update user validation schema
export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),

  contact: Joi.string()
    .pattern(/^[0-9+\-() ]+$/)
    .min(10)
    .max(20)
    .optional()
    .messages({
      'string.pattern.base': 'Contact must be a valid phone number',
      'string.min': 'Contact must be at least 10 characters long',
      'string.max': 'Contact cannot exceed 20 characters',
    }),

  role: Joi.string()
    .valid('Worker', 'Manager')
    .optional()
    .messages({
      'any.only': 'Role must be either Worker or Manager',
    }),
});

// Forgot password validation schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),
});

// Reset password validation schema
export const resetPasswordSchema = Joi.object({
  password: passwordSchema.required(),
});

export default {
  signupSchema,
  loginSchema,
  registerUserSchema,
  updateUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
