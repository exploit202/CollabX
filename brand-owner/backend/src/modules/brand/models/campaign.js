const mongoose = require("mongoose");
const { sharedDB } = require("../../../config/db");

const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    brandName: {
      type: String,
      trim: true,
      default: "",
    },
    applicantsCount: {
  type: Number,
  default: 0,
},

views: {
  type: Number,
  default: 0,
},



invitationsCount: {
  type: Number,
  default: 0,
},



    title: {
      type: String,
      required: [true, "Campaign title is required"],
      trim: true,
      minlength: [2, "Campaign title must be at least 2 characters"],
      maxlength: [200, "Campaign title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Campaign description is required"],
      trim: true,
      maxlength: [5000, "Campaign description cannot exceed 5000 characters"],
    },

    category: {
      type: String,
      required: [true, "Campaign category is required"],
      trim: true,
      index: true,
    },

    budget: {
      type: Number,
      required: [true, "Campaign budget is required"],
      min: [0, "Budget cannot be negative"],
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },

    deliverables: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    targetAudience: {
      type: String,
      trim: true,
      default: "",
    },

    platforms: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    startDate: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "paused",
        "completed",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Notes cannot exceed 5000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

campaignSchema.index({
  brandId: 1,
  status: 1,
});

campaignSchema.index({
  category: 1,
  status: 1,
});

campaignSchema.index({
  createdAt: -1,
});

const Campaign =
  sharedDB.models.Campaign ||
  sharedDB.model("Campaign", campaignSchema);

module.exports = Campaign;

