const creatorRequestService = require('../services/creatorRequest.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getRequests = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const requests = await creatorRequestService.getCreatorRequests(creatorId, req.query.status);
    return successResponse(res, 200, 'Creator requests retrieved.', requests);
  } catch (error) {
    next(error);
  }
};

const respond = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const result = await creatorRequestService.respondToInvitation(
      req.params.id,
      creatorId,
      req.body.status
    );
    return successResponse(res, 200, 'Response recorded successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  respond
};
