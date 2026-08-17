/**
 * Standardized success response handler.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {object} [data]
 * @returns {import('express').Response}
 */
const successResponse = (res, statusCode, message, data = null) => {
  const responsePayload = {
    success: true,
    message,
  };

  if (data !== null) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};

/**
 * Standardized error response handler.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {string} [code]
 * @param {Array} [details]
 * @returns {import('express').Response}
 */
const errorResponse = (res, statusCode, message, code = null, details = null) => {
  const responsePayload = {
    success: false,
    message,
    error: {
      message,
    },
  };

  if (code) {
    responsePayload.code = code;
    responsePayload.error.code = code;
  }

  if (details) {
    responsePayload.error.details = details;
  }

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  successResponse,
  errorResponse,
};
