const express = require("express");

const activeCollaborationController = require(
  "../controllers/activeCollaboration.controller"
);

const {
  authenticate,
  authorize,
} = require("../../../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// CREATE COLLABORATION FROM AGREED NEGOTIATION
// =====================================================

router.post(
  "/negotiation/:negotiationId",
  authenticate,
  authorize("brand", "creator"),
  activeCollaborationController.createFromNegotiation
);

// =====================================================
// GET BRAND COLLABORATIONS
// =====================================================

router.get(
  "/brand",
  authenticate,
  authorize("brand"),
  activeCollaborationController.getBrandCollaborations
);

// =====================================================
// GET CREATOR COLLABORATIONS
// =====================================================

router.get(
  "/creator",
  authenticate,
  authorize("creator"),
  activeCollaborationController.getCreatorCollaborations
);

// =====================================================
// GET SINGLE COLLABORATION
// =====================================================

router.get(
  "/:id",
  authenticate,
  authorize("brand", "creator"),
  activeCollaborationController.getById
);

// =====================================================
// UPDATE PROGRESS / STATUS
// =====================================================

router.patch(
  "/:id/progress",
  authenticate,
  authorize("brand", "creator"),
  activeCollaborationController.updateProgress
);

// =====================================================
// COMPLETE COLLABORATION
// =====================================================

router.patch(
  "/:id/complete",
  authenticate,
  authorize("brand", "creator"),
  activeCollaborationController.completeCollaboration
);

// =====================================================
// CANCEL COLLABORATION
// =====================================================

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("brand", "creator"),
  activeCollaborationController.cancelCollaboration
);

module.exports = router;