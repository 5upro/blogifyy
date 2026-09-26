const crypto = require('crypto');

const MAX_SLUG_LENGTH = 72;
const MAX_RANDOM_ATTEMPTS = 5;

const slugify = (value) =>
    String(value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, MAX_SLUG_LENGTH);

const createUniqueSlug = async (BlogModel, title) => {
    const base = slugify(title) || 'post';
    let slug = base;

    for (let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt += 1) {
        const existing = await BlogModel.exists({ slug });
        if (!existing) return slug;
        slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
    }

    return `${base}-${crypto.randomBytes(6).toString('hex')}`;
};

module.exports = { slugify, createUniqueSlug };
