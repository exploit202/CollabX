const mongoose = require('mongoose');

/**
 * Pricing Package Schema
 * Stores service pricing packages configured by creators.
 * Ref fixed: `creatorId` references `User` model.
 */
const pricingSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: String,
      enum: ['Instagram', 'YouTube', 'LinkedIn', 'Facebook', 'X', 'Other'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    },
    deliveryDays: {
      type: Number,
      required: true
    },
    revisions: {
      type: Number,
      default: 1
    },
    deliverables: [
      {
        type: String
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Pricing = mongoose.models.Pricing || mongoose.model('Pricing', pricingSchema);

module.exports = Pricing;
