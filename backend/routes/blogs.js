const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Blog = require('../models/blog');
const User = require('../models/user');
const { auth, optionalAuth, adminAuth, premiumAuth } = require('../middleware/auth');
const { FREE_BLOG_LIMIT, hasActivePremium } = require('../utils/premium');
const { createUniqueSlug } = require('../utils/slug');
const router = express.Router();

const PUBLIC_AUTHOR_FIELDS = 'name username profilePicture bio socialHandles role plan premiumStatus theme isAffiliated';
const PRIVATE_AUTHOR_FIELDS = 'name username profilePicture bio socialHandles email role plan premiumStatus theme isAffiliated';
const LIST_FIELDS = 'title slug content author tags published visibility imageUrl createdAt updatedAt';
const SINGLE_FIELDS = `${LIST_FIELDS} excerpt`;

const isOwnerOrAdmin = (user, blog) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return blog.author?._id?.toString() === user._id.toString();
};

const findBlogByIdentifier = (identifier, fields) => {
    const filter = mongoose.Types.ObjectId.isValid(identifier)
        ? { $or: [{ _id: identifier }, { slug: identifier }] }
        : { slug: identifier };

    return Blog.findOne(filter, fields);
};

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const tag = req.query.tag?.trim();
        const search = req.query.search?.trim();
        const username = req.query.username?.trim().toLowerCase();

        const query = { published: true, visibility: 'public' };

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

        const blogs = await Blog.find(query, LIST_FIELDS)
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

router.get('/:idOrSlug', optionalAuth, async (req, res) => {
    try {
        const blog = await findBlogByIdentifier(req.params.idOrSlug, SINGLE_FIELDS)
            .populate('author', PUBLIC_AUTHOR_FIELDS);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const isPublic = blog.published && blog.visibility === 'public';
        const isOwner = isOwnerOrAdmin(req.user, blog);

        if (!isPublic && !isOwner) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (isPublic && !isOwner) {
            await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });
        }

        res.json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:idOrSlug/analytics', auth, premiumAuth, async (req, res) => {
    try {
        const blog = await findBlogByIdentifier(req.params.idOrSlug, 'title slug author views published visibility createdAt');

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view analytics for this blog' });
        }

        return res.json({
            analytics: {
                blogId: blog._id,
                slug: blog.slug,
                title: blog.title,
                views: blog.views || 0,
                published: blog.published,
                visibility: blog.visibility
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return res.status(500).json({ message: 'Server error' });
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

        const isPro = hasActivePremium(req.user);

        if (!isPro) {
            const totalBlogs = await Blog.countDocuments({ author: req.user._id });
            if (totalBlogs >= FREE_BLOG_LIMIT) {
                return res.status(403).json({
                    message: `The Free plan allows ${FREE_BLOG_LIMIT} posts. Upgrade to Pro for unlimited posts.`,
                    code: 'BLOG_LIMIT_REACHED',
                    limit: FREE_BLOG_LIMIT
                });
            }
        }

        const { title, content, tags, published, imageUrl, visibility, excerpt } = req.body;
        const requestedVisibility = visibility === 'private' ? 'private' : 'public';

        if (requestedVisibility === 'private' && !isPro) {
            return res.status(402).json({
                message: 'Private posts are available on the Pro plan.',
                code: 'PREMIUM_REQUIRED'
            });
        }

        if (imageUrl && !isPro) {
            return res.status(402).json({
                message: 'Featured images are available on the Pro plan.',
                code: 'PREMIUM_REQUIRED'
            });
        }

        const slug = await createUniqueSlug(Blog, title);

        const blog = new Blog({
            title,
            slug,
            content,
            author: req.user._id,
            tags: tags || [],
            published: published || false,
            visibility: requestedVisibility,
            imageUrl: imageUrl || null,
            excerpt: excerpt || undefined
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

router.put('/:idOrSlug', [
    auth,
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const blog = await findBlogByIdentifier(req.params.idOrSlug, LIST_FIELDS);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const isOwner = blog.author.toString() === req.user._id.toString();

        if (!isOwner && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this blog' });
        }

        const isPro = hasActivePremium(req.user);
        const { title, content, tags, published, imageUrl, visibility, excerpt } = req.body;

        if (visibility === 'private' && !isPro) {
            return res.status(402).json({
                message: 'Private posts are available on the Pro plan.',
                code: 'PREMIUM_REQUIRED'
            });
        }

        if (imageUrl && imageUrl !== blog.imageUrl && !isPro) {
            return res.status(402).json({
                message: 'Featured images are available on the Pro plan.',
                code: 'PREMIUM_REQUIRED'
            });
        }

        if (title) {
            blog.title = title;
            blog.slug = await createUniqueSlug(Blog, title);
        }
        if (content) blog.content = content;
        if (tags) blog.tags = tags;
        if (published !== undefined) blog.published = published;
        if (visibility !== undefined) blog.visibility = visibility === 'private' ? 'private' : 'public';
        if (imageUrl !== undefined) blog.imageUrl = imageUrl;
        if (excerpt !== undefined) blog.excerpt = excerpt;

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

router.delete('/:idOrSlug', auth, async (req, res) => {
    try {
        const blog = await findBlogByIdentifier(req.params.idOrSlug, LIST_FIELDS);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this blog' });
        }

        await Blog.findByIdAndDelete(blog._id);

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

        const blogs = await Blog.find({ author: req.user._id }, LIST_FIELDS)
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

        const blogs = await Blog.find({}, LIST_FIELDS)
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
