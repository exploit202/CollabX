const mongoose = require('mongoose');

const urlRegex = /^(https?:\/\/)?([\w.-]+)+(\.[\w.-]+)+([\w\d._~:/?#[\]@!$&'()*+,;=.-]*)*$/;

const platformItemSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: ['instagram', 'youtube', 'twitter'],
        message: '{VALUE} is not a supported platform'
      }
    },
    link: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

/**
 * Creator Profile Schema
 * Stores details specific to creators/influencers.
 */
const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
      index: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    niche: {
      type: [String],
      default: [],
      index: true // Indexed to allow fast querying and filtering of creators by niche/category
    },
    socialLinks: {
      instagram: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid Instagram URL']
      },
      youtube: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid YouTube URL']
      },
      tiktok: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid TikTok URL']
      },
      twitter: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid Twitter URL']
      },
      facebook: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid Facebook URL']
      }
    },
    followers: {
      type: Number,
      default: 0,
      min: [0, 'Followers count cannot be negative'],
      index: true // Indexed for sorting creators by follower counts
    },
    engagementRate: {
      type: Number,
      default: 0.0,
      min: [0.0, 'Engagement rate cannot be negative'],
      max: [100.0, 'Engagement rate cannot exceed 100%'],
      index: true // Indexed for sorting creators by engagement metrics
    },
    portfolio: {
      type: [
        {
          type: String,
          trim: true,
          match: [urlRegex, 'Portfolio item must be a valid URL']
        }
      ],
      default: []
    },
    platforms: {
      type: [platformItemSchema],
      default: []
    },
    platformLinks: {
      instagram: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid Instagram URL']
      },
      youtube: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid YouTube URL']
      },
      twitter: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid Twitter URL']
      }
    },
    location: {
      city: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Safely convert legacy string array platform entries to object structure
creatorProfileSchema.pre('init', function (doc) {
  if (doc && Array.isArray(doc.platforms)) {
    doc.platforms = doc.platforms.map((item) => {
      if (typeof item === 'string') {
        return { platform: item, link: '' };
      }
      return item;
    });
  }
});

creatorProfileSchema.pre('validate', function () {
  if (Array.isArray(this.platforms)) {
    this.platforms = this.platforms.map((item) => {
      if (typeof item === 'string') {
        return { platform: item, link: '' };
      }
      return item;
    });
  }
});

const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);

module.exports = CreatorProfile;
