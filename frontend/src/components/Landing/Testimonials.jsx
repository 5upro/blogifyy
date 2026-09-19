import React, { forwardRef } from 'react';

const Testimonials = forwardRef((props, ref) => {
  const testimonials = [
    { name: 'Sarah Chen', role: 'Tech Blogger', text: "Switched from WordPress and never looked back. The editor is buttery smooth and my readers love the clean design.", avatar: 'SC' },
    { name: 'Marcus Rivera', role: 'Freelance Writer', text: "Finally a platform that doesn't get in the way of writing. I publish three times a week now — it used to be a chore.", avatar: 'MR' },
    { name: 'Priya Sharma', role: 'Content Strategist', text: "The admin tools are excellent. Managing a team of 12 writers is effortless with the role-based system.", avatar: 'PS' },
  ];

  return (
    <section ref={ref} className="py-28 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-14">
          Loved by{' '}
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">writers.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <p className="text-sm text-white/50 leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{t.name}</p>
                  <p className="text-xs text-white/30">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

Testimonials.displayName = 'Testimonials';
export default Testimonials;