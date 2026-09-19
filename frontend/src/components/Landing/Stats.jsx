import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

/* ─── Counter Animation Hook ─── */
function useCountUp(target, suffix = '', duration = 2) {
  const [display, setDisplay] = useState('0' + suffix);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const num = { val: 0 };
          gsap.to(num, {
            val: target,
            duration,
            ease: 'power2.out',
            onUpdate: () => setDisplay(Math.round(num.val).toLocaleString() + suffix),
          });
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix, duration]);

  return { ref, display };
}

export default function Stats() {
  const stat1 = useCountUp(1000, '+');
  const stat2 = useCountUp(5000, '+');
  const stat3 = useCountUp(50, 'K+');
  const stat4 = useCountUp(99, '%');

  return (
    <section className="relative py-24 border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <p className="text-center text-sm uppercase tracking-widest text-white/30 mb-14 font-medium">Trusted by writers worldwide</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { ref: stat1.ref, display: stat1.display, label: 'Active Writers' },
            { ref: stat2.ref, display: stat2.display, label: 'Published Posts' },
            { ref: stat3.ref, display: stat3.display, label: 'Monthly Readers' },
            { ref: stat4.ref, display: stat4.display, label: 'Uptime' },
          ].map((s, i) => (
            <div key={i} ref={s.ref}>
              <div className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {s.display}
              </div>
              <div className="mt-2 text-sm text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}