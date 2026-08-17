const invitationService = require('../services/invitation.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const createInvitation = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const invitation = await invitationService.createInvitation({
      ...req.body,
      brandId
    });

    return successResponse(res, 201, 'Invitation created successfully.', invitation);
  } catch (error) {
    next(error);
  }
};

const getBrandInvitations = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const invitations = await invitationService.getBrandInvitations(brandId, req.query);

    return successResponse(res, 200, 'Invitations retrieved successfully.', invitations);
  } catch (error) {
    next(error);
  }
};

const getInvitationById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const invitation = await invitationService.getInvitationById(req.params.id, userId);

    return successResponse(res, 200, 'Invitation details retrieved.', invitation);
  } catch (error) {
    next(error);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const invitation = await invitationService.cancelInvitation({
      invitationId: req.params.id,
      brandId
    });

    return successResponse(res, 200, 'Invitation cancelled successfully.', invitation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  getBrandInvitations,
  getInvitationById,
  cancelInvitation
};
