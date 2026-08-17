// const creatorRequestService = require('../services/creatorRequest.service');

// /**
//  * @desc Get all collaboration requests for the logged-in creator
//  * @route GET /api/creator/requests
//  * @access Private (Creator)
//  */
// const getCreatorRequests = async (req, res, next) => {
//   try {
//     const creatorId = req.user.id;
//     const { status } = req.query;

//     const requests = await creatorRequestService.getCreatorRequests(creatorId, status);

//     res.status(200).json({
//       success: true,
//       count: requests.length,
//       data: requests,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Respond to a collaboration request (accepted | rejected | negotiating)
//  * @route PATCH /api/creator/requests/:id/respond
//  * @access Private (Creator)
//  */
// const respondToRequest = async (req, res, next) => {
//   try {
//     const creatorId = req.user.id;
//     const invitationId = req.params.id;
//     const { status } = req.body;

//     if (!['accepted', 'rejected', 'negotiating'].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Status must be 'accepted', 'rejected', or 'negotiating'",
//       });
//     }

//     const result = await creatorRequestService.respondToInvitation(invitationId, creatorId, status);

//     res.status(200).json({
//       success: true,
//       message: `Invitation successfully updated to '${status}'`,
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getCreatorRequests,
//   respondToRequest,
// };


const creatorRequestService = require('../services/creatorRequest.service');

/**
 * @desc Get all collaboration requests for the logged-in creator
 * @route GET /api/creator/requests
 * @access Private (Creator)
 */
const getCreatorRequests = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const { status } = req.query;

    const requests = await creatorRequestService.getCreatorRequests(
      creatorId,
      status
    );

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Respond to a collaboration request (accepted | rejected | negotiating)
 * @route PATCH /api/creator/requests/:id/respond
 * @access Private (Creator)
 */
const respondToRequest = async (req, res, next) => {
  try {
    const creatorId = req.user.userId;
    const invitationId = req.params.id;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'negotiating'].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be 'accepted', 'rejected', or 'negotiating'",
      });
    }

    const result = await creatorRequestService.respondToInvitation(
      invitationId,
      creatorId,
      status
    );

    res.status(200).json({
      success: true,
      message: `Invitation successfully updated to '${status}'`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCreatorRequests,
  respondToRequest,
};