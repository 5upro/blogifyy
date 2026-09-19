import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI, commentAPI, likeAPI } from '../api';
import { useAuth } from '../Auth/AuthContext';
import { ArrowLeft, User, Calendar, Trash2, Loader2, Heart, Send, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UserProfilePopup from './UserProfilePopup';
import verifiedBadge from '../assets/verified.png';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showAuthorPopup, setShowAuthorPopup] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeReplyFor, setActiveReplyFor] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [submittingReplyFor, setSubmittingReplyFor] = useState('');
  const [repliesByParent, setRepliesByParent] = useState({});
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  useEffect(() => {
    fetchLikes();
  }, [id, user]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlog(id);
      setBlog(response.data.blog || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    setDeleting(true);
    try {
      await blogAPI.deleteBlog(id);
      navigate('/blogs');
    } catch {
      setError('Failed to delete blog');
      setDeleting(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await commentAPI.getBlogComments(id);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const usersResponse = await likeAPI.getLikeUsers(id);
      setLikeCount(usersResponse.data?.likeCount || 0);

      if (!user) {
        setLiked(false);
        return;
      }

      const statusResponse = await likeAPI.getLikeStatus(id);
      setLiked(Boolean(statusResponse.data?.liked));
      setLikeCount(statusResponse.data?.likeCount ?? (usersResponse.data?.likeCount || 0));
    } catch {
      setLikeCount(0);
      setLiked(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLiking(true);
      const response = await likeAPI.toggleLike(id);
      setLiked(Boolean(response.data?.liked));
      setLikeCount(response.data?.likeCount ?? 0);
    } catch {
      setError('Failed to update like status');
    } finally {
      setLiking(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const content = commentInput.trim();
    if (!content) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await commentAPI.addComment(id, { content });
      if (response.data?.comment) {
        setComments((prev) => [response.data.comment, ...prev]);
      }
      setCommentInput('');
    } catch {
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      setRepliesByParent((prev) => {
        const next = {};
        Object.entries(prev).forEach(([parentId, replies]) => {
          if (parentId === commentId) return;
          next[parentId] = replies.filter((reply) => reply._id !== commentId);
        });
        return next;
      });
    } catch {
      setError('Failed to delete comment');
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    const content = (replyDrafts[parentCommentId] || '').trim();
    if (!content) return;

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReplyFor(parentCommentId);
      const response = await commentAPI.addComment(id, { content, parentComment: parentCommentId });
      if (response.data?.comment) {
        setRepliesByParent((prev) => ({
          ...prev,
          [parentCommentId]: [response.data.comment, ...(prev[parentCommentId] || [])],
        }));
      }
      setReplyDrafts((prev) => ({ ...prev, [parentCommentId]: '' }));
      setActiveReplyFor(null);
    } catch {
      setError('Failed to add reply');
    } finally {
      setSubmittingReplyFor('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 className="animate-spin text-indigo-400" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] px-4">
        <p className="text-red-400 text-lg font-semibold mb-4">{error}</p>
        <button
          onClick={() => navigate('/blogs')}
          className="flex items-center gap-2 px-6 py-3 bg-white/[0.06] text-white rounded-xl hover:bg-white/[0.1] transition-colors"
        >
          <ArrowLeft size={25} /> Back to blogs
        </button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <p className="text-white/40">Blog not found</p>
      </div>
    );
  }

  const isAuthor = user && (blog.author?._id === user.id || user.role === 'admin');
  const displayUsername = blog.author?.username || String(blog.author?.name || 'anonymous').toLowerCase().replace(/\s+/g, '_');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative">
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <button
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to blogs</span>
          </button>
        </div>

        {blog.imageUrl && (
          <div className="w-full h-96 bg-white/[0.02] overflow-hidden">
            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <article className="max-w-4xl mx-auto px-6 py-16">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white/95 leading-tight mb-8">
              {blog.title}
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-8 pb-8 border-b border-white/[0.06]">
              <button
                type="button"
                onClick={() => setShowAuthorPopup(true)}
                className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-white/[0.04] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center overflow-hidden">
                  {blog.author?.profilePicture ? (
                    <img src={blog.author.profilePicture} alt={blog.author?.name || 'Author'} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-white/40" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white/80 flex items-center gap-1.5">
                    @{displayUsername}
                    {blog.author?.role === 'admin' && (
                      <img
                        src={verifiedBadge}
                        alt="Admin verified"
                        title="blogifyadmin - this account is affiliated with blogify"
                        className="w-4 h-4 object-contain"
                      />
                    )}
                  </p>
                  <p className="text-xs text-white/30">{blog.author?.name || 'Anonymous'}</p>
                </div>
              </button>

              <div className="flex items-center gap-2 text-white/30">
                <Calendar size={18} />
                <span className="text-sm font-medium">
                  {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'Draft'}
                </span>
              </div>

              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-auto flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                >
                  <Trash2 size={18} />
                  <span className="text-sm font-semibold">{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
            </div>

            {blog.excerpt && (
              <p className="text-lg text-white/50 leading-relaxed font-medium italic">{blog.excerpt}</p>
            )}
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12">
              {blog.tags.map((tag, i) => (
                <span key={i} className="text-xs font-bold uppercase tracking-widest bg-white/[0.04] text-white/40 px-4 py-2 rounded-full hover:bg-indigo-500/20 hover:text-indigo-300 transition-all">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose prose-lg prose-invert max-w-none mb-16">
            <div className="text-white/70 leading-relaxed space-y-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-4xl font-bold text-white/90 mt-8 mb-4" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-3xl font-bold text-white/90 mt-8 mb-4" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-2xl font-bold text-white/90 mt-6 mb-3" {...props} />,
                  h4: ({ node, ...props }) => <h4 className="text-xl font-bold text-white/90 mt-6 mb-3" {...props} />,
                  p: ({ node, ...props }) => <p className="text-white/60 leading-relaxed mb-4" {...props} />,
                  a: ({ node, ...props }) => <a className="text-indigo-400 hover:text-indigo-300 underline transition-colors" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-white/80" {...props} />,
                  em: ({ node, ...props }) => <em className="italic text-white/60" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 my-4 text-white/60" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 my-4 text-white/60" {...props} />,
                  li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-indigo-500/40 pl-6 py-4 my-4 text-white/50 italic bg-white/[0.02] rounded-r-lg" {...props} />,
                  code: ({ node, inline, ...props }) =>
                    inline
                      ? <code className="bg-white/[0.06] px-2 py-1 rounded font-mono text-sm text-indigo-300" {...props} />
                      : <code className="bg-[#111118] text-white/80 px-4 py-2 rounded block my-4 overflow-x-auto font-mono text-sm" {...props} />,
                  pre: ({ node, ...props }) => <pre className="bg-[#111118] text-white/80 px-6 py-4 rounded-xl overflow-x-auto my-4 border border-white/[0.06]" {...props} />,
                  img: ({ node, ...props }) => <img className="max-w-full h-auto rounded-xl my-6" {...props} />,
                  hr: ({ node, ...props }) => <hr className="my-8 border-white/[0.06]" {...props} />,
                  table: ({ node, ...props }) => <table className="w-full border-collapse border border-white/[0.1] my-4" {...props} />,
                  th: ({ node, ...props }) => <th className="border border-white/[0.1] bg-white/[0.04] p-2 text-left font-bold text-white/70" {...props} />,
                  td: ({ node, ...props }) => <td className="border border-white/[0.1] p-2 text-white/50" {...props} />,
                }}
              >
                {blog.content}
              </ReactMarkdown>
            </div>
          </div>

          <section className="mb-16 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={liking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    liked
                      ? 'border-rose-400/40 bg-rose-500/10 text-rose-300'
                      : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:text-white hover:border-white/[0.2]'
                  } disabled:opacity-60`}
                >
                  <Heart size={16} className={liked ? 'fill-rose-400' : ''} />
                  <span className="text-sm font-semibold">{likeCount} {likeCount === 1 ? 'Like' : 'Likes'}</span>
                </button>

                <div className="flex items-center gap-2 text-white/60">
                  <MessageCircle size={16} />
                  <span className="text-sm font-semibold">{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddComment} className="mt-6">
              <label htmlFor="comment" className="block text-sm font-semibold text-white/80 mb-2">
                Add a comment
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <textarea
                  id="comment"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows={3}
                  placeholder={user ? 'Share your thoughts...' : 'Log in to write a comment'}
                  disabled={!user || submittingComment}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#111118] px-4 py-3 text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!user || submittingComment || !commentInput.trim()}
                  className="h-fit flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold disabled:opacity-60"
                >
                  <Send size={16} />
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>

            <div className="mt-8 space-y-4">
              {commentsLoading ? (
                <p className="text-white/40 text-sm">Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-white/40 text-sm">No comments yet. Be the first one.</p>
              ) : (
                comments.map((comment) => {
                  const isCommentOwner = user && (comment.user?._id === user.id || user.role === 'admin');
                  const replies = repliesByParent[comment._id] || [];
                  return (
                    <div key={comment._id} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white/85">
                            @{comment.user?.username || String(comment.user?.name || 'anonymous').toLowerCase().replace(/\s+/g, '_')}
                          </p>
                          <p className="text-xs text-white/35 mt-1">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                        {isCommentOwner && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-xs text-red-300 hover:text-red-200"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-white/70 mt-3 whitespace-pre-wrap">{comment.content}</p>

                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setActiveReplyFor((prev) => (prev === comment._id ? null : comment._id))}
                          className="text-xs text-indigo-300 hover:text-indigo-200"
                        >
                          Reply
                        </button>
                        {replies.length > 0 && (
                          <span className="text-xs text-white/35">
                            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                      </div>

                      {activeReplyFor === comment._id && (
                        <div className="mt-3 rounded-lg border border-white/[0.08] bg-[#111118] p-3">
                          <textarea
                            value={replyDrafts[comment._id] || ''}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                            rows={2}
                            placeholder={user ? 'Write a reply...' : 'Log in to reply'}
                            disabled={!user || submittingReplyFor === comment._id}
                            className="w-full rounded-lg border border-white/[0.08] bg-[#0d0d14] px-3 py-2 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60"
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleReplySubmit(comment._id)}
                              disabled={!user || submittingReplyFor === comment._id || !(replyDrafts[comment._id] || '').trim()}
                              className="px-3 py-1.5 text-xs rounded-lg bg-indigo-500 text-white disabled:opacity-60"
                            >
                              {submittingReplyFor === comment._id ? 'Replying...' : 'Post Reply'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveReplyFor(null)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-white/[0.06] text-white/70"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {replies.length > 0 && (
                        <div className="mt-4 space-y-3 pl-4 border-l border-white/[0.08]">
                          {replies.map((reply) => {
                            const isReplyOwner = user && (reply.user?._id === user.id || user.role === 'admin');
                            return (
                              <div key={reply._id} className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-semibold text-white/85">
                                      @{reply.user?.username || String(reply.user?.name || 'anonymous').toLowerCase().replace(/\s+/g, '_')}
                                    </p>
                                    <p className="text-[11px] text-white/35 mt-1">
                                      {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ''}
                                    </p>
                                  </div>
                                  {isReplyOwner && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(reply._id)}
                                      className="text-[11px] text-red-300 hover:text-red-200"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-white/70 mt-2 whitespace-pre-wrap">{reply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <div className="pt-8 border-t border-white/[0.06]">
            <button
              onClick={() => navigate('/blogs')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)] transition-all"
            >
              <ArrowLeft size={18} />
              <span className="font-semibold">Back to all blogs</span>
            </button>
          </div>
        </article>
      </div>

      {showAuthorPopup && (
        <UserProfilePopup author={blog.author} onClose={() => setShowAuthorPopup(false)} />
      )}
    </div>
  );
};

export default BlogDetail;
