const mongoose = require('mongoose');

/**
 * Payment Schema
 * Tracks escrow/payment transactions between Brands and Creators.
 */
const paymentSchema = new mongoose.Schema(
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
      enum: ['pending', 'funded', 'escrowed', 'released', 'refunded', 'failed'],
      default: 'pending',
      index: true
    },
    paymentMethod: {
      type: String,
      default: 'simulated_escrow'
    },
    transactionId: {
      type: String,
      default: ''
    },
    fundedAt: {
      type: Date,
      default: null
    },
    escrowedAt: {
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
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

module.exports = Payment;
