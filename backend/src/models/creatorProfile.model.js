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
 * Stores creator/influencer profile details linked to User._id.
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
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    profileImage: {
      url: {
        type: String,
        default: null
      },
      publicId: {
        type: String,
        default: null
      }
    },
    niche: {
      type: [String],
      default: [],
      index: true
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
      index: true
    },
    engagementRate: {
      type: Number,
      default: 0.0,
      min: [0.0, 'Engagement rate cannot be negative'],
      max: [100.0, 'Engagement rate cannot exceed 100%'],
      index: true
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
    audienceMetrics: {
      youtube: {
        subscribers: { type: Number, min: 0, default: null },
        averageViews: { type: Number, min: 0, default: null },
        engagementRate: { type: Number, min: 0, max: 100, default: null }
      },
      instagram: {
        followers: { type: Number, min: 0, default: null },
        averageReelViews: { type: Number, min: 0, default: null },
        engagementRate: { type: Number, min: 0, max: 100, default: null }
      },
      twitter: {
        followers: { type: Number, min: 0, default: null },
        averageImpressions: { type: Number, min: 0, default: null },
        engagementRate: { type: Number, min: 0, max: 100, default: null }
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
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: [0, 'Total reviews cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

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

const CreatorProfile = mongoose.models.CreatorProfile || mongoose.model('CreatorProfile', creatorProfileSchema);

module.exports = CreatorProfile;
