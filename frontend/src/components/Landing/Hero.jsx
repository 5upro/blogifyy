import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import HeroScene from './Scene';

const Hero = ({ headingRef, subRef, btnsRef, onGetStarted }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-10">
      {/* Three.js background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a0a0f]/40 via-transparent to-[#0a0a0f]" />
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0f_75%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 flex flex-col items-center text-center w-full">
        <div ref={headingRef} className="flex flex-col items-center w-full">
          <pre className="block text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px] font-mono text-indigo-400 mb-6 select-none" aria-hidden="true">{`
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
          <span className="inline-block mb-5 px-4 py-1.5 text-xs font-medium tracking-widest uppercase rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
            The modern blogging platform
          </span>
          <h1 className="text-[clamp(2.4rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-tight">
            <span className="block text-white/95">Your ideas deserve</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              a beautiful home.
            </span>
          </h1>
        </div>

        <p
          ref={subRef}
          className="mt-6 text-lg sm:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Write, publish, and grow your audience on a platform crafted for people who care about the craft of writing. No distractions — just your voice.
        </p>

        <div ref={btnsRef} className="mt-10 flex w-full justify-center items-center">
          <button
            onClick={onGetStarted}
            className="group relative px-6 py-3.5 text-base font-semibold rounded-3xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-[0_0_32px_-4px_rgba(99,102,241,0.5)] hover:shadow-[0_0_49px_-4px_rgba(99,102,241,0.7)] transition-shadow text-center"
          >
            Start Writing — It's Free
            <span className="absolute inset-0 rounded-3xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;