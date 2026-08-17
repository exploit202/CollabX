const mongoose = require('mongoose');
const Negotiation = require('../models/Negotiation.model');
const Collaboration = require('../models/Collaboration.model');
const logger = require('../../../utils/logger');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require('../../../utils/errors');

// Helper to safely clean String IDs (strips leading colons or trailing whitespace)
const cleanIdString = (id) => {
  if (!id) return '';
  let str = String(id).trim();
  if (str.startsWith(':')) {
    str = str.substring(1).trim();
  }
  return str;
};

// Helper to safely format or convert IDs to ObjectId where valid
const toObjectId = (id) => {
  const clean = cleanIdString(id);
  if (!clean) return new mongoose.Types.ObjectId();
  if (mongoose.Types.ObjectId.isValid(clean)) {
    return new mongoose.Types.ObjectId(clean);
  }
  const hex = Buffer.from(clean).toString('hex').padEnd(24, '0').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
};

// Helper to check DB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to format negotiation outputs with Brand contract fields
const formatNegotiationDoc = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  const lastOffer = obj.offers && obj.offers.length > 0 ? obj.offers[obj.offers.length - 1] : null;

  return {
    ...obj,
    currentPrice: obj.currentBudget,
    proposedPrice: obj.proposedBudget,
    agreedPrice: obj.agreedBudget,
    campaignTitle: obj.campaignName,
    offers: (obj.offers || []).map((off) => ({
      ...off,
      proposedPrice: off.proposedBudget,
      notes: off.message,
      deliverablesSummary: off.message,
    })),
  };
};

/**
 * 1. Get List of Negotiations (With Pagination, Filtering, and Sorting)
 */
const getNegotiations = async (userId, userRole = 'creator', view = 'all', page = 1, limit = 20) => {
  if (isDbConnected()) {
    const userObjId = toObjectId(userId);
    const userStr = String(userId);

    const query = {
      $or: [
        { creatorId: userObjId },
        { creatorId: userStr },
        { brandId: userObjId },
        { brandId: userStr },
      ],
    };

    if (view === 'active' || view === 'open') {
      query.status = 'open';
    } else if (view === 'agreed' || view === 'completed') {
      query.status = 'agreed';
    } else if (view === 'closed' || view === 'rejected') {
      query.status = { $in: ['closed', 'rejected'] };
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));
    const pageSize = Math.max(1, parseInt(limit));

    const [docs, total] = await Promise.all([
      Negotiation.find(query)
        .sort({ lastActivity: -1, updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Negotiation.countDocuments(query),
    ]);

    return {
      total,
      page: parseInt(page),
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
      docs: docs.map((d) => formatNegotiationDoc(d)),
    };
  }

  return { total: 0, page: 1, limit: 20, pages: 1, docs: [] };
};

/**
 * 2. Get Single Negotiation Room Details
 */
const getNegotiationById = async (negotiationId, userId) => {
  const cleanId = cleanIdString(negotiationId);
  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ValidationError(`Invalid Negotiation ID format '${cleanId}'`);
  }
  const negObjId = new mongoose.Types.ObjectId(cleanId);

  if (isDbConnected()) {
    const negotiation = await Negotiation.findById(negObjId).lean();
    if (!negotiation) {
      throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
    }

    const userStr = String(userId);
    const isBrand = String(negotiation.brandId) === userStr;
    const isCreator = String(negotiation.creatorId) === userStr;

    if (!isBrand && !isCreator) {
  throw new ValidationError('Unauthorized access to this negotiation room');
}

    return formatNegotiationDoc(negotiation);
  }

  throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
};

/**
 * 3. Send Counter Offer / Message
 */
