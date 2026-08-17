const express = require('express');
const router = express.Router();

const creatorAuthRouter = require('./routes/creatorAuth.routes');
const creatorProfileRouter = require('./routes/creatorProfile.routes');
const creatorDashboardRouter = require('./routes/creatorDashboard.routes');
const creatorRequestRouter = require('./routes/creatorRequest.routes');
const creatorNegotiationRouter = require('./routes/creatorNegotiation.routes');
const creatorCollaborationRouter = require('./routes/creatorCollaboration.routes');
const creatorNotificationRouter = require('./routes/creatorNotification.routes');
const campaignRouter = require('./routes/campaignRoutes');
const portfolioRouter = require('./routes/portfolioRoutes');
const pricingRouter = require('./routes/pricing.routes');
const reviewRouter = require('./routes/review.routes');
const payoutAccountRouter = require('./routes/payoutAccount.routes');
const paymentRouter = require('../brand/routes/payment.routes');
const creatorAnalyticsRouter = require('./routes/creatorAnalytics.routes');

router.use('/auth', creatorAuthRouter);
router.use('/profile', creatorProfileRouter);
router.use('/dashboard', creatorDashboardRouter);
router.use('/requests', creatorRequestRouter);
router.use('/invitations', creatorRequestRouter);
router.use('/negotiations', creatorNegotiationRouter);
router.use('/collaborations', creatorCollaborationRouter);
router.use('/notifications', creatorNotificationRouter);
router.use('/campaigns', campaignRouter);
router.use('/discover', campaignRouter);
router.use('/portfolio', portfolioRouter);
router.use('/pricing', pricingRouter);
router.use('/reviews', reviewRouter);
router.use('/payout-account', payoutAccountRouter);
router.use('/payments', paymentRouter);
router.use('/analytics', creatorAnalyticsRouter);

module.exports = router;
