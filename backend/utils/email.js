const Brevo = require('@getbrevo/brevo');
const { TransactionalEmailsApi, SendSmtpEmail } = Brevo;
require('dotenv').config();

// Initialize API client
const client = new TransactionalEmailsApi();

// Set API key
client.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;

const sendVerificationEmail = async ({ toEmail, otp }) => {
  if (!toEmail || !otp) {
    throw new Error('Email and OTP are required');
  }

  // Build message
  const email = new SendSmtpEmail();
  email.subject = 'Your Email Verification OTP';
  email.htmlContent = `
    <html><body>
      <h2>Email Verification</h2>
      <p>Your OTP (One Time Password) is:</p>
      <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>Do not share this OTP with anyone.</p>
      <p>Thank you,<br/>Blogify Team</p>
      <p>for any issues, contact <a href="mailto:blogify-support@surajitsen.live">blogify-support@surajitsen.live</a></p>
    </body></html>
  `;
  email.sender = { email: process.env.EMAIL_FROM, name: 'Blogify Verification System' };
  email.to = [{ email: toEmail }];

  // Send
  return client.sendTransacEmail(email);
};

const sendPasswordResetEmail = async ({ toEmail, otp }) => {
  if (!toEmail || !otp) {
    throw new Error('Email and OTP are required');
  }

  const email = new SendSmtpEmail();
  email.subject = 'Password Reset OTP - Blogify';
  email.htmlContent = `
    <html><body>
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Use the OTP below to reset your password:</p>
      <h1 style="color: #dc2626; font-size: 32px; letter-spacing: 2px;">${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request a password reset, please ignore this email.</p>
      <p>Thank you,<br/>Blogify Team</p>
      <p>For any issues, contact <a href="mailto:blogify-support@surajitsen.live">blogify-support@surajitsen.live</a></p>
    </body></html>
  `;
  email.sender = { email: process.env.EMAIL_FROM, name: 'Blogify Password Reset' };
  email.to = [{ email: toEmail }];

  return client.sendTransacEmail(email);
};

const sendSuccessResetEmail = async ({ toEmail }) => {
  if (!toEmail) {
    throw new Error('Email is required');
  }

  const email = new SendSmtpEmail();
  email.subject = 'Password Reset Successful - Blogify';
  email.htmlContent = `
    <html><body>
      <h2>Password Reset Successful</h2>
      <p>Your password has been reset successfully.</p>
      <p>If you did not reset your password, please contact our support team immediately.</p>
      <p>Thank you,<br/>Blogify Team</p>
      <p>For any issues, contact <a href="mailto:blogify-support@surajitsen.live">blogify-support@surajitsen.live</a></p>
    </body></html>
  `;
  email.sender = { email: process.env.EMAIL_FROM, name: 'Blogify Password Reset' };
  email.to = [{ email: toEmail }];

  return client.sendTransacEmail(email);
};

const sendWelcomeEmail = async ({ toEmail, name }) => {
  if (!toEmail) {
    throw new Error('Email is required');
  }

  const email = new SendSmtpEmail();
  email.subject = 'Welcome to Blogify!';
  email.htmlContent = `
    <html><body>
      <h2 style="color: #6366f1;">Welcome to Blogify, ${name || 'there'}!</h2>
      <p>Your email has been verified and your account is now active.</p>
      <p>You can now:</p>
      <ul>
        <li>Create and publish your own blog posts</li>
        <li>Read and explore blogs from the community</li>
      </ul>
      <p>We're excited to have you on board!</p>
      <p>Thank you,<br/>Blogify Team</p>
      <p>For any issues, contact <a href="mailto:blogify-support@surajitsen.live">blogify-support@surajitsen.live</a></p>
    </body></html>
  `;
  email.sender = { email: process.env.EMAIL_FROM, name: 'Blogify' };
  email.to = [{ email: toEmail }];

  return client.sendTransacEmail(email);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendSuccessResetEmail, sendWelcomeEmail };
