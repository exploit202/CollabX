const mongoose = require('mongoose');
const negotiationService = require('../services/brandnegotiation.service');

const createNegotiation = async (req, res, next) => {
  try {
    const invitationId = req.body.invitationId;
    if (!invitationId || !mongoose.Types.ObjectId.isValid(invitationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID.'
      });
    }

    const brandId = req.user.userId;

    const negotiation =
      await negotiationService.createNegotiation(
        brandId,
        req.body
      );

    return res.status(201).json({
      success: true,
      message: 'Negotiation created successfully.',
      data: {
        negotiation
      }
    });
  } catch (error) {
    next(error);
  }
};

const getNegotiations = async (req, res, next) => {
  try {
    const brandId = req.user.userId;

    const negotiations =
      await negotiationService.getBrandNegotiations(brandId);

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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid negotiation ID.'
      });
    }

    const brandId = req.user.userId;

    const negotiation =
      await negotiationService.getNegotiationById(
        brandId,
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

const updateNegotiation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid negotiation ID.'
      });
    }

    const brandId = req.user.userId;

    const negotiation =
      await negotiationService.updateNegotiation(
        brandId,
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: 'Negotiation updated successfully.',
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid negotiation ID.'
      });
    }

    const userId = req.user.userId;

    const negotiation =
      await negotiationService.updateNegotiationStatus(
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

const addOffer = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid negotiation ID.'
      });
    }
    const senderId = req.user.userId;
    const senderRole = req.user.role;

    const negotiation = await negotiationService.addOffer(
      req.params.id,
      {
        senderId,
        senderRole,
        senderName: req.body.senderName ||'Brand',
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

module.exports = {
  createNegotiation,
  getNegotiations,
  getNegotiation,
  updateNegotiation,
  updateNegotiationStatus,
  addOffer
};