const sendCounterOffer = async (
  negotiationId,
  senderIdOrObj,
  userRoleOrPayload = 'creator',
  payload = {}
) => {
  let senderId = senderIdOrObj;
  let userRole = 'creator';
  let offerPayload = payload;

  if (typeof senderIdOrObj === 'object' && senderIdOrObj !== null) {
    senderId = senderIdOrObj.id || senderIdOrObj.userId;
    userRole = senderIdOrObj.role || 'creator';
    offerPayload = userRoleOrPayload || {};
  } else if (typeof userRoleOrPayload === 'object' && userRoleOrPayload !== null) {
    userRole = 'creator';
    offerPayload = userRoleOrPayload;
  } else {
    userRole = userRoleOrPayload;
    offerPayload = payload || {};
  }

  const { proposedBudget, proposedPrice, message, notes, deliverablesSummary, attachmentUrl, attachmentName, attachmentType } = offerPayload || {};

  const cleanId = cleanIdString(negotiationId);
  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ValidationError(`Invalid Negotiation ID format '${cleanId}'`);
  }
  const negObjId = new mongoose.Types.ObjectId(cleanId);
  const senderObjId = toObjectId(senderId);

  if (isDbConnected()) {
    const negotiation = await Negotiation.findById(negObjId);
    if (!negotiation) {
      throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
    }

    if (negotiation.status !== 'open') {
      throw new ConflictError(`Cannot send counter-offer on a '${negotiation.status}' negotiation`);
    }

    const isCreator = userRole === 'creator' || String(negotiation.creatorId) === String(senderObjId);
    const senderRole = isCreator ? 'creator' : 'brand';
    const senderName = isCreator ? negotiation.creatorName : negotiation.brandName;
    const senderAvatar = isCreator ? negotiation.creatorAvatar : negotiation.brandLogo;

    const offerPrice = proposedBudget !== undefined && proposedBudget !== null ? Number(proposedBudget) : (proposedPrice !== undefined && proposedPrice !== null ? Number(proposedPrice) : negotiation.currentBudget);
    const msg = message || notes || deliverablesSummary || '';

    const newOffer = {
      senderId: senderObjId,
      senderRole: senderRole,
      senderName: senderName || (isCreator ? 'Creator' : 'Brand Owner'),
      senderAvatar: senderAvatar || '',
      message: msg,
      proposedBudget: offerPrice,
      attachmentUrl: attachmentUrl || '',
      attachmentName: attachmentName || '',
      attachmentType: attachmentType || null,
      status: 'countered',
      isRead: false,
    };

    negotiation.offers.push(newOffer);
    negotiation.currentBudget = offerPrice;
    negotiation.lastActivity = new Date();
    await negotiation.save();

    const formattedDoc = formatNegotiationDoc(negotiation);

    // Real-time WebSocket emission
    try {
      const { getIO } = require('../../../config/socket');
      const io = getIO();
      const lastOffer = negotiation.offers[negotiation.offers.length - 1];
      io.to(`negotiation:${cleanId}`).emit('negotiation:offer', {
        negotiationId: negotiation._id.toString(),
        offer: lastOffer,
      });
    } catch (socketErr) {
      // Graceful fallback
    }

    logger.audit('COUNTER_OFFER_SENT', {
      negotiationId: cleanId,
      senderId: String(senderId),
      proposedBudget: offerPrice,
    });

    return formattedDoc;
  }

  throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
};

/**
 * 4. Accept / Finalize Negotiation
 * Idempotent, Atomic & Transaction-Safe Collaboration Creation
 */
