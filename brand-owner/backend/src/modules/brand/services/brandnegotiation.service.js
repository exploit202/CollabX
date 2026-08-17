
// const Negotiation = require('../models/negotiation.model');
// const Invitation = require('../models/invitation.model');

// const createNegotiation = async (brandId, data) => {
//   const invitation = await Invitation.findOne({
//     _id: data.invitationId,
//     brandId
//   });

//   if (!invitation) {
//     const error = new Error('Invitation not found.');
//     error.statusCode = 404;
//     throw error;
//   }

//   if (invitation.status !== 'pending') {
//     const error = new Error(
//       'Negotiation can only be started from a pending invitation.'
//     );
//     error.statusCode = 400;
//     throw error;
//   }

//   const existingNegotiation = await Negotiation.findOne({
//     invitationId: invitation._id
//   });

//   if (existingNegotiation) {
//     const error = new Error(
//       'A negotiation already exists for this invitation.'
//     );
//     error.statusCode = 409;
//     throw error;
//   }

//   const negotiation = await Negotiation.create({
//     brandId,
//     invitationId: invitation._id,
//     recipientName: invitation.recipientName,
//     recipientEmail: invitation.recipientEmail,
//     proposedBudget: invitation.proposedBudget,
//     creatorId: invitation.creatorId,
//     currentBudget:
//       data.currentBudget ?? invitation.proposedBudget,
    
//       offers: [
//   {
//     senderId: brandId,
//     senderRole: 'brand',
//     senderName: 'Brand', // Later you can replace with the actual brand name
//     message: data.message || '',
//     proposedBudget:
//       data.currentBudget ?? invitation.proposedBudget
//   }
// ],
// lastActivity: new Date()
//   });

//   return negotiation;
// };

// const getBrandNegotiations = async (brandId) => {
//   return Negotiation.find({ brandId })
//     .populate('invitationId')
//     .sort({ createdAt: -1 });
// };

// const getNegotiationById = async (brandId, negotiationId) => {
//   return Negotiation.findOne({
//     _id: negotiationId,
//     brandId
//   }).populate('invitationId');
// };

// const updateNegotiation = async (
//   brandId,
//   negotiationId,
//   data
// ) => {
//   const negotiation = await Negotiation.findOne({
//     _id: negotiationId,
//     brandId
//   });

//   if (!negotiation) {
//     const error = new Error('Negotiation not found.');
//     error.statusCode = 404;
//     throw error;
//   }

//   if (negotiation.status !== 'open') {
//     const error = new Error(
//       'Only open negotiations can be updated.'
//     );
//     error.statusCode = 400;
//     throw error;
//   }

//   if (data.currentBudget !== undefined) {
//     negotiation.currentBudget = data.currentBudget;
//   }

//  if (
//   data.currentBudget !== undefined ||
//   data.message !== undefined
// ) {
//   negotiation.currentBudget =
//     data.currentBudget ?? negotiation.currentBudget;

//   negotiation.offers.push({
//     senderId: brandId,
//     senderRole: 'brand',
//     senderName: 'Brand',
//     message: data.message || '',
//     proposedBudget: negotiation.currentBudget
//   });

//   negotiation.lastActivity = new Date();
// }

//   await negotiation.save();

//   return negotiation;
// };

// const updateNegotiationStatus = async (
//   brandId,
//   negotiationId,
//   status
// ) => {
//   const negotiation = await Negotiation.findOne({
//     _id: negotiationId,
//     brandId
//   });

//   if (!negotiation) {
//     const error = new Error('Negotiation not found.');
//     error.statusCode = 404;
//     throw error;
//   }

//   if (!['agreed', 'rejected', 'closed'].includes(status))  {
//     const error = new Error('Invalid negotiation status.');
//     error.statusCode = 400;
//     throw error;
//   }

//   negotiation.status = status;

//   await negotiation.save();

//   return negotiation;
// };

// module.exports = {
//   createNegotiation,
//   getBrandNegotiations,
//   getNegotiationById,
//   updateNegotiation,
//   updateNegotiationStatus
// };
const Negotiation = require('../models/negotiation.model');
const Invitation = require('../models/invitation.model');
const { getIO } = require('../../../socket/socket.manager');

