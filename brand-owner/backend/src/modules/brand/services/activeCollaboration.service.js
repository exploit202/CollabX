const ActiveCollaboration = require("../models/activeCollaboration.model");
const Negotiation = require("../models/negotiation.model");
const Invitation = require("../models/invitation.model");
const Campaign = require("../models/campaign");

// =====================================================
// CREATE ACTIVE COLLABORATION
// Created only after negotiation is agreed
// =====================================================

const createFromNegotiation = async ({
  negotiationId,
  userId,
}) => {
  const negotiation = await Negotiation.findById(
    negotiationId
  );

  if (!negotiation) {
    const error = new Error("Negotiation not found");
    error.statusCode = 404;
    error.code = "NEGOTIATION_NOT_FOUND";
    throw error;
  }

  // --------------------------------------------------
  // Only brand or creator involved can create it
  // --------------------------------------------------

  const isBrand =
    String(negotiation.brandId) === String(userId);

  const isCreator =
    String(negotiation.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error(
      "You do not have access to this negotiation"
    );
    error.statusCode = 403;
    error.code = "NEGOTIATION_ACCESS_DENIED";
    throw error;
  }

  // --------------------------------------------------
  // Negotiation must be agreed
  // --------------------------------------------------

  if (negotiation.status !== "agreed") {
    const error = new Error(
      "Active collaboration can only be created after the negotiation is agreed"
    );
    error.statusCode = 400;
    error.code = "NEGOTIATION_NOT_AGREED";
    throw error;
  }

  // --------------------------------------------------
  // Prevent duplicate collaboration
  // --------------------------------------------------

  const existing =
    await ActiveCollaboration.findOne({
      negotiationId: negotiation._id,
    });

  if (existing) {
    return existing;
  }

  // --------------------------------------------------
  // Get invitation
  // --------------------------------------------------

  const invitation = await Invitation.findById(
    negotiation.invitationId
  );

  if (!invitation) {
    const error = new Error(
      "Invitation associated with negotiation not found"
    );
    error.statusCode = 404;
    error.code = "INVITATION_NOT_FOUND";
    throw error;
  }

  // --------------------------------------------------
  // Get campaign
  // --------------------------------------------------

  const campaign = await Campaign.findById(
    negotiation.campaignId
  );

  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    error.code = "CAMPAIGN_NOT_FOUND";
    throw error;
  }

  // --------------------------------------------------
  // Create active collaboration
  // --------------------------------------------------
   console.log("========== BEFORE CREATE ==========");
console.log("DB:", ActiveCollaboration.db.name);
console.log(
  "ReadyState:",
  ActiveCollaboration.db.readyState
);
console.log(
  "Collection:",
  ActiveCollaboration.collection.name
);
console.log("===================================");
  const collaboration =
    await ActiveCollaboration.create({
      campaignId: negotiation.campaignId,

      invitationId: negotiation.invitationId,

      negotiationId: negotiation._id,

      brandId: negotiation.brandId,
      brandName:
        negotiation.brandName ||
        invitation.brandName,
      brandLogo:
        negotiation.brandLogo ||
        invitation.brandLogo,

      creatorId: negotiation.creatorId,
      creatorName:
        negotiation.creatorName ||
        invitation.creatorName,
      creatorAvatar:
        negotiation.creatorAvatar ||
        invitation.creatorAvatar,

      campaignTitle:
        negotiation.campaignName ||
        invitation.campaignTitle ||
        campaign.title,

      deliverables:
        invitation.deliverables || [],

      agreedBudget:
        negotiation.agreedBudget,

      startDate: new Date(),

      deadline:
        campaign.deadline || null,

      status: "active",

      progress: 0,
    });
    console.log("========== AFTER CREATE ==========");
console.log(
  "Created ID:",
  collaboration._id.toString()
);
console.log("DB:", ActiveCollaboration.db.name);
console.log(
  "ReadyState:",
  ActiveCollaboration.db.readyState
);

const verify =
  await ActiveCollaboration.findById(
    collaboration._id
  ).lean();

console.log(
  "Found immediately:",
  !!verify
);

console.log("===================================");

  return collaboration;
};

// =====================================================
// GET COLLABORATION BY ID
// =====================================================



// =====================================================
// GET BRAND COLLABORATIONS
// =====================================================
const getBrandCollaborations = async (
  brandId,
  filters = {}
) => {
  const query = {
    brandId,
  };

  if (filters.status) {
    query.status = filters.status;
  }

  return ActiveCollaboration.find(query)
    .populate(
      "campaignId",
      "title category budget deadline status"
    )
    .sort({ updatedAt: -1 })
    .lean();
};

// =====================================================
// GET CREATOR COLLABORATIONS
// =====================================================

const getCreatorCollaborations = async (
  creatorId,
  filters = {}
) => {
  const query = {
    creatorId,
  };

  if (filters.status) {
    query.status = filters.status;
  }

  return ActiveCollaboration.find(query)
    .populate(
      "campaignId",
      "title category budget deadline status"
    )
    .sort({ updatedAt: -1 })
    .lean();
};

// =====================================================
// UPDATE PROGRESS
// =====================================================

