const negotiationService = require('../services/creatornegotiation.service');

const getNegotiations = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;

    const negotiations = await negotiationService.getCreatorNegotiations(creatorId);

    return res.status(200).json({
      success: true,
      message: 'Negotiations retrieved successfully.',
      data: {
        negotiations
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNegotiation = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;

    const negotiation = await negotiationService.getNegotiationById(
      creatorId,
      req.params.id
    );

    if (!negotiation) {
      return res.status(404).json({
        success: false,
        message: 'Negotiation not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Negotiation retrieved successfully.',
      data: {
        negotiation
      }
    });
  } catch (error) {
    next(error);
  }
};

const addOffer = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const senderRole = req.user.role;

    const negotiation = await negotiationService.addOffer(
      req.params.id,
      {
        senderId,
        senderRole,
        senderName: req.body.senderName || 'Creator',
        senderAvatar: req.body.senderAvatar,
        message: req.body.message,
        proposedBudget: req.body.proposedBudget,
        attachmentUrl: req.body.attachmentUrl,
        attachmentName: req.body.attachmentName,
        attachmentType: req.body.attachmentType
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Offer/message sent successfully.',
      data: {
        negotiation
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateNegotiationStatus = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const negotiation = await negotiationService.updateNegotiationStatus(
      userId,
      req.params.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: `Negotiation ${req.body.status} successfully.`,
      data: {
        negotiation
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNegotiations,
  getNegotiation,
  addOffer,
  updateNegotiationStatus
};
