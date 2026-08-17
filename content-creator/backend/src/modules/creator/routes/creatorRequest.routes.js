// const express = require('express');
// const router = express.Router();
// const { protect, validate } = require('../middleware');
// const { getCreatorRequests, respondToRequest } = require('../controllers/creatorRequest.controller');
// const { validateRespondToRequest } = require('../validations/creatorRequest.validation');

// // All routes require authentication
// router.use(protect);

// router.get('/', getCreatorRequests);

// // Support both PATCH and POST for responding to requests
// router.patch('/:id/respond', validate(validateRespondToRequest), respondToRequest);
// router.post('/:id/respond', validate(validateRespondToRequest), respondToRequest);

// module.exports = router;


const express = require('express');
const router = express.Router();

const { protect } = require('../../../middleware/auth.middleware');
const validate = require('../middleware/validateCreator.middleware');

const {
  getCreatorRequests,
  respondToRequest
} = require('../controllers/creatorRequest.controller');

const {
  validateRespondToRequest
} = require('../validations/creatorRequest.validation');

router.use(protect);

router.get('/', getCreatorRequests);

router.patch(
  '/:id/respond',
  validate(validateRespondToRequest),
  respondToRequest
);

router.post(
  '/:id/respond',
  validate(validateRespondToRequest),
  respondToRequest
);

module.exports = router;