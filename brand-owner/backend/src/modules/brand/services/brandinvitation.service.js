const Invitation = require('../models/invitation.model');
const Notification = require('../models/notification.model');
const User = require('../../auth/models/user.model');
const Campaign = require('../models/campaign');

// =====================================================
// CREATE INVITATION
// =====================================================

const createInvitation = async (brandId, invitationData) => {
  console.log('brandId received:', brandId);

  // 1. Verify authenticated Brand
  const brand = await User.findOne({
    _id: brandId,
    role: 'brand',
    isActive: true
  });

  if (!brand) {
    const error = new Error('Brand not found.');
    error.statusCode = 404;
    throw error;
  }

  // 2. Campaign validation
  console.log("========== CAMPAIGN DEBUG ==========");
console.log("Incoming campaignId:", invitationData.campaignId);
console.log("Campaign DB:", Campaign.db.name);
console.log("Campaign collection:", Campaign.collection.name);

const campaign = await Campaign.findById(invitationData.campaignId);

console.log("Campaign found:", !!campaign);

if (campaign) {
  console.log("Campaign ID:", campaign._id.toString());
  console.log("Campaign brandId:", campaign.brandId?.toString());
  console.log("Campaign status:", campaign.status);
}

console.log("====================================");

if (!campaign) {
  const error = new Error("Campaign not found.");
  error.statusCode = 404;
  throw error;
}



  // 3. Make sure this campaign belongs to the logged-in brand
  if (String(campaign.brandId) !== String(brandId)) {
    const error = new Error(
      'You can only send invitations for your own campaigns.'
    );
    error.statusCode = 403;
    throw error;
  }

  // 4. Campaign must be active
  if (campaign.status !== 'active') {
    const error = new Error(
      'Invitation can only be sent for an active campaign.'
    );
    error.statusCode = 400;
    throw error;
  }

  // 5. Creator ID
  const creatorId = invitationData.creatorId;

  if (!creatorId) {
    const error = new Error('creatorId is required.');
    error.statusCode = 400;
    throw error;
  }

  console.log('CREATOR ID RECEIVED:', creatorId);

  // 6. Verify Creator exists and is active
  const creator = await User.findOne({
    _id: creatorId,
    role: 'creator',
    isActive: true
  });

  if (!creator) {
    const error = new Error('Creator not found.');
    error.statusCode = 404;
    throw error;
  }

  // 7. Prevent duplicate active invitations
  const existingInvitation = await Invitation.findOne({
    campaignId: campaign._id,
    creatorId,
    status: {
      $in: ['pending', 'negotiating']
    }
  });

  if (existingInvitation) {
    const error = new Error(
      'An active invitation already exists for this creator.'
    );
    error.statusCode = 409;
    throw error;
  }

  const proposedPrice =
    invitationData.proposedPrice ?? invitationData.offeredBudget;

  if (proposedPrice === undefined || proposedPrice === null) {
    const error = new Error(
      'Invitation price is required.'
    );
    error.statusCode = 400;
    throw error;
  }

  // 8. Create invitation
  const invitation = await Invitation.create({
    campaignId: campaign._id,

    campaignTitle: campaign.title,

    // Brand information
    brandId: brand._id,
    brandName: brand.fullName,
    brandLogo: brand.profileImage || '',

    // Creator information
    creatorId: creator._id,
    creatorName: creator.fullName,
    creatorAvatar: creator.profileImage || '',

    proposedPrice,

    deliverables: invitationData.deliverables || [],

    message: invitationData.message || '',

    status: 'pending',

    sentDate: new Date(),
  });

  console.log(
    '✅ INVITATION CREATED:',
    invitation._id.toString()
  );

  // 9. Notify Creator
  const notification = await Notification.create({
    userId: creatorId,
    type: 'invitation',
    title: 'New Invitation',
    message: `You have received a new invitation from ${brand.fullName} for ${invitation.campaignTitle}.`,
    relatedId: invitation._id
  });

  console.log('========== INVITATION DB DEBUG ==========');
  console.log('Database:', Invitation.db.name);
  console.log('Collection:', Invitation.collection.name);
  console.log('Invitation ID:', invitation._id.toString());

  const verifyInvitation = await Invitation
    .findById(invitation._id)
    .lean();

  console.log(
    'FOUND IMMEDIATELY AFTER CREATE:',
    !!verifyInvitation
  );

  if (verifyInvitation) {
    console.log(
      'Verified invitation:',
      verifyInvitation
    );
  }

  console.log('==========================================');

  console.log(
    '✅ NOTIFICATION CREATED:',
    notification._id.toString()
  );

  console.log(
    '   userId:',
    notification.userId.toString()
  );

  console.log(
    '   type:',
    notification.type
  );

  console.log(
    '   relatedId:',
    notification.relatedId.toString()
  );

  return invitation;
};

// =====================================================
// GET BRAND INVITATIONS
// =====================================================

const getBrandInvitations = async (brandId) => {
  return Invitation.find({ brandId })
    .sort({ createdAt: -1 });
};

// =====================================================
// GET INVITATION BY ID
// =====================================================

const getInvitationById = async (
  brandId,
  invitationId
) => {
  return Invitation.findOne({
    _id: invitationId,
    brandId
  });
};

// =====================================================
// CANCEL INVITATION
// =====================================================

const cancelInvitation = async (
  brandId,
  invitationId
) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    brandId
  });

  if (!invitation) {
    const error = new Error(
      'Invitation not found.'
    );
    error.statusCode = 404;
    throw error;
  }

  // Brand can cancel pending or negotiating invitation
  if (
    !['pending', 'negotiating'].includes(
      invitation.status
    )
  ) {
    const error = new Error(
      `Invitation cannot be cancelled because it is already ${invitation.status}.`
    );
    error.statusCode = 400;
    throw error;
  }

  invitation.status = 'cancelled';

  await invitation.save();

  // Notify creator
  await Notification.create({
    userId: invitation.creatorId,
    type: 'invitation',
    title: 'Invitation Cancelled',
    message: `The invitation from ${invitation.brandName} for ${invitation.campaignTitle} has been cancelled by the brand.`,
    relatedId: invitation._id
  });

  return invitation;
};

module.exports = {
  createInvitation,
  getBrandInvitations,
  getInvitationById,
  cancelInvitation
};