const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(1, 'Password is required'),
  role: z
    .enum(['creator', 'brand', 'admin'])
    .optional()
});

module.exports = {
  loginSchema
};
