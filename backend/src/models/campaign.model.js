const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ['instagram', 'youtube', 'twitter', 'tiktok', 'other'],
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    }
  },
  { _id: false }
);

/**
 * Unified Campaign Schema
 * Consolidates Brand Owner campaign management and Content Creator campaign discovery requirements.
 */
const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Brand User ID is required'],
      index: true
    },
    brandName: {
      type: String,
      trim: true,
      default: ''
    },
    brandLogo: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true,
      minlength: [2, 'Campaign title must be at least 2 characters'],
      maxlength: [200, 'Campaign title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      trim: true,
      maxlength: [5000, 'Campaign description cannot exceed 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Campaign category is required'],
      trim: true,
      index: true
    },
    budget: {
      type: Number,
      required: [true, 'Campaign budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
      uppercase: true
    },
    minFollowers: {
      type: Number,
      default: 0,
      min: 0
    },
    deliverables: {
      type: [String],
      default: []
    },
    requirements: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    targetAudience: {
      type: String,
      trim: true,
      default: ''
    },
    platforms: {
      type: [String],
      default: []
    },
    image: {
      type: String,
      default: '',
      trim: true
    },
    startDate: {
      type: Date,
      default: null
    },
    deadline: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      default: 'draft',
      index: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Notes cannot exceed 5000 characters']
    },
    applicantsCount: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    invitationsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

campaignSchema.index({ brandId: 1, status: 1 });
campaignSchema.index({ category: 1, status: 1 });
campaignSchema.index({ createdAt: -1 });

// Virtual to alias platforms as targetPlatforms for Content Creator frontend compatibility
campaignSchema.virtual('targetPlatforms').get(function () {
  return this.platforms;
});

campaignSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const Campaign = mongoose.models.Campaign || mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
