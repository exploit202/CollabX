const mongoose = require('mongoose');
const Payment = require('../models/Payment.model');
const CreatorPayoutAccount = require('../models/CreatorPayoutAccount.model');
const Collaboration = require('../../creator/models/Collaboration.model');
const Negotiation = require('../../creator/models/Negotiation.model');

// In-Memory Fallback Store
const inMemoryPayments = [];
const inMemoryPayoutAccounts = [];

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * 1. Create Payment Order & Calculate 3% Platform Fee
 */
const createOrder = async (user, payload) => {
  const { collaborationId, negotiationId, totalAmount, gateway = 'razorpay' } = payload;
  const amount = Number(totalAmount);

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error('Valid totalAmount greater than 0 is required');
  }

  // Calculate 3% Platform Commission & Net Creator Payout
  const platformFeeAmount = Math.round(amount * 0.03);
  const creatorPayoutAmount = amount - platformFeeAmount;

  let brandId = user.id;
  let brandName = user.name || 'Brand Team';
  let creatorId = 'creator-1';
  let creatorName = 'Creator';
  let targetCollabId = collaborationId || '';

  if (isDbConnected()) {
    if (collaborationId && mongoose.Types.ObjectId.isValid(collaborationId)) {
      const collab = await Collaboration.findById(collaborationId);
      if (collab) {
        brandId = collab.brandId;
        brandName = collab.brandName;
        creatorId = collab.creatorId;
        creatorName = collab.creatorName;
      }
    } else if (negotiationId && mongoose.Types.ObjectId.isValid(negotiationId)) {
      const neg = await Negotiation.findById(negotiationId);
      if (neg) {
        brandId = neg.brandId;
        brandName = neg.brandName;
        creatorId = neg.creatorId;
        creatorName = neg.creatorName;
      }
    }

    const gatewayOrderId = `order_rzp_test_${Date.now()}`;

    const newPayment = await Payment.create({
      collaborationId: targetCollabId || `collab-${Date.now()}`,
      negotiationId: negotiationId || '',
      brandId,
      brandName,
      creatorId,
      creatorName,
      totalAmount: amount,
      platformFeeRate: 0.03,
      platformFeeAmount,
      creatorPayoutAmount,
      currency: 'INR',
      gateway,
      gatewayOrderId,
      status: 'pending',
    });

    return newPayment;
  }

  // Fallback In-Memory
  const gatewayOrderId = `order_rzp_test_${Date.now()}`;
  const paymentObj = {
    _id: `pay-${Date.now()}`,
    collaborationId: targetCollabId || `collab-${Date.now()}`,
    negotiationId: negotiationId || '',
    brandId,
    brandName,
    creatorId,
    creatorName,
    totalAmount: amount,
    platformFeeRate: 0.03,
    platformFeeAmount,
    creatorPayoutAmount,
    currency: 'INR',
    gateway,
    gatewayOrderId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  inMemoryPayments.push(paymentObj);
  return paymentObj;
};

/**
 * 2. Verify Payment & Fund Escrow (Simulate Gateway Callback)
 */
const verifyPayment = async (paymentId, gatewayPaymentId = '', signature = '') => {
  const payId = gatewayPaymentId || `pay_rzp_test_${Date.now()}`;

  if (isDbConnected()) {
    let payment = null;
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await Payment.findById(paymentId);
    } else {
      payment = await Payment.findOne({ gatewayOrderId: paymentId });
    }

    if (!payment) {
      throw new Error(`Payment record '${paymentId}' not found`);
    }

    payment.status = 'escrowed';
    payment.gatewayPaymentId = payId;
    payment.gatewaySignature = signature || `sig_test_${Date.now()}`;
    payment.escrowFundedAt = new Date();
    await payment.save();

    // Update Collaboration Stage
    if (payment.collaborationId && mongoose.Types.ObjectId.isValid(payment.collaborationId)) {
      await Collaboration.findByIdAndUpdate(payment.collaborationId, {
        stage: 'agreement_finalized',
      });
    }

    return payment;
  }

  // In-Memory Fallback
  const payment = inMemoryPayments.find((p) => p._id === paymentId || p.gatewayOrderId === paymentId);
  if (!payment) throw new Error(`Payment record '${paymentId}' not found`);

  payment.status = 'escrowed';
  payment.gatewayPaymentId = payId;
  payment.escrowFundedAt = new Date().toISOString();
  return payment;
};

