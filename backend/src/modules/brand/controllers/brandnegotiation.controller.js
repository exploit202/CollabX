const negotiationService = require('../services/negotiation.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const createNegotiation = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const negotiation = await negotiationService.createNegotiationFromInvitation({
      invitationId: req.body.invitationId,
      userId
    });

    return successResponse(res, 201, 'Negotiation started successfully.', negotiation);
  } catch (error) {
    next(error);
  }
};

const getBrandNegotiations = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const negotiations = await negotiationService.getBrandNegotiations(brandId, req.query);

    return successResponse(res, 200, 'Negotiations retrieved successfully.', negotiations);
  } catch (error) {
    next(error);
  }
};

const getNegotiationById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const negotiation = await negotiationService.getNegotiationById({
      negotiationId: req.params.id,
      userId
    });

    return successResponse(res, 200, 'Negotiation retrieved successfully.', negotiation);
  } catch (error) {
    next(error);
  }
};

const createOffer = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const negotiation = await negotiationService.createOffer({
      negotiationId: req.params.id,
      userId,
      message: req.body.message || req.body.notes,
      notes: req.body.notes,
      proposedBudget: req.body.proposedBudget || req.body.proposedPrice,
      proposedPrice: req.body.proposedPrice
    });

    return successResponse(res, 200, 'Offer created successfully.', negotiation);
  } catch (error) {
    next(error);
  }
};

const acceptOffer = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await negotiationService.acceptOffer({
      negotiationId: req.params.id,
      userId,
      offerId: req.body.offerId
    });

    return successResponse(res, 200, 'Offer accepted successfully.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNegotiation,
  getBrandNegotiations,
  getNegotiationById,
  createOffer,
  acceptOffer
};
