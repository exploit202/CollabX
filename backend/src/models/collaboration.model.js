const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      default: 'video'
    },
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    submissionUrl: {
      type: String,
      default: ''
    },
    submissionNotes: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'revision_requested', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { _id: true }
);

const revisionSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      required: true,
      trim: true
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: {
      type: Date,
      default: null
    }
  },
  { _id: true }
);

const collaborationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    campaignTitle: {
      type: String,
      trim: true,
      default: ''
    },
    deadline: {
      type: Date,
      default: null
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    creatorName: {
      type: String,
      trim: true,
      default: ''
    },
    creatorAvatar: {
      type: String,
      default: ''
    },
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null
    },
    negotiationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Negotiation',
      default: null
    },
    agreedPrice: {
      type: Number,
      required: true,
      min: 0
    },
    agreedBudget: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: [
        'agreement_finalized',
        'active',
        'content_submitted',
        'revision_requested',
        'brand_approved',
        'completed',
        'cancelled'
      ],
      default: 'active',
      index: true
    },
    stage: {
      type: String,
      enum: [
        'agreement_finalized',
        'active',
        'content_submitted',
        'revision_requested',
        'brand_approved',
        'completed',
        'cancelled'
      ],
      default: 'active'
    },
    deliverables: {
      type: [deliverableSchema],
      default: []
    },
    submissionUrl: {
      type: String,
      default: ''
    },
    submissionNotes: {
      type: String,
      default: ''
    },
    submittedAt: {
      type: Date,
      default: null
    },
    revisions: {
      type: [revisionSchema],
      default: []
    },
    revisionNotes: {
      type: String,
      default: ''
    },
    revisionRequestedAt: {
      type: Date,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'escrowed', 'released', 'refunded'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

collaborationSchema.pre('save', function () {
  if (this.agreedBudget !== undefined && this.agreedPrice === undefined) {
    this.agreedPrice = this.agreedBudget;
  } else if (this.agreedPrice !== undefined && this.agreedBudget === undefined) {
    this.agreedBudget = this.agreedPrice;
  }

  if (this.status && !this.stage) {
    this.stage = this.status;
  } else if (this.stage && !this.status) {
    this.status = this.stage;
  }
});

collaborationSchema.index({ creatorId: 1, status: 1 });
collaborationSchema.index({ brandId: 1, status: 1 });
collaborationSchema.index({ createdAt: -1 });

const Collaboration = mongoose.models.Collaboration || mongoose.model('Collaboration', collaborationSchema);

module.exports = Collaboration;
