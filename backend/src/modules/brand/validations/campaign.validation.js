const { z } = require('zod');

const createCampaignSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Campaign title must be at least 2 characters')
      .max(200, 'Campaign title cannot exceed 200 characters'),
    description: z
      .string()
      .trim()
      .min(10, 'Campaign description must be at least 10 characters')
      .max(5000, 'Campaign description cannot exceed 5000 characters'),
    category: z
      .string()
      .trim()
      .min(2, 'Category is required')
      .max(100, 'Category cannot exceed 100 characters'),
    budget: z
      .union([z.number(), z.string()])
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val) && val >= 0, 'Budget must be a non-negative number'),
    deliverables: z
      .array(z.string().trim().min(1))
      .optional()
      .default([]),
    requirements: z
      .array(z.any())
      .optional()
      .default([]),
    targetPlatforms: z
      .array(z.string())
      .optional()
      .default([]),
    platforms: z
      .array(z.string())
      .optional()
      .default([]),
    minFollowers: z
      .union([z.number(), z.string()])
      .optional()
      .transform((val) => (val !== undefined ? Number(val) : 0)),
    deadline: z
      .string()
      .optional()
      .nullable()
      .refine(
        (value) => !value || !Number.isNaN(Date.parse(value)),
        'Invalid deadline date'
      ),
    status: z
      .enum(['draft', 'active', 'paused', 'completed', 'cancelled'])
      .optional()
      .default('active')
  })
  .passthrough();

const updateCampaignSchema = createCampaignSchema.partial();

const updateCampaignStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled'])
});

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
  updateCampaignStatusSchema
};
