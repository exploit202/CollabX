// const { z } = require("zod");

// const createInvitationSchema = z.object({
//   campaignId: z
//     .string()
//     .min(1, "Campaign ID is required"),

//   creatorId: z
//     .string()
//     .min(1, "Creator ID is required"),

//   proposedPrice: z
//     .number({
//       required_error: "Proposed price is required",
//       invalid_type_error: "Proposed price must be a number",
//     })
//     .min(0, "Proposed price cannot be negative"),

//   deliverables: z
//     .array(
//       z
//         .string()
//         .trim()
//         .min(1, "Deliverable cannot be empty")
//     )
//     .optional()
//     .default([]),

//   message: z
//     .string()
//     .trim()
//     .max(3000, "Message cannot exceed 3000 characters")
//     .optional()
//     .default(""),

//   expiresAt: z
//     .string()
//     .refine(
//       (value) => !Number.isNaN(Date.parse(value)),
//       "Invalid expiration date"
//     )
//     .optional(),
// });

// const respondToInvitationSchema = z.object({
//   action: z.enum(
//     ["accept", "reject"],
//     {
//       required_error:
//         "Action must be accept or reject",
//     }
//   ),
// });

// const cancelInvitationSchema = z.object({
//   reason: z
//     .string()
//     .trim()
//     .max(
//       1000,
//       "Cancellation reason cannot exceed 1000 characters"
//     )
//     .optional()
//     .default(""),
// });

// module.exports = {
//   createInvitationSchema,
//   respondToInvitationSchema,
//   cancelInvitationSchema,
// };