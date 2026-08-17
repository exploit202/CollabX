const { z } = require('zod');

// Regex to validate URLs (matching CreatorProfile and BrandProfile URL validators)
const urlRegex = /^(https?:\/\/)?([\w.-]+)+(\.[\w.-]+)+([\w\d._~:/?#[\]@!$&'()*+,;=.-]*)*$/;

/**
 * Zod Schema for Register request validation.
 * Supports conditional profile validations based on the user's role.
 */
const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .trim(),
  email: z
    .string()
    .email('Please provide a valid email address')
    .trim()
    .lowercase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  role: z
    .enum(['creator', 'brand', 'admin'], {
      errorMap: () => ({ message: "Role must be either 'creator', 'brand', or 'admin'" })
    }),
  profileImage: z
    .string()
    .trim()
    .regex(urlRegex, 'Profile image must be a valid URL')
    .optional()
    .or(z.literal(''))
    .or(z.null()),

  // Optional Creator Profile fields
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .trim()
    .optional(),
  niche: z
    .array(z.string().trim())
    .optional(),
  followers: z
    .number()
    .nonnegative('Followers count cannot be negative')
    .optional(),
  engagementRate: z
    .number()
    .min(0, 'Engagement rate cannot be negative')
    .max(100, 'Engagement rate cannot exceed 100%')
    .optional(),
  portfolio: z
    .array(
      z.string().trim().regex(urlRegex, 'Portfolio item must be a valid URL')
    )
    .optional(),
  location: z
    .object({
      city: z.string().trim().optional(),
      country: z.string().trim().optional()
    })
    .optional(),

  // Brand Profile fields
  companyName: z
    .string()
    .trim()
    .optional(),
  industry: z
    .string()
    .trim()
    .optional(),
  aboutBrand: z
    .string()
    .max(1000, 'About Brand details cannot exceed 1000 characters')
    .trim()
    .optional(),
  companyLogo: z
    .string()
    .trim()
    .regex(urlRegex, 'Company logo must be a valid URL')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  website: z
    .string()
    .trim()
    .regex(urlRegex, 'Website must be a valid URL')
    .optional()
    .or(z.literal(''))
    .or(z.null()),
  socialLinks: z
    .object({
      instagram: z.string().trim().regex(urlRegex, 'Instagram link must be a valid URL').optional().or(z.literal('')).or(z.null()),
      youtube: z.string().trim().regex(urlRegex, 'YouTube link must be a valid URL').optional().or(z.literal('')).or(z.null()),
      tiktok: z.string().trim().regex(urlRegex, 'TikTok link must be a valid URL').optional().or(z.literal('')).or(z.null()),
      twitter: z.string().trim().regex(urlRegex, 'Twitter link must be a valid URL').optional().or(z.literal('')).or(z.null()),
      facebook: z.string().trim().regex(urlRegex, 'Facebook link must be a valid URL').optional().or(z.literal('')).or(z.null()),
      linkedin: z.string().trim().regex(urlRegex, 'LinkedIn link must be a valid URL').optional().or(z.literal('')).or(z.null())
    })
    .optional()
})
.superRefine((data, ctx) => {
  // Enforce companyName to be required specifically when role is 'brand'
  if (data.role === 'brand' && (!data.companyName || data.companyName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Company name is required for brand profiles',
      path: ['companyName']
    });
  }
});

module.exports = {
  registerSchema
};
