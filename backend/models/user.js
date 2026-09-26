const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 300,
        default: 'Hi there! I am using Blogify.'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    socialHandles: {
        twitter: { type: String, trim: true, default: '' },
        github: { type: String, trim: true, default: '' },
        linkedin: { type: String, trim: true, default: '' },
        website: { type: String, trim: true, default: '' },
        instagram: { type: String, trim: true, default: '' }
    },
    isVerified: { type: Boolean, default: false },
    isAffiliated: { type: Boolean, default: false },
    plan: {
        type: String,
        enum: ['free', 'pro'],
        default: 'free'
    },
    premiumStatus: {
        type: String,
        enum: ['none', 'active', 'cancelled', 'expired'],
        default: 'none'
    },
    premiumPlan: { type: String, default: null },
    premiumStartedAt: { type: Date, default: null },
    premiumExpiresAt: { type: Date, default: null },
    lastPaymentReference: { type: String, default: null },
    theme: {
        accent: { type: String, default: 'indigo' }
    },
    otp: { type: String },
    otpExpiry: { type: Date },
    otpSentAt: { type: Date, default: null },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpiry: { type: Date }

}, {
    timestamps: true
});

userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  this.otpSentAt = new Date();
  return otp;
};

userSchema.methods.canResendOTP = function (cooldownMs) {
  if (!this.otpSentAt) return true;
  return Date.now() - this.otpSentAt.getTime() >= cooldownMs;
};

userSchema.methods.generatePasswordResetOTP = function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.resetPasswordOtp = otp;
  this.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  return otp;
};

userSchema.methods.hasActivePremium = function () {
  if (this.plan !== 'pro' || this.premiumStatus !== 'active') return false;
  if (!this.premiumExpiresAt) return true;
  return this.premiumExpiresAt.getTime() > Date.now();
};

userSchema.methods.activatePremium = function (plan, durationDays, reference = null) {
  const now = new Date();
  this.plan = 'pro';
  this.premiumStatus = 'active';
  this.premiumPlan = plan;
  this.premiumStartedAt = now;
  this.premiumExpiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  if (reference) this.lastPaymentReference = reference;
};

userSchema.methods.expirePremium = function () {
  this.plan = 'free';
  this.premiumStatus = 'expired';
  this.theme.accent = 'indigo';
};

module.exports = mongoose.model('User', userSchema);
