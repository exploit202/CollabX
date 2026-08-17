const { z } = require('zod');

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
      .transform((s) => s.toLowerCase())
      .pipe(z.string().email('Please provide a valid work email address')),
    phoneNumber: z
      .string()
      .trim()
      .optional()
      .default(''),
    primaryContentNiche: z
      .string()
      .trim()
      .optional()
      .default('Tech & Gadgets'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .trim()
      .optional()
  })
  .passthrough()
  .superRefine((data, ctx) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
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
