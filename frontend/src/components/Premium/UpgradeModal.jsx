import React, { useEffect, useState } from 'react';
import { X, Crown, Image, Lock, Palette, BadgeCheck } from 'lucide-react';
import { useAuth } from '../../Auth/AuthContext';
import { premiumAPI } from '../../api';
import { formatPrice } from '../../premium/plans';
import CheckoutModal from './CheckoutModal';
import PlanCard from './PlanCard';

const iconMap = {
  featuredImage: Image,
  privatePosts: Lock,
  customTheme: Palette,
  premiumBadge: BadgeCheck
};

export default function UpgradeModal({ reason, onClose, onViewPlans }) {
  const { isPremium, refreshSubscription } = useAuth();
  const [plans, setPlans] = useState([]);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [error, setError] = useState('');

  const Icon = reason?.icon ? iconMap[reason.icon] : Crown;

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await premiumAPI.getPlans();
        setPlans(response.data.plans.filter((plan) => plan.key !== 'free'));
      } catch {
        setError('Unable to load plans right now.');
      }
    };

    fetchPlans();
  }, []);

  const handleSuccess = async () => {
    setCheckoutPlan(null);
    await refreshSubscription();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 overflow-y-auto py-10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#101018] border border-white/[0.08] rounded-2xl p-6 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Icon size={20} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white/90">{reason?.title || 'Upgrade to Pro'}</h3>
              <p className="text-sm text-white/40 mt-1">{reason?.description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
            aria-label="Close upgrade dialog"
          >
            <X size={18} />
          </button>
        </div>

        {!isPremium && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-200">
            You are on the Free plan{reason?.limit ? ` and have used all ${reason.limit} posts` : ''}. Upgrade to
            unlock this and every other Pro feature.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-300">
            {error}
          </div>
        )}

        {plans.length === 0 ? (
          <div className="py-10 text-center text-sm text-white/40">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {plans.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                isFeatured={plan.billing === 'yearly'}
                isCurrent={isPremium}
                onSelect={(selected) => setCheckoutPlan(selected)}
              />
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onViewPlans}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Compare all plans, starting from {formatPrice(plans[0]?.amount || 49900)}
          </button>
        </div>

        {checkoutPlan && (
          <CheckoutModal
            plan={checkoutPlan}
            onClose={() => setCheckoutPlan(null)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
