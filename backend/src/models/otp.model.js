const mongoose = require('mongoose');

/**
 * OTP Schema
 * Temporary hashed OTP data for email verification.
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
      index: { expires: 0 } // TTL index for automatic expiration deletion
    },
    attempts: {
      type: Number,
      default: 0,
      min: [0, 'Attempts cannot be negative']
    },
    purpose: {
      type: String,
      enum: ['email_verification', 'password_reset'],
      default: 'email_verification',
      required: true,
      index: true
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

otpSchema.index({ userId: 1, purpose: 1 });

const Otp = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

module.exports = Otp;
