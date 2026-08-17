const mongoose = require('mongoose');
const Collaboration = require('../../../models/collaboration.model');

const getCreatorCollaborations = async (creatorId, filters = {}) => {
  const creatorObjId = new mongoose.Types.ObjectId(creatorId);
  const query = {
    $or: [{ creatorId: creatorObjId }, { creatorId: creatorId.toString() }]
  };
  if (filters.status) query.status = filters.status;

  const items = await Collaboration.find(query)
    .populate('campaignId', 'title category budget deadline status')
    .populate('brandId', 'fullName email profileImage')
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

const submitDeliverables = async (collaborationId, creatorId, { submissionUrl, contentUrl, submissionNotes }) => {
  const collaboration = await Collaboration.findById(collaborationId);

  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isCreator = String(collaboration.creatorId?._id || collaboration.creatorId) === String(creatorId);
  if (!isCreator) {
    const error = new Error('You do not have permission to modify this collaboration');
    error.statusCode = 403;
    throw error;
  }

  if (['completed', 'brand_approved', 'cancelled'].includes(collaboration.status)) {
    const error = new Error(`Cannot submit deliverables for a collaboration in state '${collaboration.status}'.`);
    error.statusCode = 400;
    throw error;
  }

  const isResubmission = collaboration.status === 'revision_requested';
  const url = submissionUrl || contentUrl || collaboration.submissionUrl || '';
  collaboration.submissionUrl = url;
  collaboration.submissionNotes = submissionNotes || collaboration.submissionNotes || '';
  collaboration.submissionDate = new Date().toISOString().split('T')[0];
  collaboration.status = 'content_submitted';
  collaboration.stage = 'content_submitted';
  collaboration.progress = 80;

  await collaboration.save();

  try {
    const creatorNotifService = require('./creatorNotification.service');
    const notifType = isResubmission ? 'content_resubmitted' : 'content_submitted';
    const notifTitle = isResubmission ? 'Content Resubmitted' : 'Content Submitted';
    const notifMsg = isResubmission
      ? `Creator ${collaboration.creatorName} resubmitted revised content deliverables.`
      : `Creator ${collaboration.creatorName} submitted content deliverables for review.`;

    await creatorNotifService.createNotification({
      userId: collaboration.brandId,
      senderId: creatorId,
      type: notifType,
      title: notifTitle,
      message: notifMsg,
      entityType: 'Collaboration',
      entityId: collaboration._id
    });
  } catch (err) {
    console.error('Notification error on deliverable submit:', err);
  }

  return collaboration;
};

module.exports = {
  getCreatorCollaborations,
  submitDeliverables
};
