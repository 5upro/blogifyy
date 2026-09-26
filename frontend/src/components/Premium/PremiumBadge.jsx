import React from 'react';
import { Crown } from 'lucide-react';

const sizes = {
  sm: 'text-[9px] px-2 py-0.5 gap-1',
  md: 'text-[10px] px-2.5 py-1 gap-1.5'
};

export default function PremiumBadge({ size = 'sm', showLabel = true }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/20 ${sizes[size] || sizes.sm}`}
      title="Pro subscriber"
    >
      <Crown size={size === 'md' ? 12 : 10} />
      {showLabel && 'Pro'}
    </span>
  );
}
