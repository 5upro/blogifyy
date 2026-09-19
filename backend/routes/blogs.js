const express = require('express');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/blog');
const User = require('../models/user');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

const PUBLIC_AUTHOR_FIELDS = 'name username profilePicture bio socialHandles role';
const PRIVATE_AUTHOR_FIELDS = 'name username profilePicture bio socialHandles email role';

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const tag = req.query.tag?.trim();
        const search = req.query.search?.trim();
        const username = req.query.username?.trim().toLowerCase();

        const query = { published: true };

        if (tag) {
            query.tags = { $regex: new RegExp(`^${tag}$`, 'i') };
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        if (username) {
            const author = await User.findOne({ username }).select('_id');
            if (!author) {
                return res.json({
                    blogs: [],
                    totalPages: 0,
                    currentPage: page,
                    total: 0
                });
            }
            query.author = author._id;
        }

        const blogs = await Blog.find(query, 'title content author tags published imageUrl createdAt updatedAt')
            .populate('author', PUBLIC_AUTHOR_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments(query);

        res.json({
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id, 'title content author tags published imageUrl createdAt updatedAt')
            .populate('author', PUBLIC_AUTHOR_FIELDS);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', [
    auth,
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, tags, published , imageUrl} = req.body; //added image url

        const blog = new Blog({
            title,
            content,
            author: req.user._id,
            tags: tags || [],
            published: published || false,
            imageUrl : imageUrl || null // default 
        });

        await blog.save();
        await blog.populate('author', PRIVATE_AUTHOR_FIELDS);

        res.status(201).json({
            message: 'Blog created successfully',
            blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', [
    auth,
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this blog' });
        }

        const { title, content, tags, published , imageUrl } = req.body;
        console.log('Received imageurl:',imageUrl)
        if (title) blog.title = title;
        if (content) blog.content = content;
        if (tags) blog.tags = tags;
        if (published !== undefined) blog.published = published;
        if (imageUrl !== undefined) blog.imageUrl = imageUrl; // update image url

        await blog.save();
        await blog.populate('author', PRIVATE_AUTHOR_FIELDS);

        res.json({
            message: 'Blog updated successfully',
            blog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user/me', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({ author: req.user._id }, 'title content author tags published imageUrl createdAt updatedAt')
            .populate('author', PRIVATE_AUTHOR_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments({ author: req.user._id });

        res.json({
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/all', adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const blogs = await Blog.find({}, 'title content author tags published imageUrl createdAt updatedAt')
            .populate('author', PRIVATE_AUTHOR_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Blog.countDocuments({});

        res.json({
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;