const createNegotiation = async (brandId, data) => {
  const invitation = await Invitation.findOne({
    _id: data.invitationId,
    brandId
  });

  if (!invitation) {
    const error = new Error('Invitation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (invitation.status !== 'pending') {
    const error = new Error(
      'Negotiation can only be started from a pending invitation.'
    );
    error.statusCode = 400;
    throw error;
  }

  const existingNegotiation = await Negotiation.findOne({
    invitationId: invitation._id
  });

  if (existingNegotiation) {
    const error = new Error(
      'A negotiation already exists for this invitation.'
    );
    error.statusCode = 409;
    throw error;
  }

  const currentBudget =
    data.currentBudget ?? invitation.proposedPrice;

  const negotiation = await Negotiation.create({
    invitationId: invitation._id,

    campaignId: invitation.campaignId ?? data.campaignId ?? null,
    campaignName: invitation.campaignTitle || '',

    brandId: invitation.brandId,
    brandName: invitation.brandName || data.brandName || '',

    creatorId: invitation.creatorId,
    creatorName: invitation.creatorName || '',

    proposedBudget: invitation.proposedPrice,
    currentBudget,

    offers: [
      {
        senderId: brandId,
        senderRole: 'brand',
        senderName: data.brandName || invitation.brandName || 'Brand',
        senderAvatar: data.brandAvatar || '',
        message: data.message || '',
        proposedBudget: currentBudget,
        status: 'offered'
      }
    ],

    lastActivity: new Date()
  });

  console.log('=================================');
  console.log('✅ NEGOTIATION CREATED');
  console.log('Negotiation ID:', negotiation._id.toString());
  console.log('Invitation ID:', negotiation.invitationId.toString());
  console.log('Brand ID:', negotiation.brandId.toString());
  console.log('Creator ID:', negotiation.creatorId.toString());
  console.log('Campaign ID:', negotiation.campaignId);
  console.log('Campaign Name:', negotiation.campaignName);
  console.log('=================================');

  return negotiation;
};


const getBrandNegotiations = async (brandId) => {
  return Negotiation.find({ brandId })
    .populate('invitationId')
    .sort({ createdAt: -1 });
};


const getNegotiationById = async (brandId, negotiationId) => {
  return Negotiation.findOne({
    _id: negotiationId,
    brandId
  }).populate('invitationId');
};


const updateNegotiation = async (
  brandId,
  negotiationId,
  data
) => {
  const negotiation = await Negotiation.findOne({
    _id: negotiationId,
    brandId
  });

  if (!negotiation) {
    const error = new Error('Negotiation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (negotiation.status !== 'open') {
    const error = new Error(
      'Only open negotiations can be updated.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (data.currentBudget !== undefined) {
    negotiation.currentBudget = data.currentBudget;
  }

  if (
    data.currentBudget !== undefined ||
    data.message !== undefined
  ) {
    negotiation.offers.push({
      senderId: brandId,
      senderRole: 'brand',
      senderName: data.brandName || 'Brand',
      senderAvatar: data.brandAvatar || '',
      message: data.message || '',
      proposedBudget:
        data.currentBudget ?? negotiation.currentBudget,
      status: 'countered'
    });

    negotiation.lastActivity = new Date();
  }

  await negotiation.save();

  return negotiation;
};


const addOffer = async (negotiationId, sender) => {
  const negotiation = await Negotiation.findById(negotiationId);

  if (!negotiation) {
    const error = new Error('Negotiation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (negotiation.status !== 'open') {
    const error = new Error(
      'Messages can only be sent in an open negotiation.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    !sender.message &&
    sender.proposedBudget === undefined
  ) {
    const error = new Error(
      'Message or proposedBudget is required.'
    );
    error.statusCode = 400;
    throw error;
  }

  const isBrand =
    negotiation.brandId.toString() ===
    sender.senderId.toString();

  const isCreator =
    negotiation.creatorId &&
    negotiation.creatorId.toString() ===
      sender.senderId.toString();

  if (!isBrand && !isCreator) {
    const error = new Error(
      'You are not a participant in this negotiation.'
    );
    error.statusCode = 403;
    throw error;
  }

  const offer = {
    senderId: sender.senderId,
    senderRole: sender.senderRole,
    senderName: sender.senderName|| 'Brand',
    senderAvatar: sender.senderAvatar || '',
    message: sender.message || '',
    proposedBudget:
      sender.proposedBudget ?? negotiation.currentBudget,
    attachmentUrl: sender.attachmentUrl || '',
    attachmentName: sender.attachmentName || '',
    attachmentType: sender.attachmentType || null,
    status: 'countered'
  };

  negotiation.offers.push(offer);

  if (sender.proposedBudget !== undefined) {
    negotiation.currentBudget = sender.proposedBudget;
  }

  negotiation.lastActivity = new Date();

  await negotiation.save();
    const io = getIO();

    const roomName = `negotiation:${negotiation._id}`;

    io.to(roomName).emit('negotiation:offer', {
  negotiationId: negotiation._id.toString(),
  offer: negotiation.offers[negotiation.offers.length - 1]
});


  return negotiation;
};


const updateNegotiationStatus = async (
  userId,
  negotiationId,
  status
) => {
  const negotiation = await Negotiation.findById(negotiationId);

  if (!negotiation) {
    const error = new Error('Negotiation not found.');
    error.statusCode = 404;
    throw error;
  }

  // Only allow final actions while negotiation is open
  if (negotiation.status !== 'open') {
    const error = new Error(
      'This negotiation is no longer open.'
    );
    error.statusCode = 400;
    throw error;
  }

  if (!['agreed', 'rejected'].includes(status)) {
    const error = new Error(
      'Invalid negotiation status.'
    );
    error.statusCode = 400;
    throw error;
  }

  const isBrand =
    negotiation.brandId &&
    negotiation.brandId.toString() === userId.toString();

  const isCreator =
    negotiation.creatorId &&
    negotiation.creatorId.toString() === userId.toString();

  if (!isBrand && !isCreator) {
    const error = new Error(
      'You are not a participant in this negotiation.'
    );
    error.statusCode = 403;
    throw error;
  }

  negotiation.status = status;
  negotiation.lastActivity = new Date();

  if (status === 'agreed') {
    negotiation.agreedBudget =
      negotiation.currentBudget;
  }

  await negotiation.save();

  // Real-time notification to both participants
  const io = getIO();

  const roomName =
    `negotiation:${negotiation._id.toString()}`;

  io.to(roomName).emit('negotiation:status', {
    negotiationId: negotiation._id.toString(),
    status: negotiation.status,
    agreedBudget: negotiation.agreedBudget ?? null,
    updatedBy: {
      userId: userId.toString(),
      role: isBrand ? 'brand' : 'creator'
    }
  });

  return negotiation;
};


module.exports = {
  createNegotiation,
  getBrandNegotiations,
  getNegotiationById,
  updateNegotiation,
  updateNegotiationStatus,
  addOffer
};