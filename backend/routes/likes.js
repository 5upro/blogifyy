const express = require('express');
const Like = require('../models/likes');
const Blog = require('../models/blog');
const { auth } = require('../middleware/auth');

const router = express.Router();


router.post('/:blogId/toggle', auth, async (req, res) => {
    try {
        const { blogId } = req.params;

        
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const existingLike = await Like.findOne({ blog: blogId, user: req.user._id });

        if (existingLike) {
            
            await Like.findByIdAndDelete(existingLike._id);
            const likeCount = await Like.countDocuments({ blog: blogId });
            return res.json({ message: 'Blog unliked', liked: false, likeCount });
        } else {
          
            const like = new Like({ blog: blogId, user: req.user._id });
            await like.save();
            const likeCount = await Like.countDocuments({ blog: blogId });
            return res.json({ message: 'Blog liked', liked: true, likeCount });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/:blogId', auth, async (req, res) => {
    try {
        const { blogId } = req.params;

        const likeCount = await Like.countDocuments({ blog: blogId });
        const liked = !!(await Like.findOne({ blog: blogId, user: req.user._id }));

        res.json({ likeCount, liked });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/:blogId/users', async (req, res) => {
    try {
        const { blogId } = req.params;

        const likes = await Like.find({ blog: blogId })
            .populate('user', 'name username profilePicture')
            .sort({ createdAt: -1 });

        res.json({
            likeCount: likes.length,
            users: likes.map(l => l.user)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
