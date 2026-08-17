// const Negotiation = require("../models/negotiation.model");
// const Invitation = require("../models/invitation.model");
// const Campaign = require("../models/campaign");
// const User = require("../../auth/models/user.model");

// // =====================================================
// // CREATE NEGOTIATION FROM ACCEPTED INVITATION
// // =====================================================

// const createNegotiationFromInvitation = async ({
//   invitationId,
//   userId,
// }) => {
//   const invitation = await Invitation.findById(
//     invitationId
//   );

//   if (!invitation) {
//     const error = new Error("Invitation not found");
//     error.statusCode = 404;
//     error.code = "INVITATION_NOT_FOUND";
//     throw error;
//   }

//   // Only the invited creator can start negotiation
//   if (
//     String(invitation.creatorId) !== String(userId)
//   ) {
//     const error = new Error(
//       "Only the invited creator can start negotiation"
//     );
//     error.statusCode = 403;
//     error.code = "NEGOTIATION_ACCESS_DENIED";
//     throw error;
//   }

//   // Invitation must be accepted/negotiating
//   if (
//     !["accepted", "negotiating"].includes(
//       invitation.status
//     )
//   ) {
//     const error = new Error(
//       "Invitation must be accepted before negotiation"
//     );
//     error.statusCode = 400;
//     error.code = "INVITATION_NOT_ACCEPTED";
//     throw error;
//   }

//   // Check if negotiation already exists
//   let negotiation = await Negotiation.findOne({
//     invitationId,
//   });

//   if (negotiation) {
//     return negotiation;
//   }

//   const campaign = await Campaign.findById(
//     invitation.campaignId
//   );

//   if (!campaign) {
//     const error = new Error("Campaign not found");
//     error.statusCode = 404;
//     error.code = "CAMPAIGN_NOT_FOUND";
//     throw error;
//   }

//   negotiation = await Negotiation.create({
//     invitationId: invitation._id,

//     campaignId: invitation.campaignId,
//     campaignName:
//       invitation.campaignTitle ||
//       campaign.title,

//     brandId: invitation.brandId,
//     brandName: invitation.brandName,
//     brandLogo: invitation.brandLogo,

//     creatorId: invitation.creatorId,
//     creatorName: invitation.creatorName,
//     creatorAvatar: invitation.creatorAvatar,

//     proposedBudget: invitation.proposedPrice,
//     currentBudget: invitation.proposedPrice,

//     status: "open",

//     offers: [
//       {
//         senderId: invitation.brandId,
//         senderRole: "brand",
//         senderName: invitation.brandName,
//         senderAvatar: invitation.brandLogo,
//         message:
//           invitation.message ||
//           "Initial campaign offer",
//         proposedBudget:
//           invitation.proposedPrice,
//         status: "offered",
//       },
//     ],

//     lastActivity: new Date(),
//   });

//   // Keep invitation synchronized
//   invitation.status = "negotiating";
//   await invitation.save();

//   return negotiation;
// };

// // =====================================================
// // GET NEGOTIATION BY ID
// // =====================================================

// const getNegotiationById = async ({
//   negotiationId,
//   userId,
// }) => {
//   const negotiation =
//     await Negotiation.findById(negotiationId).lean();

//   if (!negotiation) {
//     const error = new Error(
//       "Negotiation not found"
//     );
//     error.statusCode = 404;
//     error.code = "NEGOTIATION_NOT_FOUND";
//     throw error;
//   }

//   const isBrand =
//     String(negotiation.brandId) ===
//     String(userId);

//   const isCreator =
//     String(negotiation.creatorId) ===
//     String(userId);

//   if (!isBrand && !isCreator) {
//     const error = new Error(
//       "You do not have access to this negotiation"
//     );
//     error.statusCode = 403;
//     error.code = "NEGOTIATION_ACCESS_DENIED";
//     throw error;
//   }

//   return negotiation;
// };

// // =====================================================
// // GET BRAND NEGOTIATIONS
// // =====================================================

// const getBrandNegotiations = async (
//   brandId,
//   filters = {}
// ) => {
//   const query = {
//     brandId,
//   };

//   if (filters.status) {
//     query.status = filters.status;
//   }

//   return Negotiation.find(query)
//     .populate(
//       "campaignId",
//       "title category budget deadline status"
//     )
//     .populate(
//       "creatorId",
//       "fullName email profileImage"
//     )
//     .sort({ lastActivity: -1 })
//     .lean();
// };

