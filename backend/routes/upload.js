const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();
const cloudinary = require('cloudinary').v2; // added cloudinary cloud storage
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'blog_images', // folder for cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage });



router.post('/upload', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary upload info is in req.file.path or req.file.secure_url
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path || req.file.secure_url,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
