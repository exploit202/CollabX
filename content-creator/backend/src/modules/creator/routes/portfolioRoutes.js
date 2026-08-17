const express = require('express');
const router = express.Router();
const {
  getAllCreators,
  getPortfolioByCreator,
  addPortfolioItem,
} = require('../controllers/portfolioController');
const upload = require('../middleware/upload');

// GET /api/portfolio/creators        -> all creators + their portfolio items
router.get('/creators', getAllCreators);

// GET /api/portfolio/:creatorId      -> one creator + their portfolio items
router.get('/:creatorId', getPortfolioByCreator);

// POST /api/portfolio                -> add a showcase item (multipart/form-data, field: thumbnail)
router.post('/', upload.single('thumbnail'), addPortfolioItem);

module.exports = router;