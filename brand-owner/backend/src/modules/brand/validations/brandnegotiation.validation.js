const { z } = require('zod');

const objectId = (field) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${field} format`);

const createNegotiationSchema = z.object({
  invitationId: objectId('invitation ID'),
  currentOffer: z.number().nonnegative('Offer cannot be negative')
});

const decisionSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'Closed'])
});

const messageSchema = z.object({
  negotiationId: objectId('negotiation ID'),
  message: z.string().trim().min(1, 'Message is required').max(1000),
  offerAmount: z.number().nonnegative('Offer cannot be negative').optional()
});

const invitationResponseSchema = z.object({
  status: z.enum(['Accepted', 'Rejected'])
});

module.exports = { createNegotiationSchema, decisionSchema, messageSchema, invitationResponseSchema };
