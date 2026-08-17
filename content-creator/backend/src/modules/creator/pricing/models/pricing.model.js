const mongoose = require("mongoose");

const pricingModel = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      enum: ["Instagram", "YouTube", "LinkedIn", "Facebook", "X", "Other"],
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    deliveryDays: {
      type: Number,
      required: true,
    },

    revisions: {
      type: Number,
      default: 1,
    },

    deliverables: [
      {
        type: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pricing", pricingModel);