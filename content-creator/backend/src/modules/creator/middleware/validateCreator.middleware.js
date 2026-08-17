const { errorResponse } = require('../../../utils/apiResponse');

const validate = (validationFunction) => {
  return (req, res, next) => {
    try {
      const errors = validationFunction(req);

      if (errors && errors.length > 0) {
        return errorResponse(
          res,
          400,
          'Validation failed.',
          'VALIDATION_ERROR',
          errors
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;