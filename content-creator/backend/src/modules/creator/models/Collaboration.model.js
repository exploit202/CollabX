const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema(
  {
    negotiationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Negotiation',
      default: null,
      index: { unique: true, sparse: true }, // Database-level uniqueness: 1 negotiation -> 1 collaboration max
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null,
      index: true,
    },
    campaignId: {
      type: String,
      required: [true, 'campaignId is required'],
      index: true,
    },
    campaignTitle: {
      type: String,
      required: [true, 'campaignTitle is required'],
      trim: true,
    },
    brandId: {
      type: String,
      required: [true, 'brandId is required'],
      index: true,
    },
    brandName: {
      type: String,
      required: [true, 'brandName is required'],
      trim: true,
    },
    brandLogo: {
      type: String,
      default: '',
    },
    creatorId: {
      type: String,
      required: [true, 'creatorId is required'],
      index: true,
    },
    creatorName: {
      type: String,
      required: [true, 'creatorName is required'],
      trim: true,
    },
    creatorAvatar: {
      type: String,
      default: '',
    },
    deliverableType: {
      type: String,
      required: [true, 'deliverableType is required'],
      default: 'Agreed Negotiated Campaign Package',
    },
    agreedPrice: {
      type: Number,
      required: [true, 'agreedPrice is required'],
      min: [0, 'agreedPrice cannot be negative'],
    },
    stage: {
      type: String,
      enum: [
        'invitation_sent',
        'invitation_accepted',
        'negotiation_started',
        'agreement_finalized',
        'content_in_progress',
        'content_submitted',
        'brand_approved',
        'completed',
        'cancelled',
      ],
      default: 'agreement_finalized',
      index: true,
    },
    submissionUrl: {
      type: String,
      default: '',
      trim: true,
    },
    submissionNotes: {
      type: String,
      default: '',
      trim: true,
    },
    submissionDate: {
      type: String,
      default: '',
    },
    brandFeedback: {
      type: String,
      default: '',
      trim: true,
    },
    ratingGiven: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    reviewGiven: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
    deadline: {
      type: String,
      required: [true, 'deadline is required'],
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Performance & Query Indexes
collaborationSchema.index({ creatorId: 1, stage: 1 });
collaborationSchema.index({ brandId: 1, stage: 1 });
collaborationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Collaboration', collaborationSchema);
