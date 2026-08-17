const { z } = require('zod');

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const phoneDigitsRegex = /\d/g;

/**
 * Creator Registration Section 1 validation schema.
 */
const creatorRegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full Name / Creator Alias must be at least 2 characters')
      .max(100, 'Full Name / Creator Alias cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .lowercase()
      .email('Please provide a valid work email address'),
    phoneNumber: z
      .string()
      .trim()
      .min(10, 'Phone Number must be at least 10 digits')
      .refine(
        (value) => {
          const digits = value.match(phoneDigitsRegex)?.join('') || '';
          return digits.length >= 10;
        },
        {
          message: 'Please provide a valid mobile phone number'
        }
      ),
    primaryContentNiche: z
      .string()
      .trim()
      .min(2, 'Primary Content Niche must be at least 2 characters')
      .max(100, 'Primary Content Niche cannot exceed 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        passwordRegex,
        'Password must include uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string()
      .trim()
      .min(1, 'Confirm Password is required')
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Confirm Password must match Password',
        path: ['confirmPassword']
      });
    }
  });

const platformObjectSchema = z.object({
  platform: z.enum(['instagram', 'youtube', 'twitter'], {
    message: 'Platform must be one of: instagram, youtube, twitter'
  }),
  link: z.string().trim().optional().or(z.literal(''))
});

const creatorPlatformUpdateSchema = z.object({
  platforms: z
    .array(
      z.union([
        z.enum(['instagram', 'youtube', 'twitter'], {
          message: 'Platform must be one of: instagram, youtube, twitter'
        }),
        platformObjectSchema
      ])
    )
    .nonempty('At least one platform is required')
});

const creatorPlatformVerifySchema = z.object({
  platform: z.enum(['instagram', 'youtube', 'twitter'], {
    message: 'Platform must be one of: instagram, youtube, twitter'
  }),
  url: z.string().trim().url('Please provide a valid URL')
});

const creatorOtpVerifySchema = z.object({
  otp: z
    .string({ required_error: 'OTP code is required' })
    .trim()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must be a numeric 6-digit code')
});

module.exports = {
  creatorRegistrationSchema,
  creatorPlatformUpdateSchema,
  creatorPlatformVerifySchema,
  creatorOtpVerifySchema
};
