const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["instagram", "youtube"],
      required: true,
    },

    contentType: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  {
    _id: false,
  }
);

const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: String,
      required: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    brandLogo: {
      type: String,
      default: "",
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

    category: {
      type: String,
      required: true,
      trim: true,
    },

    budget: {
      type: Number,
      required: true,
      min: 0,
    },

    minFollowers: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetPlatforms: [
      {
        type: String,
        enum: ["instagram", "youtube"],
      },
    ],

    requirements: [requirementSchema],

    deadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "active", "paused", "completed"],
      default: "draft",
    },

    applicantsCount: {
      type: Number,
      default: 0,
    },

    invitationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==========================================
// Frontend compatibility
// MongoDB _id -> id
// ==========================================

campaignSchema.set("toJSON", {
  virtuals: true,

  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
  },
});

module.exports = mongoose.model("Campaign", campaignSchema);