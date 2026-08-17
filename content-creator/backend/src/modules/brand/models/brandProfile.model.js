const mongoose = require('mongoose');

const urlRegex = /^(https?:\/\/)?([\w.-]+)+(\.[\w.-]+)+([\w\d._~:/?#[\]@!$&'()*+,;=.-]*)*$/;

/**
 * Brand Profile Schema
 * Stores details specific to brands and companies.
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
      index: true // Indexed to allow search/filtering by company name
    },
    industry: {
      type: String,
      trim: true,
      index: true // Indexed to filter brand profiles by industry sector
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
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

const BrandProfile = mongoose.model('BrandProfile', brandProfileSchema);

module.exports = BrandProfile;
