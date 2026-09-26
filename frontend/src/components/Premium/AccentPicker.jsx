import React from 'react';
import { Check } from 'lucide-react';
import { ACCENTS, DEFAULT_ACCENT } from '../../premium/plans';

export default function AccentPicker({ value, onChange, disabled }) {
  const selected = value || DEFAULT_ACCENT;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-white/90">Accent Theme</h2>
        {disabled && (
          <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg">
            Pro
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {ACCENTS.map((accent) => {
          const isActive = selected === accent.key;

          return (
            <button
              key={accent.key}
              type="button"
              onClick={() => onChange(accent.key)}
              disabled={disabled}
              title={accent.label}
              aria-label={accent.label}
              aria-pressed={isActive}
              className={`relative aspect-square rounded-xl border flex items-center justify-center transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                isActive
                  ? 'border-white/25 bg-white/[0.06]'
                  : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16]'
              }`}
            >
              <span
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: accent.hex, boxShadow: `0 0 16px -2px ${accent.hex}` }}
              />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-[#0a0a0f] flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-white/40 mt-3">
        {disabled
          ? 'Upgrade to Pro to apply a custom accent to your profile and posts.'
          : 'Your accent applies to your public profile and every post you publish.'}
      </p>
    </div>
  );
}
