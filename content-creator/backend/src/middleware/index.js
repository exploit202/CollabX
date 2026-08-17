const { protect, authorize } = require('./auth.middleware');
const { errorHandler, notFound } = require('./error.middleware');
const validate = require('./validate.middleware');
const { validateAttachment } = require('./upload.middleware');
const asyncHandler = require('./asyncHandler.middleware');

module.exports = {
  protect,
  authorize,
  errorHandler,
  notFound,
  validate,
  validateAttachment,
  asyncHandler,
};