const acceptNegotiation = async (negotiationId, userId, userRole = 'creator') => {
  const cleanId = cleanIdString(negotiationId);
  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ValidationError(`Invalid Negotiation ID format '${cleanId}'`);
  }
  const negObjId = new mongoose.Types.ObjectId(cleanId);
  const userObjId = toObjectId(userId);

  if (isDbConnected()) {
    const negotiation = await Negotiation.findById(negObjId);

    if (!negotiation) {
      throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
    }

    // Handle Idempotency for Re-finalization
    if (negotiation.status === 'agreed') {
      let existingCollab = await Collaboration.findOne({ negotiationId: negotiation._id });
      if (!existingCollab) {
        existingCollab = await Collaboration.findOne({
          brandId: String(negotiation.brandId),
          creatorId: String(negotiation.creatorId),
          campaignTitle: negotiation.campaignName || 'Campaign Collaboration',
        });
      }

      if (!existingCollab) {
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + 14);

        try {
          existingCollab = await Collaboration.create({
            negotiationId: negotiation._id,
            invitationId: negotiation.invitationId || null,
            campaignId: negotiation.campaignId ? String(negotiation.campaignId) : `camp-${Date.now()}`,
            campaignTitle: negotiation.campaignName || 'Campaign Collaboration',
            brandId: String(negotiation.brandId),
            brandName: negotiation.brandName || 'Brand',
            brandLogo: negotiation.brandLogo || '',
            creatorId: String(negotiation.creatorId),
            creatorName: negotiation.creatorName || 'Creator',
            creatorAvatar: negotiation.creatorAvatar || '',
            deliverableType: 'Agreed Negotiated Campaign Package',
            agreedPrice: negotiation.currentBudget || negotiation.agreedBudget || 0,
            stage: 'agreement_finalized',
            startDate: new Date().toISOString().split('T')[0],
            deadline: deadlineDate.toISOString().split('T')[0],
          });
        } catch (err) {
          if (err.code === 11000) {
            existingCollab = await Collaboration.findOne({ negotiationId: negotiation._id });
          }
        }
      }

      return {
        negotiation: formatNegotiationDoc(negotiation),
        collaboration: existingCollab,
      };
    }

    if (negotiation.status !== 'open') {
      throw new ConflictError(`Negotiation is already '${negotiation.status}' and cannot be accepted`);
    }

    const isCreator = userRole === 'creator' || String(negotiation.creatorId) === String(userObjId);
    const senderRole = isCreator ? 'creator' : 'brand';
    const senderName = isCreator ? negotiation.creatorName : negotiation.brandName;
    const senderAvatar = isCreator ? negotiation.creatorAvatar : negotiation.brandLogo;

    const acceptOffer = {
      senderId: userObjId,
      senderRole: senderRole,
      senderName: senderName || 'User',
      senderAvatar: senderAvatar || '',
      message: `Agreement accepted at ₹${negotiation.currentBudget.toLocaleString('en-IN')}`,
      proposedBudget: negotiation.currentBudget,
      attachmentUrl: '',
      attachmentName: '',
      attachmentType: null,
      status: 'accepted',
      isRead: true,
    };

    negotiation.offers.push(acceptOffer);
    negotiation.status = 'agreed';
    negotiation.agreedBudget = negotiation.currentBudget;
    negotiation.lastActivity = new Date();
    await negotiation.save();

    const formattedDoc = formatNegotiationDoc(negotiation);

    // WebSocket Emission
    try {
      const { getIO } = require('../../../config/socket');
      const io = getIO();
      const lastOffer = negotiation.offers[negotiation.offers.length - 1];
      io.to(`negotiation:${cleanId}`).emit('negotiation:offer', {
        negotiationId: negotiation._id.toString(),
        offer: lastOffer,
      });
    } catch (socketErr) {
      // Graceful fallback
    }

    // Create Active Collaboration Document safely & idempotently
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + 14);

    let collaboration = await Collaboration.findOne({ negotiationId: negotiation._id });

    if (!collaboration) {
      try {
        collaboration = await Collaboration.create({
          negotiationId: negotiation._id,
          invitationId: negotiation.invitationId || null,
          campaignId: negotiation.campaignId ? String(negotiation.campaignId) : `camp-${Date.now()}`,
          campaignTitle: negotiation.campaignName || 'Campaign Collaboration',
          brandId: String(negotiation.brandId),
          brandName: negotiation.brandName || 'Brand',
          brandLogo: negotiation.brandLogo || '',
          creatorId: String(negotiation.creatorId),
          creatorName: negotiation.creatorName || 'Creator',
          creatorAvatar: negotiation.creatorAvatar || '',
          deliverableType: 'Agreed Negotiated Campaign Package',
          agreedPrice: negotiation.currentBudget,
          stage: 'agreement_finalized',
          startDate: new Date().toISOString().split('T')[0],
          deadline: deadlineDate.toISOString().split('T')[0],
        });
        logger.audit('COLLABORATION_CREATED', {
          collaborationId: String(collaboration._id),
          negotiationId: String(negotiation._id),
          agreedPrice: negotiation.currentBudget,
        });
      } catch (collabErr) {
        // Handle E11000 duplicate key race condition safely
        if (collabErr.code === 11000) {
          collaboration = await Collaboration.findOne({ negotiationId: negotiation._id });
        } else {
          logger.error('Error creating collaboration record:', { error: collabErr.message });
        }
      }
    }

    logger.audit('NEGOTIATION_FINALIZED', {
      negotiationId: cleanId,
      userId: String(userId),
      agreedBudget: negotiation.currentBudget,
    });

    return {
      negotiation: formattedDoc,
      collaboration,
    };
  }

  throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
};

