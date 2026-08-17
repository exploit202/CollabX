const { Resend } = require('resend');

/**
 * Sends a verification email containing a 6-digit OTP using Resend HTTPS.
 * 
 * @param {string} toEmail - Destination email address.
 * @param {string} plainOtp - The unhashed 6-digit verification code.
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>} Delivery status.
 */
const sendOtpEmail = async (toEmail, plainOtp) => {
  if (!toEmail) {
    return { success: false, error: 'Recipient email is required.' };
  }
  if (!plainOtp) {
    return { success: false, error: 'OTP is required.' };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 'YOUR_LOCAL_RESEND_API_KEY') {
    return { success: false, error: 'Resend API key is not configured.' };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Verify Your Email Address - CollabX',
      text: `Welcome to CollabX!\n\nYour 6-digit verification code is: ${plainOtp}\n\nThis code will expire in 10 minutes.\nIf you did not request this code, please ignore this email and keep your account details secure.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #ec4899; text-align: center; margin: 0 0 10px;">CollabX</h2>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p>Hello,</p>
          <p>Thank you for signing up for CollabX. To complete your registration, please verify your email address using the following 6-digit verification code:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background-color: #f1f5f9; padding: 10px 20px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block;">
              ${plainOtp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 14px;"><strong>Note:</strong> This verification code is valid for <strong>10 minutes</strong>. After 10 minutes, you will need to request a new code.</p>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">If you did not request this email, please ignore it. Your account remains secure.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 0;">&copy; 2026 CollabX. All rights reserved.</p>
        </div>
      `
    });

    if (result.error) {
      return { success: false, error: result.error.message || 'Resend error occurred.' };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpEmail
};
