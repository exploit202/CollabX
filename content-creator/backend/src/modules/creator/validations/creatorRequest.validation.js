/**
 * Validation rules for Creator Collaboration Requests / Invitations
 */

const validateRespondToRequest = (req) => {
  const errors = [];
  const body = req.body || {};
  const params = req.params || {};

  const { status } = body;
  const { id } = params;

  if (!id) {
    errors.push('Invitation ID is required in URL parameters');
  }

  if (!status) {
    errors.push("Response status is required in request body (e.g. { \"status\": \"negotiating\" })");
  } else if (!['accepted', 'rejected', 'negotiating'].includes(status)) {
    errors.push("Invalid status. Allowed values: 'accepted', 'rejected', 'negotiating'");
  }

  return errors;
};

module.exports = {
  validateRespondToRequest,
};
