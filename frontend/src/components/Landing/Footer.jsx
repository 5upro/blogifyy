import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-white/[0.06] pt-16 pb-10 bg-[#060609]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <pre className="text-[4px] leading-[4px] font-mono text-indigo-400 select-none" aria-hidden="true">{`
    +++++++
    ++++++++
    ++++++++
     +++++++
      ++++++
     +++++++
      ++++
  +++++++++++
   ++++++++++
  ++++  +++= 
   =++++++++
     ++++++
      ++++
       ++
       +
`}</pre>
              <span className="text-lg font-semibold text-white/90">Blogify</span>
            </div>
            <p className="text-sm text-white/30 max-w-sm leading-relaxed mb-5">
              A modern, open-source blogging platform that empowers writers to share their stories and connect with readers worldwide.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/blackXploit-404/blogify" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
              </a>
              <a href="https://x.com/notaddedyet" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="X (Twitter)">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>
              <a href="https://instagram.com/notaddedyet" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C16.67.014 16.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm text-white/30">
              <li><button onClick={() => navigate('/')} className="hover:text-white/70 transition-colors">Features</button></li>
              <li><a href="https://github.com/blackXploit-404/blogify" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Source Code</a></li>
              <li><button onClick={() => navigate('/')} className="hover:text-white/70 transition-colors">Self-Host</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4">Support</h4>
            <ul className="space-y-2.5 text-sm text-white/30">
              <li><a href="https://github.com/blackXploit-404/blogify/issues" target="_blank" rel="noopener noreferrer" className="hover:text-white/70 transition-colors">Report Issue</a></li>
              <li><button onClick={() => navigate('/Contact')} className="hover:text-white/70 transition-colors">Contact</button></li>
              <li><button onClick={() => navigate('/privacy')} className="hover:text-white/70 transition-colors">Privacy</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-8 flex flex-col items-center gap-5">
          <a
            href="https://stats.uptimerobot.com/ucLvlFewRq/802168320"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            Check Server Status
            <svg className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </a>
          <p className="text-xs text-white/20">&copy; 2026 Blogify. All rights reserved.</p>
          <p className="text-[11px] text-white/15 text-center leading-relaxed">
            This page is a landing demo page. Some information displayed may not be accurate and is shown for demonstration purposes only.
            <a href='/learnmore' className="underline text-white/30 hover:text-white transition-colors ml-1">Learn more</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}