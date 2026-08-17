// const mongoose = require('mongoose');
// const Invitation = require('../models/Invitation.model');
// const Negotiation = require('../models/Negotiation.model');
// const Collaboration = require('../models/Collaboration.model');

// // Helper to safely format or convert string IDs to ObjectId
// const cleanIdString = (id) => {
//   if (!id) return '';
//   return String(id).replace(/%0A|%0D|[\r\n\s]+/gi, '').trim();
// };

// const toObjectId = (id) => {
//   const clean = cleanIdString(id);
//   if (!clean) return new mongoose.Types.ObjectId();
//   if (mongoose.Types.ObjectId.isValid(clean)) {
//     return new mongoose.Types.ObjectId(clean);
//   }
//   const hex = Buffer.from(clean).toString('hex').padEnd(24, '0').slice(0, 24);
//   return new mongoose.Types.ObjectId(hex);
// };

// // In-Memory Fallback Store for Offline / No MongoDB Environment
// const inMemoryRequests = [];

// const isDbConnected = () => mongoose.connection.readyState === 1;

// /**
//  * Get collaboration requests / invitations for a specific creator
//  */
// const getCreatorRequests = async (creatorId, status) => {
//   if (isDbConnected()) {
//     const query = {};
//     if (creatorId) {
//       query.creatorId = toObjectId(creatorId);
//     }
//     if (status) query.status = status;
//     return await Invitation.find(query).sort({ createdAt: -1 });
//   }

//   const filtered = inMemoryRequests.filter((req) => !status || req.status === status);
//   return filtered.length > 0 ? filtered : inMemoryRequests;
// };

// /**
//  * Respond to an invitation (accept, reject, or negotiate)
//  */
// const respondToInvitation = async (invitationId, creatorId, status) => {
//   const cleanInvId = cleanIdString(invitationId);
//   if (!mongoose.Types.ObjectId.isValid(cleanInvId)) {
//     throw new Error(`Invalid Invitation ID format '${cleanInvId}'.`);
//   }

//   const invObjId = new mongoose.Types.ObjectId(cleanInvId);

//   if (isDbConnected()) {
//     let invitation = await Invitation.findById(invObjId);
//     if (!invitation) {
//       throw new Error(`Invitation '${cleanInvId}' not found.`);
//     }

//     invitation.status = status;
//     await invitation.save();

//     let activeCollaboration = null;
//     let negotiationRoom = null;

//     if (status === 'accepted') {
//       const deadlineDate = new Date();
//       deadlineDate.setDate(deadlineDate.getDate() + 14);

//       activeCollaboration = await Collaboration.create({
//         campaignId: invitation.campaignId ? String(invitation.campaignId) : `camp-${Date.now()}`,
//         campaignTitle: invitation.campaignTitle,
//         brandId: String(invitation.brandId),
//         brandName: invitation.brandName,
//         brandLogo: invitation.brandLogo || '',
//         creatorId: String(invitation.creatorId),
//         creatorName: invitation.creatorName,
//         creatorAvatar: invitation.creatorAvatar || '',
//         deliverableType: Array.isArray(invitation.deliverables) ? invitation.deliverables.join(', ') : 'Agreed Deliverables',
//         agreedPrice: invitation.proposedPrice,
//         stage: 'agreement_finalized',
//         startDate: new Date().toISOString().split('T')[0],
//         deadline: deadlineDate.toISOString().split('T')[0],
//       });
//     } else if (status === 'negotiating') {
//       negotiationRoom = await Negotiation.findOne({ invitationId: invitation._id });

//       if (!negotiationRoom) {
//         const brandObjId = invitation.brandId;
//         const creatorObjId = invitation.creatorId;
//         const campaignObjId = invitation.campaignId;
//         const price = invitation.proposedPrice;

//         negotiationRoom = await Negotiation.create({
//           invitationId: invitation._id,
//           campaignId: campaignObjId,
//           campaignName: invitation.campaignTitle,
//           brandId: brandObjId,
//           brandName: invitation.brandName,
//           brandLogo: invitation.brandLogo || '',
//           creatorId: creatorObjId,
//           creatorName: invitation.creatorName,
//           creatorAvatar: invitation.creatorAvatar || '',
//           proposedBudget: price,
//           currentBudget: price,
//           status: 'open',
//           offers: [
//             {
//               senderId: brandObjId,
//               senderRole: 'brand',
//               senderName: invitation.brandName,
//               senderAvatar: invitation.brandLogo || '',
//               message: invitation.message || 'Initial Campaign Invitation Offer',
//               proposedBudget: price,
//               status: 'offered',
//               isRead: false,
//             },
//           ],
//           lastActivity: new Date(),
//         });
//       }
//     }

//     return { invitation, collaboration: activeCollaboration, negotiation: negotiationRoom };
//   }

//   // In-Memory Mode
//   const invIndex = inMemoryRequests.findIndex((i) => String(i._id) === cleanInvId || String(i.id) === cleanInvId);
//   if (invIndex !== -1) {
//     inMemoryRequests[invIndex].status = status;
//     return { invitation: inMemoryRequests[invIndex], collaboration: null, negotiation: null };
//   }

//   return { invitation: inMemoryRequests[0], collaboration: null, negotiation: null };
// };

// module.exports = {
//   getCreatorRequests,
//   respondToInvitation,
//   inMemoryRequests,
// };


const mongoose = require('mongoose');
const Invitation = require('../models/Invitation.model');
const Negotiation = require('../models/Negotiation.model');
const Collaboration = require('../models/Collaboration.model');

