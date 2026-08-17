const nodemailer = require('nodemailer');
require('dotenv').config();

const runDiagnostic = async () => {
  console.log('====================================================');
  console.log('🔍 NODEMAILER GMAIL SMTP DIAGNOSTIC TEST');
  console.log('====================================================\n');

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const passWithSpaces = process.env.EMAIL_PASS;
  const passClean = passWithSpaces ? passWithSpaces.replace(/\s+/g, '') : '';

  console.log(`SMTP Host: ${host}`);
  console.log(`SMTP Port: ${port}`);
  console.log(`SMTP User: ${user}`);
  console.log(`EMAIL_PASS with spaces length: ${passWithSpaces ? passWithSpaces.length : 0}`);
  console.log(`EMAIL_PASS stripped length: ${passClean.length}\n`);

  // Test 1: Transporter with raw EMAIL_PASS (with spaces)
  console.log('[TEST 1] Verifying transporter with raw EMAIL_PASS (with spaces)...');
  const transporterWithSpaces = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: passWithSpaces },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporterWithSpaces.verify();
    console.log('  ✅ TEST 1 PASS (Transporter verified with raw EMAIL_PASS)');
  } catch (err) {
    console.error('  ❌ TEST 1 FAIL:', err.message);
  }

  // Test 2: Transporter with stripped EMAIL_PASS (no spaces)
  console.log('\n[TEST 2] Verifying transporter with stripped EMAIL_PASS (no spaces)...');
  const transporterClean = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: passClean },
    tls: { rejectUnauthorized: false }
  });

  try {
    await transporterClean.verify();
    console.log('  ✅ TEST 2 PASS (Transporter verified with stripped EMAIL_PASS)');
  } catch (err) {
    console.error('  ❌ TEST 2 FAIL:', err.message);
  }

  // Test 3: Send actual test email to recipient
  const targetRecipient = process.argv[2] || user;
  console.log(`\n[TEST 3] Sending actual test email to recipient: ${targetRecipient}...`);
  try {
    const activeTransporter = transporterClean; // Use cleaned transporter
    const info = await activeTransporter.sendMail({
      from: process.env.EMAIL_FROM || `CollabX <${user}>`,
      to: targetRecipient,
      subject: 'CollabX Real Delivery Test',
      text: 'This is a real test email from CollabX Nodemailer Gmail SMTP diagnostic.',
      html: '<b>This is a real test email from CollabX Nodemailer Gmail SMTP diagnostic.</b>'
    });

    console.log('  ✅ TEST 3 PASS!');
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Accepted Recipients: ${JSON.stringify(info.accepted)}`);
    console.log(`  Rejected Recipients: ${JSON.stringify(info.rejected)}`);
    console.log(`  SMTP Response: ${info.response}`);
  } catch (err) {
    console.error('  ❌ TEST 3 FAIL (sendMail error):', err.message);
  }

  console.log('\n====================================================');
};

runDiagnostic();
