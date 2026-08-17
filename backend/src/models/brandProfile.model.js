const mongoose = require('mongoose');

const urlRegex = /^(https?:\/\/)?([\w.-]+)+(\.[\w.-]+)+([\w\d._~:/?#[\]@!$&'()*+,;=.-]*)*$/;

const notificationPreferencesSchema = new mongoose.Schema(
  {
    newInvitationResponses: { type: Boolean, default: true },
    counterOffers: { type: Boolean, default: true },
    negotiationMessages: { type: Boolean, default: true },
    collaborationUpdates: { type: Boolean, default: true },
    contentSubmissions: { type: Boolean, default: true },
    escrowUpdates: { type: Boolean, default: true },
    dailyCampaignDigest: { type: Boolean, default: true }
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
      enum: ['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({})
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({})
    }
  },
  { _id: false }
);

/**
 * Brand Profile Schema
 * Stores brand/company profile details linked to User._id.
 */
const brandProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      unique: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    industry: {
      type: String,
      trim: true,
      index: true
    },
    aboutBrand: {
      type: String,
      trim: true,
      maxlength: [1000, 'About Brand details cannot exceed 1000 characters']
    },
    companyLogo: {
      type: String,
      default: null
    },
    website: {
      type: String,
      trim: true,
      match: [urlRegex, 'Please provide a valid website URL']
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
    socialLinks: {
      instagram: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid Instagram URL']
      },
      linkedin: {
        type: String,
        trim: true,
        match: [urlRegex, 'Please provide a valid LinkedIn URL']
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
    contactName: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact name cannot exceed 100 characters']
    },
    contactRole: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact role cannot exceed 100 characters']
    },
    targetAudience: {
      type: String,
      trim: true,
      maxlength: [1000, 'Target audience cannot exceed 1000 characters']
    },
    preferredCreatorCategories: {
      type: [String],
      default: []
    },
    preferredPlatforms: {
      type: [String],
      default: []
    },
    settings: {
      type: settingsSchema,
      default: () => ({})
    }
  },
  {
    timestamps: true
  }
);

const BrandProfile = mongoose.models.BrandProfile || mongoose.model('BrandProfile', brandProfileSchema);

module.exports = BrandProfile;
