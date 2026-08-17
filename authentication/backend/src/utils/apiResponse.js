/**
 * Standard Success Response helper.
 * @param {object} res - Express response object.
 * @param {number} [statusCode=200] - HTTP status code (e.g. 200, 201).
 * @param {string} [message="Operation completed successfully."] - Descriptive success message.
 * @param {object|array|null} [data={}] - Response payload data.
 * @returns {object} Express response object.
 */
const successResponse = (res, statusCode = 200, message = 'Operation completed successfully.', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard Error Response helper.
 * @param {object} res - Express response object.
 * @param {number} [statusCode=500] - HTTP status code (e.g. 400, 401, 403, 404, 500).
 * @param {string} [message="Something went wrong."] - User-friendly error message.
 * @param {string} [errorCode="INTERNAL_SERVER_ERROR"] - Standardized error code for front-end handling.
 * @param {array|null} [details=null] - Optional structured error details for validation responses.
 * @returns {object} Express response object.
 */
const errorResponse = (res, statusCode = 500, message = 'Something went wrong.', errorCode = 'INTERNAL_SERVER_ERROR', details = null) => {
  const payload = {
    success: false,
    message,
    error: {
      code: errorCode
    }
  };

  if (details) {
    payload.error.details = details;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  errorResponse
};
