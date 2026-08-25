const cloudinary = require('../config/cloudinary');
const User = require('../models/user.model');
const CreatorProfile = require('../models/creatorProfile.model');
const BrandProfile = require('../models/brandProfile.model');

/**
 * Upload Buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>}
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        ...options
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Delete previous asset from Cloudinary by publicId
 * @param {String} publicId - Cloudinary publicId to remove
 * @returns {Promise<Object>}
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Failed to delete previous Cloudinary asset:', publicId, error);
    return null;
  }
};

/**
 * Upload and update profile image for Creator or Brand user
 * @param {String} userId - User ID of the authenticated user
 * @param {Buffer} buffer - File buffer
 * @param {String} role - Role of the user ('creator' or 'brand')
 */
const uploadUserProfileImage = async (userId, buffer, role) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User account not found.');
    error.statusCode = 404;
    throw error;
  }

  const effectiveRole = user.role || role;

  // Organize separate Cloudinary folders by role
  let folder = 'collabx/profiles/creators';
  let ProfileModel = CreatorProfile;

  if (effectiveRole === 'brand') {
    folder = 'collabx/profiles/brands';
    ProfileModel = BrandProfile;
  }

  // Generate unique public_id using authenticated userId and timestamp
  const publicId = `${folder}/${userId}_${Date.now()}`;

  // 1. Upload new image to Cloudinary
  const uploadResult = await uploadToCloudinary(buffer, {
    public_id: publicId
  });

  const newProfileImage = {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id
  };

  // 2. Fetch current profile document to retrieve old publicId
  let profile = await ProfileModel.findOne({ userId });
  const oldPublicId = profile?.profileImage?.publicId;

  // 3. Update profile document in MongoDB
  if (!profile) {
    profile = await ProfileModel.create({
      userId,
      profileImage: newProfileImage
    });
  } else {
    profile.profileImage = newProfileImage;
    await profile.save();
  }

  // Also sync User.profileImage
  user.profileImage = uploadResult.secure_url;
  await user.save();

  // 4. Delete previous Cloudinary asset AFTER new upload & DB update succeed
  if (oldPublicId && oldPublicId !== uploadResult.public_id) {
    await deleteFromCloudinary(oldPublicId);
  }

  return {
    profileImage: newProfileImage,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage
    },
    profile
  };
};

module.exports = {
  uploadUserProfileImage,
  uploadToCloudinary,
  deleteFromCloudinary
};
