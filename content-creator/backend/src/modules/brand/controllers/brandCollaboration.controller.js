const creatorCollaborationService = require('../../creator/services/creatorCollaboration.service');

/**
 * @desc Get active collaborations for logged-in brand
 * @route GET /api/brand/collaborations
 * @access Private (Brand)
 */
const getBrandCollaborations = async (req, res, next) => {
  try {
    const brandId = req.user.id;
    const { stage } = req.query;

    const collaborations = await creatorCollaborationService.getCollaborations(brandId, 'brand', stage);

    res.status(200).json({
      success: true,
      count: collaborations.length,
      data: collaborations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Brand approves creator submitted deliverables & provides rating
 * @route POST /api/brand/collaborations/:id/approve
 * @access Private (Brand)
 */
const approveDeliverable = async (req, res, next) => {
  try {
    const brandId = req.user.id;
    const collaborationId = req.params.id;
    const { brandFeedback, ratingGiven, reviewGiven } = req.body;

    const approvedCollab = await creatorCollaborationService.approveDeliverable(collaborationId, brandId, {
      brandFeedback,
      ratingGiven,
      reviewGiven,
    });

    res.status(200).json({
      success: true,
      message: 'Deliverable approved successfully',
      data: approvedCollab,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrandCollaborations,
  approveDeliverable,
};
