const mongoose = require('mongoose');

/**
 * OTP Schema
 * Stores temporary hashed OTP data for email verification.
 */
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      index: true
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
      trim: true
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration time is required'],
      index: { expires: 0 } // TTL index to automatically delete expired documents
    },
    attempts: {
      type: Number,
      default: 0,
      min: [0, 'Attempts cannot be negative']
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
