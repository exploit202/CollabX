const Escrow = require('../../../models/escrow.model');
const Payment = require('../../../models/payment.model');
const Collaboration = require('../../../models/collaboration.model');
const Notification = require('../../../models/notification.model');
const { successResponse, errorResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

/**
 * POST /api/payments/fund
 * Fund escrow for a collaboration (Demo workflow)
 */
const fundEscrow = async (req, res, next) => {
  try {
    const { collaborationId, amount, currency } = req.body;

    if (!collaborationId) {
      return errorResponse(res, 400, 'collaborationId is required to fund escrow.');
    }

    const collaboration = await Collaboration.findById(collaborationId);
    if (!collaboration) {
      return errorResponse(res, 404, 'Collaboration not found.');
    }

    const brandId = req.user ? getUserId(req) : (collaboration.brandId?._id || collaboration.brandId);
    const creatorId = collaboration.creatorId?._id || collaboration.creatorId;
    const paymentAmount = Number(amount) || Number(collaboration.agreedBudget) || Number(collaboration.agreedPrice) || 50000;

    // Check if an existing Escrow or Payment exists
    let escrow = await Escrow.findOne({ collaborationId });
    if (!escrow) {
      escrow = new Escrow({
        collaborationId: collaboration._id,
        brandId,
        creatorId,
        amount: paymentAmount,
        currency: currency || 'INR',
        status: 'funded',
        fundedAt: new Date()
      });
    } else {
      escrow.status = 'funded';
      escrow.amount = paymentAmount;
      escrow.fundedAt = new Date();
    }
    await escrow.save();

    // Also mirror into Payment model for complete backwards compatibility
    let payment = await Payment.findOne({ collaborationId });
    if (!payment) {
      payment = new Payment({
        collaborationId: collaboration._id,
        brandId,
        creatorId,
        amount: paymentAmount,
        currency: currency || 'INR',
        status: 'funded',
        fundedAt: new Date(),
        escrowedAt: new Date(),
        transactionId: escrow.transactionId
      });
    } else {
      payment.status = 'funded';
      payment.amount = paymentAmount;
      payment.fundedAt = new Date();
      payment.escrowedAt = new Date();
    }
    await payment.save();

    // Update collaboration payment status
    collaboration.paymentStatus = 'escrowed';
    await collaboration.save();

    // Create in-app notification for creator
    try {
      await Notification.create({
        userId: creatorId,
        senderId: brandId,
        type: 'payment_escrowed',
        title: 'Escrow Payment Secured',
        message: `Brand has securely funded the escrow of ₹${paymentAmount.toLocaleString('en-IN')} for campaign "${collaboration.campaignTitle || 'Collaboration'}". You can start producing content!`,
        entityType: 'Escrow',
        entityId: escrow._id
      });
    } catch (notifErr) {
      console.warn('Failed to dispatch escrow notification:', notifErr.message);
    }

    return successResponse(res, 201, 'Escrow funded successfully.', escrow);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/release
 * Release payment to creator after deliverable approval (Demo workflow)
 */
const releaseEscrow = async (req, res, next) => {
  try {
    const { collaborationId, paymentId, escrowId } = req.body;

    let query = {};
    if (escrowId) query._id = escrowId;
    else if (paymentId) query._id = paymentId;
    else if (collaborationId) query.collaborationId = collaborationId;
    else {
      return errorResponse(res, 400, 'Please provide collaborationId, paymentId, or escrowId.');
    }

    let escrow = await Escrow.findOne(query);
    if (!escrow && (paymentId || collaborationId)) {
      // Try finding by collaborationId
      if (collaborationId) escrow = await Escrow.findOne({ collaborationId });
    }

    let payment = await Payment.findOne(query);
    if (!payment && collaborationId) {
      payment = await Payment.findOne({ collaborationId });
    }

    if (!escrow && !payment) {
      return errorResponse(res, 404, 'Escrow transaction not found.');
    }

    const now = new Date();

    if (escrow) {
      escrow.status = 'released';
      escrow.releasedAt = now;
      await escrow.save();
    }

    if (payment) {
      payment.status = 'released';
      payment.releasedAt = now;
      await payment.save();
    }

    const targetCollabId = escrow?.collaborationId || payment?.collaborationId;
    if (targetCollabId) {
      const collaboration = await Collaboration.findById(targetCollabId);
      if (collaboration) {
        collaboration.paymentStatus = 'released';
        if (collaboration.status !== 'completed') {
          collaboration.status = 'completed';
          collaboration.completedAt = now;
        }
        await collaboration.save();

        // Create notification for creator
        try {
          await Notification.create({
            userId: collaboration.creatorId,
            senderId: collaboration.brandId,
            type: 'payment_released',
            title: 'Escrow Payout Released',
            message: `Congratulations! Escrow payment of ₹${(escrow?.amount || payment?.amount || 0).toLocaleString('en-IN')} has been released to your account for "${collaboration.campaignTitle}".`,
            entityType: 'Escrow',
            entityId: escrow?._id || payment?._id
          });
        } catch (notifErr) {
          console.warn('Failed to dispatch release notification:', notifErr.message);
        }
      }
    }

    return successResponse(res, 200, 'Payment released successfully.', escrow || payment);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments
 * Get list of escrow/payment transactions (with optional filter)
 */
const getPayments = async (req, res, next) => {
  try {
    const { collaborationId, status, role } = req.query;
    const filter = {};

    if (collaborationId) filter.collaborationId = collaborationId;
    if (status) filter.status = status;

    if (req.user) {
      const userId = getUserId(req);
      if (req.user.role === 'brand') filter.brandId = userId;
      else if (req.user.role === 'creator') filter.creatorId = userId;
    }

    const escrows = await Escrow.find(filter)
      .populate('collaborationId', 'campaignTitle status agreedBudget agreedPrice brandName creatorName')
      .populate('brandId', 'fullName email')
      .populate('creatorId', 'fullName email')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Payments retrieved successfully.', escrows);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fundEscrow,
  releaseEscrow,
  getPayments
};
