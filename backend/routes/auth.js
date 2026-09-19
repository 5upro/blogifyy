const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail, sendSuccessResetEmail, sendWelcomeEmail } = require('../utils/email');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const router = express.Router();

const tokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};

// Rate limiter for password reset endpoints — 5 requests per 15 minutes per IP
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: 'Too many password reset attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const serializeUser = (user) => ({
    id: user._id,
    name: user.name,
    username: user.username || '',
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    bio: user.bio || '',
    profilePicture: user.profilePicture || '',
    socialHandles: {
        twitter: user.socialHandles?.twitter || '',
        github: user.socialHandles?.github || '',
        linkedin: user.socialHandles?.linkedin || '',
        website: user.socialHandles?.website || '',
        instagram: user.socialHandles?.instagram || ''
    }
});

router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('username')
        .trim()
        .matches(/^[a-zA-Z0-9_.]{3,20}$/)
        .withMessage('Username must be 3-20 characters and only letters, numbers, underscore, dot'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, username, email, password, role } = req.body;
        const normalizedUsername = username.trim().toLowerCase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const existingUsername = await User.findOne({ username: normalizedUsername });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            username: normalizedUsername,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        const verificationOTP = user.generateOTP();
        await user.save();

        await sendVerificationEmail({ toEmail: user.email, otp: verificationOTP });

        res.status(201).json({
            message: 'User registered. Please check your email for OTP.'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send verification email' });
    }
});

router.post('/login', [
    body('identifier').notEmpty().withMessage('Email or username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, password } = req.body;
        const normalizedIdentifier = identifier.trim().toLowerCase();

        const user = await User.findOne({
            $or: [
                { email: normalizedIdentifier },
                { username: normalizedIdentifier }
            ]
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please check your inbox.' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET.trim(),
            { expiresIn: '24h' }
        );

        res.cookie('token', token, tokenCookieOptions);

        res.json({
            message: 'Login successful',
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: serializeUser(req.user)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;
        console.log('Verify email request received with token:', token);
        
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const user = await User.findOne({ verificationToken: token });
        console.log('User found:', user ? user.email : 'No user found');
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        console.log('User verified successfully:', user.email);

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        console.log('OTP verification request:', email);

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const user = await User.findOne({ email });
        console.log('User found:', user ? user.email : 'No user found');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        console.log('User verified successfully:', user.email);

        // Send welcome email (fire and forget)
        sendWelcomeEmail({ toEmail: user.email, name: user.name }).catch(err =>
            console.error('Failed to send welcome email:', err)
        );

        // GENERATE TOKEN AFTER VERIFICATION
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET.trim(),
            { expiresIn: '24h' }
        );

        res.cookie('token', token, tokenCookieOptions);

        res.json({ 
            message: 'Email verified successfully',
            token,
            user: serializeUser(user)
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

// ─── Password Reset Flow ────────────────────────────────────────────

// Step 1: Request password reset OTP
router.post('/forgot-password', passwordResetLimiter, [
    body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If an account with that email exists, a reset OTP has been sent.' });
        }

        const otp = user.generatePasswordResetOTP();
        await user.save();

        await sendPasswordResetEmail({ toEmail: user.email, otp });

        res.json({ message: 'If an account with that email exists, a reset OTP has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Step 2: Verify OTP and set new password
router.post('/reset-password', passwordResetLimiter, [
    body('email').isEmail().withMessage('Valid email is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset request' });
        }

        if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.resetPasswordOtpExpiry < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordOtp = undefined;
        user.resetPasswordOtpExpiry = undefined;
        await user.save();

        // Send password reset success email (fire and forget)
        sendSuccessResetEmail({ toEmail: user.email }).catch(err =>
            console.error('Failed to send password reset success email:', err)
        );

        res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', tokenCookieOptions);
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;