const validateCreateOrder = (req) => {
  const errors = [];
  const body = req.body || {};
  const { totalAmount } = body;

  if (totalAmount === undefined || totalAmount === null) {
    errors.push('totalAmount is required in request body');
  } else if (isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
    errors.push('totalAmount must be a positive number greater than 0');
  }

  return errors;
};

const validateVerifyPayment = (req) => {
  const errors = [];
  const body = req.body || {};
  const { paymentId, orderId } = body;

  if (!paymentId && !orderId) {
    errors.push('paymentId or orderId is required in request body');
  }

  return errors;
};

const validateReleasePayout = (req) => {
  const errors = [];
  const body = req.body || {};
  const { paymentId, collaborationId } = body;

  if (!paymentId && !collaborationId) {
    errors.push('paymentId or collaborationId is required in request body');
  }

  return errors;
};

module.exports = {
  validateCreateOrder,
  validateVerifyPayment,
  validateReleasePayout,
};
