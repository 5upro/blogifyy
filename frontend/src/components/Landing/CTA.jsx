import React, { forwardRef } from 'react';

const CTA = forwardRef(({ onGetStarted, handleMagnetic, handleMagneticLeave }, ref) => {
  return (
    <section ref={ref} className="py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.06] to-transparent pointer-events-none" />
      <div className="cta-inner max-w-3xl mx-auto text-center px-5 sm:px-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
          Ready to share{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">your story?</span>
        </h2>
        <p className="mt-4 text-white/40 text-lg max-w-xl mx-auto">
          Join thousands of writers who chose a better way to blog. Free to start, no strings attached.
        </p>
        <button
          onClick={onGetStarted}
          onMouseMove={handleMagnetic}
          onMouseLeave={handleMagneticLeave}
          className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-white text-[#0a0a0f] hover:bg-white/90 transition-colors shadow-[0_0_40px_-8px_rgba(255,255,255,0.3)]"
        >
          Create Your Free Account
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </section>
  );
});

CTA.displayName = 'CTA';
export default CTA;