const paymentService = require('../services/payment.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const initiateEscrow = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const payment = await paymentService.initiateEscrowPayment(brandId, req.body);
    return successResponse(res, 201, 'Escrow payment initiated successfully.', payment);
  } catch (error) {
    next(error);
  }
};

const releaseEscrow = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const payment = await paymentService.releaseEscrowPayment(req.params.id, userId);
    return successResponse(res, 200, 'Escrow payment released successfully.', payment);
  } catch (error) {
    next(error);
  }
};

const getBrandPayments = async (req, res, next) => {
  try {
    const brandId = getUserId(req);
    const payments = await paymentService.getBrandPayments(brandId);
    return successResponse(res, 200, 'Brand payments retrieved.', payments);
  } catch (error) {
    next(error);
  }
};

const getCreatorPayments = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const payments = await paymentService.getCreatorPayments(creatorId);
    return successResponse(res, 200, 'Creator payments retrieved.', payments);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateEscrow,
  releaseEscrow,
  getBrandPayments,
  getCreatorPayments
};
