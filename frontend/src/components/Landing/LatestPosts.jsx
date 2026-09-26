import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, User } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { blogAPI } from '../../api';
import PremiumBadge from '../Premium/PremiumBadge';

gsap.registerPlugin(ScrollTrigger);

const SAMPLE_SIZE = 3;

const displayUsername = (author) => {
  if (author?.username) return author.username;
  return String(author?.name || 'anonymous').toLowerCase().replace(/\s+/g, '_');
};

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getSummary = (blog) => {
  if (blog.excerpt) return blog.excerpt;
  if (!blog.content) return '';
  const plain = blog.content.replace(/[#*_`>[\]()!-]/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > 150 ? `${plain.slice(0, 150)}...` : plain;
};

const LatestPosts = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [blogs, setBlogs] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;

    const fetchPosts = async () => {
      try {
        const response = await blogAPI.getAllBlogs({ page: 1 });
        const rows = Array.isArray(response.data?.blogs) ? response.data.blogs : [];
        if (!active) return;
        setBlogs(rows.slice(0, SAMPLE_SIZE));
        setStatus(rows.length > 0 ? 'ready' : 'empty');
      } catch {
        if (!active) return;
        setStatus('error');
      }
    };

    fetchPosts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status !== 'ready') return undefined;

    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
          y: 50,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power3.out'
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [status]);

  return (
    <section ref={sectionRef} className="py-28 border-t border-white/[0.04]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 mb-3">From the community</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Fresh from the{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">archive.</span>
          </h2>
          <p className="mt-4 text-white/40 text-lg max-w-2xl mx-auto">
            A few of the latest posts published on Blogify. Every published post is public and shareable.
          </p>
        </div>

        {status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map((index) => (
              <div key={index} className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <div className="h-4 w-24 bg-white/[0.06] rounded mb-5 animate-pulse" />
                <div className="h-6 w-3/4 bg-white/[0.06] rounded mb-4 animate-pulse" />
                <div className="h-3 w-full bg-white/[0.04] rounded mb-2 animate-pulse" />
                <div className="h-3 w-2/3 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <p className="text-center text-sm text-white/40 py-10">
            Could not load posts right now. Please try again shortly.
          </p>
        )}

        {status === 'empty' && (
          <p className="text-center text-sm text-white/40 py-10">
            No published posts yet. Be the first to write one.
          </p>
        )}

        {status === 'ready' && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {blogs.map((blog, index) => (
                <article
                  key={blog._id}
                  ref={(el) => {
                    cardsRef.current[index] = el;
                  }}
                  onClick={() => navigate(`/blog/${blog.slug || blog._id}`)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-300 cursor-pointer"
                >
                  {blog.imageUrl && (
                    <div className="w-full h-40 overflow-hidden bg-white/[0.02]">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-7 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                        {blog.author?.profilePicture ? (
                          <img
                            src={blog.author.profilePicture}
                            alt={blog.author?.name || 'Author'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={10} className="text-white/30" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 truncate">
                        @{displayUsername(blog.author)}
                      </span>
                      {blog.author?.plan === 'pro' && <PremiumBadge showLabel={false} />}
                    </div>

                    <h3 className="text-lg font-semibold text-white/90 leading-snug mb-3 group-hover:text-indigo-300 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-sm text-white/40 leading-relaxed mb-5 line-clamp-3 flex-1">
                      {getSummary(blog)}
                    </p>

                    <div className="flex items-center justify-between text-white/30">
                      <span className="flex items-center gap-1.5 text-xs">
                        <CalendarDays size={13} />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-white/40 group-hover:text-indigo-300 transition-colors">
                        Read
                        <ArrowUpRight size={13} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0a0a0f] font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Start writing
                <ArrowUpRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default LatestPosts;
