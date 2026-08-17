const express = require('express');
const router = express.Router();

const invitationRouter = require('./routes/creatorinvitation.routes');
const negotiationRouter = require('./routes/creatornegotiation.routes');
const notificationRouter = require('./routes/creatornotification.routes');
const settingsRouter = require('./routes/creatorsettings.routes');


router.use('/invitations', invitationRouter);
router.use('/negotiations', negotiationRouter);
router.use('/notifications', notificationRouter);
router.use('/settings', settingsRouter);

module.exports = router;
