require('dotenv').config();
const test = require('node:test');
const assert = require('node:assert/strict');
const { mock } = require('node:test');

// Clear require cache for email service so it's reloaded with any env configuration changes
delete require.cache[require.resolve('../src/modules/auth/services/email.service')];

test('sendOtpEmail successfully delivers email using mocked Resend client', async () => {
  const mockSendMail = mock.fn(async (options) => {
    assert.equal(options.to, 'test-recipient@example.com');
    assert.ok(options.html.includes('987654'));
    assert.ok(options.text.includes('987654'));
    assert.ok(options.subject.includes('Verify Your Email'));
    return { data: { id: 'mocked-message-id-xyz' } };
  });

  class MockResend {
    constructor(apiKey) {
      assert.equal(apiKey, 're_test_key');
      this.emails = {
        send: mockSendMail
      };
    }
  }

  const resendPath = require.resolve('resend');
  const originalResendModule = require.cache[resendPath];

  // Inject MockResend into require cache
  require.cache[resendPath] = {
    id: resendPath,
    filename: resendPath,
    loaded: true,
    exports: { Resend: MockResend }
  };

  try {
    const originalApiKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.EMAIL_FROM = 'noreply@collabx.com';

    // Reload email service to pick up the mock Resend exports
    delete require.cache[require.resolve('../src/modules/auth/services/email.service')];
    const emailService = require('../src/modules/auth/services/email.service');
    const result = await emailService.sendOtpEmail('test-recipient@example.com', '987654');
    
    assert.equal(result.success, true);
    assert.equal(result.messageId, 'mocked-message-id-xyz');
    assert.equal(mockSendMail.mock.callCount(), 1);

    process.env.RESEND_API_KEY = originalApiKey;
  } finally {
    // Restore original Resend module
    if (originalResendModule) {
      require.cache[resendPath] = originalResendModule;
    } else {
      delete require.cache[resendPath];
    }
    delete require.cache[require.resolve('../src/modules/auth/services/email.service')];
  }
});

test('sendOtpEmail returns success: false if recipient email is missing', async () => {
  const emailService = require('../src/modules/auth/services/email.service');
  const result = await emailService.sendOtpEmail('', '987654');
  assert.equal(result.success, false);
  assert.equal(result.error, 'Recipient email is required.');
});

test('sendOtpEmail returns success: false if OTP is missing', async () => {
  const emailService = require('../src/modules/auth/services/email.service');
  const result = await emailService.sendOtpEmail('test-recipient@example.com', '');
  assert.equal(result.success, false);
  assert.equal(result.error, 'OTP is required.');
});

test('sendOtpEmail returns success: false if Resend returns an error payload', async () => {
  const mockSendMail = mock.fn(async () => {
    return { error: { message: 'API rate limit exceeded' } };
  });

  class MockResend {
    constructor(apiKey) {
      assert.equal(apiKey, 're_test_key');
      this.emails = {
        send: mockSendMail
      };
    }
  }

  const resendPath = require.resolve('resend');
  const originalResendModule = require.cache[resendPath];

  // Inject MockResend into require cache
  require.cache[resendPath] = {
    id: resendPath,
    filename: resendPath,
    loaded: true,
    exports: { Resend: MockResend }
  };

  try {
    const originalApiKey = process.env.RESEND_API_KEY;
    process.env.RESEND_API_KEY = 're_test_key';

    delete require.cache[require.resolve('../src/modules/auth/services/email.service')];
    const emailService = require('../src/modules/auth/services/email.service');
    const result = await emailService.sendOtpEmail('test-recipient@example.com', '987654');
    
    assert.equal(result.success, false);
    assert.equal(result.error, 'API rate limit exceeded');
    assert.equal(mockSendMail.mock.callCount(), 1);

    process.env.RESEND_API_KEY = originalApiKey;
  } finally {
    if (originalResendModule) {
      require.cache[resendPath] = originalResendModule;
    } else {
      delete require.cache[resendPath];
    }
    delete require.cache[require.resolve('../src/modules/auth/services/email.service')];
  }
});