// Helper to safely format or convert string IDs to ObjectId
const cleanIdString = (id) => {
  if (!id) return '';
  return String(id).replace(/%0A|%0D|[\r\n\s]+/gi, '').trim();
};

const toObjectId = (id) => {
  const clean = cleanIdString(id);

  if (!clean) {
    return new mongoose.Types.ObjectId();
  }

  if (mongoose.Types.ObjectId.isValid(clean)) {
    return new mongoose.Types.ObjectId(clean);
  }

  const hex = Buffer.from(clean)
    .toString('hex')
    .padEnd(24, '0')
    .slice(0, 24);

  return new mongoose.Types.ObjectId(hex);
};

// In-Memory Fallback Store for Offline / No MongoDB Environment
const inMemoryRequests = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Get collaboration requests / invitations for a specific creator
 */
const getCreatorRequests = async (creatorId, status) => {
  if (isDbConnected()) {
    const query = {};

    if (creatorId) {
      query.creatorId = toObjectId(creatorId);
    }

    if (status) {
      query.status = status;
    }

    return await Invitation.find(query).sort({ createdAt: -1 });
  }

  const filtered = inMemoryRequests.filter(
    (req) => !status || req.status === status
  );

  return filtered.length > 0 ? filtered : inMemoryRequests;
};

/**
 * Respond to an invitation (accept, reject, or negotiate)
 */
const respondToInvitation = async (invitationId, creatorId, status) => {
  const cleanInvId = cleanIdString(invitationId);

  if (!mongoose.Types.ObjectId.isValid(cleanInvId)) {
    throw new Error(`Invalid Invitation ID format '${cleanInvId}'.`);
  }

  const invObjId = new mongoose.Types.ObjectId(cleanInvId);

  if (isDbConnected()) {
    const invitation = await Invitation.findById(invObjId);

    if (!invitation) {
      throw new Error(`Invitation '${cleanInvId}' not found.`);
    }

    // Ensure the authenticated creator owns this invitation
    if (String(invitation.creatorId) !== String(creatorId)) {
      const error = new Error(
        'Unauthorized access to this invitation.'
      );
      error.statusCode = 403;
      throw error;
    }

    invitation.status = status;
    await invitation.save();

    let activeCollaboration = null;
    let negotiationRoom = null;

    if (status === 'accepted') {
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + 14);

      activeCollaboration = await Collaboration.create({
        campaignId: invitation.campaignId
          ? String(invitation.campaignId)
          : `camp-${Date.now()}`,
        campaignTitle: invitation.campaignTitle,
        brandId: String(invitation.brandId),
        brandName: invitation.brandName,
        brandLogo: invitation.brandLogo || '',
        creatorId: String(invitation.creatorId),
        creatorName: invitation.creatorName,
        creatorAvatar: invitation.creatorAvatar || '',
        deliverableType: Array.isArray(invitation.deliverables)
          ? invitation.deliverables.join(', ')
          : 'Agreed Deliverables',
        agreedPrice: invitation.proposedPrice,
        stage: 'agreement_finalized',
        startDate: new Date().toISOString().split('T')[0],
        deadline: deadlineDate.toISOString().split('T')[0],
      });
    } else if (status === 'negotiating') {
      negotiationRoom = await Negotiation.findOne({
        invitationId: invitation._id,
      });

      if (!negotiationRoom) {
        const brandObjId = invitation.brandId;
        const creatorObjId = invitation.creatorId;
        const campaignObjId = invitation.campaignId;
        const price = invitation.proposedPrice;

        negotiationRoom = await Negotiation.create({
          invitationId: invitation._id,
          campaignId: campaignObjId,
          campaignName: invitation.campaignTitle,
          brandId: brandObjId,
          brandName: invitation.brandName,
          brandLogo: invitation.brandLogo || '',
          creatorId: creatorObjId,
          creatorName: invitation.creatorName,
          creatorAvatar: invitation.creatorAvatar || '',
          proposedBudget: price,
          currentBudget: price,
          status: 'open',
          offers: [
            {
              senderId: brandObjId,
              senderRole: 'brand',
              senderName: invitation.brandName,
              senderAvatar: invitation.brandLogo || '',
              message:
                invitation.message ||
                'Initial Campaign Invitation Offer',
              proposedBudget: price,
              status: 'offered',
              isRead: false,
            },
          ],
          lastActivity: new Date(),
        });
      }
    }

    return {
      invitation,
      collaboration: activeCollaboration,
      negotiation: negotiationRoom,
    };
  }

  // In-Memory Mode
  const invIndex = inMemoryRequests.findIndex(
    (i) =>
      String(i._id) === cleanInvId ||
      String(i.id) === cleanInvId
  );

  if (invIndex !== -1) {
    // Ensure the authenticated creator owns this invitation
    if (
      String(inMemoryRequests[invIndex].creatorId) !==
      String(creatorId)
    ) {
      const error = new Error(
        'Unauthorized access to this invitation.'
      );
      error.statusCode = 403;
      throw error;
    }

    inMemoryRequests[invIndex].status = status;

    return {
      invitation: inMemoryRequests[invIndex],
      collaboration: null,
      negotiation: null,
    };
  }

  return {
    invitation: null,
    collaboration: null,
    negotiation: null,
  };
};

module.exports = {
  getCreatorRequests,
  respondToInvitation,
  inMemoryRequests,
};