const updateProgress = async ({
  collaborationId,
  userId,
  progress,
  status,
  notes,
}) => {
  const collaboration =
    await ActiveCollaboration.findById(
      collaborationId
    );

  if (!collaboration) {
    const error = new Error(
      "Active collaboration not found"
    );
    error.statusCode = 404;
    error.code = "COLLABORATION_NOT_FOUND";
    throw error;
  }

  const isBrand =
    String(collaboration.brandId) ===
    String(userId);

  const isCreator =
    String(collaboration.creatorId) ===
    String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error(
      "You do not have access to this collaboration"
    );
    error.statusCode = 403;
    error.code = "COLLABORATION_ACCESS_DENIED";
    throw error;
  }

  // -----------------------------------------------
  // Validate progress
  // -----------------------------------------------

  if (
    progress !== undefined &&
    (typeof progress !== "number" ||
      progress < 0 ||
      progress > 100)
  ) {
    const error = new Error(
      "Progress must be between 0 and 100"
    );
    error.statusCode = 400;
    error.code = "INVALID_PROGRESS";
    throw error;
  }

  if (progress !== undefined) {
    collaboration.progress = progress;
  }

  if (status) {
    const allowedStatuses = [
      "active",
      "in_progress",
      "submitted",
      "completed",
      "cancelled",
      "disputed",
    ];

    if (!allowedStatuses.includes(status)) {
      const error = new Error(
        "Invalid collaboration status"
      );
      error.statusCode = 400;
      error.code = "INVALID_STATUS";
      throw error;
    }

    collaboration.status = status;

    if (status === "completed") {
      collaboration.progress = 100;
      collaboration.completedAt = new Date();
    }

    if (status === "cancelled") {
      collaboration.cancelledAt = new Date();
    }
  }

  if (notes !== undefined) {
    collaboration.notes = notes;
  }

  await collaboration.save();

  return collaboration;
};

// =====================================================
// COMPLETE COLLABORATION
// =====================================================

const completeCollaboration = async ({
  collaborationId,
  userId,
}) => {
  const collaboration =
    await ActiveCollaboration.findById(
      collaborationId
    );

  if (!collaboration) {
    const error = new Error(
      "Active collaboration not found"
    );
    error.statusCode = 404;
    error.code = "COLLABORATION_NOT_FOUND";
    throw error;
  }

  const isBrand =
    String(collaboration.brandId) ===
    String(userId);

  const isCreator =
    String(collaboration.creatorId) ===
    String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error(
      "You do not have access to this collaboration"
    );
    error.statusCode = 403;
    error.code = "COLLABORATION_ACCESS_DENIED";
    throw error;
  }

  if (
    collaboration.status === "completed"
  ) {
    return collaboration;
  }

  if (
    collaboration.status === "cancelled"
  ) {
    const error = new Error(
      "Cancelled collaboration cannot be completed"
    );
    error.statusCode = 400;
    error.code = "COLLABORATION_CANCELLED";
    throw error;
  }

  collaboration.status = "completed";
  collaboration.progress = 100;
  collaboration.completedAt = new Date();

  await collaboration.save();

  return collaboration;
};

// =====================================================
// CANCEL COLLABORATION
// =====================================================

const getById = async ({
  collaborationId,
  userId,
}) => {
  const collaboration =
    await ActiveCollaboration.findById(
      collaborationId
    )
      .populate(
        "campaignId",
        "title description category budget deadline status"
      )
      .populate(
        "negotiationId"
      )
      .lean();

  if (!collaboration) {
    const error = new Error(
      "Active collaboration not found"
    );

    error.statusCode = 404;
    error.code = "COLLABORATION_NOT_FOUND";

    throw error;
  }

  const isBrand =
    String(collaboration.brandId) ===
    String(userId);

  const isCreator =
    String(collaboration.creatorId) ===
    String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error(
      "You do not have access to this collaboration"
    );

    error.statusCode = 403;
    error.code = "COLLABORATION_ACCESS_DENIED";

    throw error;
  }

  return collaboration;
};
const cancelCollaboration = async ({
  collaborationId,
  userId,
  notes,
}) => {
  const collaboration =
    await ActiveCollaboration.findById(
      collaborationId
    );

  if (!collaboration) {
    const error = new Error(
      "Active collaboration not found"
    );

    error.statusCode = 404;
    error.code = "COLLABORATION_NOT_FOUND";

    throw error;
  }

  const isBrand =
    String(collaboration.brandId) ===
    String(userId);

  const isCreator =
    String(collaboration.creatorId) ===
    String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error(
      "You do not have access to this collaboration"
    );

    error.statusCode = 403;
    error.code = "COLLABORATION_ACCESS_DENIED";

    throw error;
  }

  if (collaboration.status === "completed") {
    const error = new Error(
      "Completed collaboration cannot be cancelled"
    );

    error.statusCode = 400;
    error.code = "COLLABORATION_COMPLETED";

    throw error;
  }

  collaboration.status = "cancelled";
  collaboration.cancelledAt = new Date();

  if (notes !== undefined) {
    collaboration.notes = notes;
  }

  await collaboration.save();

  return collaboration;
};
module.exports = {
  createFromNegotiation,
  getById,
  getBrandCollaborations,
  getCreatorCollaborations,
  updateProgress,
  completeCollaboration,
  cancelCollaboration,
};