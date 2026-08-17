const { z } = require('zod');

const urlRegex = /^(https?:\/\/)?([\w.-]+)+(\.[\w.-]+)+([\w\d._~:/?#\[\]@!$&'()*+,;=-]*)$/;

const creatorProfileUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).trim().optional(),
  profileImage: z.string().trim().regex(urlRegex, 'Profile image must be a valid URL').optional().or(z.literal('')).or(z.null()),
  bio: z.string().max(500).trim().optional(),
  niche: z.array(z.string().trim()).optional(),
  socialLinks: z.object({
    instagram: z.string().trim().regex(urlRegex, 'Instagram link must be a valid URL').optional().or(z.literal('')).or(z.null()),
    youtube: z.string().trim().regex(urlRegex, 'YouTube link must be a valid URL').optional().or(z.literal('')).or(z.null()),
    tiktok: z.string().trim().regex(urlRegex, 'TikTok link must be a valid URL').optional().or(z.literal('')).or(z.null()),
    twitter: z.string().trim().regex(urlRegex, 'Twitter link must be a valid URL').optional().or(z.literal('')).or(z.null()),
    facebook: z.string().trim().regex(urlRegex, 'Facebook link must be a valid URL').optional().or(z.literal('')).or(z.null())
  }).optional(),
  portfolio: z.array(z.string().trim().regex(urlRegex, 'Portfolio item must be a valid URL')).optional(),
  location: z.object({
    city: z.string().trim().optional(),
    country: z.string().trim().optional()
  }).optional()
}).strict();

module.exports = { creatorProfileUpdateSchema };
