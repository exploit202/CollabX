const router = require('express').Router();
const controller = require('../controllers/brandnegotiationMessage.controller');
const { authenticate } = require('../../../middleware/auth.middleware');
const validateRequest = require('../../../middleware/validation.middleware');
const { messageSchema } = require('../validations/brandnegotiation.validation');
router.post('/', authenticate, validateRequest(messageSchema), controller.sendMessage);
module.exports = router;
