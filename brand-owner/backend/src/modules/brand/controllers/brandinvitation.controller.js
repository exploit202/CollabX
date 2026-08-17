const mongoose = require('mongoose');
const invitationService = require('../services/brandinvitation.service');
const {
  createInvitationSchema,
} = require('../validations/brandinvitation.validation');

const createInvitation = async (req, res, next) => {
  try {
    const validation = createInvitationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation data.',
        errors: validation.error.flatten(),
      });
    }

    const brandId = req.user.userId;

    const invitation = await invitationService.createInvitation(
      brandId,
      validation.data
    );

    return res.status(201).json({
      success: true,
      message: 'Invitation created successfully.',
      data: {
        invitation,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInvitations = async (req, res, next) => {
  try {
    const brandId = req.user.userId;

    const invitations =
      await invitationService.getBrandInvitations(brandId);

    return res.status(200).json({
      success: true,
      message: 'Invitations retrieved successfully.',
      data: {
        invitations
      }
    });
  } catch (error) {
    next(error);
  }
};

const getInvitation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID.'
      });
    }

    const brandId = req.user.userId;

    const invitation =
      await invitationService.getInvitationById(
        brandId,
        req.params.id
      );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation retrieved successfully.',
      data: {
        invitation
      }
    });
  } catch (error) {
    next(error);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation ID.'
      });
    }

    const brandId = req.user.userId;

    const invitation =
      await invitationService.cancelInvitation(
        brandId,
        req.params.id
      );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully.',
      data: {
        invitation
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvitation,
  getInvitations,
  getInvitation,
  cancelInvitation
};