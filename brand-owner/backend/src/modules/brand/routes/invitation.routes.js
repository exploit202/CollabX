// const express = require("express");

// const invitationController = require("../controllers/invitation.controller");

// const {
//   authenticate,
//   authorize,
// } = require("../../auth/middleware/auth.middleware");

// const router = express.Router();

// // =====================================================
// // BRAND ROUTES
// // =====================================================

// // Brand sends invitation to creator
// router.post(
//   "/",
//   authenticate,
//   authorize("brand"),
//   invitationController.createInvitation
// );

// // Get invitations sent by logged-in brand
// router.get(
//   "/brand",
//   authenticate,
//   authorize("brand"),
//   invitationController.getBrandInvitations
// );

// // Brand cancels invitation
// router.patch(
//   "/:id/cancel",
//   authenticate,
//   authorize("brand"),
//   invitationController.cancelInvitation
// );

// // =====================================================
// // CREATOR ROUTES
// // =====================================================

// // Get invitations received by logged-in creator
// router.get(
//   "/creator",
//   authenticate,
//   authorize("creator"),
//   invitationController.getCreatorInvitations
// );

// // Creator accepts/rejects invitation
// router.patch(
//   "/:id/respond",
//   authenticate,
//   authorize("creator"),
//   invitationController.respondToInvitation
// );

// // =====================================================
// // SHARED ROUTE
// // =====================================================

// // Brand or creator can view their invitation
// router.get(
//   "/:id",
//   authenticate,
//   invitationController.getInvitationById
// );

// module.exports = router;