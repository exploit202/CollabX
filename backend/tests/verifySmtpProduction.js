const { verifyTransporter, sendOtpEmail } = require('../src/modules/auth/services/email.service');
require('dotenv').config();

const runProductionSmtpCheck = async () => {
  console.log('====================================================');
  console.log('🔍 COLLABX PRODUCTION SMTP DELIVERY DIAGNOSTIC');
  console.log('====================================================\n');

  // Step 1: Transporter Verification
  console.log('[STEP 1] Testing Nodemailer SMTP transporter.verify()...');
  const isVerified = await verifyTransporter();
  if (!isVerified) {
    console.error('❌ Transporter verification FAILED. Please check EMAIL_USER & EMAIL_PASS in .env');
    process.exit(1);
  }
  console.log('  ✅ Transporter Verification: PASS');

  // Step 2: Test Real Delivery to Recipient Address
  const targetRecipient = process.argv[2] || process.env.EMAIL_USER;
  console.log(`\n[STEP 2] Sending real OTP verification email to recipient: ${targetRecipient}...`);
  const result = await sendOtpEmail(targetRecipient, '884920');

  if (!result.success) {
    console.error(`❌ SMTP Delivery FAILED for ${targetRecipient}:`, result.error);
    process.exit(1);
  }

  console.log('  ✅ Real Email Delivery: PASS');
  console.log(`  Recipient: ${targetRecipient}`);
  console.log(`  Message ID: ${result.messageId}`);
  console.log('\n====================================================');
  console.log('🎉 SMTP REAL DELIVERY DIAGNOSTIC PASSED 100%');
  console.log('====================================================\n');
};

runProductionSmtpCheck();
