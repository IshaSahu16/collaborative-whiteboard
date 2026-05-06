import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"BoardFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your BoardFlow password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #4F46E5; padding: 24px; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">BoardFlow</h1>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #E5E7EB;">
          <h2 style="color: #111827;">Reset your password</h2>
          <p style="color: #6B7280;">You requested a password reset. Click the button below to set a new password.</p>
          <a href="${resetUrl}" 
             style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #9CA3AF; font-size: 14px;">This link expires in 1 hour.</p>
          <p style="color: #9CA3AF; font-size: 14px;">If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
  });
};

export default transporter;