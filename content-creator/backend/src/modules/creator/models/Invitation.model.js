const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    campaignTitle: {
      type: String,
      required: true,
      trim: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    brandLogo: {
      type: String,
      default: '',
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    creatorName: {
      type: String,
      required: true,
      trim: true,
    },

    creatorAvatar: {
      type: String,
      default: '',
    },

    proposedPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    deliverables: {
      type: [String],
      default: [],
    },

    message: {
      type: String,
      trim: true,
      default: '',
    },

    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'rejected',
        'negotiating',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },

    sentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Invitation ||
  mongoose.model('Invitation', invitationSchema);
