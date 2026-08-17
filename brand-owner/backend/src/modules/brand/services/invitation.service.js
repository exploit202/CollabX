const Invitation = require("../models/invitation.model");
const Campaign = require("../models/campaign");
const User = require("../../auth/models/user.model");

// =====================================================
// CREATE INVITATION
// =====================================================

const createInvitation = async ({
  campaignId,
  brandId,
  creatorId,
  proposedPrice,
  deliverables,
  message,
  expiresAt,
}) => {
   const campaign = await Campaign.findOne({
  _id: campaignId
});

console.log("========== CAMPAIGN DEBUG ==========");
console.log("ID:", campaignId);
console.log("DB:", Campaign.db.name);
console.log("COLLECTION:", Campaign.collection.name);
console.log("FOUND:", !!campaign);
console.log("====================================");


  if (!campaign) {
    const error = new Error("Campaign not found");
    error.statusCode = 404;
    error.code = "CAMPAIGN_NOT_FOUND";
    throw error;
  }

  // Only campaign owner can send invitations
  if (String(campaign.brandId) !== String(brandId)) {
    const error = new Error(
      "You can only send invitations for your own campaigns"
    );
    error.statusCode = 403;
    error.code = "CAMPAIGN_ACCESS_DENIED";
    throw error;
  }

  // Invitation should be sent only for active campaigns
  if (campaign.status !== "active") {
    const error = new Error(
      "Invitation can only be sent for an active campaign"
    );
    error.statusCode = 400;
    error.code = "CAMPAIGN_NOT_ACTIVE";
    throw error;
  }

  const creator = await User.findOne({
    _id: creatorId,
    role: "creator",
    isActive: true,
  });

  if (!creator) {
    const error = new Error("Creator not found");
    error.statusCode = 404;
    error.code = "CREATOR_NOT_FOUND";
    throw error;
  }

  // Prevent duplicate pending/negotiating invitations
  const existingInvitation = await Invitation.findOne({
    campaignId,
    creatorId,
    status: {
      $in: ["pending", "negotiating"],
    },
  });

  if (existingInvitation) {
    const error = new Error(
      "An active invitation already exists for this creator"
    );
    error.statusCode = 409;
    error.code = "INVITATION_ALREADY_EXISTS";
    throw error;
  }

  const invitation = await Invitation.create({
    campaignId,
    campaignTitle: campaign.title,

    brandId,
    brandName: campaign.brandName || "Brand",
    brandLogo: campaign.brandImage || "",

    creatorId,
    creatorName: creator.fullName,
    creatorAvatar: creator.profileImage || "",

    proposedPrice,
    deliverables: deliverables || [],
    message: message || "",

    status: "pending",

    sentDate: new Date(),

    expiresAt: expiresAt
      ? new Date(expiresAt)
      : null,
  });

  // Update campaign invitation/application count
  await Campaign.findByIdAndUpdate(
    campaignId,
    {
      $inc: {
        applicationsCount: 1,
      },
    }
  );

  return invitation;
};

// =====================================================
// GET BRAND INVITATIONS
// =====================================================

const getBrandInvitations = async (
  brandId,
  filters = {}
) => {
  const query = {
    brandId,
  };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.campaignId) {
    query.campaignId = filters.campaignId;
  }

  return Invitation.find(query)
    .populate(
      "campaignId",
      "title description category budget deadline status"
    )
    .populate(
      "creatorId",
      "fullName email profileImage"
    )
    .sort({ createdAt: -1 })
    .lean();
};

// =====================================================
// GET CREATOR INVITATIONS
// =====================================================

const getCreatorInvitations = async (
  creatorId,
  filters = {}
) => {
  const query = {
    creatorId,
  };

  if (filters.status) {
    query.status = filters.status;
  }

  return Invitation.find(query)
    .populate(
      "campaignId",
      "title description category budget deliverables requirements deadline status brandName brandImage"
    )
    .populate(
      "brandId",
      "fullName email profileImage"
    )
    .sort({ createdAt: -1 })
    .lean();
};

// =====================================================
// GET SINGLE INVITATION
// =====================================================

const getInvitationById = async (
  invitationId,
  userId
) => {
  const invitation = await Invitation.findById(
    invitationId
  )
    .populate(
      "campaignId",
      "title description category budget deliverables requirements deadline status brandName brandImage"
    )
    .populate(
      "brandId",
      "fullName email profileImage"
    )
    .populate(
      "creatorId",
      "fullName email profileImage"
    )
    .lean();

  if (!invitation) {
    const error = new Error(
      "Invitation not found"
    );
    error.statusCode = 404;
    error.code = "INVITATION_NOT_FOUND";
    throw error;
  }

  const isBrand =
    String(invitation.brandId?._id) ===
    String(userId);

  const isCreator =
    String(invitation.creatorId?._id) ===
    String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error(
      "You do not have access to this invitation"
    );
    error.statusCode = 403;
    error.code = "INVITATION_ACCESS_DENIED";
    throw error;
  }

  return invitation;
};

// =====================================================
// RESPOND TO INVITATION
// =====================================================

const respondToInvitation = async ({
  invitationId,
  creatorId,
  action,
}) => {
  const invitation = await Invitation.findById(
    invitationId
  );

  if (!invitation) {
    const error = new Error(
      "Invitation not found"
    );
    error.statusCode = 404;
    error.code = "INVITATION_NOT_FOUND";
    throw error;
  }

  if (
    String(invitation.creatorId) !==
    String(creatorId)
  ) {
    const error = new Error(
      "Only the invited creator can respond"
    );
    error.statusCode = 403;
    error.code = "INVITATION_RESPONSE_DENIED";
    throw error;
  }

  if (invitation.status !== "pending") {
    const error = new Error(
      "This invitation can no longer be responded to"
    );
    error.statusCode = 400;
    error.code = "INVITATION_NOT_PENDING";
    throw error;
  }

  if (
    invitation.expiresAt &&
    invitation.expiresAt < new Date()
  ) {
    invitation.status = "expired";
    await invitation.save();

    const error = new Error(
      "This invitation has expired"
    );
    error.statusCode = 400;
    error.code = "INVITATION_EXPIRED";
    throw error;
  }

  if (action === "accept") {
    // Accepted invitation moves into negotiation
    invitation.status = "negotiating";
  } else {
    invitation.status = "rejected";
  }

  invitation.respondedAt = new Date();

  await invitation.save();

  return invitation;
};

// =====================================================
// CANCEL INVITATION
// =====================================================

const cancelInvitation = async ({
  invitationId,
  brandId,
}) => {
  const invitation = await Invitation.findById(
    invitationId
  );

  if (!invitation) {
    const error = new Error(
      "Invitation not found"
    );
    error.statusCode = 404;
    error.code = "INVITATION_NOT_FOUND";
    throw error;
  }

  if (
    String(invitation.brandId) !==
    String(brandId)
  ) {
    const error = new Error(
      "Only the invitation's brand can cancel it"
    );
    error.statusCode = 403;
    error.code = "INVITATION_CANCEL_DENIED";
    throw error;
  }

  if (
    !["pending", "negotiating"].includes(
      invitation.status
    )
  ) {
    const error = new Error(
      "This invitation cannot be cancelled"
    );
    error.statusCode = 400;
    error.code = "INVITATION_NOT_CANCELLABLE";
    throw error;
  }

  invitation.status = "cancelled";
  invitation.respondedAt = new Date();

  await invitation.save();

  return invitation;
};

module.exports = {
  createInvitation,
  getBrandInvitations,
  getCreatorInvitations,
  getInvitationById,
  respondToInvitation,
  cancelInvitation,
};