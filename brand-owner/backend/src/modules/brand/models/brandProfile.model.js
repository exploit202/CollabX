const mongoose = require("mongoose");
const { sharedDB } = require("../../../config/db");

const urlRegex =
  /^(https?:\/\/)?([\w.-]+)+(\.[\w.-]+)+([\w\d._~:/?#[\]@!$&'()*+,;=.-]*)*$/;

const brandProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID reference is required"],
      unique: true,
      index: true,
    },

    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      index: true,
    },

    industry: {
      type: String,
      trim: true,
      index: true,
    },

    aboutBrand: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "About Brand details cannot exceed 1000 characters",
      ],
    },

    companyLogo: {
      type: String,
      default: null,
    },

    website: {
      type: String,
      trim: true,
      match: [
        urlRegex,
        "Please provide a valid website URL",
      ],
    },

    location: {
      city: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },
    },

    socialLinks: {
      instagram: {
        type: String,
        trim: true,
        match: [
          urlRegex,
          "Please provide a valid Instagram URL",
        ],
      },

      linkedin: {
        type: String,
        trim: true,
        match: [
          urlRegex,
          "Please provide a valid LinkedIn URL",
        ],
      },

      twitter: {
        type: String,
        trim: true,
        match: [
          urlRegex,
          "Please provide a valid Twitter URL",
        ],
      },

      facebook: {
        type: String,
        trim: true,
        match: [
          urlRegex,
          "Please provide a valid Facebook URL",
        ],
      },
    },

    contactName: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Contact name cannot exceed 100 characters",
      ],
    },

    contactRole: {
      type: String,
      trim: true,
      maxlength: [
        100,
        "Contact role cannot exceed 100 characters",
      ],
    },

    targetAudience: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Target audience cannot exceed 1000 characters",
      ],
    },

    preferredCreatorCategories: {
      type: [String],
      default: [],
    },

    preferredPlatforms: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// IMPORTANT: use the SHARED database connection
const BrandProfile =
  sharedDB.models.BrandProfile ||
  sharedDB.model("BrandProfile", brandProfileSchema);

console.log("========== BRAND PROFILE MODEL ==========");
console.log("DB:", BrandProfile.db?.name);
console.log("ReadyState:", BrandProfile.db?.readyState);
console.log("Collection:", BrandProfile.collection.name);
console.log("==========================================");

module.exports = BrandProfile;