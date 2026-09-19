import React, { forwardRef } from 'react';

const HowItWorks = forwardRef(({ itemsRef }, ref) => {
  const steps = [
    { num: '01', title: 'Create your account', desc: 'Sign up in seconds with email verification — no credit card required.' },
    { num: '02', title: 'Write your first post', desc: 'Open the editor, start typing, and format with simple Markdown syntax.' },
    { num: '03', title: 'Publish & share', desc: 'Hit publish and share your post with a clean, shareable link instantly.' },
  ];

  return (
    <section ref={ref} className="py-28 border-t border-white/[0.04]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Up and running in{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">minutes.</span>
          </h2>
        </div>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div
              key={i}
              ref={(el) => (itemsRef.current[i] = el)}
              className="flex items-start gap-6 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <span className="shrink-0 text-3xl font-black bg-gradient-to-br from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {s.num}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-white/90 mb-1">{s.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

HowItWorks.displayName = 'HowItWorks';
export default HowItWorks;