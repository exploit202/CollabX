const { z } = require('zod');

const createInvitationSchema = z
  .object({
    campaignId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Campaign ID is required'),

    creatorId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Creator ID is required'),

    proposedPrice: z
      .number()
      .min(0, 'Proposed price cannot be negative')
      .optional(),

    offeredBudget: z
      .number()
      .min(0, 'Offered budget cannot be negative')
      .optional(),

    deliverables: z
      .array(z.string().trim().min(1))
      .optional()
      .default([]),

    message: z
      .string()
      .trim()
      .max(3000, 'Message cannot exceed 3000 characters')
      .optional()
      .default(''),
  })
  .refine(
    (data) =>
      data.proposedPrice !== undefined ||
      data.offeredBudget !== undefined,
    {
      message:
        'Either proposedPrice or offeredBudget is required',
      path: ['proposedPrice'],
    }
  );

module.exports = {
  createInvitationSchema,
};