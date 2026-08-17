const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

const User = require('../src/modules/auth/models/user.model');
const BrandProfile = require('../src/modules/brand/models/brandProfile.model');
const authService = require('../src/modules/auth/services/auth.service');

test('register rejects brand payloads that are missing a company name', async () => {
  const userFindOneMock = mock.method(User, 'findOne', async () => null);

  try {
    await assert.rejects(
      () =>
        authService.register({
          fullName: 'ABC Technologies',
          email: 'brand@gmail.com',
          password: 'Password@123',
          role: 'brand',
          industry: 'Software',
          aboutBrand: 'We build AI products.'
        }),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'COMPANY_NAME_REQUIRED');
        assert.match(error.message, /company name/i);
        return true;
      }
    );
  } finally {
    userFindOneMock.mock.restore();
  }
});
