const { z } = require('zod');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const brandRegistrationSchema = z.object({
  role: z.enum(['brand']).optional(),
  companyName: z
    .string()
    .trim()
    .min(1, 'Company name is required'),
  workEmail: z
    .string()
    .trim()
    .email('Please provide a valid work email address'),
  industryType: z
    .string()
    .trim()
    .min(1, 'Industry type is required'),
  aboutBrand: z
    .string()
    .trim()
    .max(1000, 'About Brand details cannot exceed 1000 characters')
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordRegex, 'Password must include uppercase, lowercase, number, and special character')
});

const validateBrandRegistration = (payload) => {
  try {
    const validated = brandRegistrationSchema.parse(payload);

    return {
      ...validated,
      email: validated.workEmail
    };
  } catch (error) {
    if (error.name === 'ZodError') {
      const details = error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message: issue.message,
        code: issue.code
      }));

      const validationError = new Error('Validation failed.');
      validationError.statusCode = 400;
      validationError.code = 'VALIDATION_ERROR';
      validationError.details = details;
      throw validationError;
    }

    throw error;
  }
};

module.exports = {
  brandRegistrationSchema,
  validateBrandRegistration
};
