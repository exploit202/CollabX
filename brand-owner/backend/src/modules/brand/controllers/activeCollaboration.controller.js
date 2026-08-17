const activeCollaborationService = require("../services/activeCollaboration.service");

// =====================================================
// CREATE FROM AGREED NEGOTIATION
// =====================================================

const createFromNegotiation = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const collaboration =
      await activeCollaborationService.createFromNegotiation({
        negotiationId: req.params.negotiationId,
        userId,
      });

    return res.status(201).json({
      success: true,
      message: "Active collaboration created successfully",
      data: collaboration,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET COLLABORATION BY ID
// =====================================================

const getById = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const collaboration =
      await activeCollaborationService.getById({
        collaborationId: req.params.id,
        userId,
      });

    return res.status(200).json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET BRAND COLLABORATIONS
// =====================================================

const getBrandCollaborations = async (
  req,
  res,
  next
) => {
  try {
    const brandId = req.user.userId;

    const collaborations =
      await activeCollaborationService.getBrandCollaborations(
        brandId,
        {
          status: req.query.status,
        }
      );

    return res.status(200).json({
      success: true,
      count: collaborations.length,
      data: collaborations,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET CREATOR COLLABORATIONS
// =====================================================

const getCreatorCollaborations = async (
  req,
  res,
  next
) => {
  try {
    const creatorId = req.user.userId;

    const collaborations =
      await activeCollaborationService.getCreatorCollaborations(
        creatorId,
        {
          status: req.query.status,
        }
      );

    return res.status(200).json({
      success: true,
      count: collaborations.length,
      data: collaborations,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UPDATE PROGRESS / STATUS
// =====================================================

const updateProgress = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const {
      progress,
      status,
      notes,
    } = req.body;

    if (
      progress === undefined &&
      status === undefined &&
      notes === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field is required to update",
      });
    }

    if (
      progress !== undefined &&
      (
        typeof progress !== "number" ||
        progress < 0 ||
        progress > 100
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Progress must be a number between 0 and 100",
      });
    }

    const collaboration =
      await activeCollaborationService.updateProgress({
        collaborationId: req.params.id,
        userId,
        progress,
        status,
        notes,
      });

    return res.status(200).json({
      success: true,
      message:
        "Collaboration updated successfully",
      data: collaboration,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// COMPLETE COLLABORATION
// =====================================================

const completeCollaboration = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.userId;

    const collaboration =
      await activeCollaborationService.completeCollaboration({
        collaborationId: req.params.id,
        userId,
      });

    return res.status(200).json({
      success: true,
      message:
        "Collaboration completed successfully",
      data: collaboration,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// CANCEL COLLABORATION
// =====================================================

const cancelCollaboration = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.userId;

    const collaboration =
      await activeCollaborationService.cancelCollaboration({
        collaborationId: req.params.id,
        userId,
        notes: req.body?.notes,
      });

    return res.status(200).json({
      success: true,
      message:
        "Collaboration cancelled successfully",
      data: collaboration,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createFromNegotiation,
  getById,
  getBrandCollaborations,
  getCreatorCollaborations,
  updateProgress,
  completeCollaboration,
  cancelCollaboration,
};