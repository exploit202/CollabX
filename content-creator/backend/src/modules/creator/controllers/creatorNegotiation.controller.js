// const creatorNegotiationService = require('../services/creatorNegotiation.service');

// /**
//  * @desc View creator negotiations list
//  * @route GET /api/creator/negotiations
//  * @access Private (Creator / Brand)
//  */
// const getNegotiations = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const userRole = req.user?.role || req.headers['x-user-role'] || 'creator';
//     const { view, status, page = 1, limit = 20 } = req.query;

//     const statusView = view || status;
//     const result = await creatorNegotiationService.getNegotiations(
//       userId,
//       userRole,
//       statusView,
//       page,
//       limit
//     );

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
//  * @desc View single negotiation room details by ID
//  * @route GET /api/creator/negotiations/:id
//  * @access Private (Creator / Brand)
//  */
// const getNegotiationById = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const userRole = req.user?.role || req.headers['x-user-role'] || 'creator';
//     const negotiationId = req.params.id;

//     const negotiation = await creatorNegotiationService.getNegotiationById(
//       negotiationId,
//       userId,
//       userRole
//     );

//     res.status(200).json({
//       success: true,
//       data: negotiation,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Send counter offer or message in negotiation room
//  * @route POST /api/creator/negotiations/:id/counter
//  * @access Private (Creator / Brand)
//  */
// const sendCounterOffer = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const userRole = req.user?.role || req.headers['x-user-role'] || 'creator';

//     const negotiationId = req.params.id;
//     const offerPayload = req.body || {};

//     const updatedNegotiation = await creatorNegotiationService.sendCounterOffer(
//       negotiationId,
//       userId,
//       userRole,
//       offerPayload
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Counter offer sent successfully',
//       data: updatedNegotiation,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Accept negotiation & lock agreed budget
//  * @route POST /api/creator/negotiations/:id/accept
//  * @access Private (Creator / Brand)
//  */
// const acceptNegotiation = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const userRole = req.user?.role || req.headers['x-user-role'] || 'creator';
//     const negotiationId = req.params.id;

//     const result = await creatorNegotiationService.acceptNegotiation(
//       negotiationId,
//       userId,
//       userRole
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Negotiation accepted successfully and active collaboration created',
//       data: result,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Reject negotiation & mark as declined
//  * @route POST /api/creator/negotiations/:id/reject
//  * @access Private (Creator / Brand)
//  */
// const rejectNegotiation = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const userRole = req.user?.role || req.headers['x-user-role'] || 'creator';
//     const negotiationId = req.params.id;
//     const reason = req.body?.reason || req.body?.message || '';

//     const negotiation = await creatorNegotiationService.rejectNegotiation(
//       negotiationId,
//       userId,
//       userRole,
//       reason
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Negotiation declined successfully',
//       data: negotiation,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * @desc Mark messages in negotiation room as read
//  * @route PATCH /api/creator/negotiations/:id/read
//  * @access Private (Creator / Brand)
//  */
// const markAsRead = async (req, res, next) => {
//   try {
//     const userId = req.user?.id || req.headers['x-user-id'] || 'creator-1';
//     const negotiationId = req.params.id;

//     const negotiation = await creatorNegotiationService.markAsRead(
//       negotiationId,
//       userId
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Messages marked as read successfully',
//       data: negotiation,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   getNegotiations,
//   getNegotiationById,
//   sendCounterOffer,
//   addCounterOffer: sendCounterOffer,
//   acceptNegotiation,
//   finalizeAgreement: acceptNegotiation,
//   rejectNegotiation,
//   markAsRead,
// };


const creatorNegotiationService = require('../services/creatorNegotiation.service');

/**
 * @desc View creator negotiations list
 * @route GET /api/creator/negotiations
 * @access Private (Creator / Brand)
 */
const getNegotiations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'creator';
    const { view, status, page = 1, limit = 20 } = req.query;

    const statusView = view || status;

    const result = await creatorNegotiationService.getNegotiations(
      userId,
      userRole,
      statusView,
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
      total:
        result.total !== undefined
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
 * @desc View single negotiation room details by ID
 * @route GET /api/creator/negotiations/:id
 * @access Private (Creator / Brand)
 */
const getNegotiationById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'creator';
    const negotiationId = req.params.id;

    const negotiation = await creatorNegotiationService.getNegotiationById(
      negotiationId,
      userId,
      userRole
    );

    res.status(200).json({
      success: true,
      data: negotiation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Send counter offer or message in negotiation room
 * @route POST /api/creator/negotiations/:id/counter
 * @access Private (Creator / Brand)
 */
const sendCounterOffer = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'creator';

    const negotiationId = req.params.id;
    const offerPayload = req.body || {};

    const updatedNegotiation =
      await creatorNegotiationService.sendCounterOffer(
        negotiationId,
        userId,
        userRole,
        offerPayload
      );

    res.status(200).json({
      success: true,
      message: 'Counter offer sent successfully',
      data: updatedNegotiation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Accept negotiation & lock agreed budget
 * @route POST /api/creator/negotiations/:id/accept
 * @access Private (Creator / Brand)
 */
const acceptNegotiation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'creator';
    const negotiationId = req.params.id;

    const result = await creatorNegotiationService.acceptNegotiation(
      negotiationId,
      userId,
      userRole
    );

    res.status(200).json({
      success: true,
      message:
        'Negotiation accepted successfully and active collaboration created',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Reject negotiation & mark as declined
 * @route POST /api/creator/negotiations/:id/reject
 * @access Private (Creator / Brand)
 */
const rejectNegotiation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'creator';
    const negotiationId = req.params.id;
    const reason = req.body?.reason || req.body?.message || '';

    const negotiation = await creatorNegotiationService.rejectNegotiation(
      negotiationId,
      userId,
      userRole,
      reason
    );

    res.status(200).json({
      success: true,
      message: 'Negotiation declined successfully',
      data: negotiation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Mark messages in negotiation room as read
 * @route PATCH /api/creator/negotiations/:id/read
 * @access Private (Creator / Brand)
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const negotiationId = req.params.id;

    const negotiation = await creatorNegotiationService.markAsRead(
      negotiationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read successfully',
      data: negotiation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNegotiations,
  getNegotiationById,
  sendCounterOffer,
  addCounterOffer: sendCounterOffer,
  acceptNegotiation,
  finalizeAgreement: acceptNegotiation,
  rejectNegotiation,
  markAsRead,
};