const paymentService = require('../services/payment.service');

/**
 * @desc Create payment order & calculate 3% platform fee
 * @route POST /api/payments/create-order
 * @access Private (Brand)
 */
const createOrder = async (req, res, next) => {
  try {
    const payment = await paymentService.createOrder(req.user, req.body);
    res.status(201).json({
      success: true,
      message: 'Payment order created with 3% platform fee calculation',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Verify payment & fund escrow (Simulate Gateway Callback)
 * @route POST /api/payments/verify
 * @access Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, gatewayPaymentId, gatewaySignature } = req.body;
    const verifiedPayment = await paymentService.verifyPayment(
      paymentId || req.body.orderId,
      gatewayPaymentId,
      gatewaySignature
    );
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully and funds locked in Escrow',
      data: verifiedPayment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Release escrow payout to creator bank account / UPI ID
 * @route POST /api/payments/release-payout
 * @access Private (Brand / Admin)
 */
const releasePayout = async (req, res, next) => {
  try {
    const { paymentId } = req.body;
    const releasedPayment = await paymentService.releasePayout(
      paymentId || req.body.collaborationId,
      req.user
    );
    res.status(200).json({
      success: true,
      message: 'Escrow payout successfully released to Creator bank/UPI',
      data: releasedPayment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get payment transaction history for Brand or Creator
 * @route GET /api/payments/history
 * @access Private
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const history = await paymentService.getPaymentHistory(req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Configure Creator bank details or UPI ID for direct payouts
 * @route POST /api/payments/payout-account
 * @access Private (Creator)
 */
const savePayoutAccount = async (req, res, next) => {
  try {
    const account = await paymentService.savePayoutAccount(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Creator payout account details saved successfully',
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  releasePayout,
  getPaymentHistory,
  savePayoutAccount,
};
