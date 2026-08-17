const mongoose = require('mongoose');
const Invitation = require('../../creator/models/Invitation.model');

// Helper to safely format or convert string IDs to ObjectId
const toObjectId = (id) => {
  if (!id) return new mongoose.Types.ObjectId();
  if (mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  const hex = Buffer.from(String(id)).toString('hex').padEnd(24, '0').slice(0, 24);
  return new mongoose.Types.ObjectId(hex);
};

/**
 * @desc Brand sends a new collaboration invitation to a creator
 * @route POST /api/brand/invitations
 * @access Private (Brand)
 */
const sendInvitation = async (req, res, next) => {
  try {
    const brandId = req.user?.id || req.headers['x-user-id'] || 'brand-1';
    const {
      campaignId,
      campaignTitle,
      campaignName,
      creatorId,
      creatorName,
      recipientName,
      creatorAvatar,
      proposedPrice,
      proposedBudget,
      deliverables,
      message,
    } = req.body;

    const brandObjId = toObjectId(brandId);
    const creatorObjId = toObjectId(creatorId);
    const campaignObjId = campaignId ? toObjectId(campaignId) : null;
    const price = Number(proposedPrice !== undefined ? proposedPrice : proposedBudget);

    const newInvitation = await Invitation.create({
      campaignId: campaignObjId,
      campaignTitle: campaignTitle || campaignName || 'Campaign Invitation',
      brandId: brandObjId,
      brandName: req.body.brandName || req.user?.name || 'Brand Team',
      brandLogo: req.body.brandLogo || req.user?.avatar || '',
      creatorId: creatorObjId,
      creatorName: creatorName || recipientName || 'Creator',
      creatorAvatar: creatorAvatar || '',
      proposedPrice: isNaN(price) ? 0 : price,
      deliverables: Array.isArray(deliverables) ? deliverables : deliverables ? [deliverables] : ['Campaign Deliverable'],
      message: message || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Collaboration invitation sent to creator successfully',
      data: newInvitation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all invitations sent by the brand
 * @route GET /api/brand/invitations
 * @access Private (Brand)
 */
const getBrandInvitations = async (req, res, next) => {
  try {
    const brandId = req.user?.id || req.headers['x-user-id'] || 'brand-1';
    const brandObjId = toObjectId(brandId);

    const invitations = await Invitation.find({ brandId: brandObjId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendInvitation,
  getBrandInvitations,
};
