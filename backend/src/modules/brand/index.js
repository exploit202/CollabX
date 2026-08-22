const express = require('express');
const router = express.Router();

const brandProfileRouter = require('./routes/brandProfile.routes');
const campaignRouter = require('./routes/campaign.routes');
const brandDashboardRouter = require('./routes/brandDashboard.routes');
const savedCreatorsRouter = require('./routes/savedCreators.routes');
const invitationRouter = require('./routes/invitation.routes');
const negotiationRouter = require('./routes/negotiation.routes');
const activeCollaborationRouter = require('./routes/activeCollaboration.routes');
const brandNotificationRouter = require('./routes/brandnotification.routes');
const paymentRouter = require('./routes/payment.routes');
const analyticsRouter = require('./routes/analytics.routes');
const reviewRouter = require('../creator/routes/review.routes');
const brandDiscoveryRouter = require('./routes/brandDiscovery.routes');
const brandSettingsRouter = require('./routes/brandSettings.routes');
const reportRouter = require('../reports/report.routes').createRoleRouter('brand');

router.use('/dashboard', brandDashboardRouter);
router.use('/profile', brandProfileRouter);
router.use('/campaigns', campaignRouter);
router.use('/saved-creators', savedCreatorsRouter);
router.use('/creators', brandDiscoveryRouter);
router.use('/invitations', invitationRouter);
router.use('/negotiations', negotiationRouter);
router.use('/collaborations', activeCollaborationRouter);
router.use('/notifications', brandNotificationRouter);
router.use('/payments', paymentRouter);
router.use('/analytics', analyticsRouter);
router.use('/reviews', reviewRouter);
router.use('/settings', brandSettingsRouter);
router.use('/reports', reportRouter);

module.exports = router;
