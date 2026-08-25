const { z } = require('zod');

const sendResetOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
});

const verifyResetOtpSchema = z.object({
  email: z
    .string({ required_error: 'Email address is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  otp: z
    .string({ required_error: 'OTP code is required' })
    .trim()
    .length(6, 'OTP code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP code must contain only numeric digits')
});

const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .optional(),
  password: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters'),
  resetToken: z
    .string()
    .trim()
    .optional()
});

module.exports = {
  sendResetOtpSchema,
  verifyResetOtpSchema,
  resetPasswordSchema
};
