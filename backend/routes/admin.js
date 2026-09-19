const express = require('express');
const { adminAuth, auth } = require('../middleware/auth');
const User = require('../models/user');
const Blog = require('../models/blog');

const router = express.Router();

router.get('/users', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments({});

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete yourself' });
        }

        await Blog.deleteMany({ author: userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: 'User and their blogs deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot change your own role' });
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { role }, 
            { new: true }
        ).select('-password');

        res.json({ message: 'User role updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalBlogs = await Blog.countDocuments({});
        const publishedBlogs = await Blog.countDocuments({ published: true });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        res.json({
            totalUsers,
            totalBlogs,
            publishedBlogs,
            unpublishedBlogs: totalBlogs - publishedBlogs,
            totalAdmins
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;