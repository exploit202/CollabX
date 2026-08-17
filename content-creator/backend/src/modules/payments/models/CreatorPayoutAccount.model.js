const mongoose = require('mongoose');

const creatorPayoutAccountSchema = new mongoose.Schema(
  {
    creatorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    payoutMethod: {
      type: String,
      enum: ['bank_account', 'upi'],
      default: 'upi',
    },
    accountHolderName: {
      type: String,
      default: '',
    },
    bankName: {
      type: String,
      default: '',
    },
    accountNumber: {
      type: String,
      default: '',
    },
    ifscCode: {
      type: String,
      default: '',
    },
    upiId: {
      type: String,
      default: 'creator@okaxis',
    },
    panNumber: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CreatorPayoutAccount', creatorPayoutAccountSchema);
