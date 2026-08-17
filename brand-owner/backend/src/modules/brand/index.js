const express = require('express');
const router = express.Router();
const campaignRouter = require('./routes/campaign.routes');
router.use('/campaigns', campaignRouter);
const activeCollaborationRouter = require('./routes/activeCollaboration.routes');
router.use('/activecollaborations', activeCollaborationRouter);


// router.use('/negotiations', negotiationRouter);
// router.use('/negotiation-messages', negotiationMessageRouter);


// Brand profile route

const invitationRouter = require('./routes/brandInvitation.routes');
const negotiationRouter = require('./routes/brandNegotiation.routes');
const notificationRouter = require('./routes/brandNotification.routes');
const dashboardRouter = require('./routes/brandDashboard.routes');
const creatorDiscoveryRouter = require('./routes/savedCreators.routes');


const brandProfileRouter = require('./routes/brandProfile.routes');

router.use('/profile', brandProfileRouter);
router.use('/invitations', invitationRouter);

router.use('/negotiations', negotiationRouter);
router.use('/dashboard', dashboardRouter);
router.use('/', creatorDiscoveryRouter);






router.use('/notifications', notificationRouter);
const settingsRouter = require('./routes/brandsettings.routes');
router.use('/settings', settingsRouter);
const BrandProfile = require('./models/brandProfile.model');
const { authenticate } = require('../../middleware/auth.middleware');
const { successResponse } = require('../../utils/apiResponse');

router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const profile = await BrandProfile.findOne({
      userId: req.user.userId
    }).populate(
      'userId',
      'fullName email profileImage role'
    );

    if (!profile) {
      throw Object.assign(
        new Error('Brand profile not found.'),
        { statusCode: 404 }
      );
    }

    return successResponse(
      res,
      200,
      'Brand profile retrieved.',
      { profile }
    );

  } catch (error) {
    next(error);
  }
});


module.exports = router;