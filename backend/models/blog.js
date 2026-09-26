const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String
    }],
    published: {
        type: Boolean,
        default: false
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    imageUrl: {
        type: String,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    excerpt: {
        type: String,
        maxlength: 200
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);