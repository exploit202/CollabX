const creatorNegotiationService = require('../../creator/services/creatorNegotiation.service');

/**
 * @desc Get negotiations for the logged-in brand
 * @route GET /api/brand/negotiations
 * @access Private (Brand)
 */
const getBrandNegotiations = async (req, res, next) => {
  try {
    const brandId = req.user.id;
    const { view } = req.query;

    const negotiations = await creatorNegotiationService.getNegotiations(brandId, 'brand', view);

    res.status(200).json({
      success: true,
      count: negotiations.length,
      data: negotiations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single negotiation room by ID (Brand side)
 * @route GET /api/brand/negotiations/:id
 * @access Private (Brand)
 */
const getBrandNegotiationById = async (req, res, next) => {
  try {
    const brandId = req.user.id;
    const negotiationId = req.params.id;

    const negotiation = await creatorNegotiationService.getNegotiationById(negotiationId, brandId);

    res.status(200).json({
      success: true,
      data: negotiation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Brand Team sends counter offer or message in deal room
 * @route POST /api/brand/negotiations/:id/counter
 * @access Private (Brand)
 */
const addBrandCounterOffer = async (req, res, next) => {
  try {
    const senderInfo = {
      id: req.user.id,
      role: 'brand',
      name: req.body.senderName || req.user.name || 'Brand Team',
      avatar: req.body.senderAvatar || req.user.avatar || '',
    };

    const negotiationId = req.params.id;
    const offerPayload = req.body;

    const updatedNegotiation = await creatorNegotiationService.addCounterOffer(
      negotiationId,
      senderInfo,
      offerPayload
    );

    res.status(200).json({
      success: true,
      message: 'Brand counter offer sent successfully',
      data: updatedNegotiation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Brand Team finalizes agreement in deal room
 * @route POST /api/brand/negotiations/:id/finalize
 * @access Private (Brand)
 */
const finalizeBrandAgreement = async (req, res, next) => {
  try {
    const brandId = req.user.id;
    const negotiationId = req.params.id;

    const result = await creatorNegotiationService.finalizeAgreement(negotiationId, brandId, 'brand');

    res.status(200).json({
      success: true,
      message: 'Agreement finalized by Brand and active collaboration created',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBrandNegotiations,
  getBrandNegotiationById,
  addBrandCounterOffer,
  finalizeBrandAgreement,
};
