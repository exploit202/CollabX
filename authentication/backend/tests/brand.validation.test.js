const test = require('node:test');
const assert = require('node:assert/strict');

const { validateBrandRegistration } = require('../src/modules/auth/validations/brandRegistration.validation');

test('validateBrandRegistration accepts valid brand payloads', () => {
  const payload = {
    role: 'brand',
    companyName: 'ABC Technologies',
    workEmail: 'brand@abc.com',
    industryType: 'Software',
    aboutBrand: 'We build AI products.',
    password: 'Password@123'
  };

  const validated = validateBrandRegistration(payload);

  assert.equal(validated.companyName, 'ABC Technologies');
  assert.equal(validated.email, 'brand@abc.com');
  assert.equal(validated.industryType, 'Software');
  assert.equal(validated.password, 'Password@123');
});

test('validateBrandRegistration returns structured validation errors for missing fields', () => {
  assert.throws(
    () => validateBrandRegistration({ role: 'brand', companyName: ' ', password: 'short' }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.ok(Array.isArray(error.details));
      assert.ok(error.details.some((detail) => detail.field === 'workEmail'));
      assert.ok(error.details.some((detail) => detail.field === 'industryType'));
      assert.ok(error.details.some((detail) => detail.field === 'password'));
      return true;
    }
  );
});
