const { z } = require('zod');

/**
 * Validation schema for Brand Registration.
 */
const brandRegistrationSchema = z.object({
  companyName: z
    .string({ required_error: 'Company name is required' })
    .trim()
    .min(2, 'Company / Brand name must be at least 2 characters'),
  workEmail: z
    .string({ required_error: 'Work email is required' })
    .trim()
    .lowercase()
    .email('Please provide a valid work email address'),
  industryType: z.string().trim().optional(),
  aboutBrand: z.string().trim().optional(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
});

module.exports = {
  brandRegistrationSchema
};

