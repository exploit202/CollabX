const mongoose = require('mongoose');

/**
 * Portfolio Schema
 * Stores portfolio items uploaded by creators.
 * Ref fixed: `creator` references `User` model.
 */
const portfolioSchema = new mongoose.Schema(
  {
    creator: {
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
      trim: true,
      default: ''
    },
    brandName: {
      type: String,
      trim: true,
      default: ''
    },
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'shorts-reels', 'other'],
      default: 'youtube'
    },
    mediaType: {
      type: String,
      default: 'video'
    },
    thumbnail: {
      type: String,
      default: ''
    },
    contentUrl: {
      type: String,
      default: ''
    },
    campaignValue: {
      type: Number,
      default: 0
    },
    views: {
      type: mongoose.Schema.Types.Mixed,
      default: 0
    },
    engagementRate: {
      type: mongoose.Schema.Types.Mixed,
      default: ''
    },
    likes: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

portfolioSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  }
});

const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
