const payoutAccountService = require('../services/payoutAccount.service');
const { successResponse } = require('../../../utils/apiResponse');

const getUserId = (req) => req.user?.userId || req.user?._id || req.user?.id;

const getPayoutAccount = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const account = await payoutAccountService.getPayoutAccount(creatorId);
    return successResponse(res, 200, 'Payout account retrieved.', account);
  } catch (error) {
    next(error);
  }
};

const updatePayoutAccount = async (req, res, next) => {
  try {
    const creatorId = getUserId(req);
    const account = await payoutAccountService.createOrUpdatePayoutAccount(creatorId, req.body);
    return successResponse(res, 200, 'Payout account updated successfully.', account);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayoutAccount,
  updatePayoutAccount
};
