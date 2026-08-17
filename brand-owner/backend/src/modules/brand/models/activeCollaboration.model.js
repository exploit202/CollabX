const mongoose = require("mongoose");
const { sharedDB } = require("../../../config/db");

const activeCollaborationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },

    invitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invitation",
      required: true,
      index: true,
    },

    negotiationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Negotiation",
      required: true,
      unique: true,
      index: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    brandName: {
      type: String,
      required: true,
      trim: true,
    },

    brandLogo: {
      type: String,
      default: "",
    },

    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    creatorName: {
      type: String,
      required: true,
      trim: true,
    },

    creatorAvatar: {
      type: String,
      default: "",
    },

    campaignTitle: {
      type: String,
      required: true,
      trim: true,
    },

    deliverables: {
      type: [String],
      default: [],
    },

    agreedBudget: {
      type: Number,
      required: true,
      min: 0,
    },

    startDate: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: [
        "active",
        "in_progress",
        "submitted",
        "completed",
        "cancelled",
        "disputed",
      ],
      default: "active",
      index: true,
    },

    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 5000,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const ActiveCollaboration =
  sharedDB.models.ActiveCollaboration ||
  sharedDB.model(
    "ActiveCollaboration",
    activeCollaborationSchema
  );

console.log("========== ACTIVE COLLAB MODEL ==========");
console.log("ReadyState:", sharedDB.readyState);
console.log("Host:", sharedDB.host);
console.log("Database:", sharedDB.db?.databaseName);
console.log("Collection:", ActiveCollaboration.collection.name);
console.log("=========================================");
module.exports = ActiveCollaboration;