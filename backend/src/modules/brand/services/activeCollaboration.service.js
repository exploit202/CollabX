const mongoose = require('mongoose');
const Collaboration = require('../../../models/collaboration.model');

const getBrandCollaborations = async (brandId, filters = {}) => {
  const query = { brandId };
  if (filters.status) query.status = filters.status;

  const items = await Collaboration.find(query)
    .populate('campaignId', 'title category budget deadline status')
    .populate('creatorId', 'fullName email profileImage')
    .sort({ updatedAt: -1 })
    .lean();

  return items.map((item) => {
    const camp = item.campaignId && typeof item.campaignId === 'object' ? item.campaignId : {};
    return {
      ...item,
      campaignTitle: item.campaignTitle || camp.title || 'Campaign Collaboration',
      deadline: item.deadline || camp.deadline || item.createdAt || null
    };
  });
};

const getCollaborationById = async (collaborationId, userId) => {
  const collaboration = await Collaboration.findById(collaborationId)
    .populate('campaignId', 'title description category budget deliverables requirements deadline status brandName brandLogo')
    .populate('brandId', 'fullName email profileImage')
    .populate('creatorId', 'fullName email profileImage')
    .lean();

  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(collaboration.brandId?._id || collaboration.brandId) === String(userId);
  const isCreator = String(collaboration.creatorId?._id || collaboration.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have access to this collaboration');
    error.statusCode = 403;
    throw error;
  }

  const camp = collaboration.campaignId && typeof collaboration.campaignId === 'object' ? collaboration.campaignId : {};
  return {
    ...collaboration,
    campaignTitle: collaboration.campaignTitle || camp.title || 'Campaign Collaboration',
    deadline: collaboration.deadline || camp.deadline || collaboration.createdAt || null
  };
};

const requestRevision = async (collaborationId, brandUserId, { revisionNotes, brandFeedback }) => {
  const collaboration = await Collaboration.findById(collaborationId);

  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(collaboration.brandId?._id || collaboration.brandId) === String(brandUserId);
  if (!isBrand) {
    const error = new Error('Only the owning brand can request revisions for this collaboration');
    error.statusCode = 403;
    throw error;
  }

  if (!['content_submitted', 'submitted'].includes(collaboration.status)) {
    const error = new Error(`Cannot request revision for collaboration in state '${collaboration.status}'. Content must be submitted first.`);
    error.statusCode = 400;
    throw error;
  }

  const feedbackText = revisionNotes || brandFeedback || 'Revision requested by brand';

  collaboration.status = 'revision_requested';
  collaboration.stage = 'revision_requested';
  collaboration.progress = 50;
  collaboration.revisionNotes = feedbackText;
  collaboration.brandFeedback = feedbackText;
  collaboration.revisionRequestedAt = new Date();
  collaboration.revisionsCount = (collaboration.revisionsCount || 0) + 1;

  await collaboration.save();

  try {
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: collaboration.creatorId,
      senderId: brandUserId,
      type: 'revision_requested',
      title: 'Revision Requested',
      message: `Brand ${collaboration.brandName || 'Brand'} requested content revisions: "${feedbackText}".`,
      entityType: 'Collaboration',
      entityId: collaboration._id
    });
  } catch (err) {
    console.error('Notification error on revision request:', err);
  }

  return collaboration;
};

const approveCollaboration = async (collaborationId, brandUserId, { feedback } = {}) => {
  const collaboration = await Collaboration.findById(collaborationId);

  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(collaboration.brandId?._id || collaboration.brandId) === String(brandUserId);
  if (!isBrand) {
    const error = new Error('Only the owning brand can approve this collaboration');
    error.statusCode = 403;
    throw error;
  }

  if (!['content_submitted', 'submitted'].includes(collaboration.status)) {
    const error = new Error(`Cannot approve collaboration in state '${collaboration.status}'. Content must be submitted first.`);
    error.statusCode = 400;
    throw error;
  }

  collaboration.status = 'brand_approved';
  collaboration.stage = 'brand_approved';
  collaboration.progress = 90;
  collaboration.approvedAt = new Date();
  if (feedback) collaboration.brandFeedback = feedback;

  await collaboration.save();

  try {
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: collaboration.creatorId,
      senderId: brandUserId,
      type: 'content_approved',
      title: 'Deliverables Approved',
      message: `Brand ${collaboration.brandName || 'Brand'} approved your content deliverables!`,
      entityType: 'Collaboration',
      entityId: collaboration._id
    });
  } catch (err) {
    console.error('Notification error on brand approval:', err);
  }

  return collaboration;
};

const completeCollaboration = async (collaborationId, userId) => {
  const collaboration = await Collaboration.findById(collaborationId);

  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(collaboration.brandId?._id || collaboration.brandId) === String(userId);
  const isCreator = String(collaboration.creatorId?._id || collaboration.creatorId) === String(userId);

  if (!isBrand && !isCreator) {
    const error = new Error('You do not have permission to modify this collaboration');
    error.statusCode = 403;
    throw error;
  }

  if (collaboration.status !== 'brand_approved') {
    const error = new Error(`Cannot complete collaboration in state '${collaboration.status}'. Deliverables must be brand_approved first.`);
    error.statusCode = 400;
    throw error;
  }

  collaboration.status = 'completed';
  collaboration.stage = 'completed';
  collaboration.progress = 100;
  collaboration.completedAt = new Date();

  await collaboration.save();

  try {
    const notificationService = require('./notification.service');
    const targetRecipient = isBrand ? collaboration.creatorId : collaboration.brandId;
    await notificationService.createNotification({
      userId: targetRecipient,
      senderId: userId,
      type: 'collaboration_completed',
      title: 'Collaboration Completed',
      message: `Collaboration for "${collaboration.campaignTitle || 'Campaign'}" has been marked as completed!`,
      entityType: 'Collaboration',
      entityId: collaboration._id
    });
  } catch (err) {
    console.error('Notification error on collaboration completion:', err);
  }

  return collaboration;
};

module.exports = {
  getBrandCollaborations,
  getCollaborationById,
  requestRevision,
  approveCollaboration,
  completeCollaboration
};
