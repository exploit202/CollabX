// const creatorCollaborationService = require('../services/creatorCollaboration.service');

// /**
//  * @desc Get active collaborations for user
//  * @route GET /api/creator/collaborations
//  * @access Private
//  */
// const getCollaborations = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const userRole = req.user?.role || req.headers['x-user-role'] || 'creator';
//     const { stage, page = 1, limit = 20 } = req.query;

//     const result = await creatorCollaborationService.getCollaborations(userId, userRole, stage, page, limit);

//     res.status(200).json({
//       success: true,
//       count: result.docs ? result.docs.length : (Array.isArray(result) ? result.length : 0),
//       total: result.total !== undefined ? result.total : (Array.isArray(result) ? result.length : 0),
//       page: result.page || 1,
//       pages: result.pages || 1,
//       data: result.docs || result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Get single active collaboration details
//  * @route GET /api/creator/collaborations/:id
//  * @access Private
//  */
// const getCollaborationById = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const collaborationId = req.params.id;

//     const collaboration = await creatorCollaborationService.getCollaborationById(collaborationId, userId);

//     res.status(200).json({
//       success: true,
//       data: collaboration,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Submit content deliverables URL & notes (Creator)
//  * @route POST /api/creator/collaborations/:id/submit
//  * @access Private (Creator)
//  */
// const submitContentDeliverable = async (req, res, next) => {
//   try {
//     const creatorId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const collaborationId = req.params.id;
//     const { submissionUrl, submissionNotes } = req.body;

//     const updatedCollab = await creatorCollaborationService.submitContentDeliverable(collaborationId, creatorId, {
//       submissionUrl,
//       submissionNotes,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Deliverables submitted successfully',
//       data: updatedCollab,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Approve deliverables & provide review/rating (Brand / Admin)
//  * @route POST /api/creator/collaborations/:id/approve
//  * @access Private (Brand / Admin)
//  */
// const approveDeliverable = async (req, res, next) => {
//   try {
//     const brandId = req.user?.id || req.headers['x-user-id'] || 'brand-1';
//     const collaborationId = req.params.id;
//     const { brandFeedback, ratingGiven, reviewGiven } = req.body;

//     const approvedCollab = await creatorCollaborationService.approveDeliverable(collaborationId, brandId, {
//       brandFeedback,
//       ratingGiven,
//       reviewGiven,
//     });

//     res.status(200).json({
//       success: true,
//       message: 'Deliverable approved successfully',
//       data: approvedCollab,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getCollaborations,
//   getCollaborationById,
//   submitContentDeliverable,
//   approveDeliverable,
// };


const creatorCollaborationService = require('../services/creatorCollaboration.service');

/**
 * @desc Get active collaborations for user
 * @route GET /api/creator/collaborations
 * @access Private
 */
const getCollaborations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'creator';
    const { stage, page = 1, limit = 20 } = req.query;

    const result = await creatorCollaborationService.getCollaborations(
      userId,
      userRole,
      stage,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      count: result.docs
        ? result.docs.length
        : Array.isArray(result)
          ? result.length
          : 0,
      total: result.total !== undefined
        ? result.total
        : Array.isArray(result)
          ? result.length
          : 0,
      page: result.page || 1,
      pages: result.pages || 1,
      data: result.docs || result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get single active collaboration details
 * @route GET /api/creator/collaborations/:id
 * @access Private
 */
const getCollaborationById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const collaborationId = req.params.id;

    const collaboration =
      await creatorCollaborationService.getCollaborationById(
        collaborationId,
        userId
      );

    res.status(200).json({
      success: true,
      data: collaboration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Submit content deliverables URL & notes (Creator)
 * @route POST /api/creator/collaborations/:id/submit
 * @access Private (Creator)
 */
const submitContentDeliverable = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const collaborationId = req.params.id;
    const { submissionUrl, submissionNotes } = req.body;

    const updatedCollab =
      await creatorCollaborationService.submitContentDeliverable(
        collaborationId,
        creatorId,
        {
          submissionUrl,
          submissionNotes,
        }
      );

    res.status(200).json({
      success: true,
      message: 'Deliverables submitted successfully',
      data: updatedCollab,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Approve deliverables & provide review/rating (Brand / Admin)
 * @route POST /api/creator/collaborations/:id/approve
 * @access Private (Brand / Admin)
 */
const approveDeliverable = async (req, res, next) => {
  try {
    const brandId = req.user.userId;
    const collaborationId = req.params.id;
    const { brandFeedback, ratingGiven, reviewGiven } = req.body;

    const approvedCollab =
      await creatorCollaborationService.approveDeliverable(
        collaborationId,
        brandId,
        {
          brandFeedback,
          ratingGiven,
          reviewGiven,
        }
      );

    res.status(200).json({
      success: true,
      message: 'Deliverable approved successfully',
      data: approvedCollab,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCollaborations,
  getCollaborationById,
  submitContentDeliverable,
  approveDeliverable,
};