const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    collaborationId: {
      type: String,
      required: true,
      index: true,
    },
    negotiationId: {
      type: String,
      default: '',
    },
    brandId: {
      type: String,
      required: true,
      index: true,
    },
    brandName: {
      type: String,
      default: 'Brand',
    },
    creatorId: {
      type: String,
      required: true,
      index: true,
    },
    creatorName: {
      type: String,
      default: 'Creator',
    },
    // Financial Breakdown with 3% Platform Fee
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFeeRate: {
      type: Number,
      default: 0.03, // 3% Platform Commission
    },
    platformFeeAmount: {
      type: Number,
      required: true,
    },
    creatorPayoutAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // Payment Gateway References
    gateway: {
      type: String,
      enum: ['razorpay', 'stripe', 'upi', 'simulated_escrow'],
      default: 'razorpay',
    },
    gatewayOrderId: {
      type: String,
      required: true,
    },
    gatewayPaymentId: {
      type: String,
      default: '',
    },
    gatewaySignature: {
      type: String,
      default: '',
    },
    // Escrow Lifecycle
    status: {
      type: String,
      enum: ['pending', 'escrowed', 'released', 'refunded', 'failed'],
      default: 'pending',
      index: true,
    },
    escrowFundedAt: {
      type: Date,
      default: null,
    },
    escrowReleasedAt: {
      type: Date,
      default: null,
    },
    payoutReferenceId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
