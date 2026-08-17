// const express = require("express");

// const negotiationController = require("../controllers/negotiation.controller");

// const {
//   authenticate,
//   authorize,
// } = require("../../auth/middleware/auth.middleware");

// const router = express.Router();

// // =====================================================
// // CREATE NEGOTIATION FROM INVITATION
// // =====================================================

// router.post(
//   "/invitation/:invitationId",
//   authenticate,
//   authorize("brand", "creator"),
//   negotiationController.createNegotiation
// );

// // =====================================================
// // GET BRAND NEGOTIATIONS
// // =====================================================

// router.get(
//   "/brand",
//   authenticate,
//   authorize("brand"),
//   negotiationController.getBrandNegotiations
// );

// // =====================================================
// // GET CREATOR NEGOTIATIONS
// // =====================================================

// router.get(
//   "/creator",
//   authenticate,
//   authorize("creator"),
//   negotiationController.getCreatorNegotiations
// );

// // =====================================================
// // GET SINGLE NEGOTIATION
// // =====================================================

// router.get(
//   "/:id",
//   authenticate,
//   authorize("brand", "creator"),
//   negotiationController.getNegotiationById
// );

// // =====================================================
// // CREATE OFFER / COUNTER OFFER
// // =====================================================

// router.post(
//   "/:id/offers",
//   authenticate,
//   authorize("brand", "creator"),
//   negotiationController.createOffer
// );

// // =====================================================
// // ACCEPT OFFER
// // =====================================================

// router.patch(
//   "/:id/offers/:offerId/accept",
//   authenticate,
//   authorize("brand", "creator"),
//   negotiationController.acceptOffer
// );

// // =====================================================
// // DECLINE OFFER
// // =====================================================

// router.patch(
//   "/:id/offers/:offerId/decline",
//   authenticate,
//   authorize("brand", "creator"),
//   negotiationController.declineOffer
// );

// // =====================================================
// // CLOSE NEGOTIATION
// // =====================================================

// router.patch(
//   "/:id/close",
//   authenticate,
//   authorize("brand", "creator"),
//   negotiationController.closeNegotiation
// );

// module.exports = router;