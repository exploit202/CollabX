const invitationService = require('../services/creatorinvitation.service');

const getInvitations = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;

    const invitations = await invitationService.getCreatorInvitations(creatorId);

    return res.status(200).json({
      success: true,
      message: 'Invitations retrieved successfully.',
      data: {
        invitations,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInvitation = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;

    const invitation = await invitationService.getInvitationById(
      creatorId,
      req.params.id
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Invitation retrieved successfully.',
      data: {
        invitation,
      },
    });
  } catch (error) {
    next(error);
  }
};

const respondToInvitation = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      const error = new Error(
        'Invalid invitation response. Expected accepted or rejected.'
      );
      error.statusCode = 400;
      throw error;
    }

    const invitation = await invitationService.respondToInvitation(
      creatorId,
      req.params.id,
      status
    );

    return res.status(200).json({
      success: true,
      message:
        status === 'accepted'
          ? 'Invitation accepted successfully.'
          : 'Invitation rejected successfully.',
      data: {
        invitation,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvitations,
  getInvitation,
  respondToInvitation
};
