import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI, uploadAPI } from '../api';
import { useAuth } from '../Auth/AuthContext';
import { Type, Hash, Send, CheckCircle, Upload, X, Lock, Crown } from 'lucide-react';
import EasyMDE from 'easymde';
import UpgradeModal from './Premium/UpgradeModal';
import 'easymde/dist/easymde.min.css';

const INITIAL_STATE = {
  title: '',
  content: '',
  tags: '',
  published: false,
  imageUrl: '',
  excerpt: '',
  visibility: 'public'
};

const CreateBlog = ({ onBlogCreated }) => {
  const navigate = useNavigate();
  const { entitlements, isPremium, subscription, refreshSubscription } = useAuth();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState('');
  const [upgradeReason, setUpgradeReason] = useState(null);
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  const blogLimit = entitlements.blogLimit;
  const blogsUsed = subscription?.usage?.blogsUsed ?? 0;
  const limitReached = blogLimit !== null && blogsUsed >= blogLimit;

  useEffect(() => {
    if (!subscription) {
      refreshSubscription();
    }
  }, [subscription, refreshSubscription]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setError('');
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!entitlements.featuredImage) {
      setUpgradeReason({
        icon: 'featuredImage',
        title: 'Featured images are a Pro feature',
        description: 'Add a cover image to your posts so they stand out in the archive.'
      });
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image size must be less than 5MB'); return; }

    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const response = await uploadAPI.uploadImage(fd);
      setFormData(prev => ({ ...prev, imageUrl: response.data.imageUrl }));
      setPreview(response.data.imageUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setPreview('');
  };

  const initializeEditor = () => {
    if (editorRef.current && !editorInstanceRef.current) {
      editorInstanceRef.current = new EasyMDE({
        element: editorRef.current,
        spellChecker: false,
        autoDownloadFontAwesome: true,
        placeholder: 'Write your markdown content here...',
        minHeight: '420px',
        initialValue: formData.content,
        toolbar: ['bold', 'italic', 'strikethrough', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', 'table', '|', 'link', 'image', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
      });
    }
  };

  useEffect(() => {
    initializeEditor();

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.toTextArea();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      const content = editorInstanceRef.current ? editorInstanceRef.current.value() : formData.content;
      const blogData = {
        ...formData,
        content,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };
      await blogAPI.createBlog(blogData);
      setFormData(INITIAL_STATE);
      if (editorInstanceRef.current) editorInstanceRef.current.value('');
      setPreview('');
      setSuccess(true);
      refreshSubscription();
      if (onBlogCreated) onBlogCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const code = err.response?.data?.code;

      if (code === 'PREMIUM_REQUIRED' || code === 'BLOG_LIMIT_REACHED') {
        setUpgradeReason({
          icon: code === 'BLOG_LIMIT_REACHED' ? 'privatePosts' : 'featuredImage',
          title:
            code === 'BLOG_LIMIT_REACHED'
              ? `You have used all ${blogLimit} posts on the Free plan`
              : 'That is a Pro feature',
          description:
            code === 'BLOG_LIMIT_REACHED'
              ? 'Free accounts can hold 10 posts at a time. Delete one to make room, or upgrade for unlimited posts.'
              : err.response?.data?.message,
          limit: code === 'BLOG_LIMIT_REACHED' ? blogLimit : null
        });
        setError('');
      } else {
        setError(err.response?.data?.message || 'Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-10 p-8 md:p-10 bg-[#111118] rounded-2xl border border-white/[0.06]">
      <header className="mb-8 border-b border-white/[0.06] pb-4">
        <h2 className="text-2xl font-bold text-white/90">Draft a New Story</h2>
        <p className="text-white/40 text-sm mt-1">Share your thoughts with the world.</p>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-sm">{error}</div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Blog published successfully!
        </div>
      )}

      <div className="mb-6 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {isPremium ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg">
              <Crown size={12} /> Pro
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-lg">
              Free
            </span>
          )}
          <p className="text-sm text-white/50">
            {isPremium
              ? 'Unlimited posts, featured images and private drafts.'
              : `${blogsUsed} of ${blogLimit} posts used`}
          </p>
        </div>
        {!isPremium && (
          <button
            type="button"
            onClick={() => setUpgradeReason({
              icon: 'premiumBadge',
              title: 'Unlock everything with Pro',
              description: 'Unlimited posts, featured images, private drafts and a custom accent theme.'
            })}
            className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 text-sm font-medium transition-all"
          >
            Upgrade to Pro
          </button>
        )}
      </div>

      {limitReached && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl text-sm">
          You have reached the {blogLimit} post limit on the Free plan. Delete an existing post to make room, or
          upgrade for unlimited posts.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label className="text-sm font-medium text-white/60 block mb-2">Blog Title</label>
          <div className="flex items-center">
            <Type className="absolute ml-3 text-white/20 w-5 h-5" />
            <input
              type="text"
              name="title"
              placeholder="e.g. Mastering React Hooks"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 bg-white/[0.04] text-white border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none transition-all placeholder:text-white/20"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white/60">Featured Image</label>
            {!entitlements.featuredImage && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg">
                <Crown size={11} /> Pro
              </span>
            )}
          </div>
          {preview ? (
            <div className="relative group">
              <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-xl border border-white/[0.06]" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : entitlements.featuredImage ? (
            <label className="flex flex-col items-center justify-center w-full h-56 border border-dashed border-white/[0.12] rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <Upload className="w-8 h-8 text-white/20 mb-2" />
              <p className="text-sm text-white/40 font-medium">Click to upload image</p>
              <p className="text-xs text-white/20 mt-1">PNG, JPG, JPEG up to 5MB</p>
              <input type="file" onChange={handleImageUpload} disabled={uploading} accept="image/*" className="hidden" />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setUpgradeReason({
                icon: 'featuredImage',
                title: 'Featured images are a Pro feature',
                description: 'Add a cover image to your posts so they stand out in the archive.'
              })}
              className="flex flex-col items-center justify-center w-full h-56 border border-dashed border-white/[0.08] rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
            >
              <Crown className="w-7 h-7 text-amber-400/60 mb-2" />
              <p className="text-sm text-white/40 font-medium">Unlock featured images</p>
              <p className="text-xs text-white/20 mt-1">Available on the Pro plan</p>
            </button>
          )}
          {uploading && (
            <div className="mt-2 flex items-center gap-2 text-indigo-400 text-sm">
              <Upload className="w-4 h-4 animate-spin" /> Uploading...
            </div>
          )}
        </div>

        <div className="relative">
          <label className="text-sm font-medium text-white/60 block mb-2">Tags (comma separated)</label>
          <div className="flex items-center">
            <Hash className="absolute ml-3 text-white/20 w-5 h-5" />
            <input
              type="text"
              name="tags"
              placeholder="tech, tutorial, webdev"
              value={formData.tags}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] text-white border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none transition-all text-sm placeholder:text-white/20"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-white/60 block mb-2">Short Excerpt</label>
          <textarea
            name="excerpt"
            placeholder="A brief summary for the card view..."
            value={formData.excerpt}
            onChange={handleChange}
            rows={3}
            className="w-full p-4 bg-white/[0.04] text-white border border-white/[0.08] rounded-xl focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30 outline-none transition-all resize-none placeholder:text-white/20"
          />
          <p className="text-xs text-white/20 mt-1 text-right">{formData.excerpt.length} characters</p>
        </div>

        <div>
          <label className="text-sm font-medium text-white/60 block mb-2">Content (Markdown)</label>
          <div className="rounded-xl border border-white/[0.08] overflow-hidden blog-editor-dark">
            <textarea ref={editorRef} defaultValue={formData.content} />
          </div>
          <p className="text-xs text-white/20 mt-2">Supports GitHub-style markdown: tables, checklists, code fences, headings, links and images.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 text-indigo-500 focus:ring-indigo-500/40 bg-white/[0.04]"
              />
              <span className="ml-2 text-sm text-white/40 group-hover:text-white/60 transition-colors">Publish immediately</span>
            </label>

            {entitlements.privatePosts ? (
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="visibility"
                  checked={formData.visibility === 'private'}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      visibility: e.target.checked ? 'private' : 'public'
                    }));
                  }}
                  className="w-4 h-4 rounded border-white/20 text-indigo-500 focus:ring-indigo-500/40 bg-white/[0.04]"
                />
                <Lock className="w-3.5 h-3.5 ml-2 text-white/30" />
                <span className="ml-1.5 text-sm text-white/40 group-hover:text-white/60 transition-colors">Keep private</span>
              </label>
            ) : (
              <button
                type="button"
                onClick={() => setUpgradeReason({
                  icon: 'privatePosts',
                  title: 'Private posts are a Pro feature',
                  description: 'Mark a post as private so its link returns nothing for everyone except you.'
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium transition-all hover:bg-amber-500/20"
              >
                <Lock size={12} />
                Private posts on Pro
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)]"
          >
            {loading ? 'Processing...' : 'Create Blog Post'}
          </button>
        </div>
      </form>

      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          onClose={() => setUpgradeReason(null)}
          onViewPlans={() => {
            setUpgradeReason(null);
            navigate('/premium');
          }}
        />
      )}
    </div>
  );
};

export default CreateBlog;