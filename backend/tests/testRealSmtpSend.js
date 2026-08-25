const nodemailer = require('nodemailer');
require('dotenv').config();

const testSmtp = async () => {
  console.log('Testing Real Gmail SMTP Connection & Email Send...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 587);

  const rawPass = process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Verifying Transporter...');
    await transporter.verify();
    console.log('Transporter Verified PASS!');

    const targetEmail = '404gladiator171117@gmail.com';
    console.log(`Sending real OTP email to ${targetEmail}...`);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `CollabX <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      subject: 'Verify Your Email Address - CollabX',
      text: 'Welcome to CollabX!\n\nYour 6-digit verification code is: 849201\n\nThis code will expire in 10 minutes.',
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ec4899;">CollabX Verification Code</h2>
        <p style="font-size: 14px; color: #334155;">Welcome to CollabX! Use the verification code below to complete your registration:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">849201</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>`
    });

    console.log('🎉 EMAIL SENT SUCCESSFULLY!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (err) {
    console.error('❌ SMTP SEND ERROR:', err);
  }
};

testSmtp();
