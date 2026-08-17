// const negotiationService = require("../services/negotiation.service");

// // =====================================================
// // CREATE NEGOTIATION FROM INVITATION
// // =====================================================

// const createNegotiation = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const negotiation =
//       await negotiationService.createNegotiationFromInvitation({
//         invitationId: req.params.invitationId,
//         userId,
//       });

//     return res.status(201).json({
//       success: true,
//       message: "Negotiation created successfully",
//       data: negotiation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // GET NEGOTIATION BY ID
// // =====================================================

// const getNegotiationById = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const negotiation =
//       await negotiationService.getNegotiationById({
//         negotiationId: req.params.id,
//         userId,
//       });

//     return res.status(200).json({
//       success: true,
//       data: negotiation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // GET BRAND NEGOTIATIONS
// // =====================================================

// const getBrandNegotiations = async (req, res, next) => {
//   try {
//     const brandId = req.user.userId;

//     const negotiations =
//       await negotiationService.getBrandNegotiations(
//         brandId,
//         {
//           status: req.query.status,
//         }
//       );

//     return res.status(200).json({
//       success: true,
//       count: negotiations.length,
//       data: negotiations,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // GET CREATOR NEGOTIATIONS
// // =====================================================

// const getCreatorNegotiations = async (req, res, next) => {
//   try {
//     const creatorId = req.user.userId;

//     const negotiations =
//       await negotiationService.getCreatorNegotiations(
//         creatorId,
//         {
//           status: req.query.status,
//         }
//       );

//     return res.status(200).json({
//       success: true,
//       count: negotiations.length,
//       data: negotiations,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // CREATE OFFER / COUNTER OFFER
// // =====================================================

// const createOffer = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const {
//       message,
//       proposedBudget,
//       attachmentUrl,
//       attachmentName,
//       attachmentType,
//     } = req.body;

//     if (
//       proposedBudget === undefined ||
//       proposedBudget === null
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Proposed budget is required",
//       });
//     }

//     if (
//       typeof proposedBudget !== "number" ||
//       proposedBudget < 0
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Proposed budget must be a valid positive number",
//       });
//     }

//     const negotiation =
//       await negotiationService.createOffer({
//         negotiationId: req.params.id,
//         userId,
//         message,
//         proposedBudget,
//         attachmentUrl,
//         attachmentName,
//         attachmentType,
//       });

//     return res.status(201).json({
//       success: true,
//       message: "Offer sent successfully",
//       data: negotiation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // ACCEPT OFFER
// // =====================================================

// const acceptOffer = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const negotiation =
//       await negotiationService.acceptOffer({
//         negotiationId: req.params.id,
//         userId,
//         offerId: req.params.offerId,
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Offer accepted successfully",
//       data: negotiation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // DECLINE OFFER
// // =====================================================

// const declineOffer = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const negotiation =
//       await negotiationService.declineOffer({
//         negotiationId: req.params.id,
//         userId,
//         offerId: req.params.offerId,
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Offer declined successfully",
//       data: negotiation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // CLOSE NEGOTIATION
// // =====================================================

// const closeNegotiation = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;

//     const negotiation =
//       await negotiationService.closeNegotiation({
//         negotiationId: req.params.id,
//         userId,
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Negotiation closed successfully",
//       data: negotiation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// module.exports = {
//   createNegotiation,
//   getNegotiationById,
//   getBrandNegotiations,
//   getCreatorNegotiations,
//   createOffer,
//   acceptOffer,
//   declineOffer,
//   closeNegotiation,
// };