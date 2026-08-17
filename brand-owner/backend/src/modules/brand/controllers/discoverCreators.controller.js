const discoverService = require('../services/discoverCreators.service');

exports.searchCreators = async (req, res) => {
  try {
    const creators = await discoverService.getDiscoverCreators(req.query || {});
    return res.status(200).json({ success: true, data: creators });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to search creators'
    });
  }
};

exports.filterCreators = async (req, res) => {
  try {
    const creators = await discoverService.getDiscoverCreators(req.query || {});
    return res.status(200).json({ success: true, data: creators });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to filter creators'
    });
  }
};

exports.getDiscoverCreators = async (req, res) => {
  try {
    const creators = await discoverService.getDiscoverCreators(req.query || {});
    return res.status(200).json({ success: true, data: creators });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get creators'
    });
  }
};

exports.getCreatorProfile = async (req, res) => {
  try {
    const creator = await discoverService.getCreatorProfileById(req.params.id);
    return res.status(200).json({ success: true, data: creator });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to get creator profile'
    });
  }
};
