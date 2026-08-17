const mongoose = require('mongoose');

/**
 * Saved Creator Schema
 * Bookmarks creators saved by Brand Users.
 */
const savedCreatorSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Brand ID is required'],
      index: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreatorProfile',
      required: [true, 'Creator profile ID is required']
    }
  },
  {
    timestamps: true
  }
);

savedCreatorSchema.index(
  { brandId: 1, creatorId: 1 },
  { unique: true }
);

const SavedCreator =
  mongoose.models.BrandSavedCreator ||
  mongoose.models.SavedCreator ||
  mongoose.model('BrandSavedCreator', savedCreatorSchema);

module.exports = SavedCreator;
