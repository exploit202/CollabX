const mongoose = require('mongoose');

/**
 * Creator Payout Account Schema
 * Stores bank and UPI payout account information for creators.
 */
const creatorPayoutAccountSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    bankName: {
      type: String,
      trim: true,
      default: ''
    },
    accountNumber: {
      type: String,
      trim: true,
      default: ''
    },
    ifscCode: {
      type: String,
      trim: true,
      default: ''
    },
    accountHolderName: {
      type: String,
      trim: true,
      default: ''
    },
    upiId: {
      type: String,
      trim: true,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const CreatorPayoutAccount =
  mongoose.models.CreatorPayoutAccount ||
  mongoose.model('CreatorPayoutAccount', creatorPayoutAccountSchema);

module.exports = CreatorPayoutAccount;
