/**
 * Validation rules for Active Collaborations
 */

const validateSubmitDeliverable = (req) => {
  const errors = [];
  const body = req.body || {};
  const params = req.params || {};

  const { submissionUrl, submissionNotes } = body;
  const { id } = params;

  if (!id) {
    errors.push('Collaboration ID is required in URL parameters');
  }

  if (!submissionUrl) {
    errors.push('submissionUrl is required in request body');
  } else {
    try {
      new URL(submissionUrl);
    } catch (_) {
      errors.push('submissionUrl must be a valid URL (e.g., https://instagram.com/p/draft or https://youtube.com/...)');
    }
  }

  if (submissionNotes && typeof submissionNotes !== 'string') {
    errors.push('submissionNotes must be a string text');
  }

  return errors;
};

const validateApproveDeliverable = (req) => {
  const errors = [];
  const body = req.body || {};
  const params = req.params || {};

  const { ratingGiven } = body;
  const { id } = params;

  if (!id) {
    errors.push('Collaboration ID is required in URL parameters');
  }

  if (ratingGiven !== undefined && ratingGiven !== null) {
    const rating = Number(ratingGiven);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      errors.push('ratingGiven must be a number between 1 and 5');
    }
  }

  return errors;
};

module.exports = {
  validateSubmitDeliverable,
  validateApproveDeliverable,
};
