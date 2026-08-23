const Payment = require('../../../models/payment.model');
const Collaboration = require('../../../models/collaboration.model');

const initiateEscrowPayment = async (brandUserId, { collaborationId, amount, currency, paymentMethod }) => {
  const collaboration = await Collaboration.findById(collaborationId);

  if (!collaboration) {
    const error = new Error('Collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(collaboration.brandId?._id || collaboration.brandId) === String(brandUserId);
  if (!isBrand) {
    const error = new Error('Only the owning brand can initiate escrow payment for this collaboration');
    error.statusCode = 403;
    throw error;
  }

  const paymentAmount = amount || collaboration.agreedBudget || collaboration.agreedPrice;
  if (!paymentAmount || Number(paymentAmount) <= 0) {
    const error = new Error('Valid payment amount is required');
    error.statusCode = 400;
    throw error;
  }

  // Prevent duplicate active/pending escrow payment
  const existingActive = await Payment.findOne({
    collaborationId: collaboration._id,
    status: { $in: ['pending', 'escrowed'] }
  });

  if (existingActive) {
    const error = new Error('An active or pending escrow payment already exists for this collaboration');
    error.statusCode = 400;
    throw error;
  }

  const payment = await Payment.create({
    collaborationId: collaboration._id,
    brandId: brandUserId,
    creatorId: collaboration.creatorId?._id || collaboration.creatorId,
    amount: Number(paymentAmount),
    currency: currency || 'INR',
    status: 'escrowed',
    paymentMethod: paymentMethod || 'simulated_escrow',
    transactionId: `ESCROW-${Date.now()}`,
    escrowedAt: new Date()
  });

  try {
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: collaboration.creatorId?._id || collaboration.creatorId,
      senderId: brandUserId,
      type: 'payment_escrowed',
      title: 'Escrow Funds Secured',
      message: `Brand ${collaboration.brandName} deposited ₹${Number(paymentAmount).toLocaleString('en-IN')} into escrow for your collaboration.`,
      entityType: 'Payment',
      entityId: payment._id
    });
    await notificationService.createNotification({
      userId: brandUserId,
      senderId: collaboration.creatorId?._id || collaboration.creatorId,
      type: 'escrow_funded',
      title: 'Escrow Payment Initiated',
      message: `You deposited ₹${Number(paymentAmount).toLocaleString('en-IN')} into CollabX Escrow Vault for "${collaboration.campaignTitle}".`,
      entityType: 'Payment',
      entityId: payment._id
    });
  } catch (err) {
    console.error('Notification error on escrow creation:', err);
  }

  return payment;
};

const releaseEscrowPayment = async (paymentId, userId) => {
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    const error = new Error('Payment not found');
    error.statusCode = 404;
    throw error;
  }

  const isBrand = String(payment.brandId?._id || payment.brandId) === String(userId);
  if (!isBrand) {
    const error = new Error('Only the owning brand can release escrow payment');
    error.statusCode = 403;
    throw error;
  }

  if (payment.status === 'released') {
    const error = new Error('Payment has already been released.');
    error.statusCode = 400;
    throw error;
  }

  if (!['escrowed', 'pending'].includes(payment.status)) {
    const error = new Error(`Payment cannot be released from status '${payment.status}'.`);
    error.statusCode = 400;
    throw error;
  }

  const collaboration = await Collaboration.findById(payment.collaborationId);
  if (!collaboration) {
    const error = new Error('Associated collaboration not found');
    error.statusCode = 404;
    throw error;
  }

  if (collaboration.status !== 'completed') {
    const error = new Error(`Escrow payment can only be released after collaboration is completed. Current status: '${collaboration.status}'.`);
    error.statusCode = 400;
    throw error;
  }

  payment.status = 'released';
  payment.releasedAt = new Date();
  await payment.save();

  try {
    const notificationService = require('./notification.service');
    await notificationService.createNotification({
      userId: payment.creatorId?._id || payment.creatorId,
      senderId: userId,
      type: 'payment_released',
      title: 'Escrow Payout Released',
      message: `Escrow payout of ₹${Number(payment.amount).toLocaleString('en-IN')} has been released to your account!`,
      entityType: 'Payment',
      entityId: payment._id
    });
    await notificationService.createNotification({
      userId: userId,
      senderId: payment.creatorId?._id || payment.creatorId,
      type: 'escrow_released',
      title: 'Escrow Payout Transferred',
      message: `₹${Number(payment.amount).toLocaleString('en-IN')} payout has been successfully transferred to ${collaboration.creatorName || 'creator'}.`,
      entityType: 'Payment',
      entityId: payment._id
    });
  } catch (err) {
    console.error('Notification error on escrow release:', err);
  }

  return payment;
};

const getBrandPayments = async (brandUserId) => {
  return Payment.find({ brandId: brandUserId })
    .populate('collaborationId', 'campaignTitle status')
    .populate('creatorId', 'fullName email')
    .sort({ createdAt: -1 });
};

const getCreatorPayments = async (creatorUserId) => {
  return Payment.find({ creatorId: creatorUserId })
    .populate('collaborationId', 'campaignTitle status')
    .populate('brandId', 'companyName email')
    .sort({ createdAt: -1 });
};

module.exports = {
  initiateEscrowPayment,
  releaseEscrowPayment,
  getBrandPayments,
  getCreatorPayments
};
