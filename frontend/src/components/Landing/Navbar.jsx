import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
const Navbar = forwardRef(({ onGetStarted, handleMagnetic, handleMagneticLeave }, ref) => {
  const navigate = useNavigate();

  return (
    <nav
      ref={ref}
      className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 flex justify-between items-center h-16">
        <div className="flex items-center gap-3">
          <pre className="text-[4px] leading-[4px] font-mono text-indigo-400 select-none" aria-hidden="true">{`
    ++++++++
    ++++++++
    ++++++++
     +++++++
      ++++++
     +++++++
      +++++
  +++++++++++
    +++++++++
  ++++  ++++ 
   =++++++++
     ++++++
      ++++
       ++
       +
`}</pre>
          <span className="text-lg font-semibold tracking-tight text-white/90">Blogify</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/premium')}
            className="hidden sm:inline-flex text-sm text-amber-300/80 hover:text-amber-300 transition-colors px-3 py-1.5"
          >
            Premium
          </button>
          <button
            onClick={() => navigate('/privacy')}
            className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
          >
            Privacy
          </button>
          <button
            onClick={() => navigate('/Contact')}
            className="hidden sm:inline-flex text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5"
          >
            Contact
          </button>
          <a
            href="https://github.com/5upro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/40 hover:text-white transition-colors p-1.5"
            aria-label="GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
          </a>
          <button
            onClick={onGetStarted}
            onMouseMove={handleMagnetic}
            onMouseLeave={handleMagneticLeave}
            className="relative px-5 py-2 text-sm font-medium rounded-lg bg-white text-[#0a0a0f] hover:bg-white/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