/**
 * 3. Release Escrow Payout to Creator Bank / UPI
 */
const releasePayout = async (paymentId, user) => {
  if (isDbConnected()) {
    let payment = null;
    if (mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await Payment.findById(paymentId);
    } else {
      payment = await Payment.findOne({ collaborationId: paymentId });
    }

    if (!payment) {
      throw new Error(`Payment record '${paymentId}' not found`);
    }

    if (payment.status === 'released') {
      throw new Error('Payout for this collaboration has already been released to creator');
    }

    const payoutRef = `payout_rzp_route_${Date.now()}`;
    payment.status = 'released';
    payment.escrowReleasedAt = new Date();
    payment.payoutReferenceId = payoutRef;
    await payment.save();

    // Update Collaboration Stage to completed
    if (payment.collaborationId && mongoose.Types.ObjectId.isValid(payment.collaborationId)) {
      await Collaboration.findByIdAndUpdate(payment.collaborationId, {
        stage: 'completed',
      });
    }

    return payment;
  }

  const payment = inMemoryPayments.find((p) => p._id === paymentId || p.collaborationId === paymentId);
  if (!payment) throw new Error(`Payment record '${paymentId}' not found`);

  payment.status = 'released';
  payment.escrowReleasedAt = new Date().toISOString();
  payment.payoutReferenceId = `payout_rzp_route_${Date.now()}`;
  return payment;
};

/**
 * 4. Get Payment History for Brand or Creator
 */
const getPaymentHistory = async (userId, userRole) => {
  if (isDbConnected()) {
    const query = {};
    if (userRole === 'creator') query.creatorId = userId;
    else if (userRole === 'brand') query.brandId = userId;
    else query.$or = [{ creatorId: userId }, { brandId: userId }];

    return await Payment.find(query).sort({ createdAt: -1 });
  }

  return inMemoryPayments.filter((p) =>
    userRole === 'creator' ? p.creatorId === userId : userRole === 'brand' ? p.brandId === userId : true
  );
};

/**
 * 5. Configure Creator Payout Account (Bank / UPI)
 */
const savePayoutAccount = async (creatorId, accountPayload) => {
  const { payoutMethod = 'upi', upiId, bankName, accountNumber, ifscCode, panNumber, accountHolderName } = accountPayload;

  if (isDbConnected()) {
    let account = await CreatorPayoutAccount.findOne({ creatorId });
    if (!account) {
      account = await CreatorPayoutAccount.create({
        creatorId,
        payoutMethod,
        accountHolderName: accountHolderName || 'Creator',
        bankName: bankName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        upiId: upiId || 'creator@okaxis',
        panNumber: panNumber || '',
        isVerified: true,
      });
    } else {
      account.payoutMethod = payoutMethod;
      if (upiId) account.upiId = upiId;
      if (bankName) account.bankName = bankName;
      if (accountNumber) account.accountNumber = accountNumber;
      if (ifscCode) account.ifscCode = ifscCode;
      if (panNumber) account.panNumber = panNumber;
      if (accountHolderName) account.accountHolderName = accountHolderName;
      await account.save();
    }
    return account;
  }

  const accountObj = {
    creatorId,
    payoutMethod,
    upiId: upiId || 'creator@okaxis',
    bankName: bankName || '',
    accountNumber: accountNumber || '',
    ifscCode: ifscCode || '',
    panNumber: panNumber || '',
    isVerified: true,
  };
  inMemoryPayoutAccounts.push(accountObj);
  return accountObj;
};

module.exports = {
  createOrder,
  verifyPayment,
  releasePayout,
  getPaymentHistory,
  savePayoutAccount,
  inMemoryPayments,
};
