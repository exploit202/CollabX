const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
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
    entityType: {
      type: String,
      default: ''
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

// Sync read, isRead, userId and recipient fields
notificationSchema.pre('validate', function () {
  if (this.recipient && !this.userId) {
    this.userId = this.recipient;
  }
  if (this.userId && !this.recipient) {
    this.recipient = this.userId;
  }
});

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
  if (this.recipient && !this.userId) {
    this.userId = this.recipient;
  }
  if (this.userId && !this.recipient) {
    this.recipient = this.userId;
  }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;
