const Creator = require('../models/creatorProfile.model'); // file is named Creatorprofile.model.js in your project
const PortfolioItem = require('../models/Portfolio'); // file is named Portfolio.js in your project

// GET /api/portfolio/creators
exports.getAllCreators = async (req, res, next) => {
  try {
    const creators = await Creator.find();

    const creatorsWithPortfolio = await Promise.all(
      creators.map(async (creator) => {
        const portfolio = await PortfolioItem.find({ creator: creator._id });
        return {
          ...creator.toJSON(),
          portfolio: portfolio.map((item) => item.toJSON()),
        };
      })
    );

    res.json(creatorsWithPortfolio);
  } catch (err) {
    next(err);
  }
};

// GET /api/portfolio/:creatorId
exports.getPortfolioByCreator = async (req, res, next) => {
  try {
    const creator = await Creator.findById(req.params.creatorId);
    if (!creator) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    const portfolio = await PortfolioItem.find({ creator: creator._id });
    res.json({ ...creator.toJSON(), portfolio: portfolio.map((item) => item.toJSON()) });
  } catch (err) {
    next(err);
  }
};

// POST /api/portfolio  (multipart/form-data)
exports.addPortfolioItem = async (req, res, next) => {
  try {
    const { creatorId, title, description, brandName, mediaType } = req.body;

    if (!creatorId || !title || !mediaType) {
      return res.status(400).json({ message: 'creatorId, title and mediaType are required.' });
    }

    const creatorExists = await Creator.findById(creatorId);
    if (!creatorExists) {
      return res.status(404).json({ message: 'Creator not found.' });
    }

    const thumbnail = req.file ? `/uploads/${req.file.filename}` : req.body.thumbnail;

    const item = await PortfolioItem.create({
      creator: creatorId,
      title,
      description,
      brandName,
      mediaType,
      thumbnail,
    });

    res.status(201).json(item.toJSON());
  } catch (err) {
    next(err);
  }
};