const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'invitation',
        'invitation_sent',
        'collaboration_invitation',
        'invitation_response',
        'invitation_accepted',
        'invitation_declined',
        'invitation_rejected',
        'negotiation',
        'offer_received',
        'collaboration_created',
        'deliverable_submitted',
        'content_submitted',
        'content_resubmitted',
        'revision_requested',
        'deliverable_approved',
        'content_approved',
        'collaboration_completed',
        'escrow_deposited',
        'payment_escrowed',
        'payment_released',
        'review_submitted',
        'review_received',
        'system'
      ],
      default: 'system'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    read: {
      type: Boolean,
      default: false
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Sync read and isRead fields
notificationSchema.pre('save', function () {
  if (this.isModified('isRead')) {
    this.read = this.isRead;
  } else if (this.isModified('read')) {
    this.isRead = this.read;
  }
  if (this.entityId && !this.relatedId) {
    this.relatedId = this.entityId;
  } else if (this.relatedId && !this.entityId) {
    this.entityId = this.relatedId;
  }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
