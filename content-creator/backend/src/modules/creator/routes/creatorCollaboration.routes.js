// const express = require('express');
// const router = express.Router();
// const { protect, validate } = require('../middleware');
// const {
//   getCollaborations,
//   getCollaborationById,
//   submitContentDeliverable,
//   approveDeliverable,
// } = require('../controllers/creatorCollaboration.controller');
// const {
//   validateSubmitDeliverable,
//   validateApproveDeliverable,
// } = require('../validations/creatorCollaboration.validation');

// router.use(protect);

// router.get('/', getCollaborations);
// router.get('/:id', getCollaborationById);
// router.post('/:id/submit', validate(validateSubmitDeliverable), submitContentDeliverable);
// router.post('/:id/approve', validate(validateApproveDeliverable), approveDeliverable);

// module.exports = router;


const express = require('express');
const router = express.Router();

const { protect } = require('../../../middleware/auth.middleware');
const validate = require('../middleware/validateCreator.middleware');

const {
  getCollaborations,
  getCollaborationById,
  submitContentDeliverable,
  approveDeliverable
} = require('../controllers/creatorCollaboration.controller');

const {
  validateSubmitDeliverable,
  validateApproveDeliverable
} = require('../validations/creatorCollaboration.validation');

router.use(protect);

router.get('/', getCollaborations);

router.get('/:id', getCollaborationById);

router.post(
  '/:id/submit',
  validate(validateSubmitDeliverable),
  submitContentDeliverable
);

router.post(
  '/:id/approve',
  validate(validateApproveDeliverable),
  approveDeliverable
);

module.exports = router;