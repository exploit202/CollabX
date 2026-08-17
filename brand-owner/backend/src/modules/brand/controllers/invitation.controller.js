// const invitationService = require("../services/invitation.service");

// const {
//   createInvitationSchema,
//   respondToInvitationSchema,
//   cancelInvitationSchema,
// } = require("../validations/invitation.validation");

// // =====================================================
// // CREATE INVITATION
// // Brand sends an invitation to a creator
// // =====================================================

// const createInvitation = async (req, res, next) => {
//   try {
//     const validation =
//       createInvitationSchema.safeParse(req.body);

//     if (!validation.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid invitation data",
//         errors: validation.error.flatten(),
//       });
//     }

//     const brandId = req.user.userId;

//     const invitation =
//       await invitationService.createInvitation({
//         ...validation.data,
//         brandId,
//       });

//     return res.status(201).json({
//       success: true,
//       message: "Invitation sent successfully",
//       data: invitation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // GET BRAND INVITATIONS
// // =====================================================

// const getBrandInvitations = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const brandId = req.user.userId;

//     const invitations =
//       await invitationService.getBrandInvitations(
//         brandId,
//         {
//           status: req.query.status,
//           campaignId: req.query.campaignId,
//         }
//       );

//     return res.status(200).json({
//       success: true,
//       count: invitations.length,
//       data: invitations,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // GET CREATOR INVITATIONS
// // =====================================================

// const getCreatorInvitations = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const creatorId = req.user.userId;

//     const invitations =
//       await invitationService.getCreatorInvitations(
//         creatorId,
//         {
//           status: req.query.status,
//         }
//       );

//     return res.status(200).json({
//       success: true,
//       count: invitations.length,
//       data: invitations,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // GET INVITATION BY ID
// // =====================================================

// const getInvitationById = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const userId = req.user.userId;

//     const invitation =
//       await invitationService.getInvitationById(
//         req.params.id,
//         userId
//       );

//     return res.status(200).json({
//       success: true,
//       data: invitation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // ACCEPT / REJECT INVITATION
// // Creator only
// // =====================================================

// const respondToInvitation = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const validation =
//       respondToInvitationSchema.safeParse(
//         req.body
//       );

//     if (!validation.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid invitation response",
//         errors: validation.error.flatten(),
//       });
//     }

//     const creatorId = req.user.userId;

//     const invitation =
//       await invitationService.respondToInvitation({
//         invitationId: req.params.id,
//         creatorId,
//         action: validation.data.action,
//       });

//     return res.status(200).json({
//       success: true,
//       message:
//         validation.data.action === "accept"
//           ? "Invitation accepted successfully"
//           : "Invitation rejected successfully",
//       data: invitation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// // =====================================================
// // CANCEL INVITATION
// // Brand only
// // =====================================================

// const cancelInvitation = async (
//   req,
//   res,
//   next
// ) => {
//   try {
//     const validation =
//       cancelInvitationSchema.safeParse(
//         req.body || {}
//       );

//     if (!validation.success) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid cancellation data",
//         errors: validation.error.flatten(),
//       });
//     }

//     const brandId = req.user.userId;

//     const invitation =
//       await invitationService.cancelInvitation({
//         invitationId: req.params.id,
//         brandId,
//       });

//     return res.status(200).json({
//       success: true,
//       message: "Invitation cancelled successfully",
//       data: invitation,
//     });
//   } catch (error) {
//     return next(error);
//   }
// };

// module.exports = {
//   createInvitation,
//   getBrandInvitations,
//   getCreatorInvitations,
//   getInvitationById,
//   respondToInvitation,
//   cancelInvitation,
// };