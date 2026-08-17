const mongoose = require('mongoose');
const Collaboration = require('../models/Collaboration.model');
const logger = require('../../../utils/logger');
const {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} = require('../../../utils/errors');

// Helper to safely format or convert IDs to ObjectId where valid
const toObjectId = (id) => {
  if (!id) return new mongoose.Types.ObjectId();
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  const hex = Buffer.from(String(id)).toString('hex').padEnd(24, '0').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
};

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * 1. Get Active Collaborations (With Pagination, Filtering, Projection & Lean Query Optimization)
 */
const getCollaborations = async (userId, userRole = 'creator', stage = null, page = 1, limit = 20) => {
  if (isDbConnected()) {
    const cleanUser = String(userId);
    const query = {};

    if (cleanUser) {
      if (userRole === 'creator') {
        query.$or = [{ creatorId: cleanUser }, { creatorId: toObjectId(cleanUser) }];
      } else if (userRole === 'brand') {
        query.$or = [{ brandId: cleanUser }, { brandId: toObjectId(cleanUser) }];
      }
    }

    if (stage) {
      query.stage = stage;
    }

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.max(1, parseInt(limit));
    const pageSize = Math.max(1, parseInt(limit));

    const [docs, total] = await Promise.all([
      Collaboration.find(query)
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Collaboration.countDocuments(query),
    ]);

    return {
      total,
      page: parseInt(page),
      limit: pageSize,
      pages: Math.ceil(total / pageSize),
      docs,
    };
  }

  return { total: 0, page: 1, limit: 20, pages: 1, docs: [] };
};

/**
 * 2. Get Single Collaboration Details
 */
const getCollaborationById = async (collaborationId, userId) => {
  if (!collaborationId) throw new ValidationError('collaborationId is required');

  if (isDbConnected()) {
    const collab = await Collaboration.findById(collaborationId).lean();
    if (!collab) throw new NotFoundError('Collaboration not found');

    const cleanUser = String(userId);
    if (String(collab.creatorId) !== cleanUser && String(collab.brandId) !== cleanUser) {
      throw new ForbiddenError('Unauthorized access to this collaboration');
    }

    return collab;
  }

  throw new NotFoundError('Collaboration not found');
};

/**
 * 3. Creator Submits Draft/Live Deliverable URL & Notes
 */
const submitContentDeliverable = async (collaborationId, creatorId, { submissionUrl, submissionNotes }) => {
  if (!submissionUrl) throw new ValidationError('submissionUrl is required to submit deliverable');

  if (isDbConnected()) {
    const collab = await Collaboration.findById(collaborationId);
    if (!collab) throw new NotFoundError('Collaboration not found');

    const cleanCreator = String(creatorId);
    if (String(collab.creatorId) !== cleanCreator) {
      throw new ForbiddenError('Only the assigned creator can submit deliverables');
    }

    if (collab.stage === 'completed') throw new ConflictError('Collaboration is already completed');

    collab.submissionUrl = submissionUrl;
    collab.submissionNotes = submissionNotes || '';
    collab.submissionDate = new Date().toISOString().split('T')[0];
    collab.stage = 'content_submitted';

    await collab.save();

    logger.audit('COLLABORATION_SUBMITTED', {
      collaborationId: String(collab._id),
      creatorId: cleanCreator,
      submissionUrl,
    });

    return collab;
  }

  throw new NotFoundError('Collaboration not found');
};

/**
 * 4. Brand/Admin Approves Submitted Deliverables
 */
const approveDeliverable = async (collaborationId, brandId, { brandFeedback, ratingGiven, reviewGiven }) => {
  if (isDbConnected()) {
    const collab = await Collaboration.findById(collaborationId);
    if (!collab) throw new NotFoundError('Collaboration not found');

    const cleanBrand = String(brandId);
    if (String(collab.brandId) !== cleanBrand) {
      throw new ForbiddenError('Only the assigned brand can approve deliverables');
    }

    collab.stage = 'completed';
    collab.approvedAt = new Date();
    collab.completedAt = new Date();
    if (brandFeedback) collab.brandFeedback = brandFeedback;
    if (ratingGiven) collab.ratingGiven = Number(ratingGiven);
    if (reviewGiven) collab.reviewGiven = reviewGiven;

    await collab.save();

    logger.audit('COLLABORATION_APPROVED', {
      collaborationId: String(collab._id),
      brandId: cleanBrand,
      ratingGiven,
    });

    return collab;
  }

  throw new NotFoundError('Collaboration not found');
};

module.exports = {
  getCollaborations,
  getCollaborationById,
  submitContentDeliverable,
  approveDeliverable,
};