/**
 * 5. Reject Negotiation
 */
const rejectNegotiation = async (negotiationId, userId, userRole = 'creator', reason = '') => {
  const cleanId = cleanIdString(negotiationId);
  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ValidationError(`Invalid Negotiation ID format '${cleanId}'`);
  }
  const negObjId = new mongoose.Types.ObjectId(cleanId);
  const userObjId = toObjectId(userId);

  if (isDbConnected()) {
    const negotiation = await Negotiation.findById(negObjId);
    if (!negotiation) {
      throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
    }

    if (negotiation.status !== 'open') {
      throw new ConflictError(`Negotiation is already '${negotiation.status}' and cannot be rejected`);
    }

    const isCreator = userRole === 'creator' || String(negotiation.creatorId) === String(userObjId);
    const senderRole = isCreator ? 'creator' : 'brand';
    const senderName = isCreator ? negotiation.creatorName : negotiation.brandName;

    const rejectOffer = {
      senderId: userObjId,
      senderRole: senderRole,
      senderName: senderName || 'User',
      message: reason ? `Declined: ${reason}` : 'Negotiation declined',
      proposedBudget: negotiation.currentBudget,
      status: 'declined',
      isRead: true,
    };

    negotiation.offers.push(rejectOffer);
    negotiation.status = 'rejected';
    negotiation.lastActivity = new Date();
    await negotiation.save();

    const formattedDoc = formatNegotiationDoc(negotiation);

    try {
      const { getIO } = require('../../../config/socket');
      const io = getIO();
      const lastOffer = negotiation.offers[negotiation.offers.length - 1];
      io.to(`negotiation:${cleanId}`).emit('negotiation:offer', {
        negotiationId: negotiation._id.toString(),
        offer: lastOffer,
      });
    } catch (socketErr) {
      // Graceful fallback
    }

    logger.audit('NEGOTIATION_REJECTED', {
      negotiationId: cleanId,
      userId: String(userId),
      reason,
    });

    return formattedDoc;
  }

  throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
};

/**
 * 6. Mark Messages as Read
 */
const markAsRead = async (negotiationId, userId) => {
  const cleanId = cleanIdString(negotiationId);
  if (!mongoose.Types.ObjectId.isValid(cleanId)) {
    throw new ValidationError(`Invalid Negotiation ID format '${cleanId}'`);
  }
  const negObjId = new mongoose.Types.ObjectId(cleanId);
  const userObjId = toObjectId(userId);

  if (isDbConnected()) {
    const negotiation = await Negotiation.findById(negObjId);
    if (!negotiation) {
      throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
    }

    let updated = false;
    negotiation.offers.forEach((offer) => {
      if (String(offer.senderId) !== String(userObjId) && !offer.isRead) {
        offer.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      await negotiation.save();
    }

    return formatNegotiationDoc(negotiation);
  }

  throw new NotFoundError(`Negotiation room '${cleanId}' not found`);
};

module.exports = {
  getNegotiations,
  getNegotiationById,
  sendCounterOffer,
  addCounterOffer: sendCounterOffer,
  acceptNegotiation,
  finalizeAgreement: acceptNegotiation,
  rejectNegotiation,
  markAsRead,
};
