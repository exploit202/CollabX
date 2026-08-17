const CreatorPayoutAccount = require('../../../models/creatorPayoutAccount.model');

const getPayoutAccount = async (creatorId) => {
  const account = await CreatorPayoutAccount.findOne({ creatorId });
  return account || null;
};

const createOrUpdatePayoutAccount = async (creatorId, data) => {
  const { bankName, accountNumber, ifscCode, accountHolderName, upiId } = data;

  const account = await CreatorPayoutAccount.findOneAndUpdate(
    { creatorId },
    {
      creatorId,
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      accountHolderName: accountHolderName || '',
      upiId: upiId || ''
    },
    { new: true, upsert: true, runValidators: true }
  );

  return account;
};

module.exports = {
  getPayoutAccount,
  createOrUpdatePayoutAccount
};
