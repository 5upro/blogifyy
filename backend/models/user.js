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
    otp: { type: String },
    otpExpiry: { type: Date },
    resetPasswordOtp: { type: String },
    resetPasswordOtpExpiry: { type: Date }

}, {
    timestamps: true
});

userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  return otp;
}; // added otp verification method

userSchema.methods.generatePasswordResetOTP = function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.resetPasswordOtp = otp;
  this.resetPasswordOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  return otp;
};

module.exports = mongoose.model('User', userSchema);