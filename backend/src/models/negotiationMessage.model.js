const mongoose = require('mongoose');

/**
 * Negotiation Message Schema
 * Messages exchanged during a negotiation thread.
 */
const negotiationMessageSchema = new mongoose.Schema(
  {
    negotiationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Negotiation',
      required: [true, 'Negotiation ID is required'],
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required'],
      index: true
    },
    senderType: {
      type: String,
      enum: ['Brand', 'Creator', 'brand', 'creator'],
      required: [true, 'Sender type is required']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    offerAmount: {
      type: Number,
      min: [0, 'Offer amount cannot be negative'],
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const NegotiationMessage =
  mongoose.models.NegotiationMessage ||
  mongoose.model('NegotiationMessage', negotiationMessageSchema);

module.exports = NegotiationMessage;