// // =====================================================
// // GET CREATOR NEGOTIATIONS
// // =====================================================

// const getCreatorNegotiations = async (
//   creatorId,
//   filters = {}
// ) => {
//   const query = {
//     creatorId,
//   };

//   if (filters.status) {
//     query.status = filters.status;
//   }

//   return Negotiation.find(query)
//     .populate(
//       "campaignId",
//       "title category budget deadline status"
//     )
//     .populate(
//       "brandId",
//       "fullName email profileImage"
//     )
//     .sort({ lastActivity: -1 })
//     .lean();
// };

// // =====================================================
// // SEND NEW OFFER / COUNTER OFFER
// // =====================================================

// const createOffer = async ({
//   negotiationId,
//   userId,
//   message,
//   proposedBudget,
//   attachmentUrl,
//   attachmentName,
//   attachmentType,
// }) => {
//   const negotiation =
//     await Negotiation.findById(
//       negotiationId
//     );

//   if (!negotiation) {
//     const error = new Error(
//       "Negotiation not found"
//     );
//     error.statusCode = 404;
//     error.code = "NEGOTIATION_NOT_FOUND";
//     throw error;
//   }

//   if (negotiation.status !== "open") {
//     const error = new Error(
//       "Negotiation is no longer open"
//     );
//     error.statusCode = 400;
//     error.code = "NEGOTIATION_NOT_OPEN";
//     throw error;
//   }

//   const isBrand =
//     String(negotiation.brandId) ===
//     String(userId);

//   const isCreator =
//     String(negotiation.creatorId) ===
//     String(userId);

//   if (!isBrand && !isCreator) {
//     const error = new Error(
//       "You do not have access to this negotiation"
//     );
//     error.statusCode = 403;
//     error.code = "NEGOTIATION_ACCESS_DENIED";
//     throw error;
//   }

//   const user = await User.findById(userId).select(
//     "fullName profileImage role"
//   );

//   if (!user) {
//     const error = new Error("User not found");
//     error.statusCode = 404;
//     error.code = "USER_NOT_FOUND";
//     throw error;
//   }

//   // Mark previous active offers as countered
//   negotiation.offers.forEach((offer) => {
//     if (
//       ["offered", "countered"].includes(
//         offer.status
//       )
//     ) {
//       offer.status = "countered";
//     }
//   });

//   const newOffer = {
//     senderId: user._id,
//     senderRole: isBrand ? "brand" : "creator",
//     senderName: user.fullName,
//     senderAvatar: user.profileImage || "",

//     message: message || "",

//     proposedBudget,

//     attachmentUrl:
//       attachmentUrl || "",

//     attachmentName:
//       attachmentName || "",

//     attachmentType:
//       attachmentType || null,

//     status: "offered",

//     isRead: false,
//   };

//   negotiation.offers.push(newOffer);

//   negotiation.currentBudget = proposedBudget;
//   negotiation.lastActivity = new Date();

//   await negotiation.save();

//   return negotiation;
// };

// // =====================================================
// // ACCEPT OFFER
// // =====================================================

// const acceptOffer = async ({
//   negotiationId,
//   userId,
//   offerId,
// }) => {
//   const negotiation =
//     await Negotiation.findById(
//       negotiationId
//     );

//   if (!negotiation) {
//     const error = new Error(
//       "Negotiation not found"
//     );
//     error.statusCode = 404;
//     error.code = "NEGOTIATION_NOT_FOUND";
//     throw error;
//   }

//   const isBrand =
//     String(negotiation.brandId) ===
//     String(userId);

//   const isCreator =
//     String(negotiation.creatorId) ===
//     String(userId);

//   if (!isBrand && !isCreator) {
//     const error = new Error(
//       "You do not have access to this negotiation"
//     );
//     error.statusCode = 403;
//     error.code = "NEGOTIATION_ACCESS_DENIED";
//     throw error;
//   }

//   if (negotiation.status !== "open") {
//     const error = new Error(
//       "Negotiation is no longer open"
//     );
//     error.statusCode = 400;
//     error.code = "NEGOTIATION_NOT_OPEN";
//     throw error;
//   }

//   const offer = negotiation.offers.id(
//     offerId
//   );

