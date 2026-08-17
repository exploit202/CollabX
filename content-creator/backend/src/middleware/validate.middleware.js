/**
 * Validation Middleware Wrapper
 * Executes validation rules against req.body, req.params, and req.query.
 * Automatically parses stringified JSON bodies if sent as Text/Plain.
 * 
 * @param {Function} validationFn - Function returning array of error strings
 */
const validate = (validationFn) => {
  return (req, res, next) => {
    // If request body is sent as text string, attempt auto-parsing JSON
    if (typeof req.body === 'string' && req.body.trim().startsWith('{')) {
      try {
        req.body = JSON.parse(req.body);
      } catch (_) {
        // Ignore parse error and proceed to validator
      }
    }

    const errors = validationFn(req);

    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    next();
  };
};

module.exports = validate;
