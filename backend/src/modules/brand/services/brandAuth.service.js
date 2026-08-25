const bcrypt = require('bcrypt');
const User = require('../../../models/user.model');
const BrandProfile = require('../../../models/brandProfile.model');

const registerBrand = async (registrationData) => {
  const {
    companyName,
    password,
    industryType,
    aboutBrand
  } = registrationData;

  const email = registrationData.workEmail || registrationData.email;

  if (!email) {
    const error = new Error('Email address is required');
    error.statusCode = 400;
    error.code = 'EMAIL_REQUIRED';
    throw error;
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Work email address is already registered');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await User.create({
    fullName: companyName,
    email,
    password: hashedPassword,
    role: 'brand',
    isVerified: false,
    isActive: true,
    registrationStatus: 'pending'
  });

  await BrandProfile.create({
    userId: newUser._id,
    companyName,
    industry: industryType || '',
    aboutBrand: aboutBrand || ''
  });

  const safeUser = newUser.toObject();
  delete safeUser.password;
  safeUser.userId = newUser._id;
  return safeUser;
};

const markRegistrationCompleted = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  if (user.role !== 'brand') {
    const error = new Error('Only brand owner accounts can complete registration');
    error.statusCode = 403;
    error.code = 'INVALID_USER_ROLE';
    throw error;
  }

  user.isVerified = true;
  user.registrationStatus = 'completed';
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

const loginBrand = async (loginData) => {
  const email = loginData.email || loginData.workEmail;
  const { password } = loginData;

  const user = await User.findOne({ email }).select('+password');

  const throwAuthError = () => {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  };

  if (!user) throwAuthError();
  if (user.role !== 'brand') throwAuthError();

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throwAuthError();

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    error.code = 'ACCOUNT_DEACTIVATED';
    throw error;
  }

  const { generateAccessToken } = require('../../../utils/jwt');
  const token = generateAccessToken({
    userId: user._id,
    email: user.email,
    role: user.role
  });

  user.lastLogin = new Date();
  await user.save();

  const safeUser = user.toObject();
  delete safeUser.password;

  return {
    user: safeUser,
    token
  };
};

module.exports = {
  registerBrand,
  markRegistrationCompleted,
  loginBrand
};
