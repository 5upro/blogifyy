const express = require('express')
const { body, validationResult } = require('express-validator');
const Comments = require('../models/comments')
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { content, parentComment } = req.body;

        const comment = new Comments({
            blog: req.params.id,
            user: req.user._id,
            content,
            parentComment: parentComment || null
        });

        await comment.save();

        await comment.populate('user', 'name username profilePicture');

        res.json({
            message: 'Comment added',
            comment
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await Comments.find({
            blog: req.params.id,
            parentComment: null
        })
        .populate('user', 'name username profilePicture')
        .sort({ createdAt: -1 });

        res.json(comments);

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/comment/:commentId', auth, async (req, res) => {
    try {
        const comment = await Comments.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        if (
            comment.user.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not allowed' });
        }

        await Comments.findByIdAndDelete(req.params.commentId);

        res.json({ message: 'Comment deleted' });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;