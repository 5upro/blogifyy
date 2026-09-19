const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/user');

const router = express.Router();

const sanitizeSocialHandles = (socialHandles = {}) => ({
  twitter: String(socialHandles.twitter || '').trim(),
  github: String(socialHandles.github || '').trim(),
  linkedin: String(socialHandles.linkedin || '').trim(),
  website: String(socialHandles.website || '').trim(),
  instagram: String(socialHandles.instagram || '').trim()
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
  socialHandles: sanitizeSocialHandles(user.socialHandles)
});

router.get('/me', auth, async (req, res) => {
  try {
    return res.json({ user: serializeUser(req.user) });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put(
  '/me',
  [
    auth,
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('username')
      .optional({ nullable: true })
      .trim()
      .matches(/^[a-zA-Z0-9_.]{3,20}$/)
      .withMessage('Username must be 3-20 characters and only letters, numbers, underscore, dot'),
    body('bio').optional().isLength({ max: 300 }).withMessage('Bio must be at most 300 characters'),
    body('profilePicture').optional().isString(),
    body('socialHandles').optional().isObject().withMessage('socialHandles must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, username, bio, profilePicture, socialHandles } = req.body;

      if (name !== undefined) {
        req.user.name = name.trim();
      }

      if (username !== undefined) {
        const normalizedUsername = username.trim().toLowerCase();
        const existing = await User.findOne({
          username: normalizedUsername,
          _id: { $ne: req.user._id }
        });

        if (existing) {
          return res.status(400).json({ message: 'Username is already taken' });
        }

        req.user.username = normalizedUsername;
      }

      if (bio !== undefined) {
        req.user.bio = bio;
      }

      if (profilePicture !== undefined) {
        req.user.profilePicture = profilePicture;
      }

      if (socialHandles !== undefined) {
        req.user.socialHandles = sanitizeSocialHandles(socialHandles);
      }

      await req.user.save();

      return res.json({
        message: 'Profile updated successfully',
        user: serializeUser(req.user)
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
