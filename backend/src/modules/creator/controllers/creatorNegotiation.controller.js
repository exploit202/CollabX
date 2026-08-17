const creatorNegotiationService = require('../services/creatorNegotiation.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getNegotiations = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const negotiations = await creatorNegotiationService.getCreatorNegotiations(creatorId, req.query);
    return successResponse(res, 200, 'Creator negotiations retrieved.', negotiations);
  } catch (error) {
    next(error);
  }
};

const counterOffer = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const negotiation = await creatorNegotiationService.sendCounterOffer({
      negotiationId: req.params.id,
      creatorId,
      message: req.body.message || req.body.notes,
      proposedBudget: req.body.proposedBudget || req.body.proposedPrice,
      proposedPrice: req.body.proposedPrice,
      notes: req.body.notes
    });
    return successResponse(res, 200, 'Counter offer sent successfully.', negotiation);
  } catch (error) {
    next(error);
  }
};

const acceptOffer = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const result = await creatorNegotiationService.acceptOffer({
      negotiationId: req.params.id,
      creatorId,
      offerId: req.body.offerId
    });
    return successResponse(res, 200, 'Offer accepted successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNegotiations,
  counterOffer,
  acceptOffer
};
