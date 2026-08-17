const { z } = require("zod");

const createCampaignSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Campaign title must be at least 3 characters")
    .max(150, "Campaign title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Campaign description must be at least 10 characters")
    .max(5000, "Campaign description cannot exceed 5000 characters"),

  category: z
    .string()
    .trim()
    .min(2, "Category is required")
    .max(100, "Category cannot exceed 100 characters"),

  budget: z
    .number({
      required_error: "Budget is required",
      invalid_type_error: "Budget must be a number",
    })
    .min(0, "Budget cannot be negative"),

  deliverables: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),

  requirements: z
    .array(z.string().trim().min(1))
    .optional()
    .default([]),

  deadline: z
    .string()
    .refine(
      (value) => !Number.isNaN(Date.parse(value)),
      "Invalid deadline"
    ),

  status: z
    .enum([
      "draft",
      "active",
      "paused",
      "completed",
      "cancelled",
    ])
    .optional()
    .default("draft"),
});
const updateCampaignSchema = createCampaignSchema.partial();
const updateCampaignStatusSchema = z.object({
  status: z.enum([
    "draft",
    "active",
    "paused",
    "completed",
    "cancelled",
  ]),
});

module.exports = {
  createCampaignSchema,
  updateCampaignSchema,
  updateCampaignStatusSchema,
};