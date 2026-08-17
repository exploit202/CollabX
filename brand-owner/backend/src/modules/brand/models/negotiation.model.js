const mongoose = require('mongoose');
const { sharedDB } = require('../../../config/db');

const offerSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    senderRole: {
      type: String,
      enum: ['brand', 'creator'],
      required: true
    },

    senderName: {
      type: String,
      required: true
    },

    senderAvatar: {
      type: String,
      default: ''
    },

    message: {
      type: String,
      trim: true,
      default: ''
    },

    proposedBudget: {
      type: Number,
      required: true,
      min: 0
    },

    attachmentUrl: {
      type: String,
      default: ''
    },

    attachmentName: {
      type: String,
      default: ''
    },

    attachmentType: {
      type: String,
      enum: ['image', 'pdf', 'doc'],
      default: null
    },

    status: {
      type: String,
      enum: [
        'offered',
        'countered',
        'accepted',
        'declined'
      ],
      default: 'countered'
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const negotiationSchema = new mongoose.Schema(
  {
    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      required: true,
      unique: true,
      index: true
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
      index: true
    },

    campaignName: {
      type: String,
      default: ''
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    brandName: {
      type: String,
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
      default: ''
    },

    creatorAvatar: {
      type: String,
      default: ''
    },

    proposedBudget: {
      type: Number,
      required: true,
      min: 0
    },

    currentBudget: {
      type: Number,
      required: true,
      min: 0
    },

    agreedBudget: {
      type: Number,
      default: null
    },

    status: {
      type: String,
      enum: [
        'open',
        'agreed',
        'rejected',
        'closed'
      ],
      default: 'open',
      index: true
    },

    offers: [offerSchema],

    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = sharedDB.model('Negotiation', negotiationSchema);