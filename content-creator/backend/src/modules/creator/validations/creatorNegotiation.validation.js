const validateSendCounterOffer = (req) => {
  const errors = [];
  const body = req.body || {};

  const budget = body.proposedBudget !== undefined ? body.proposedBudget : body.proposedPrice;

  if (budget === undefined || budget === null) {
    errors.push('proposedBudget or proposedPrice is required in request body');
  } else if (isNaN(Number(budget)) || Number(budget) < 0) {
    errors.push('proposedBudget must be a non-negative number');
  }

  if (body.attachmentType && !['image', 'pdf', 'doc'].includes(body.attachmentType)) {
    errors.push("attachmentType must be one of 'image', 'pdf', or 'doc'");
  }

  return errors;
};

const validateRejectNegotiation = (req) => {
  const errors = [];
  return errors;
};

const validateFinalizeAgreement = (req) => {
  const errors = [];
  return errors;
};

module.exports = {
  validateSendCounterOffer,
  validateCounterOffer: validateSendCounterOffer,
  validateAddCounterOffer: validateSendCounterOffer, // backward compatibility alias for brand routes
  validateRejectNegotiation,
  validateFinalizeAgreement,
};
