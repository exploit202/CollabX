const express = require('express');
const router = express.Router();

router.use('/invitations', require('./routes/brandInvitation.routes'));
router.use('/negotiations', require('./routes/brandNegotiation.routes'));
router.use('/collaborations', require('./routes/brandCollaboration.routes'));

module.exports = router;
