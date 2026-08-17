const creatorCollaborationService = require('../services/creatorCollaboration.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getCollaborations = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const collaborations = await creatorCollaborationService.getCreatorCollaborations(creatorId, req.query);
    return successResponse(res, 200, 'Creator collaborations retrieved.', collaborations);
  } catch (error) {
    next(error);
  }
};

const submitContent = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const collaboration = await creatorCollaborationService.submitDeliverables(
      req.params.id,
      creatorId,
      req.body
    );
    return successResponse(res, 200, 'Deliverables submitted successfully.', collaboration);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollaborations,
  submitContent
};
