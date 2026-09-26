import React from 'react';
import { Check } from 'lucide-react';
import { formatPrice } from '../../premium/plans';

export default function PlanCard({ plan, isCurrent, isFeatured, isBusy, onSelect, disabled }) {
  const features = plan.features || {};
  const blogLimit = features.blogLimit;

  const rows = [
    {
      label: blogLimit ? `Up to ${blogLimit} published posts` : 'Unlimited published posts',
      enabled: true
    },
    { label: 'Featured image on every post', enabled: Boolean(features.featuredImage) },
    { label: 'Private posts that stay unlisted', enabled: Boolean(features.privatePosts) },
    { label: 'Custom accent theme', enabled: Boolean(features.customTheme) },
    { label: 'Pro badge on your posts', enabled: Boolean(features.premiumBadge) }
  ];

  return (
    <div
      className={`relative flex flex-col p-7 rounded-2xl border transition-all duration-300 ${
        isFeatured
          ? 'bg-gradient-to-b from-indigo-500/[0.08] to-transparent border-indigo-500/30 shadow-[0_0_40px_-16px_rgba(99,102,241,0.45)]'
          : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {isFeatured && (
        <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-bold uppercase tracking-widest">
          Most popular
        </span>
      )}

      <h3 className="text-lg font-semibold text-white/90">
        {plan.name}
        {plan.billing !== 'lifetime' && (
          <span className="ml-2 text-sm font-normal text-white/40">{plan.billing}</span>
        )}
      </h3>

      <p className="text-sm text-white/40 leading-relaxed mt-1">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white/90">{formatPrice(plan.amount, plan.currency)}</span>
        {plan.billing !== 'lifetime' && (
          <span className="text-sm text-white/40">/{plan.billing === 'yearly' ? 'year' : 'month'}</span>
        )}
      </div>

      <ul className="mt-6 space-y-3 flex-1">
        {rows.map((row) => (
          <li key={row.label} className="flex items-start gap-2.5 text-sm">
            <Check
              size={16}
              className={`mt-0.5 flex-shrink-0 ${row.enabled ? 'text-indigo-400' : 'text-white/20'}`}
            />
            <span className={row.enabled ? 'text-white/70' : 'text-white/30 line-through'}>
              {row.label}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(plan)}
        disabled={disabled || isCurrent || isBusy}
        className={`mt-7 w-full px-5 py-3 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
          isCurrent
            ? 'bg-white/[0.06] border border-white/[0.08] text-white/50'
            : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-[0_0_24px_-4px_rgba(99,102,241,0.5)]'
        }`}
      >
        {isCurrent ? 'Current plan' : isBusy ? 'Processing...' : plan.amount ? `Upgrade to ${plan.name}` : 'Get started free'}
      </button>
    </div>
  );
}
