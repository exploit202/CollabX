const bcrypt = require("bcrypt");
const { sharedDB } = require("../../../config/db");

const User = require("../models/user.model");
const BrandProfile = require("../../brand/models/brandProfile.model");
const { generateToken } = require("../../../utils/jwt");

// =====================================================
// REGISTER
// =====================================================

const register = async (registerData) => {
  const {
    fullName,
    email,
    password,
    role,
    profileImage,

    // Brand fields
    companyName,
    industry,
    aboutBrand,
    companyLogo,
    website,

    // Common profile fields
    location,
    socialLinks,

    // Extended brand profile fields
    contactName,
    contactRole,
    targetAudience,
    preferredCreatorCategories,
    preferredPlatforms,
  } = registerData;

  // --------------------------------------------------
  // Only brand registration
  // --------------------------------------------------

  if (role !== "brand") {
    const error = new Error(
      "Only brand registration is supported."
    );

    error.statusCode = 400;
    error.code = "INVALID_ROLE";

    throw error;
  }

  // --------------------------------------------------
  // Check existing user
  // --------------------------------------------------

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error(
      "Email address is already registered"
    );

    error.statusCode = 409;
    error.code = "EMAIL_ALREADY_EXISTS";

    throw error;
  }

  // --------------------------------------------------
  // Hash password
  // --------------------------------------------------

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  // --------------------------------------------------
  // Shared DB transaction
  // --------------------------------------------------

  const session = await sharedDB.startSession();

  session.startTransaction();

  try {
    // ------------------------------------------------
    // Create User in shared DB
    // ------------------------------------------------

    const [newUser] = await User.create(
      [
        {
          fullName,
          email,
          password: hashedPassword,
          role: "brand",
          profileImage: profileImage || null,
          isVerified: false,
          isActive: true,
        },
      ],
      { session }
    );

    // ------------------------------------------------
    // Create BrandProfile in shared DB
    // ------------------------------------------------

    await BrandProfile.create(
      [
        {
          userId: newUser._id,

          companyName,
          industry: industry || "",
          aboutBrand: aboutBrand || "",
          companyLogo: companyLogo || null,
          website: website || null,

          location: location || {},

          socialLinks: {
            instagram: socialLinks?.instagram || null,
            linkedin: socialLinks?.linkedin || null,
            twitter: socialLinks?.twitter || null,
            facebook: socialLinks?.facebook || null,
          },

          contactName: contactName || "",
          contactRole: contactRole || "",
          targetAudience: targetAudience || "",

          preferredCreatorCategories:
            preferredCreatorCategories || [],

          preferredPlatforms:
            preferredPlatforms || [],
        },
      ],
      { session }
    );

    // ------------------------------------------------
    // Commit
    // ------------------------------------------------

    await session.commitTransaction();
    session.endSession();

    // ------------------------------------------------
    // Safe response
    // ------------------------------------------------

    const safeUser = newUser.toObject();

    delete safeUser.password;

    return safeUser;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

// =====================================================
// LOGIN
// =====================================================

const login = async (loginData) => {
  const { email, password } = loginData;

  // --------------------------------------------------
  // Find user
  // --------------------------------------------------

  const user = await User.findOne({ email })
    .select("+password");

  const throwAuthError = () => {
    const error = new Error(
      "Invalid email or password."
    );

    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";

    throw error;
  };

  if (!user) {
    throwAuthError();
  }

  // --------------------------------------------------
  // Check password
  // --------------------------------------------------

  const isMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!isMatch) {
    throwAuthError();
  }

  // --------------------------------------------------
  // Check active account
  // --------------------------------------------------

  if (!user.isActive) {
    const error = new Error(
      "Your account has been deactivated. Please contact support."
    );

    error.statusCode = 403;
    error.code = "ACCOUNT_DEACTIVATED";

    throw error;
  }

  // --------------------------------------------------
  // Only brand
  // --------------------------------------------------

  if (user.role !== "brand") {
    const error = new Error(
      "Only brand accounts can access this application."
    );

    error.statusCode = 403;
    error.code = "INVALID_ROLE";

    throw error;
  }

  // --------------------------------------------------
  // Generate JWT
  // --------------------------------------------------

  const token = generateToken({
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  // --------------------------------------------------
  // Update last login
  // --------------------------------------------------

  user.lastLogin = new Date();

  await user.save();

  // --------------------------------------------------
  // Safe user
  // --------------------------------------------------

  const safeUser = user.toObject();

  delete safeUser.password;

  return {
    user: safeUser,
    token,
  };
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (
  userId,
  newPassword,
  confirmPassword
) => {
  if (!newPassword || !confirmPassword) {
    const error = new Error(
      "New password and confirm password are required."
    );

    error.statusCode = 400;
    error.code = "PASSWORD_REQUIRED";

    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error(
      "New password and confirm password do not match."
    );

    error.statusCode = 400;
    error.code = "PASSWORD_MISMATCH";

    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error(
      "Password must be at least 8 characters long."
    );

    error.statusCode = 400;
    error.code = "PASSWORD_TOO_SHORT";

    throw error;
  }

  const user = await User.findById(userId)
    .select("+password");
    

  if (!user) {
    const error = new Error("User not found.");

    error.statusCode = 404;
    error.code = "USER_NOT_FOUND";

    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  user.password = hashedPassword;

  await user.save();

  return {
    userId: user._id,
  };
};
const updatePassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  if (!currentPassword || !newPassword) {
    const error = new Error(
      'Current password and new password are required.'
    );
    error.statusCode = 400;
    error.code = 'PASSWORD_REQUIRED';
    throw error;
  }

  if (newPassword.length < 8) {
    const error = new Error(
      'Password must be at least 8 characters long.'
    );
    error.statusCode = 400;
    error.code = 'PASSWORD_TOO_SHORT';
    throw error;
  }

  const user = await User.findById(userId)
    .select('+password');

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    const error = new Error(
      'Current password is incorrect.'
    );
    error.statusCode = 401;
    error.code = 'INVALID_CURRENT_PASSWORD';
    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    10
  );

  user.password = hashedPassword;

  await user.save();

  return {
    userId: user._id
  };
};

module.exports = {
  register,
  login,
  updatePassword,
  changePassword
};