const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer Transporter using Gmail SMTP or configured SMTP host.
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = Number(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  if (!user || !pass || pass === 'YOUR_GMAIL_APP_PASSWORD' || pass === 'your_gmail_app_password') {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Verifies SMTP connection and authentication credentials cleanly.
 */
const verifyTransporter = async () => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('[SMTP DIAGNOSTIC] SMTP User/Pass credentials not set in environment.');
    return false;
  }

  try {
    await transporter.verify();
    console.log(`[SMTP DIAGNOSTIC] Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}, Port: ${process.env.EMAIL_PORT || 587}, User: ${process.env.EMAIL_USER}, Status: PASS`);
    return true;
  } catch (err) {
    console.error('[SMTP DIAGNOSTIC] Transporter verification failed:', err.message);
    return false;
  }
};

const sendOtpEmail = async (toEmail, plainOtp) => {
  if (!toEmail) return { success: false, error: 'Recipient email is required.' };
  if (!plainOtp) return { success: false, error: 'OTP is required.' };

  const transporter = createTransporter();

  if (!transporter) {
    console.error(`[SMTP ERROR] Nodemailer SMTP credentials not configured in environment. Failed to send OTP to ${toEmail}.`);
    return { success: false, error: 'SMTP server credentials not configured on backend.' };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || `CollabX <${process.env.EMAIL_USER || 'exploit171117@gmail.com'}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: 'Verify Your Email Address - CollabX',
      text: `Welcome to CollabX!\n\nYour 6-digit verification code is: ${plainOtp}\n\nThis code will expire in 10 minutes.`,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #ec4899;">CollabX Verification Code</h2>
        <p style="font-size: 14px; color: #334155;">Welcome to CollabX! Use the verification code below to complete your registration:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${plainOtp}</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>`
    });

    if (!info || !info.messageId) {
      return { success: false, error: 'SMTP server did not return a valid messageId.' };
    }

    if (Array.isArray(info.rejected) && info.rejected.length > 0) {
      return { success: false, error: `Recipient address rejected by SMTP server: ${info.rejected.join(', ')}` };
    }

    console.log(`[SMTP DELIVERED] Verification email sent to ${toEmail}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createTransporter,
  verifyTransporter,
  sendOtpEmail
};
