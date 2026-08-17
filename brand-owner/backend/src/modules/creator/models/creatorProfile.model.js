const mongoose = require('mongoose');
const { sharedDB } = require('../../../config/db');

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    niche: {
      type: [String],
      default: []
    },

    followers: {
      type: Number,
      min: 0,
      default: 0
    },

    engagementRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },

    portfolio: {
      type: [String],
      default: []
    },

    location: {
      city: String,
      country: String
    },

    socialLinks: {
      instagram: String,
      youtube: String,
      tiktok: String,
      twitter: String,
      facebook: String
    }
  },
  {
    timestamps: true
  }
);

const CreatorProfile =
  sharedDB.models.CreatorProfile ||
  sharedDB.model('CreatorProfile', creatorProfileSchema);

module.exports = CreatorProfile;