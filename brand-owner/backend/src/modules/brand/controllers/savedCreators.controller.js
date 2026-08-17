const savedService = require('../services/savedCreators.service');


// =====================================================
// SAVE CREATOR
// =====================================================

exports.saveCreator = async (req, res, next) => {
  try {
    const brandId = req.user.userId;
    const { creatorId } = req.body || {};

    if (!creatorId) {
      return res.status(400).json({
        success: false,
        message: 'creatorId is required'
      });
    }

    const result = await savedService.saveCreator(
      creatorId,
      brandId
    );

    if (!result.success) {
      return res.status(result.status || 400).json({
        success: false,
        message: result.message
      });
    }

    return res.status(result.status || 201).json({
      success: true,
      message: 'Creator saved successfully.',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// REMOVE SAVED CREATOR
// =====================================================

exports.removeSavedCreator = async (req, res, next) => {
  try {
    const brandId = req.user.userId;
    const { creatorId } = req.params;

    const removed = await savedService.removeSavedCreator(
      creatorId,
      brandId
    );

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Saved creator not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Creator removed from saved creators.'
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET SAVED CREATORS
// =====================================================

exports.getSavedCreators = async (req, res, next) => {
  try {
    const brandId = req.user.userId;

    const creators =
      await savedService.getSavedCreatorsByBrand(brandId);

    return res.status(200).json({
      success: true,
      message: 'Saved creators retrieved successfully.',
      data: creators
    });
  } catch (error) {
    next(error);
  }
};