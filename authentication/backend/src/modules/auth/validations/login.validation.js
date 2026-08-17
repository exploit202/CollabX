const { z } = require('zod');

/**
 * Zod Schema for Login request validation.
 */
const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(1, 'Password is required')
});

module.exports = {
  loginSchema
};
