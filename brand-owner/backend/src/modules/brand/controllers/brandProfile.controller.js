const BrandProfile = require('../models/brandProfile.model');
const { successResponse } = require('../../../utils/apiResponse');

const editableFields = ['companyName', 'industry', 'aboutBrand', 'companyLogo', 'website', 'location', 'socialLinks', 'contactName', 'contactRole', 'targetAudience', 'preferredCreatorCategories', 'preferredPlatforms'];

function requireBrand(req) {
  if (req.user?.role !== 'brand') {
    const error = new Error('Only brands can manage company profiles.');
    error.statusCode = 403;
    throw error;
  }
}

const getProfile = async (req, res, next) => {
  try {
      
    requireBrand(req);
      console.log('========== GET BRAND PROFILE ==========');
    console.log('req.user:', req.user);
    console.log('userId:', req.user?.userId);
    console.log('========================================');
    const profile = await BrandProfile.findOne({ userId: req.user.userId }).populate('userId', 'fullName email profileImage role');
    if (!profile) { const error = new Error('Brand profile not found.'); error.statusCode = 404; throw error; }
    return successResponse(res, 200, 'Brand profile retrieved.', { profile });
  } catch (error) { next(error); }
};

const updateProfile = async (req, res, next) => {
  try {
    requireBrand(req);
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => editableFields.includes(key)));
    if (!Object.keys(updates).length) { const error = new Error('No editable profile fields were provided.'); error.statusCode = 400; throw error; }
    const profile = await BrandProfile.findOneAndUpdate(
      { userId: req.user.userId }, updates, { new: true, runValidators: true }
    ).populate('userId', 'fullName email profileImage role');
    if (!profile) { const error = new Error('Brand profile not found.'); error.statusCode = 404; throw error; }
    return successResponse(res, 200, 'Brand profile updated successfully.', { profile });
  } catch (error) { next(error); }
};

module.exports = { getProfile, updateProfile };



//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YTdkMzgzZDY5OTgxNzhmNzMxNGQ4NjAiLCJlbWFpbCI6ImJyYW5kdGVzdDIwMjZAZ21haWwuY29tIiwicm9sZSI6ImJyYW5kIiwiaWF0IjoxNzg2NTkxMzI1LCJleHAiOjE3ODcxOTYxMjV9.pmuZF2ljyDHM5kMqiOFkcRuWB6E3mbqpS0fo_jJc63A
