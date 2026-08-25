const { successResponse } = require('../../utils/apiResponse');
const { createUserReport } = require('./report.service');

const submitReport = (allowedRole) => async (req, res, next) => {
  try {
    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        success: false,
        message: `Only ${allowedRole} accounts can use this report endpoint.`
      });
    }

    const report = await createUserReport(req.user._id, req.user.role, req.body);
    return successResponse(res, 201, 'Report submitted successfully.', { report });
  } catch (error) {
    return next(error);
  }
};

module.exports = { submitReport };
