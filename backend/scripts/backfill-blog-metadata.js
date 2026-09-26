require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/blog');
const { createUniqueSlug } = require('../utils/slug');

const backfillBlogMetadata = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to database: ${mongoose.connection.name}`);

    const blogs = await Blog.find({}).select('title slug visibility');

    let slugAdded = 0;
    let visibilityAdded = 0;

    for (const blog of blogs) {
        let changed = false;

        if (!blog.slug) {
            blog.slug = await createUniqueSlug(Blog, blog.title);
            slugAdded += 1;
            changed = true;
        }

        if (!blog.visibility) {
            blog.visibility = 'public';
            visibilityAdded += 1;
            changed = true;
        }

        if (changed) {
            await blog.save();
        }
    }

    console.log(`Slugs generated: ${slugAdded}`);
    console.log(`Visibility values set: ${visibilityAdded}`);
    console.log(`Blogs scanned: ${blogs.length}`);

    const missingSlug = await Blog.countDocuments({ $or: [{ slug: { $exists: false } }, { slug: null }] });
    const missingVisibility = await Blog.countDocuments({ $or: [{ visibility: { $exists: false } }, { visibility: null }] });

    console.log(`Remaining without a slug: ${missingSlug}`);
    console.log(`Remaining without visibility: ${missingVisibility}`);

    await mongoose.disconnect();
};

backfillBlogMetadata().catch((error) => {
    console.error('Backfill failed:', error.message);
    process.exit(1);
});
