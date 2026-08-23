const mongoose = require('mongoose');

/**
 * Escrow Schema
 * Demo Escrow Model for tracking funded and released payments for collaborations.
 */
const escrowSchema = new mongoose.Schema(
  {
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'funded', 'released', 'refunded'],
      default: 'pending',
      index: true
    },
    fundedAt: {
      type: Date,
      default: null
    },
    releasedAt: {
      type: Date,
      default: null
    },
    refundedAt: {
      type: Date,
      default: null
    },
    transactionId: {
      type: String,
      default: () => `ESC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
    }
  },
  {
    timestamps: true
  }
);

escrowSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const Escrow = mongoose.models.Escrow || mongoose.model('Escrow', escrowSchema);

module.exports = Escrow;
