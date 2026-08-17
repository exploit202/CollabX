const activeCollaborationService = require('../services/activeCollaboration.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getCollaborations = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const collaborations = await activeCollaborationService.getBrandCollaborations(brandId, req.query);
    return successResponse(res, 200, 'Collaborations retrieved successfully.', collaborations);
  } catch (error) {
    next(error);
  }
};

const getCollaborationById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const collaboration = await activeCollaborationService.getCollaborationById(req.params.id, userId);
    return successResponse(res, 200, 'Collaboration details retrieved.', collaboration);
  } catch (error) {
    next(error);
  }
};

const requestRevision = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const collaboration = await activeCollaborationService.requestRevision(
      req.params.id,
      brandId,
      req.body
    );
    return successResponse(res, 200, 'Revision requested successfully.', collaboration);
  } catch (error) {
    next(error);
  }
};

const approveCollaboration = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const collaboration = await activeCollaborationService.approveCollaboration(
      req.params.id,
      brandId,
      req.body
    );
    return successResponse(res, 200, 'Collaboration approved successfully.', collaboration);
  } catch (error) {
    next(error);
  }
};

const completeCollaboration = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const collaboration = await activeCollaborationService.completeCollaboration(
      req.params.id,
      userId
    );
    return successResponse(res, 200, 'Collaboration completed successfully.', collaboration);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollaborations,
  getCollaborationById,
  requestRevision,
  approveCollaboration,
  completeCollaboration
};