//   if (!offer) {
//     const error = new Error(
//       "Offer not found"
//     );
//     error.statusCode = 404;
//     error.code = "OFFER_NOT_FOUND";
//     throw error;
//   }

//   // Only the other party should accept an offer
//   if (
//     String(offer.senderId) ===
//     String(userId)
//   ) {
//     const error = new Error(
//       "You cannot accept your own offer"
//     );
//     error.statusCode = 400;
//     error.code = "OWN_OFFER";
//     throw error;
//   }

//   offer.status = "accepted";

//   // Decline all other active offers
//   negotiation.offers.forEach((item) => {
//     if (
//       String(item._id) !==
//         String(offer._id) &&
//       ["offered", "countered"].includes(
//         item.status
//       )
//     ) {
//       item.status = "declined";
//     }
//   });

//   negotiation.agreedBudget =
//     offer.proposedBudget;

//   negotiation.currentBudget =
//     offer.proposedBudget;

//   negotiation.status = "agreed";
//   negotiation.lastActivity = new Date();

//   await negotiation.save();

//   // Update invitation
//   await Invitation.findByIdAndUpdate(
//     negotiation.invitationId,
//     {
//       status: "accepted",
//       respondedAt: new Date(),
//     }
//   );

//   return negotiation;
// };

// // =====================================================
// // DECLINE OFFER
// // =====================================================

// const declineOffer = async ({
//   negotiationId,
//   userId,
//   offerId,
// }) => {
//   const negotiation =
//     await Negotiation.findById(
//       negotiationId
//     );

//   if (!negotiation) {
//     const error = new Error(
//       "Negotiation not found"
//     );
//     error.statusCode = 404;
//     error.code = "NEGOTIATION_NOT_FOUND";
//     throw error;
//   }

//   const isBrand =
//     String(negotiation.brandId) ===
//     String(userId);

//   const isCreator =
//     String(negotiation.creatorId) ===
//     String(userId);

//   if (!isBrand && !isCreator) {
//     const error = new Error(
//       "You do not have access to this negotiation"
//     );
//     error.statusCode = 403;
//     error.code = "NEGOTIATION_ACCESS_DENIED";
//     throw error;
//   }

//   const offer = negotiation.offers.id(
//     offerId
//   );

//   if (!offer) {
//     const error = new Error(
//       "Offer not found"
//     );
//     error.statusCode = 404;
//     error.code = "OFFER_NOT_FOUND";
//     throw error;
//   }

//   offer.status = "declined";

//   negotiation.lastActivity = new Date();

//   await negotiation.save();

//   return negotiation;
// };

// // =====================================================
// // CLOSE NEGOTIATION
// // =====================================================

// const closeNegotiation = async ({
//   negotiationId,
//   userId,
// }) => {
//   const negotiation =
//     await Negotiation.findById(
//       negotiationId
//     );

//   if (!negotiation) {
//     const error = new Error(
//       "Negotiation not found"
//     );
//     error.statusCode = 404;
//     error.code = "NEGOTIATION_NOT_FOUND";
//     throw error;
//   }

//   const isBrand =
//     String(negotiation.brandId) ===
//     String(userId);

//   const isCreator =
//     String(negotiation.creatorId) ===
//     String(userId);

//   if (!isBrand && !isCreator) {
//     const error = new Error(
//       "You do not have access to this negotiation"
//     );
//     error.statusCode = 403;
//     error.code = "NEGOTIATION_ACCESS_DENIED";
//     throw error;
//   }

//   if (negotiation.status === "agreed") {
//     const error = new Error(
//       "An agreed negotiation cannot be closed"
//     );
//     error.statusCode = 400;
//     error.code = "NEGOTIATION_ALREADY_AGREED";
//     throw error;
//   }

//   negotiation.status = "closed";
//   negotiation.lastActivity = new Date();

//   await negotiation.save();

//   await Invitation.findByIdAndUpdate(
//     negotiation.invitationId,
//     {
//       status: "cancelled",
//       respondedAt: new Date(),
//     }
//   );

//   return negotiation;
// };

// module.exports = {
//   createNegotiationFromInvitation,
//   getNegotiationById,
//   getBrandNegotiations,
//   getCreatorNegotiations,
//   createOffer,
//   acceptOffer,
//   declineOffer,
//   closeNegotiation,
// };