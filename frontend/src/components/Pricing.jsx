import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../Auth/AuthContext';
import { premiumAPI } from '../api';
import { FALLBACK_PLANS, ACCENTS, formatExpiry } from '../premium/plans';
import PlanCard from './Premium/PlanCard';
import CheckoutModal from './Premium/CheckoutModal';
import PremiumBadge from './Premium/PremiumBadge';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, isPremium, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [accents, setAccents] = useState(ACCENTS);
  const [loading, setLoading] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [error, setError] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await premiumAPI.getPlans();
        if (Array.isArray(response.data.plans) && response.data.plans.length > 0) {
          setPlans(response.data.plans);
        }
        if (Array.isArray(response.data.accents) && response.data.accents.length > 0) {
          setAccents(response.data.accents);
        }
      } catch {
        setError('Showing the default plan list. Live pricing is unavailable right now.');
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleSelect = (plan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!plan.amount) {
      return;
    }

    setCheckoutPlan(plan);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your Pro subscription? You keep Pro until the period ends.')) return;

    setCancelBusy(true);
    setError('');

    try {
      await premiumAPI.cancelSubscription();
      await refreshSubscription();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to cancel the subscription.');
    } finally {
      setCancelBusy(false);
    }
  };

  const handleSuccess = async () => {
    setCheckoutPlan(null);
    await refreshSubscription();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] bg-indigo-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <nav className="fixed w-full top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/oldlogo.png" alt="Blogify" className="h-10 w-auto object-contain drop-shadow-md" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Blogify
              </span>
            </div>
            <button
              onClick={() => navigate(user ? '/blogs' : '/')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.1] font-medium transition-all"
            >
              <ArrowLeft size={16} />
              {user ? 'Back to Blogs' : 'Back Home'}
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/30 mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Write without <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">limits</span>
          </h1>
          <p className="mt-4 text-white/40 text-lg max-w-2xl mx-auto">
            Every post is public on the Free plan. Go Pro when you want featured images, private drafts and a theme
            that is actually yours.
          </p>
        </div>

        {isPremium && (
          <div className="max-w-2xl mx-auto mb-10 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <PremiumBadge size="md" />
              <div>
                <p className="text-sm font-semibold text-emerald-200">Your Pro plan is active</p>
                <p className="text-xs text-emerald-200/60 mt-0.5">
                  {user?.premiumExpiresAt
                    ? `Renews on ${formatExpiry(user.premiumExpiresAt)}`
                    : 'Lifetime access to Pro features'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              disabled={cancelBusy}
              className="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/70 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              {cancelBusy ? 'Cancelling...' : 'Cancel plan'}
            </button>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-10 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                isFeatured={plan.key === 'pro_yearly'}
                isCurrent={isPremium && plan.key !== 'free'}
                disabled={isPremium && plan.key !== 'free'}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}

        <section className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Pick an accent that is <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">yours</span>
            </h2>
            <p className="mt-3 text-white/40 max-w-xl mx-auto">
              Pro members can theme their public profile and post pages. Your choice applies everywhere your name shows
              up.
            </p>
          </div>

          <div className="max-w-3xl mx-auto p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {accents.map((accent) => (
                <div
                  key={accent.key}
                  className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                >
                  <span
                    className="w-9 h-9 rounded-full"
                    style={{ backgroundColor: accent.hex, boxShadow: `0 0 20px -4px ${accent.hex}` }}
                  />
                  <span className="text-xs text-white/50">{accent.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-white/30 text-center">
              Change your accent any time from your profile settings.
            </p>
          </div>
        </section>

        <section className="mt-20 max-w-3xl mx-auto p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
          <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            Common questions
          </h3>
          <div className="mt-5 space-y-4">
            {[
              {
                q: 'Can readers see my drafts?',
                a: 'Only published posts appear in the public archive. Drafts are visible to you alone, and on Pro you can also mark a post private so its link returns nothing for everyone else.'
              },
              {
                q: 'What happens when Pro expires?',
                a: 'Your posts stay live and your accent resets to the default indigo. Private posts stay private and visible only to you until you upgrade again.'
              },
              {
                q: 'Do I lose posts if I downgrade?',
                a: 'No. Nothing is deleted. You simply cannot create new posts past the Free limit of 10 until you free up a slot or upgrade.'
              }
            ].map((item) => (
              <div key={item.q}>
                <p className="text-sm font-medium text-white/80">{item.q}</p>
                <p className="text-sm text-white/40 mt-1 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-12 text-center text-xs text-white/20">
          Need help?{' '}
          <button onClick={() => navigate('/contact')} className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Contact support
          </button>{' '}
          or email us at blogify-support@surajitsen.live
        </p>
      </main>

      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
