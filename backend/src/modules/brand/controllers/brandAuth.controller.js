const brandAuthService = require('../services/brandAuth.service');
const { successResponse } = require('../../../utils/apiResponse');
const { generateAccessToken, parseExpiresInToMs } = require('../../../utils/jwt');

const register = async (req, res, next) => {
  try {
    const user = await brandAuthService.registerBrand(req.body);
    const token = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });

    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 201, 'Brand registered successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await brandAuthService.loginBrand(req.body);
    const maxAge = parseExpiresInToMs(process.env.JWT_EXPIRES_IN);

    res.clearCookie('signupToken');
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge
    });

    return successResponse(res, 200, 'Brand logged in successfully.', { user, token });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};
