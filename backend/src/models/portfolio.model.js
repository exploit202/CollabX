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
      trim: true
    },
    brandName: {
      type: String,
      trim: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    thumbnail: {
      type: String,
      default: ''
    },
    views: {
      type: Number,
      default: 0
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
